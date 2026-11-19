#!/bin/sh
# ycc-cis-audit — read-only CIS-aligned container baseline checks.
#
# 13 CIS-aligned controls (internal identifiers AUD-01..AUD-13) plus one
# separate connectivity check (HOST 000, not a CIS control). The AUD-xx ids are
# Yalgar's own labels grouped by CIS Docker Benchmark area; they are not
# verified CIS rule numbers and this is not a certifying CIS assessment.
#
# Zero dependencies beyond the docker CLI and coreutils. It does NOT change the
# host or the daemon: it inspects daemon config, permissions, audit rules, and
# the runtime flags of running containers, then reports PASS/FAIL/WARN/N/A.
#
# Usage:
#   ./audit.sh                          # human-readable summary
#   ./audit.sh --json                   # JSON to stdout
#   ./audit.sh --json --out artifacts/cis-baseline
#   ./audit.sh --daemon-config ./weak-daemon.json
#   ./audit.sh --no-fail-exit           # always exit 0 (for demo runs)
#
# Exit codes: 0 = no failures, 1 = at least one FAIL (connectivity included),
# 2 = usage error.
set -u

VERSION="2.0.0"
JSON=0
FAIL_EXIT=1
OUT_DIR=""
DAEMON_CONFIG="/etc/docker/daemon.json"

usage() {
  sed -n '2,21p' "$0" | sed 's/^# \{0,1\}//'
  exit 2
}

while [ $# -gt 0 ]; do
  case "$1" in
    --json) JSON=1 ;;
    --out) [ $# -ge 2 ] || usage; OUT_DIR="$2"; shift ;;
    --daemon-config) [ $# -ge 2 ] || usage; DAEMON_CONFIG="$2"; shift ;;
    --no-fail-exit) FAIL_EXIT=0 ;;
    -h|--help) usage ;;
    *) echo "unknown argument: $1" >&2; usage ;;
  esac
  shift
done

[ -n "$OUT_DIR" ] && mkdir -p "$OUT_DIR" 2>/dev/null

RESULTS=$(mktemp "${TMPDIR:-/tmp}/cis-audit.XXXXXX") || exit 2
trap 'rm -f "$RESULTS"' EXIT INT TERM

PASS=0; FAIL=0; WARN=0; NA=0; TOTAL=0
CONN_STATUS="FAIL"; CONN_EVIDENCE="connectivity check not run"
OS=$(uname -s 2>/dev/null || echo unknown)
KERNEL=$(uname -r 2>/dev/null || echo unknown)
HOSTNAME_VALUE=$(hostname 2>/dev/null || echo unknown)
NOW=$(date -u +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || echo unknown)
DOCKER_VERSION=$(docker version --format '{{.Server.Version}}' 2>/dev/null || echo unavailable)
DOCKER_OK=0
docker info >/dev/null 2>&1 && DOCKER_OK=1

escape() {
  printf '%s' "$1" | tr '\n' ' ' | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g'
}

record() {
  id="$1"; title="$2"; area="$3"; status="$4"; evidence="$5"
  TOTAL=$((TOTAL + 1))
  case "$status" in
    PASS) PASS=$((PASS + 1)) ;;
    FAIL) FAIL=$((FAIL + 1)) ;;
    WARN) WARN=$((WARN + 1)) ;;
    *)    NA=$((NA + 1)) ;;
  esac
  printf '%s\t%s\t%s\t%s\t%s\n' "$id" "$title" "$area" "$status" "$evidence" >> "$RESULTS"
}

file_mode() {
  # Linux: stat -c '%a %U'; BSD/macOS: stat -f '%Lp %Su'
  stat -c '%a %U' "$1" 2>/dev/null || stat -f '%Lp %Su' "$1" 2>/dev/null
}

container_ids() {
  docker ps -q 2>/dev/null
}

container_field() {
  # $1 = id, $2 = go-template field
  docker inspect -f "$2" "$1" 2>/dev/null
}

