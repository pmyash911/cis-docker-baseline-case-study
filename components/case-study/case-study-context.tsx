const profile = [
  {
    label: "Target Infrastructure",
    value: "Linux host · Docker 29.9.3",
    note: "Hardened reference container + deliberately weak companion",
  },
  {
    label: "Engagement Horizon",
    value: "Fixed-scope baseline audit",
    note: "13 CIS-aligned controls + one connectivity check",
  },
  {
    label: "Primary Risk Area",
    value: "Privilege escalation exposure",
    note: "Unchecked socket mounts, remote API and default capabilities",
  },
];

export function CaseStudyContext() {
  return (
    <section className="w-full bg-surface-container-lowest py-space-xl">
      <div className="mx-auto max-w-[1120px] px-margin md:px-margin-tablet lg:px-margin-desktop">
        <div className="grid grid-cols-1 gap-space-xl lg:grid-cols-12">
          <div className="space-y-space-lg lg:col-span-4">
            <div>
              <span className="mb-space-xs block font-caption text-caption uppercase tracking-widest text-outline">
                01 // CONTEXT
              </span>
              <h2 className="font-headline-sm text-headline-sm text-primary">
                Operational profile and challenge
              </h2>
            </div>
            <div className="border-t border-outline-variant pt-space-lg">
              {profile.map((entry) => (
                <div key={entry.label}>
                  <div className="font-caption text-caption uppercase text-outline">
                    {entry.label}
                  </div>
                  <div className="mt-1 font-body-bold text-body-bold text-primary">
                    {entry.value}
                  </div>
                  <div className="font-caption text-caption text-on-surface-variant">
                    {entry.note}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-space-lg lg:col-span-8">
            <div>
              <h3 className="mb-space-sm font-headline-sm text-headline-sm text-primary">
                The measurement problem
              </h3>
              <p className="font-body-md leading-relaxed text-body-md text-on-surface-variant">
                Container hardening is easy to claim and hard to evidence. A
                one-off shell check or a semi-annual spreadsheet cannot show
                whether a running host still matches its intended configuration,
                and ad-hoc checks rarely survive from one environment to the
                next.
              </p>
              <p className="mt-space-sm font-body-md leading-relaxed text-body-md text-on-surface-variant">
                This lab treats the audit as a measurement. The same read-only
                harness runs against a hardened reference container and a
                deliberately weak companion, so every control reports PASS, FAIL,
                WARN or N/A with the evidence string that produced the state.
              </p>
            </div>
            <div className="pt-space-md">
              <h3 className="mb-space-sm font-headline-sm text-headline-sm text-primary">
                What was built
              </h3>
              <p className="font-body-md leading-relaxed text-body-md text-on-surface-variant">
                I wrote a standalone, zero-dependency validation harness for the
                CIS-aligned control set. It is POSIX shell and runs entirely
                out-of-band: no daemon agents, no sidecars, no elevated network
                permissions.
              </p>
              <p className="mt-space-sm font-body-md leading-relaxed text-body-md text-on-surface-variant">
                The harness produces deterministic, machine-readable JSON plus a
                plain-language terminal summary, and it is read-only — it
                inspects the host and every running container but never writes to
                them. The controls are grouped by the areas the CIS Docker
                Benchmark covers and carry our own AUD-01 to AUD-13
                identifiers. They are not verified CIS rule numbers; this is
                CIS-aligned work, not a certifying CIS assessment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
