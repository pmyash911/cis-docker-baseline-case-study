import {
  IconFileText,
  IconTerminal,
  IconWorkflow,
} from "@/components/icons";

const deliverables = [
  {
    icon: IconFileText,
    title: "Executive Briefing Folio",
    body: "Synthesized, plain-language legal and risk summary tailored for the CISO, VP Engineering, and Board Audit Committee. Features prioritized residual risk ratings, compliance delta mappings, and audit-defensibility metrics.",
    format: "Format: Board-ready PDF",
  },
  {
    icon: IconTerminal,
    title: "Prioritized Remediation Backlog",
    body: "Jira-compatible and Markdown-native ticket backlog containing copy-pasteable configuration stanzas, kernel parameter overrides, and exact Dockerfile refactoring instructions organized by operational severity.",
    format: "Format: Jira JSON + Markdown",
  },
  {
    icon: IconWorkflow,
    title: "Continuous Audit Runner",
    body: "Single-binary / zero-dependency shell runner that executes as a continuous pre-deployment gate. Halts unhardened images and flags regressions immediately with automated PR commentary.",
    format: "Format: POSIX Shell + GitHub Action",
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
            Deliverables Transferred
          </h2>
          <p className="mt-space-xs max-w-2xl font-body-md text-body-md text-on-surface-variant">
            Following Yalgar&apos;s fixed-scope model, code and technical
            governance frameworks become perpetual client property upon
            engagement sign-off.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-space-lg md:grid-cols-3">
          {deliverables.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex flex-col justify-between bg-surface-container-lowest p-space-lg"
              >
                <div className="space-y-space-md">
                  <div className="flex h-10 w-10 items-center justify-center bg-surface-container text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-primary">
                    {item.title}
                  </h3>
                  <p className="text-sm font-body-md leading-relaxed text-body-md text-on-surface-variant">
                    {item.body}
                  </p>
                </div>
                <div className="mt-space-lg border-t border-surface-container-highest pt-space-lg">
                  <span className="block font-caption text-caption uppercase tracking-wider text-outline">
                    {item.format}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
