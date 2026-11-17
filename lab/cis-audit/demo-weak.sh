#!/bin/sh
# demo-weak.sh — create a deliberately weak Docker environment for the CIS lab,
# audit it, then clean up. Linux-only (it needs a real Docker daemon and AppArmor).
#
# Usage:
#   ./demo-weak.sh --setup     # create network + weak containers
#   ./demo-weak.sh --status    # show what is running
#   ./demo-weak.sh --cleanup   # remove containers + network
#
# Do not run this on a machine you care about without reading it: it starts
# privileged containers and mounts the docker socket *inside* the sandbox only.
set -u

MODE="${1:---status}"
NETWORK="cislab"
WEAK1="cis-weak-1"
WEAK2="cis-weak-2"

require_linux() {
  if [ "$(uname -s)" != "Linux" ]; then
    echo "This demo needs Linux with a real Docker daemon (Docker Desktop on macOS is not enough)." >&2
    echo "Run it inside the Docker Cloud Sandbox — see HOMELAB-PLAN.md." >&2
    exit 1
  fi
  docker info >/dev/null 2>&1 || { echo "Docker daemon is not reachable." >&2; exit 1; }
}

setup() {
  require_linux
  echo "→ creating network $NETWORK"
  docker network create "$NETWORK" >/dev/null 2>&1 || true

  echo "→ weak container 1: privileged, root user, unconfined AppArmor, writable rootfs, no limits"
  docker rm -f "$WEAK1" >/dev/null 2>&1 || true
  docker run -d --name "$WEAK1" --network "$NETWORK" \
    --privileged \
    --user 0:0 \
    --security-opt apparmor=unconfined \
    nginx:alpine >/dev/null || {
      echo "  ! could not start $WEAK1 (the sandbox may restrict privileged containers)" >&2
    }

  echo "→ weak container 2: root user, docker socket mounted, no limits"
  docker rm -f "$WEAK2" >/dev/null 2>&1 || true
  docker run -d --name "$WEAK2" --network "$NETWORK" \
    --user root \
    -v /var/run/docker.sock:/var/run/docker.sock \
    alpine:3.20 sleep 3600 >/dev/null || {
      echo "  ! could not start $WEAK2" >&2
    }

  echo
  echo "Weak environment ready. Now run:"
  echo "  ./audit.sh --json --out ../artifacts/cis-weak --no-fail-exit"
  echo "then clean up with: ./demo-weak.sh --cleanup"
}

status() {
  docker ps --filter "network=$NETWORK" --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}' 2>/dev/null || true
  for name in "$WEAK1" "$WEAK2"; do
    docker inspect "$name" >/dev/null 2>&1 || continue
    echo
    echo "$name:"
    docker inspect -f '  privileged={{.HostConfig.Privileged}} user={{if .Config.User}}{{.Config.User}}{{else}}(default/root){{end}} read_only={{.HostConfig.ReadonlyRootfs}} memory={{.HostConfig.Memory}} nanocpus={{.HostConfig.NanoCpus}} apparmor={{join .HostConfig.SecurityOpt ","}}' "$name" 2>/dev/null
  done
}

cleanup() {
  for name in "$WEAK1" "$WEAK2"; do
    docker rm -f "$name" >/dev/null 2>&1 || true
  done
  docker network rm "$NETWORK" >/dev/null 2>&1 || true
  echo "Removed $WEAK1, $WEAK2 and network $NETWORK."
}

case "$MODE" in
  --setup) setup ;;
  --status) status ;;
  --cleanup) cleanup ;;
  *) echo "usage: $0 --setup | --status | --cleanup" >&2; exit 2 ;;
esac
