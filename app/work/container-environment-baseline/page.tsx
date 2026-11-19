import type { Metadata } from "next";

import { CaseStudyContext } from "@/components/case-study/case-study-context";
import { CaseStudyDeliverables } from "@/components/case-study/case-study-deliverables";
import { CaseStudyDossier } from "@/components/case-study/case-study-dossier";
import { CaseStudyFramework } from "@/components/case-study/case-study-framework";
import { CaseStudyHero } from "@/components/case-study/case-study-hero";
import { CaseStudyMatrix } from "@/components/case-study/case-study-matrix";
import { SectionRule } from "@/components/case-study/section-rule";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Case study: Container Environment Baseline & CIS-Aligned Audit",
  description:
    "A read-only baseline of 13 CIS-aligned controls plus one connectivity check, measured against a hardened reference container and a deliberately weak companion environment — with findings, remediation and reproducible evidence.",
  openGraph: {
    title: "Case study: Container Environment Baseline & CIS-Aligned Audit",
    description:
      "13 CIS-aligned controls plus a connectivity check: hardened vs weak environments, measured evidence and remediation.",
    type: "article",
  },
};

export default function ContainerBaselineCaseStudyPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1 pt-16">
        <CaseStudyHero />
        <SectionRule />
        <CaseStudyContext />
        <SectionRule />
        <CaseStudyFramework />
        <SectionRule />
        <CaseStudyMatrix />
        <SectionRule />
        <CaseStudyDeliverables />
        <SectionRule />
        <CaseStudyDossier caseStudyKey="container-environment-baseline" />
      </main>
      <SiteFooter />
    </>
  );
}
