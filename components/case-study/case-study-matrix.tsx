type MatrixRow = {
  rule: string;
  title: string;
  note: string;
  level: string;
  status: "PASS" | "FAIL" | "N/A";
  directive: string;
};

const rows: MatrixRow[] = [
  {
    rule: "CIS 1.1.1",
    title: "Host Filesystem Auditing",
    note: "Verify auditd rule configuration for docker daemon files",
    level: "Level 1",
    status: "N/A",
    directive: "—",
  },
  {
    rule: "CIS 2.1.4",
    title: "Default ulimit Enforcement",
    note: "Check core dump & open file handles in daemon config",
    level: "Level 1",
    status: "FAIL",
    directive:
      'Set "default-ulimits": {"nofile": {"Name":"nofile","Hard":64000,"Soft":64000}}',
  },
  {
    rule: "CIS 4.1.2",
    title: "Non-Root User Declaration",
    note: "Ensure container manifest designates unprivileged UID > 1000",
    level: "Level 1",
    status: "PASS",
    directive: "Inject USER nonroot:nonroot (UID 65532) in Dockerfile build stage",
  },
  {
    rule: "CIS 5.1.1",
    title: "AppArmor Profile Attestation",
    note: "Verify docker-default or tailored security profile active",
    level: "Level 1",
    status: "N/A",
    directive: "—",
  },
  {
    rule: "CIS 5.2.2",
    title: "Read-Only Root Filesystem",
    note: "Ensure write operations strictly directed to mounted tmpfs",
    level: "Level 2",
    status: "PASS",
    directive: "--read-only runtime invocation active on production services",
  },
];

export function CaseStudyMatrix() {
  return (
    <section className="w-full bg-surface-container-lowest py-space-xl">
      <div className="mx-auto max-w-[1120px] px-margin md:px-margin-tablet lg:px-margin-desktop">
        <div className="mb-space-xl flex flex-col justify-between gap-space-md md:flex-row md:items-end">
          <div>
            <span className="mb-space-xs block font-caption text-caption uppercase tracking-widest text-outline">
              03 // EVALUATION MATRIX
            </span>
            <h2 className="font-headline-md text-headline-md text-primary">
              Representative CIS Rule Verification Matrix
            </h2>
          </div>
          <div className="font-caption text-caption text-outline">
            Sample controls from the 14-control public baseline
          </div>
        </div>

        <div className="w-full overflow-x-auto bg-surface-container-lowest">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface-container font-label-md text-caption uppercase tracking-wider text-primary">
                <th className="w-28 px-space-md py-space-sm">Rule ID</th>
                <th className="px-space-md py-space-sm">Control Description</th>
                <th className="w-28 px-space-md py-space-sm">CIS Level</th>
                <th className="w-32 px-space-md py-space-sm">Status</th>
                <th className="hidden px-space-md py-space-sm md:table-cell">
                  Automated Remediation Directive
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-highest font-body-md text-sm">
              {rows.map((row) => (
                <tr
                  key={row.rule}
                  className="transition-colors hover:bg-surface-container-low"
                >
                  <td className="px-space-md py-space-md font-mono font-semibold text-primary">
                    {row.rule}
                  </td>
                  <td className="px-space-md py-space-md">
                    <span className="block font-semibold text-on-surface">
                      {row.title}
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      {row.note}
                    </span>
                  </td>
                  <td className="px-space-md py-space-md font-caption text-outline">
                    {row.level}
                  </td>
                  <td className="px-space-md py-space-md">
                    <span
                      className={
                        row.status === "PASS"
                          ? "inline-flex items-center bg-surface-container px-2 py-0.5 font-mono text-xs font-semibold text-primary"
                          : row.status === "N/A"
                            ? "inline-flex items-center bg-surface-container-low px-2 py-0.5 font-mono text-xs font-semibold text-outline"
                            : "inline-flex items-center bg-error-container px-2 py-0.5 font-mono text-xs font-semibold text-on-error-container"
                      }
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="hidden px-space-md py-space-md font-mono text-xs text-on-surface-variant md:table-cell">
                    {row.directive}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-space-md flex flex-col justify-between gap-space-xs text-caption text-outline sm:flex-row sm:items-center">
          <div>* Evaluated against CIS Docker Benchmark v1.6.0 control descriptions; measured 18 Nov 2026.</div>
          <div>N/A is reported explicitly and never counted as a pass.</div>
        </div>
      </div>
    </section>
  );
}
