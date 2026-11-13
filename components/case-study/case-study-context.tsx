const profile = [
  {
    label: "Target Infrastructure",
    value: "Linux host · Docker 29.9.3",
    note: "Hardened container + deliberately weak companion",
  },
  {
    label: "Engagement Horizon",
    value: "Fixed-scope baseline audit",
    note: "14-control public harness",
  },
  {
    label: "Primary Risk Factor",
    value: "Privilege Escalation Exposure",
    note: "Unchecked socket mounts & default caps",
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
                Operational Profile &amp; Challenge
              </h2>
            </div>
            <div className="space-y-space-md bg-surface-container-low p-space-lg">
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
                The Vulnerability Bottleneck
              </h3>
              <p className="font-body-md leading-relaxed text-body-md text-on-surface-variant">
                Prior to Yalgar&apos;s intervention, the engineering organization
                relied on manual, ad-hoc shell checks and semi-annual compliance
                spreadsheets. Hardening validation took approximately four hours
                per release cycle across heterogeneous staging and production
                hosts.
              </p>
              <p className="mt-space-sm font-body-md leading-relaxed text-body-md text-on-surface-variant">
                This latency incentivized pipeline bypasses, allowing
                misconfigurations—including root execution defaults, unrestricted
                ulimits, and exposed daemon sockets—to slip undetected into
                production runtime nodes. Inconsistent audit artifacts also made
                historical compliance hard to defend during external audits.
              </p>
            </div>
            <div className="pt-space-md">
              <h3 className="mb-space-sm font-headline-sm text-headline-sm text-primary">
                Engineered Remediation
              </h3>
              <p className="font-body-md leading-relaxed text-body-md text-on-surface-variant">
                Yalgar engineered a standalone, zero-dependency validation harness
                mapped directly to the Center for Internet Security (CIS) Docker
                Benchmark v1.6.0. Written in strictly validated POSIX shell, the
                tool operates entirely out-of-band without persistent daemon
                agents or elevated network permissions.
              </p>
              <p className="mt-space-sm font-body-md leading-relaxed text-body-md text-on-surface-variant">
                The harness produces deterministic, machine-readable JSON
                telemetry paired with plain-language terminal summaries, and runs
                read-only without installing agents.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
