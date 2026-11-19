import Link from "next/link";

import { selectedWork } from "@/lib/content";

export function SelectedWork() {
  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="w-full scroll-mt-20 bg-surface-container-lowest py-section-mobile md:py-section-desktop"
    >
      <div className="mx-auto max-w-[1120px] px-margin md:px-margin-tablet lg:px-margin-desktop">
        <div className="mb-space-xl flex flex-col justify-between gap-space-sm md:flex-row md:items-baseline">
          <div>
            <span className="font-label-md text-label-md uppercase tracking-wider text-outline">
              Portfolio
            </span>
            <h2
              id="work-heading"
              className="mt-space-xs font-headline-lg text-headline-md text-primary md:text-headline-lg"
            >
              Selected work
            </h2>
          </div>
          <Link
            href="/work"
            className="inline-flex min-h-[var(--control-min-height)] items-center font-label-md text-label-md text-primary underline underline-offset-4 transition-colors hover:text-on-surface-variant"
          >
            View all projects
          </Link>
        </div>

        <div className="divide-y divide-outline-variant border-t border-outline-variant">
          {selectedWork.map((item) => (
            <article
              key={item.slug}
              className="flex flex-col justify-between gap-space-lg py-space-lg md:flex-row md:items-start md:py-space-xl"
            >
              <div className="max-w-2xl">
                <span className="mb-space-xs block font-caption text-caption uppercase tracking-wider text-outline">
                  {item.label}
                </span>
                <h3 className="mb-space-xs font-headline-sm text-headline-sm text-primary">
                  {item.title}
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  {item.body}
                </p>
              </div>
              <div className="shrink-0 pt-space-xs">
                <Link
                  href={item.href}
                  className="inline-flex min-h-[var(--control-min-height)] items-center font-label-md text-label-md text-primary underline underline-offset-4 transition-colors hover:text-on-surface-variant"
                >
                  Read case study
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
