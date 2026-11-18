# Homelab run — 20261118-235455

- Host: Linux 6.12.114
- Node: v22.23.4
- Docker: 29.9.3
- Core path: HEALTHY

## Tests
- pass 9
- fail 0

## Baseline CIS audit
```json
{"pass":10,"fail":1,"warn":0,"na":3,"total":14}
```

Artifacts in this directory:

- `tests.log` / `tests-summary.txt`
- `build.log`, `docker-build.log`, `container.log`
- `http.log` (routes + API dry-run)
- `cis-baseline/audit.json` + `audit.txt`
- `cis-weak/audit.json` (Linux only) and `cis-weak-daemon/audit.json`
- `env.txt`, `run.log`

Core path PASSED.
