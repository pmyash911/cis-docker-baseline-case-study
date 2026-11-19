# Recorded evidence

These files are the **raw output of the audit harness as it ran** on 18 November 2026
(Docker Cloud Sandbox, Linux 6.12 aarch64, Docker 29.9.3). They are kept unedited.

- The JSON still uses the harness's v1.0.0 identifiers (`CIS 1.1.1`, `CIS 2.1.4`, …). Those were
  labels for our own checks; they are **not** CIS Docker Benchmark rule numbers.
- The dossier maps every recorded identifier to the current `AUD-01 … AUD-13` identifiers and the
  separate connectivity check **without changing any status or evidence string**. The mapping is in
  the dossier's evidence table.
- `summary` in these files counts all 14 recorded rows, including the connectivity row. The
  current harness reports 13 CIS-aligned controls plus the connectivity check separately.

`run-report.md` describes the run; `bundle.tar.gz` is the hashed archive of the log set.
