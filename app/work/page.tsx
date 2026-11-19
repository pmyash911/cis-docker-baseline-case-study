import type { Metadata } from "next";
import Link from "next/link";

import { ContactBand } from "@/components/contact-band";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { selectedWork, siteConfig } from "@/lib/content";

export const metadata: Metadata = {
  title: "Selected work",
  description:
    "Fixed-scope lab projects and reference engagements in security risk assessment, supply chain review, and web application security.",
};

export default function WorkPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1 pt-16">
        <section className="w-full bg-surface-container-lowest py-section-mobile md:py-section-desktop">
          <div className="mx-auto max-w-[1120px] px-margin md:px-margin-tablet lg:px-margin-desktop">
            <div className="max-w-3xl">
              <span className="font-label-md text-label-md uppercase tracking-wider text-outline">
                Portfolio
              </span>
              <h1 className="mb-space-lg mt-space-xs font-display text-headline-lg font-semibold tracking-tight text-primary md:text-display">
                Selected work
              </h1>
              <p className="max-w-[70ch] font-body-lg text-body-lg text-on-surface-variant">
                A sample of fixed-scope lab projects that show how the work is
                scoped, assessed, and reported. Reference engagements and full
                write-ups are available on request.
              </p>
            </div>
          </div>
        </section>

        <div className="mx-auto w-full max-w-[1120px] px-margin md:px-margin-tablet lg:px-margin-desktop">
          <hr className="w-full border-t border-outline-variant" />
        </div>

        <section className="w-full bg-surface-container-lowest py-section-mobile md:py-section-desktop">
          <div className="mx-auto max-w-[1120px] px-margin md:px-margin-tablet lg:px-margin-desktop">
            <div className="divide-y divide-outline-variant border-t border-outline-variant">
              {selectedWork.map((item) => (
                <article
                  key={item.slug}
                  id={item.slug}
                  className="grid scroll-mt-24 grid-cols-1 gap-space-lg py-space-lg md:grid-cols-12 md:py-space-xl"
                >
                  <div className="md:col-span-8">
                    <span className="mb-space-xs block font-caption text-caption uppercase tracking-wider text-outline">
                      {item.label}
                    </span>
                    <h2 className="mb-space-xs font-headline-sm text-headline-sm text-primary md:text-headline-md">
                      <Link
                        href={item.href}
                        className="transition-colors hover:text-secondary"
                      >
                        {item.title}
                      </Link>
                    </h2>
                    <p className="max-w-[65ch] font-body-md text-body-md text-on-surface-variant">
                      {item.body}
                    </p>
                    {item.href.startsWith("/work/") ? null : (
                      <p className="mt-space-sm max-w-[65ch] font-body-md text-body-md text-on-surface-variant">
                        Detailed methodology, findings, and remediation evidence
                        are withheld from the public summary; request the brief
                        for the full write-up.
                      </p>
                    )}
                  </div>
                  <div className="flex md:col-span-4 md:justify-end">
                    {item.href.startsWith("/work/") ? (
                      <Link
                        href={item.href}
                        className="inline-flex min-h-[var(--control-min-height)] items-center font-label-md text-label-md text-primary underline underline-offset-4 transition-colors hover:text-on-surface-variant"
                      >
                        Read the case study
                      </Link>
                    ) : (
                      <a
                        href={`mailto:${siteConfig.email}?subject=${encodeURIComponent(
                          `Brief request: ${item.title}`,
                        )}`}
                        className="inline-flex min-h-[var(--control-min-height)] items-center font-label-md text-label-md text-primary underline underline-offset-4 transition-colors hover:text-on-surface-variant"
                      >
                        Request the brief
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <ContactBand />
      </main>
      <SiteFooter />
    </>
  );
}
