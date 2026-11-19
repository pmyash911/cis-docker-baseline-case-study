import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/lib/content";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How Yalgar Consulting LLC handles information submitted through this website.",
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1 pt-16">
        <section className="w-full bg-surface-container-lowest py-section-mobile md:py-section-desktop">
          <div className="mx-auto max-w-[1120px] px-margin md:px-margin-tablet lg:px-margin-desktop">
            <div className="max-w-2xl">
              <span className="font-label-md text-label-md uppercase tracking-wider text-outline">
                Legal
              </span>
              <h1 className="mb-space-lg mt-space-xs font-display text-headline-lg font-semibold tracking-tight text-primary md:text-display">
                Privacy
              </h1>

              <div className="space-y-space-lg font-body-lg text-body-lg leading-relaxed text-on-surface-variant">
                <p>
                  This website is a static informational site. It does not use
                  advertising cookies, third-party analytics, or tracking
                  pixels, and it does not sell or share visitor information.
                </p>
                <p>
                  If you contact {siteConfig.name} by email, the message and any
                  details you include are used only to respond to your inquiry
                  and, where relevant, to prepare a scoped engagement. Email is
                  retained for as long as needed for that purpose.
                </p>
                <p>
                  Engagement documents and assessment findings are treated as
                  confidential client information, are shared only with the
                  people you authorize, and are handled under the terms of the
                  applicable engagement letter.
                </p>
                <p>
                  Questions about this policy, or requests to review or delete
                  correspondence, can be sent to{" "}
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="font-body-bold text-primary underline underline-offset-4 hover:text-on-surface-variant"
                  >
                    {siteConfig.email}
                  </a>
                  .
                </p>
              </div>

              <p className="mt-space-xl font-caption text-caption text-outline">
                Last updated: November 2026
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
