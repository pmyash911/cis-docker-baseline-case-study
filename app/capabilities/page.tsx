import type { Metadata } from "next";

import { ContactBand } from "@/components/contact-band";
import { SectionDivider } from "@/components/section-divider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { capabilityDetails } from "@/lib/content";

export const metadata: Metadata = {
  title: "Capabilities",
  description:
    "Fixed-scope security risk assessments, vendor and supply chain reviews, and web application reviews: what I look at, and what you get.",
};

export default function CapabilitiesPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1 pt-16">
        <section className="w-full bg-surface-container-lowest py-section-mobile md:py-section-desktop">
          <div className="mx-auto max-w-[1120px] px-margin md:px-margin-tablet lg:px-margin-desktop">
            <div className="max-w-[70ch]">
              <span className="font-label-md text-label-md uppercase tracking-wider text-outline">
                Capabilities
              </span>
              <h1 className="mb-space-lg mt-space-xs font-display text-headline-lg font-semibold tracking-tight text-primary md:text-display">
                Capabilities
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                I do three kinds of fixed-scope work. Each one ends the same way:
                a written answer to what to fix, why it matters, and who owns it.
              </p>
            </div>
          </div>
        </section>

        <SectionDivider />

        <section
          aria-labelledby="capabilities-list-heading"
          className="w-full bg-surface-container-lowest py-section-mobile md:py-section-desktop"
        >
          <div className="mx-auto max-w-[1120px] px-margin md:px-margin-tablet lg:px-margin-desktop">
            <h2 id="capabilities-list-heading" className="sr-only">
              Capabilities in detail
            </h2>
            <div className="max-w-3xl divide-y divide-outline-variant border-t border-outline-variant">
              {capabilityDetails.map((capability) => (
                <article key={capability.title} className="py-space-xl">
                  <h3 className="mb-space-sm font-headline-lg text-headline-md text-primary md:text-headline-lg">
                    {capability.title}
                  </h3>
                  <p className="mb-space-lg font-body-md text-body-md text-on-surface-variant">
                    {capability.body}
                  </p>

                  <h4 className="mb-space-xs font-label-md text-label-md uppercase tracking-wider text-outline">
                    What I look at
                  </h4>
                  <ul className="border-t border-outline-variant">
                    {capability.includes.map((item) => (
                      <li
                        key={item}
                        className="border-b border-outline-variant py-space-sm font-body-md text-body-md text-on-surface-variant"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>

                  <h4 className="mb-space-xs mt-space-lg font-label-md text-label-md uppercase tracking-wider text-outline">
                    What you get
                  </h4>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    {capability.deliverable}
                  </p>
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