inspect_all() {
  # $1 = go-template expression that prints "true"/"false"/value per container
  ids=$(container_ids)
  [ -z "$ids" ] && return 1
  for id in $ids; do
    value=$(container_field "$id" "$1") || return 1
    printf '%s\n' "$value"
  done
  return 0
}

##### Host information ########################################################

# Connectivity is reported separately: it is a precondition for the runtime
# checks, not one of the 13 CIS-aligned controls, and it is never counted in the
# CIS summary.
if [ "$DOCKER_OK" -eq 1 ]; then
  CONN_STATUS="PASS"
  CONN_EVIDENCE="server $DOCKER_VERSION on $OS/$KERNEL"
else
  CONN_STATUS="FAIL"
  CONN_EVIDENCE="docker CLI cannot reach a daemon"
fi

##### Section 1 — Host configuration ##########################################

if [ "$OS" != "Linux" ]; then
  record "AUD-01" "Host filesystem auditing (auditd)" "Host" "N/A" "host is $OS; auditd rules are Linux-only"
elif ! command -v auditctl >/dev/null 2>&1; then
  record "AUD-01" "Host filesystem auditing (auditd)" "Host" "N/A" "auditd is not installed"
elif grep -rqs "docker" /etc/audit/rules.d /etc/audit/audit.rules 2>/dev/null; then
  record "AUD-01" "Host filesystem auditing (auditd)" "Host" "PASS" "docker audit rules present under /etc/audit"
else
  record "AUD-01" "Host filesystem auditing (auditd)" "Host" "FAIL" "no docker path rules found in auditd config"
fi

if [ "$OS" != "Linux" ]; then
  record "AUD-02" "Separate partition for /var/lib/docker" "Host" "N/A" "host is $OS"
elif command -v findmnt >/dev/null 2>&1; then
  target=$(findmnt -no TARGET /var/lib/docker 2>/dev/null)
  if [ -n "$target" ] && [ "$target" != "/" ]; then
    record "AUD-02" "Separate partition for /var/lib/docker" "Host" "PASS" "mounted at $target"
  else
    record "AUD-02" "Separate partition for /var/lib/docker" "Host" "FAIL" "container storage shares the root filesystem"
  fi
else
  record "AUD-02" "Separate partition for /var/lib/docker" "Host" "N/A" "findmnt unavailable"
fi

if [ -f "$DAEMON_CONFIG" ]; then
  mode=$(file_mode "$DAEMON_CONFIG")
  perms=$(printf '%s' "$mode" | awk '{print $1}')
  owner=$(printf '%s' "$mode" | awk '{print $2}')
  case "$perms" in
    600|640|644)
      if [ "$owner" = "root" ]; then
        record "AUD-03" "Daemon config file permissions" "Host" "PASS" "$DAEMON_CONFIG is $perms owned by $owner"
      else
        record "AUD-03" "Daemon config file permissions" "Host" "FAIL" "$DAEMON_CONFIG is $perms owned by $owner"
      fi ;;
    *) record "AUD-03" "Daemon config file permissions" "Host" "FAIL" "$DAEMON_CONFIG is $perms (expected 600/640/644)" ;;
  esac
else
  record "AUD-03" "Daemon config file permissions" "Host" "N/A" "no $DAEMON_CONFIG on this host"
fi

##### Section 2 — Daemon configuration ########################################

if [ -f "$DAEMON_CONFIG" ] && grep -q '"default-ulimits"' "$DAEMON_CONFIG" 2>/dev/null; then
  record "AUD-04" "Default ulimit enforcement" "Daemon" "PASS" "default-ulimits is configured"
else
  record "AUD-04" "Default ulimit enforcement" "Daemon" "FAIL" "default-ulimits is missing from daemon config"
fi

if [ -f "$DAEMON_CONFIG" ] && grep -Eq '"hosts"[^]]*"tcp://' "$DAEMON_CONFIG" 2>/dev/null; then
  if grep -q '"tlsverify"' "$DAEMON_CONFIG" 2>/dev/null; then
    record "AUD-05" "Remote API protected by TLS" "Daemon" "PASS" "TCP host configured with tlsverify"
  else
    record "AUD-05" "Remote API protected by TLS" "Daemon" "FAIL" "TCP host configured without tlsverify"
  fi
