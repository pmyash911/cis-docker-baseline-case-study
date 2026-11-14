export type NavItem = {
  key: "services" | "work" | "about" | "capabilities" | "contact";
  label: string;
  hash: `#${string}`;
};

export type Capability = {
  title: string;
  body: string;
};

export type WorkItem = {
  slug: string;
  label: string;
  title: string;
  body: string;
  href: string;
};

export type ApproachStep = {
  number: string;
  title: string;
  body: string;
};

export const siteConfig = {
  name: "Yalgar Consulting LLC",
  shortName: "Yalgar Consulting",
  email: "inqury@yalgar.com",
  tagline:
    "Practical security, supply chain, and operations consulting for small and mid-size organizations.",
  consultationHref:
    "mailto:inqury@yalgar.com?subject=Consultation%20request",
} as const;

export const navItems: NavItem[] = [
  { key: "services", label: "Services", hash: "#services" },
  { key: "work", label: "Work", hash: "#work" },
  { key: "about", label: "About", hash: "#about" },
  { key: "capabilities", label: "Capabilities", hash: "#capabilities" },
  { key: "contact", label: "Contact", hash: "#contact" },
];

export const hero = {
  headline:
    "Practical security, supply chain, and operations consulting for small and mid-size organizations.",
  subhead:
    "Fixed-scope reviews and plain-language deliverables designed to answer what to fix, why it matters, and who owns it.",
  primaryCta: "Request a consultation",
  secondaryCta: "View selected work",
} as const;

export const capabilities: Capability[] = [
  {
    title: "Security Risk Assessments",
    body: "System evaluations mapped against NIST CSF and CIS benchmarks to deliver an actionable gap analysis, prioritized risk register, and plain-language executive roadmap.",
  },
  {
    title: "Vendor & Supply Chain Reviews",
    body: "Structured third-party supplier risk reviews using transparent scoring models, vendor questionnaires, and focused remediation requirements.",
  },
  {
    title: "Web Application Reviews",
    body: "Targeted application security evaluations identifying implementation defects, exposure points, and misconfigurations with explicit code fixes.",
  },
];

export const selectedWork: WorkItem[] = [
  {
    slug: "container-environment-baseline",
    label: "Lab Project",
    title: "Container Environment Baseline & CIS Audit",
    body: "A read-only, 14-control CIS Docker baseline measured against a hardened production container and a deliberately weak companion environment — with reproducible evidence.",
    href: "/work/container-environment-baseline",
  },
  {
    slug: "nist-csf-2-0-assessment",
    label: "Lab Project",
    title: "Small Business NIST CSF 2.0 Assessment Simulation",
    body: "Produced a prioritized 90-day remediation roadmap for a simulated 45-person distributor, focusing capital spend on identity governance and offsite backup isolation.",
    href: "/work#nist-csf-2-0-assessment",
  },
  {
    slug: "web-application-surface-audit",
    label: "Lab Project",
    title: "Web Application Surface Audit & Header Hardening",
    body: "Analyzed and remediated security header policies, CSP directives, and session termination flaws across five exposed staging environments.",
    href: "/work#web-application-surface-audit",
  },
];

export const approachSteps: ApproachStep[] = [
  {
    number: "01.",
    title: "Scope",
    body: "We agree on exact targets, timelines, and deliverables before work begins. No open-ended hourly billing.",
  },
  {
    number: "02.",
    title: "Assess",
    body: "We test, verify, and document findings against recognized standards rather than proprietary checklists.",
  },
  {
    number: "03.",
    title: "Report",
    body: "You receive an executive summary, a prioritized remediation register, and exact technical instructions.",
  },
  {
    number: "04.",
    title: "Support",
    body: "We conduct a 60-minute findings walkthrough with your team and re-test remediated items within 30 days.",
  },
];

export const about = {
  eyebrow: "The Practice",
  heading: "About Yalgar Consulting",
  body: "Founded on the principle that small and mid-size organizations need decisive, verified security analysis rather than open-ended advisory contracts. We combine hands-on technical validation with plain-language reporting so leadership can make defensible risk decisions.",
  linkLabel: "Read full background and credentials →",
} as const;

export const contact = {
  eyebrow: "Inquiries",
  heading: "Direct inquiry",
  body: "Contact us directly at",
  responseNote: "or submit a request for a fixed-scope consultation. We respond within two business days.",
  cta: "Request a consultation",
  directLabel: "Direct:",
} as const;

export const footerLinks = [
  { label: "Resume (PDF)", href: "mailto:inqury@yalgar.com?subject=Resume%20request" },
  { label: "Insights", href: "mailto:inqury@yalgar.com?subject=Insights%20briefing%20request" },
  { label: "Privacy", href: "/privacy" },
  { label: ".well-known/security.txt", href: "/.well-known/security.txt" },
];
