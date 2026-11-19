const deliverables = [
  {
    title: "Executive briefing folio",
    body: "Synthesized, plain-language legal and risk summary tailored for the CISO, VP Engineering, and Board Audit Committee. Features prioritized residual risk ratings, compliance delta mappings, and audit-defensibility metrics.",
    format: "Format: board-ready PDF",
  },
  {
    title: "Prioritized remediation backlog",
    body: "Jira-compatible and Markdown-native ticket backlog containing copy-pasteable configuration stanzas, kernel parameter overrides, and exact Dockerfile refactoring instructions organized by operational severity.",
    format: "Format: Jira JSON + Markdown",
  },
  {
    title: "Continuous audit runner",
    body: "Zero-dependency shell runner that executes as a continuous pre-deployment gate. Halts unhardened images and flags regressions immediately with automated PR commentary.",
    format: "Format: POSIX shell + GitHub Action",
  },
];

export function CaseStudyDeliverables() {
  return (
    <section className="w-full bg-surface-container-low py-space-xl">
      <div className="mx-auto max-w-[1120px] px-margin md:px-margin-tablet lg:px-margin-desktop">
        <div className="mb-space-xl">
          <span className="mb-space-xs block font-caption text-caption uppercase tracking-widest text-outline">
            04 // ARTIFACTS
          </span>
          <h2 className="font-headline-md text-headline-md text-primary">
            Deliverables transferred
          </h2>
          <p className="mt-space-xs max-w-2xl font-body-md text-body-md text-on-surface-variant">
            Following Yalgar&apos;s fixed-scope model, code and technical
            governance frameworks become perpetual client property upon
            engagement sign-off.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-space-lg md:grid-cols-3">
          {deliverables.map((item) => (
            <div
              key={item.title}
              className="flex flex-col justify-between border-t border-outline-variant bg-surface-container-lowest p-space-lg pt-space-md"
            >
              <div className="space-y-space-md">
                <h3 className="font-headline-sm text-headline-sm text-primary">
                  {item.title}
                </h3>
                <p className="text-sm font-body-md leading-relaxed text-body-md text-on-surface-variant">
                  {item.body}
                </p>
              </div>
              <div className="mt-space-lg border-t border-outline-variant pt-space-lg">
                <span className="block font-caption text-caption uppercase tracking-wider text-outline">
                  {item.format}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
