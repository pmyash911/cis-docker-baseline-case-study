type MatrixRow = {
  id: string;
  title: string;
  note: string;
  area: string;
  baseline: "PASS" | "FAIL" | "N/A";
  weak: "PASS" | "FAIL" | "N/A";
  directive: string;
};

const rows: MatrixRow[] = [
  {
    id: "AUD-01",
    title: "Host filesystem auditing",
    note: "auditd rules covering the docker daemon and its files",
    area: "Host",
    baseline: "N/A",
    weak: "N/A",
    directive: "Not evaluable: auditd is not installed on the sandbox host",
  },
  {
    id: "AUD-04",
    title: "Default ulimit enforcement",
    note: "Core-dump and open-file defaults in the daemon config",
    area: "Daemon",
    baseline: "FAIL",
    weak: "FAIL",
    directive:
      'Set "default-ulimits": {"nofile": {"Name": "nofile", "Hard": 64000, "Soft": 64000}}',
  },
  {
    id: "AUD-08",
    title: "Non-root user declaration",
    note: "Container manifest designates an unprivileged user",
    area: "Images",
    baseline: "PASS",
    weak: "FAIL",
    directive: "Add an explicit non-root USER to the image and drop privileges at runtime",
  },
  {
    id: "AUD-09",
    title: "AppArmor profile enforcement",
    note: "docker-default or tailored security profile active",
    area: "Runtime",
    baseline: "N/A",
    weak: "N/A",
    directive: "Not evaluable: AppArmor is not available on the sandbox kernel",
  },
  {
    id: "AUD-10",
    title: "Read-only root filesystem",
    note: "Write operations routed to mounted tmpfs",
    area: "Runtime",
    baseline: "PASS",
    weak: "FAIL",
    directive: "--read-only runtime invocation active on reference services",
  },
];

function stateClass(status: MatrixRow["baseline"]) {
  if (status === "FAIL") return "text-error";
  if (status === "N/A") return "text-outline";
  return "text-primary";
}

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
              Representative CIS-aligned verification matrix
            </h2>
          </div>
          <div className="font-caption text-caption text-outline">
            Sample controls from the 13-control CIS-aligned baseline
          </div>
        </div>

        <div className="w-full overflow-x-auto bg-surface-container-lowest">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-y border-outline-variant font-label-md text-caption uppercase tracking-wider text-primary">
                <th className="w-24 px-space-md py-space-sm">ID</th>
                <th className="px-space-md py-space-sm">Control</th>
                <th className="w-24 px-space-md py-space-sm">Area</th>
                <th className="w-24 px-space-md py-space-sm">Baseline</th>
                <th className="w-24 px-space-md py-space-sm">Weak</th>
                <th className="hidden px-space-md py-space-sm md:table-cell">
                  Remediation directive
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-highest font-body-md text-sm">
              {rows.map((row) => (
                <tr key={row.id} className=" hover:bg-surface-container-low">
                  <td className="px-space-md py-space-md font-mono font-semibold text-primary">
                    {row.id}
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
                    {row.area}
                  </td>
                  <td
                    className={`px-space-md py-space-md font-mono text-xs font-semibold ${stateClass(row.baseline)}`}
                  >
                    {row.baseline}
                  </td>
                  <td
                    className={`px-space-md py-space-md font-mono text-xs font-semibold ${stateClass(row.weak)}`}
                  >
                    {row.weak}
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
          <div>
            * CIS-aligned controls with our own AUD-xx identifiers, grouped by
            CIS Docker Benchmark area. They are not verified CIS rule numbers and
            this is not a certifying CIS assessment. Measured 18 Nov 2026.
          </div>
          <div>N/A is reported explicitly and never counted as a pass.</div>
        </div>
      </div>
    </section>
  );
}
