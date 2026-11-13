import Link from "next/link";

const metrics = [
  {
    label: "Baseline Controls",
    value: "10/14",
    note: "PASS · 1 open finding · 3 N/A",
  },
  {
    label: "Weak-Env Failures",
    value: "6",
    note: "Caught across two deliberately weak containers",
  },
  {
    label: "Control Coverage",
    value: "14",
    note: "CIS Docker baseline · read-only harness",
  },
  {
    label: "Execution Footprint",
    value: "Zero-Agent",
    note: "Stateless POSIX CLI · no agents installed",
  },
];

export function CaseStudyHero() {
  return (
    <section className="w-full bg-surface-container-lowest">
      <div className="mx-auto max-w-[1120px] px-margin py-space-xl md:px-margin-tablet lg:px-margin-desktop">
        <nav
          aria-label="Breadcrumb"
          className="mb-space-lg flex flex-wrap items-center gap-space-xs"
        >
          <Link
            href="/"
            className="font-label-md text-label-md text-on-surface-variant no-underline transition-colors hover:text-primary"
          >
            Portfolio
          </Link>
          <span aria-hidden="true" className="font-label-md text-label-md text-outline">
            /
          </span>
          <Link
            href="/work"
            className="font-label-md text-label-md text-on-surface-variant no-underline transition-colors hover:text-primary"
          >
            Selected work
          </Link>
          <span aria-hidden="true" className="font-label-md text-label-md text-outline">
            /
          </span>
          <span
            aria-current="page"
            className="font-label-md text-label-md font-semibold text-primary"
          >
            Lab Project #084-CIS
          </span>
        </nav>

        <div className="flex flex-wrap items-center justify-between gap-space-md pb-space-md">
          <span className="inline-block bg-surface-container px-3 py-1 font-label-md font-semibold uppercase tracking-wider text-caption text-primary">
            Lab Project · Infrastructure Security
          </span>
          <div className="font-caption text-caption uppercase tracking-widest text-outline">
            Ref: YLG-AUD-2026-084 · Distribution: Public excerpt
          </div>
        </div>

        <div className="mt-space-md max-w-4xl">
          <h1 className="font-display text-headline-lg leading-tight text-primary md:text-display">
            Container Environment Baseline{" "}
            <span className="whitespace-nowrap">&amp; CIS Audit</span>
          </h1>
          <p className="mt-space-md max-w-3xl font-body-lg text-body-lg text-on-surface-variant">
            A read-only, 14-control CIS Docker baseline run against a hardened
            production container and a deliberately weak companion environment —
            with findings, remediation and reproducible evidence.
          </p>
        </div>

        <div className="mt-space-xl grid grid-cols-1 gap-[1px] bg-surface-container-low sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="flex flex-col justify-between bg-surface-container-lowest p-space-lg"
            >
              <span className="font-caption text-caption uppercase tracking-wider text-outline">
                {metric.label}
              </span>
              <div className="my-space-sm">
                <span className="font-display text-headline-lg tracking-tight text-primary">
                  {metric.value}
                </span>
              </div>
              <span className="font-caption text-caption text-on-surface-variant">
                {metric.note}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
