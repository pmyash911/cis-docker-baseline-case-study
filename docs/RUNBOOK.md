# Homelab runbook

Run one unattended validation + CIS audit pass inside a Linux sandbox (Docker Cloud Sandbox,
or any Linux host with Docker), and leave an evidence bundle.

## Setup in a cloud sandbox

```bash
brew trust docker/tap && brew install docker/tap/sbx
sbx login
sbx --cloud create --name ycc-homelab --cpus 2 --memory 4g --ttl 4h --on-timeout stop shell
rsync -a --exclude node_modules --exclude .next --exclude .env --exclude .git \
  ./ /tmp/ycc-src/
sbx --cloud cp /tmp/ycc-src ycc-homelab:/home/agent/workspace
sbx --cloud attach ycc-homelab
```

Inside the sandbox, install Node 22 if it is missing:

```bash
curl -fsSL https://nodejs.org/dist/v22.23.4/node-v22.23.4-linux-arm64.tar.gz -o /tmp/node.tar.gz
sudo tar -C /usr/local --strip-components=1 -xzf /tmp/node.tar.gz
```

## Agent prompt

Paste this into the coding agent running inside the sandbox:

```text
You are in a Linux sandbox with this project at /home/agent/workspace.

Run ONE unattended validation + CIS audit pass and leave an evidence bundle. Do not ask
questions. Do not edit source files. Do not use secrets, .env, CRM, email, or publish ports.

1. Run: bash scripts/run-homelab.sh
2. If it exits non-zero, run it once more, saving output to artifacts/retry.log.
3. Confirm artifacts/homelab-*.tar.gz exists and contains tests.log, build.log,
   docker-build.log, http.log, cis-baseline/audit.json, RUN-REPORT.md.
4. Write artifacts/AGENT-SUMMARY.md with PASS/FAIL for build, tests, container and baseline
   audit, exact counts, anything skipped and why, and the commands used.
5. Print the bundle path and its SHA-256, print HOMELAB DONE, then stop.
```

## What the script does

1. Records the environment (OS, kernel, Node, Docker).
2. Installs dependencies if missing.
3. Builds the site.
4. Runs the 13-test suite (browser tests auto-skip without Chrome).
5. Builds the production image and boots it with hardened flags.
6. Hits all routes and the dossier API in dry-run.
7. Runs the read-only CIS baseline audit while the container is running.
8. Starts the deliberately weak demo containers, audits them, then removes them.
9. Writes `RUN-REPORT.md` and tars the evidence bundle.

## After the run

```bash
sbx --cloud cp ycc-homelab:/home/agent/workspace/artifacts/homelab-XXXX.tar.gz ./
sbx --cloud stop ycc-homelab
```

Stopped sandboxes are not billed. The bundle is the deliverable; the sandbox is disposable.
