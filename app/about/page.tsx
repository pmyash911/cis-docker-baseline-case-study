import type { Metadata } from "next";
import Link from "next/link";

import { SectionDivider } from "@/components/section-divider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description:
    "Yash Patel runs Yalgar Consulting LLC, an independent practice in security risk assessment, vendor and supply chain review, and web application security.",
};

const background = [
  { label: "Name", value: siteConfig.person },
  { label: "Based in", value: siteConfig.location },
  { label: "Founded", value: siteConfig.founded },
  { label: "Degrees and credentials", value: siteConfig.credentials },
];

const contactLinks = [
  { label: "Email", value: siteConfig.email, href: `mailto:${siteConfig.email}` },
  { label: "LinkedIn", value: "linkedin.com/in/yash-patelycc", href: siteConfig.linkedin },
  { label: "GitHub", value: "github.com/pmyash911", href: siteConfig.github },
  { label: "Resume", value: "resume.pdf", href: siteConfig.resume },
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1 pt-16">
        <section className="w-full bg-surface-container-lowest py-section-mobile md:py-section-desktop">
          <div className="mx-auto max-w-[1120px] px-margin md:px-margin-tablet lg:px-margin-desktop">
            <div className="max-w-[70ch]">
              <span className="font-label-md text-label-md uppercase tracking-wider text-outline">
                About
              </span>
              <h1 className="mb-space-lg mt-space-xs font-display text-headline-lg font-semibold tracking-tight text-primary md:text-display">
                {siteConfig.person}
              </h1>
              <div className="space-y-space-lg font-body-lg text-body-lg leading-relaxed text-on-surface-variant">
                <p>
                  I am Yash Patel. I run {siteConfig.name}, where I do hands-on
                  security, supply chain, and operations work for small and
                  mid-size organizations.
                </p>
                <p>
                  Most of the work starts with a question a small team cannot
                  afford to guess at: is this system safe to run, is this
                  supplier safe to depend on, and what to fix first? I answer
                  those questions with evidence, not opinion. I keep scopes
                  fixed, test against recognized standards such as the NIST
                  Cybersecurity Framework and CIS benchmarks, and report what I
                  found in plain language: what the problem is, why it matters,
                  and who owns the fix.
                </p>
                <p>
                  My public work is lab work. The case studies on this site come
                  from systems I control, and I publish the method and the
                  evidence so the result can be checked rather than taken on
                  trust.
                </p>
              </div>
            </div>
          </div>
        </section>

        <SectionDivider />

        <section
          aria-labelledby="background-heading"
          className="w-full bg-surface-container-lowest py-section-mobile md:py-section-desktop"
        >
          <div className="mx-auto max-w-[1120px] px-margin md:px-margin-tablet lg:px-margin-desktop">
            <div className="max-w-3xl">
              <h2
                id="background-heading"
                className="mb-space-lg font-headline-lg text-headline-md text-primary md:text-headline-lg"
              >
                Background
              </h2>
              <dl className="divide-y divide-outline-variant border-y border-outline-variant">
                {background.map((fact) => (
                  <div
                    key={fact.label}
                    className="grid grid-cols-1 gap-space-xs py-space-md md:grid-cols-[16rem_1fr]"
                  >
                    <dt className="font-label-md text-label-md uppercase tracking-wider text-outline">
                      {fact.label}
                    </dt>
                    <dd className="font-body-md text-body-md text-on-surface">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <SectionDivider />

        <section
          aria-labelledby="contact-heading"
          className="w-full bg-surface-container-lowest py-section-mobile md:py-section-desktop"
        >
          <div className="mx-auto max-w-[1120px] px-margin md:px-margin-tablet lg:px-margin-desktop">
            <div className="max-w-3xl">
              <h2
                id="contact-heading"
                className="mb-space-lg font-headline-lg text-headline-md text-primary md:text-headline-lg"
              >
                Contact
              </h2>
              <ul className="divide-y divide-outline-variant border-y border-outline-variant">
                {contactLinks.map((link) => (
                  <li
                    key={link.label}
                    className="flex flex-col gap-space-xs py-space-md sm:flex-row sm:items-baseline sm:justify-between"
                  >
                    <span className="font-label-md text-label-md uppercase tracking-wider text-outline">
                      {link.label}
                    </span>
                    <a
                      href={link.href}
                      className="font-body-md text-body-md text-primary underline underline-offset-4 transition-colors hover:text-on-surface-variant"
                    >
                      {link.value}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-space-lg font-body-md text-body-md text-on-surface-variant">
                For a scoped review,{" "}
                <Link
                  href="/#contact"
                  className="text-primary underline underline-offset-4 transition-colors hover:text-on-surface-variant"
                >
                  send a consultation request
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
