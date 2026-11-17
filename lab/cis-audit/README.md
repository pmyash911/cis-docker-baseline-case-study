# CIS lab — audit harness

Read-only CIS Docker baseline checks used to produce real evidence for the
"Container Environment Baseline & CIS Audit" case study.

```bash
./audit.sh                                   # human-readable summary
./audit.sh --json --out ../../artifacts/cis-baseline
./audit.sh --daemon-config ./weak-daemon.json --no-fail-exit   # demo failures
```

- **Read-only**: inspects daemon config, file permissions, auditd rules and the
  runtime flags of running containers. It installs nothing and changes nothing.
- **Zero dependencies**: POSIX `sh`, `docker`, coreutils. JSON is emitted directly.
- **Exit code**: `0` all clear, `1` failures found (use `--no-fail-exit` for demos).

## What it checks

| Area | Rules |
|---|---|
| Host | auditd docker rules (`1.1.1`), `/var/lib/docker` separation (`1.1.2`), daemon config perms (`1.1.3`) |
| Daemon | default-ulimits (`2.1.4`), remote API TLS (`2.2.1`) |
| Files | docker socket perms (`3.3.6`), systemd unit perms (`3.1.1`) |
| Images | containers run non-root (`4.1.2`) |
| Runtime | AppArmor (`5.1.1`), read-only rootfs (`5.2.2`), privileged (`5.2.3`), limits (`5.1.5`), docker-socket mounts (`5.2.1`) |

## Weak demo (Linux sandbox only)

`demo-weak.sh` starts two deliberately weak containers (privileged, root,
unconfined AppArmor, writable rootfs, no limits, docker socket mounted), so the
audit shows real failures before remediation:

```bash
./demo-weak.sh --setup
./audit.sh --json --out ../../artifacts/cis-weak --no-fail-exit
./demo-weak.sh --cleanup
```

For daemon-level failures without touching the host daemon, audit the shipped
fixture: `./audit.sh --daemon-config ./weak-daemon.json --no-fail-exit`.
