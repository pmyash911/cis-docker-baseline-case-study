# CIS-aligned lab — audit harness

Read-only container-baseline checks used to produce real evidence for the
"Container Environment Baseline & CIS-Aligned Audit" case study.

The harness emits **13 CIS-aligned controls** with internal identifiers
`AUD-01` … `AUD-13`, grouped by the areas the CIS Docker Benchmark covers
(host, daemon, files, images, runtime), plus **one separate connectivity check**
(`HOST 000`). `AUD-xx` is our label — it is not a verified CIS rule number, and
this harness is not a certifying CIS assessment. See the note at the end.

```bash
./audit.sh                                   # human-readable summary
./audit.sh --json --out ../../artifacts/cis-baseline
./audit.sh --daemon-config ./weak-daemon.json --no-fail-exit   # fixture failures
```

- **Read-only**: inspects daemon config, file permissions, auditd rules and the
  runtime flags of running containers. It installs nothing and changes nothing.
- **Zero dependencies**: POSIX `sh`, `docker`, coreutils. JSON is emitted directly.
- **Exit code**: `0` all clear, `1` failures found or the connectivity check
  failed (use `--no-fail-exit` for demos), `2` usage error.

## What it checks

`HOST 000` is reported separately and is never counted in the CIS summary: it is
a precondition for the runtime checks, not a control.

| Area | ID | Control |
|---|---|---|
| Connectivity | HOST 000 | Docker daemon reachable (not a CIS control) |
| Host | AUD-01 | Host filesystem auditing (auditd) rules for Docker |
| Host | AUD-02 | Separate partition for `/var/lib/docker` |
| Host | AUD-03 | Daemon configuration file permissions |
| Daemon | AUD-04 | Default ulimit enforcement |
| Daemon | AUD-05 | Remote API protected by TLS |
| Files | AUD-06 | Docker socket permissions |
| Files | AUD-07 | `docker.service` file permissions |
| Images | AUD-08 | Containers run as non-root |
| Runtime | AUD-09 | AppArmor profile enforced |
| Runtime | AUD-10 | Read-only root filesystem |
| Runtime | AUD-11 | Privileged containers |
| Runtime | AUD-12 | Memory and CPU limits |
| Runtime | AUD-13 | Docker socket not mounted into containers |

JSON shape (`version 2.0.0`):

```json
{
  "tool": "ycc-cis-audit",
  "version": "2.0.0",
  "framework": "CIS-aligned",
  "note": "AUD identifiers are Yalgar's own; not verified CIS rule numbers; not a certifying CIS assessment",
  "generatedAt": "…",
  "host": { "hostname": "…", "os": "…", "kernel": "…", "docker": "…" },
  "connectivity": { "id": "HOST 000", "title": "Docker daemon reachable", "status": "PASS", "evidence": "…" },
  "summary": { "pass": 9, "fail": 1, "warn": 0, "na": 3, "total": 13 },
  "checks": [ { "id": "AUD-01", "title": "…", "area": "Host", "status": "N/A", "evidence": "…" } ]
}
```

`summary` counts the 13 CIS-aligned controls only. `connectivity` carries the
separate daemon-reachability result.

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

## On the CIS attribution

The harness is **CIS-aligned**, not a CIS certification. It does not assert
exact CIS Docker Benchmark rule numbers or a benchmark edition, because those
were not verified against a published edition when the evidence was collected.
The checks inspect running containers and host configuration; a full CIS
assessment also covers build pipelines, image provenance and organisational
process. When the host cannot evaluate a check (for example auditd or AppArmor
is unavailable), the harness reports **N/A** explicitly and never counts it as
a pass.
