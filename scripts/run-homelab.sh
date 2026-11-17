#!/usr/bin/env bash
# run-homelab.sh — one unattended pass: build, test, container smoke test,
# baseline CIS audit, weak-demo audit, evidence bundle. Safe to run in a
# Docker Cloud Sandbox; also works locally (macOS skips the Linux-only demo).
#
# Usage: bash scripts/run-homelab.sh
# Exit:  0 = build/tests/API healthy, 1 = something in the core path failed.
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

STAMP="$(date -u +%Y%m%d-%H%M%S)"
ART="$ROOT/artifacts/homelab-$STAMP"
mkdir -p "$ART"
LOG="$ART/run.log"
exec > >(tee -a "$LOG") 2>&1

CORE_FAIL=0
DOCKER_OK=0
docker info >/dev/null 2>&1 && DOCKER_OK=1
OS="$(uname -s)"
CONTAINER="ycc-smoke-$STAMP"

step() { printf '\n=== %s ===\n' "$1"; }
ok()   { printf '✓ %s\n' "$1"; }
bad()  { printf '✗ %s\n' "$1"; CORE_FAIL=1; }
note() { printf '· %s\n' "$1"; }

cleanup() {
  docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
  if [ -x lab/cis-audit/demo-weak.sh ]; then
    (cd lab/cis-audit && ./demo-weak.sh --cleanup >/dev/null 2>&1) || true
  fi
}
trap cleanup EXIT INT TERM

step "Environment"
{
  echo "timestamp=$STAMP"
  echo "os=$OS $(uname -r)"
  echo "node=$(node -v 2>/dev/null || echo missing)"
  echo "npm=$(npm -v 2>/dev/null || echo missing)"
  echo "docker=$(docker version --format '{{.Server.Version}}' 2>/dev/null || echo unavailable)"
  echo "chrome=$([ -x "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ] && echo present || echo absent)"
} | tee "$ART/env.txt"
ok "environment captured"

if [ "$DOCKER_OK" -eq 0 ]; then
  note "docker daemon is not reachable — container + audit steps will be skipped"
fi

step "Dependencies"
if [ -d node_modules ]; then
  note "node_modules already present"
else
  npm ci 2>&1 | tee "$ART/npm-ci.log"
  [ "${PIPESTATUS[0]}" -eq 0 ] && ok "npm ci" || bad "npm ci failed"
fi

step "Build"
npm run build 2>&1 | tee "$ART/build.log"
if [ "${PIPESTATUS[0]}" -eq 0 ]; then ok "next build"; else bad "next build failed"; fi

