import Link from "next/link";

import { IconArrowLeft, IconCheck } from "@/components/icons";
import { siteConfig } from "@/lib/content";

import { DossierRequestForm } from "./dossier-request-form";

const includes = [
  "Includes the 14-control public harness specification",
  "Includes sanitized Dockerfile remediation diffs",
  "Direct delivery via encrypted, authenticated link",
];

export function CaseStudyDossier({ caseStudyKey }: { caseStudyKey: string }) {
  return (
    <section className="w-full bg-surface-container-lowest py-space-xl">
      <div className="mx-auto max-w-[1120px] px-margin md:px-margin-tablet lg:px-margin-desktop">
        <div className="bg-surface-container p-space-lg md:p-space-xl">
          <div className="grid grid-cols-1 gap-space-xl lg:grid-cols-12">
            <div className="space-y-space-md lg:col-span-5">
              <span className="block font-caption text-caption uppercase tracking-widest text-outline">
                Controlled Release
              </span>
              <h2 className="font-headline-md text-headline-md text-primary">
                Request the Full Write-Up &amp; Evidence Dossier
              </h2>
              <p className="font-body-md leading-relaxed text-body-md text-on-surface-variant">
                Reference engagements, sanitized vulnerability logs, and the
                complete CIS automated harness codebase are available directly to
                vetted corporate leaders and prospective clients.
              </p>
              <div className="space-y-space-xs pt-space-sm font-caption text-caption text-outline">
                {includes.map((item) => (
                  <div key={item} className="flex items-center gap-space-xs">
                    <IconCheck className="h-4 w-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="pt-space-md">
                <p className="font-caption text-caption text-on-surface-variant">
                  Prefer direct correspondence? Reach out via{" "}
                  <a
                    className="font-semibold text-primary underline underline-offset-4 hover:opacity-80"
                    href={`mailto:${siteConfig.email}`}
                  >
                    {siteConfig.email}
                  </a>
                  .
                </p>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-space-lg lg:col-span-7">
              <DossierRequestForm caseStudy={caseStudyKey} />
            </div>
          </div>
        </div>

        <div className="mt-space-xl flex items-center justify-between gap-space-md border-t border-surface-container-highest pt-space-md">
          <Link
            href="/work"
            className="inline-flex items-center gap-space-xs font-label-md font-semibold text-label-md text-primary no-underline transition-colors hover:text-secondary"
          >
            <IconArrowLeft className="h-4 w-4" />
            <span>Return to Selected Work</span>
          </Link>
          <span className="font-caption text-caption text-outline">
            Page ID: CS-084-CIS // Yalgar Advisory Lab
          </span>
        </div>
      </div>
    </section>
  );
}