else
  record "AUD-05" "Remote API protected by TLS" "Daemon" "PASS" "no remote TCP host configured"
fi

##### Section 3 — Daemon file permissions #####################################

if [ -S /var/run/docker.sock ]; then
  mode=$(file_mode /var/run/docker.sock)
  perms=$(printf '%s' "$mode" | awk '{print $1}')
  case "$perms" in
    660|600) record "AUD-06" "Docker socket permissions" "Files" "PASS" "/var/run/docker.sock is $perms" ;;
    *) record "AUD-06" "Docker socket permissions" "Files" "FAIL" "/var/run/docker.sock is $perms (expected 660 or 600)" ;;
  esac
else
  record "AUD-06" "Docker socket permissions" "Files" "N/A" "/var/run/docker.sock not present"
fi

SERVICE_FILE=""
for candidate in /usr/lib/systemd/system/docker.service /lib/systemd/system/docker.service /etc/systemd/system/docker.service; do
  [ -f "$candidate" ] && SERVICE_FILE="$candidate" && break
done

if [ -n "$SERVICE_FILE" ]; then
  mode=$(file_mode "$SERVICE_FILE")
  perms=$(printf '%s' "$mode" | awk '{print $1}')
  case "$perms" in
    644|600|640) record "AUD-07" "docker.service file permissions" "Files" "PASS" "$SERVICE_FILE is $perms" ;;
    *) record "AUD-07" "docker.service file permissions" "Files" "FAIL" "$SERVICE_FILE is $perms (expected 644)" ;;
  esac
else
  record "AUD-07" "docker.service file permissions" "Files" "N/A" "no systemd docker unit found"
fi

##### Section 4 — Images and builds ###########################################

if [ "$DOCKER_OK" -eq 0 ]; then
  record "AUD-08" "Containers run as non-root" "Images" "N/A" "daemon unreachable"
elif [ -z "$(container_ids)" ]; then
  record "AUD-08" "Containers run as non-root" "Images" "WARN" "no running containers to evaluate"
else
  bad=""
  for id in $(container_ids); do
    user=$(container_field "$id" '{{.Config.User}}')
    if [ -z "$user" ] || [ "$user" = "root" ] || [ "$user" = "0" ]; then
      name=$(container_field "$id" '{{.Name}}' | sed 's#^/##')
      bad="$bad $name"
    fi
  done
  if [ -z "$bad" ]; then
    record "AUD-08" "Containers run as non-root" "Images" "PASS" "all running containers declare a non-root user"
  else
    record "AUD-08" "Containers run as non-root" "Images" "FAIL" "root/default user:$bad"
  fi
fi

##### Section 5 — Runtime ######################################################

if [ "$DOCKER_OK" -eq 0 ]; then
  record "AUD-09" "AppArmor profile enforced" "Runtime" "N/A" "daemon unreachable"
elif [ -z "$(container_ids)" ]; then
  record "AUD-09" "AppArmor profile enforced" "Runtime" "WARN" "no running containers to evaluate"
elif [ "$OS" != "Linux" ] || [ ! -d /sys/module/apparmor ]; then
  record "AUD-09" "AppArmor profile enforced" "Runtime" "N/A" "AppArmor not available on this kernel"
else
  bad=""
  for id in $(container_ids); do
    opts=$(container_field "$id" '{{join .HostConfig.SecurityOpt ","}}')
    if printf '%s' "$opts" | grep -q "apparmor=unconfined"; then
      name=$(container_field "$id" '{{.Name}}' | sed 's#^/##')
      bad="$bad $name(unconfined)"
    elif ! printf '%s' "$opts" | grep -q "apparmor="; then
      # Docker applies the docker-default profile implicitly when AppArmor is
      # available; no explicit security-opt is still a pass unless unconfined.
      :
    fi
  done
  if [ -z "$bad" ]; then
    record "AUD-09" "AppArmor profile enforced" "Runtime" "PASS" "every container has an AppArmor profile"
  else
    record "AUD-09" "AppArmor profile enforced" "Runtime" "FAIL" "missing/unconfined:$bad"
  fi