step "Tests"
if command -v timeout >/dev/null 2>&1; then
  timeout 240 node --test tests/*.test.mjs 2>&1 | tee "$ART/tests.log"
else
  node --test tests/*.test.mjs 2>&1 | tee "$ART/tests.log"
fi
TEST_STATUS="${PIPESTATUS[0]}"
if [ "$TEST_STATUS" -eq 0 ]; then ok "test suite passed"; else bad "test suite failed"; fi
grep -E "^# (pass|fail|skipped) " "$ART/tests.log" > "$ART/tests-summary.txt" || true

step "Container image"
if [ "$DOCKER_OK" -eq 1 ]; then
  docker build -t ycc-site:homelab . >> "$ART/docker-build.log" 2>&1 || true
  if docker image inspect ycc-site:homelab >/dev/null 2>&1; then
    ok "image built"
  else
    note "default builder failed; retrying with legacy builder"
    DOCKER_BUILDKIT=0 docker build -t ycc-site:homelab . >> "$ART/docker-build.log" 2>&1 || true
    if docker image inspect ycc-site:homelab >/dev/null 2>&1; then
      ok "image built (legacy builder)"
    else
      bad "image build failed"
    fi
  fi

  step "Container smoke test"
  cleanup
  docker run -d --name "$CONTAINER" -p 3322:3000 \
    --read-only --tmpfs /tmp \
    --memory 512m --cpus 0.5 \
    --security-opt no-new-privileges \
    -e DOSSIER_DRY_RUN=1 -e DOSSIER_SEND_EMAIL=0 -e SITE_URL=http://127.0.0.1:3322 \
    ycc-site:homelab >/dev/null 2>&1 || bad "container failed to start"
  sleep 4

  {
    for path in / /work /work/container-environment-baseline /privacy; do
      code=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:3322$path")
      printf '%-46s %s\n' "$path" "$code"
      [ "$code" = "200" ] || CORE_FAIL=1
    done
    printf '\nAPI dry-run:\n'
    curl -s -X POST http://127.0.0.1:3322/api/dossier-request \
      -H 'Content-Type: application/json' \
      -d '{"name":"Homelab Smoke","email":"homelab@example.org","organization":"Example","caseStudy":"container-environment-baseline","startedAt":0}'
    printf '\n'
  } | tee "$ART/http.log"
  grep -q '"ok":true' "$ART/http.log" && ok "dossier API answered" || bad "dossier API failed"
  docker logs "$CONTAINER" > "$ART/container.log" 2>&1 || true

  # Baseline audit while the hardened container is running.
  bash lab/cis-audit/audit.sh --json --out "$ART/cis-baseline" --no-fail-exit >/dev/null 2>&1 || true
  [ -f "$ART/cis-baseline/audit.json" ] && ok "baseline audit captured" || bad "baseline audit missing"
  cleanup
else
  echo "skipped" > "$ART/docker-build.log"
fi

step "CIS weak demo"
if [ "$DOCKER_OK" -eq 1 ] && [ "$OS" = "Linux" ]; then
  (cd lab/cis-audit && ./demo-weak.sh --setup) > "$ART/cis-demo.log" 2>&1 || true
  bash lab/cis-audit/audit.sh --json --out "$ART/cis-weak" --no-fail-exit >/dev/null 2>&1 || true
  (cd lab/cis-audit && ./demo-weak.sh --cleanup) >> "$ART/cis-demo.log" 2>&1 || true
  [ -f "$ART/cis-weak/audit.json" ] && ok "weak-environment audit captured" || note "weak demo unavailable"
else
  note "skipped (Linux + Docker required)"
fi

bash lab/cis-audit/audit.sh --json --out "$ART/cis-weak-daemon" \
  --daemon-config lab/cis-audit/weak-daemon.json --no-fail-exit >/dev/null 2>&1 || true
[ -f "$ART/cis-weak-daemon/audit.json" ] && ok "weak daemon-config audit captured" || true

step "Report"
TEST_PASS=$(sed -n 's/^# pass /pass /p' "$ART/tests.log" | tail -1)
TEST_FAIL=$(sed -n 's/^# fail /fail /p' "$ART/tests.log" | tail -1)
BASELINE_SUMMARY=$(node -e 'const j=require(process.argv[1]);console.log(JSON.stringify(j.summary))' "$ART/cis-baseline/audit.json" 2>/dev/null || echo '{}')

cat > "$ART/RUN-REPORT.md" <<REPORT
# Homelab run — $STAMP

- Host: $OS $(uname -r)
- Node: $(node -v 2>/dev/null)
- Docker: $(docker version --format '{{.Server.Version}}' 2>/dev/null || echo unavailable)
- Core path: $([ "$CORE_FAIL" -eq 0 ] && echo HEALTHY || echo FAILED)

## Tests
- ${TEST_PASS:-pass ?}
- ${TEST_FAIL:-fail ?}

## Baseline CIS audit
\`\`\`json
$BASELINE_SUMMARY
\`\`\`

Artifacts in this directory:

- \`tests.log\` / \`tests-summary.txt\`
- \`build.log\`, \`docker-build.log\`, \`container.log\`
- \`http.log\` (routes + API dry-run)
- \`cis-baseline/audit.json\` + \`audit.txt\`
- \`cis-weak/audit.json\` (Linux only) and \`cis-weak-daemon/audit.json\`
- \`env.txt\`, \`run.log\`

Core path $([ "$CORE_FAIL" -eq 0 ] && echo PASSED || echo "FAILED — see logs above").
REPORT

ok "report written"

step "Bundle"
BUNDLE="$ROOT/artifacts/homelab-$STAMP.tar.gz"
tar -czf "$BUNDLE" -C "$ROOT/artifacts" "homelab-$STAMP" 2>/dev/null
if command -v sha256sum >/dev/null 2>&1; then
  CHECKSUM=$(sha256sum "$BUNDLE" | awk '{print $1}')
else
  CHECKSUM=$(shasum -a 256 "$BUNDLE" | awk '{print $1}')
fi
echo "$BUNDLE"
echo "sha256=$CHECKSUM"
printf '%s\n' "$CHECKSUM" > "$ART.sha256"

printf '\n=== RESULT ===\n'
printf 'Artifacts: %s\n' "$ART"
printf 'Bundle:    %s\n' "$BUNDLE"
printf 'SHA-256:   %s\n' "$CHECKSUM"
if [ "$CORE_FAIL" -eq 0 ]; then
  printf 'HOMELAB DONE\n'
  exit 0
fi
printf 'HOMELAB FAILED (core path) — see %s/run.log\n' "$ART"
exit 1