fi

if [ "$DOCKER_OK" -eq 0 ]; then
  record "AUD-10" "Read-only root filesystem" "Runtime" "N/A" "daemon unreachable"
elif [ -z "$(container_ids)" ]; then
  record "AUD-10" "Read-only root filesystem" "Runtime" "WARN" "no running containers to evaluate"
else
  bad=""
  for id in $(container_ids); do
    ro=$(container_field "$id" '{{.HostConfig.ReadonlyRootfs}}')
    if [ "$ro" != "true" ]; then
      name=$(container_field "$id" '{{.Name}}' | sed 's#^/##')
      bad="$bad $name"
    fi
  done
  if [ -z "$bad" ]; then
    record "AUD-10" "Read-only root filesystem" "Runtime" "PASS" "all containers use a read-only root filesystem"
  else
    record "AUD-10" "Read-only root filesystem" "Runtime" "FAIL" "writable rootfs:$bad"
  fi
fi

if [ "$DOCKER_OK" -eq 0 ]; then
  record "AUD-11" "Privileged containers" "Runtime" "N/A" "daemon unreachable"
elif [ -z "$(container_ids)" ]; then
  record "AUD-11" "Privileged containers" "Runtime" "WARN" "no running containers to evaluate"
else
  bad=""
  for id in $(container_ids); do
    privileged=$(container_field "$id" '{{.HostConfig.Privileged}}')
    if [ "$privileged" = "true" ]; then
      name=$(container_field "$id" '{{.Name}}' | sed 's#^/##')
      bad="$bad $name"
    fi
  done
  if [ -z "$bad" ]; then
    record "AUD-11" "Privileged containers" "Runtime" "PASS" "no container runs privileged"
  else
    record "AUD-11" "Privileged containers" "Runtime" "FAIL" "privileged:$bad"
  fi
fi

if [ "$DOCKER_OK" -eq 0 ]; then
  record "AUD-12" "Memory and CPU limits" "Runtime" "N/A" "daemon unreachable"
elif [ -z "$(container_ids)" ]; then
  record "AUD-12" "Memory and CPU limits" "Runtime" "WARN" "no running containers to evaluate"
else
  bad=""
  for id in $(container_ids); do
    limits=$(container_field "$id" '{{.HostConfig.Memory}} {{.HostConfig.NanoCpus}}')
    memory=$(printf '%s' "$limits" | awk '{print $1}')
    cpu=$(printf '%s' "$limits" | awk '{print $2}')
    if [ "${memory:-0}" -le 0 ] || [ "${cpu:-0}" -le 0 ]; then
      name=$(container_field "$id" '{{.Name}}' | sed 's#^/##')
      bad="$bad $name"
    fi
  done
  if [ -z "$bad" ]; then
    record "AUD-12" "Memory and CPU limits" "Runtime" "PASS" "all containers declare memory and CPU limits"
  else
    record "AUD-12" "Memory and CPU limits" "Runtime" "FAIL" "unlimited:$bad"
  fi
fi

if [ "$DOCKER_OK" -eq 0 ]; then
  record "AUD-13" "Docker socket not mounted into containers" "Runtime" "N/A" "daemon unreachable"
elif [ -z "$(container_ids)" ]; then
  record "AUD-13" "Docker socket not mounted into containers" "Runtime" "WARN" "no running containers to evaluate"
else
  bad=""
  for id in $(container_ids); do
    if container_field "$id" '{{range .Mounts}}{{.Source}}{{"\n"}}{{end}}' | grep -q "/var/run/docker.sock"; then
      name=$(container_field "$id" '{{.Name}}' | sed 's#^/##')
      bad="$bad $name"
    fi
  done
  if [ -z "$bad" ]; then
    record "AUD-13" "Docker socket not mounted into containers" "Runtime" "PASS" "no container mounts the host docker socket"
  else
    record "AUD-13" "Docker socket not mounted into containers" "Runtime" "FAIL" "socket mounted:$bad"
  fi
fi

##### Output ##################################################################

human_report() {
  printf '\nYalgar CIS-aligned container baseline audit v%s\n' "$VERSION"
  printf 'Host: %s (%s %s) · Docker: %s · %s\n\n' "$HOSTNAME_VALUE" "$OS" "$KERNEL" "$DOCKER_VERSION" "$NOW"
  printf 'Connectivity check (not a CIS control): %s — %s\n\n' "$CONN_STATUS" "$CONN_EVIDENCE"
  printf '%-10s %-42s %-8s %-5s %s\n' "ID" "CONTROL" "AREA" "STATE" "EVIDENCE"
  printf '%s\n' "--------------------------------------------------------------------------------------------------------------"
  while IFS="$(printf '\t')" read -r id title area status evidence; do
    printf '%-10s %-42s %-8s %-5s %s\n' "$id" "$title" "$area" "$status" "$evidence"
  done < "$RESULTS"
  printf '%s\n' "--------------------------------------------------------------------------------------------------------------"
  printf 'CIS-aligned: PASS %d · FAIL %d · WARN %d · N/A %d · TOTAL %d\n\n' "$PASS" "$FAIL" "$WARN" "$NA" "$TOTAL"
  printf 'AUD-01..AUD-13 are Yalgar identifiers grouped by CIS Docker Benchmark area, not verified\n'
  printf 'CIS rule numbers; this is not a certifying CIS assessment. Read-only audit.\n'
}

json_report() {
  printf '{\n'
  printf '  "tool": "ycc-cis-audit",\n'
  printf '  "version": "%s",\n' "$VERSION"
  printf '  "framework": "CIS-aligned",\n'
  printf '  "note": "AUD identifiers are Yalgar'\''s own; not verified CIS rule numbers; not a certifying CIS assessment",\n'
  printf '  "generatedAt": "%s",\n' "$NOW"
  printf '  "host": {"hostname": "%s", "os": "%s", "kernel": "%s", "docker": "%s"},\n' \
    "$(escape "$HOSTNAME_VALUE")" "$(escape "$OS")" "$(escape "$KERNEL")" "$(escape "$DOCKER_VERSION")"
  printf '  "connectivity": {"id": "HOST 000", "title": "Docker daemon reachable", "status": "%s", "evidence": "%s"},\n' \
    "$(escape "$CONN_STATUS")" "$(escape "$CONN_EVIDENCE")"
  printf '  "summary": {"pass": %d, "fail": %d, "warn": %d, "na": %d, "total": %d},\n' "$PASS" "$FAIL" "$WARN" "$NA" "$TOTAL"
  printf '  "checks": [\n'
  first=1
  while IFS="$(printf '\t')" read -r id title area status evidence; do
    [ "$first" -eq 0 ] && printf ',\n'
    first=0
    printf '    {"id": "%s", "title": "%s", "area": "%s", "status": "%s", "evidence": "%s"}' \
      "$(escape "$id")" "$(escape "$title")" "$(escape "$area")" "$(escape "$status")" "$(escape "$evidence")"
  done < "$RESULTS"
  printf '\n  ]\n}\n'
}

if [ "$JSON" -eq 1 ]; then
  json_report
else
  human_report
fi

if [ -n "$OUT_DIR" ]; then
  human_report > "$OUT_DIR/audit.txt"
  json_report > "$OUT_DIR/audit.json"
  printf 'Wrote %s/audit.json and %s/audit.txt\n' "$OUT_DIR" "$OUT_DIR" >&2
fi

if { [ "$FAIL" -gt 0 ] || [ "$CONN_STATUS" != "PASS" ]; } && [ "$FAIL_EXIT" -eq 1 ]; then
  exit 1
fi
exit 0
