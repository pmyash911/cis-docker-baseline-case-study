export type NavItem = {
  key: "services" | "work" | "about" | "capabilities" | "contact";
  label: string;
  /** Home-page anchor for this item, used by the scroll-spy. */
  hash: `#${string}`;
  /** Where the header link points: an in-page anchor or a route. */
  href: `#${string}` | `/${string}`;
};

export type Capability = {
  title: string;
  body: string;
};

export type CapabilityDetail = {
  title: string;
  body: string;
  includes: string[];
  deliverable: string;
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
  person: "Yash Patel",
  email: "inquiry@yalgar.com",
  linkedin: "https://linkedin.com/in/yash-patelycc",
  github: "https://github.com/pmyash911",
  resume: "/resume.pdf",
  website: "https://yalgar.com",
  // Facts not supplied. Left visible on purpose so they are not softened into a claim.
  location: "[FILL IN]",
  founded: "[FILL IN]",
  credentials: "[FILL IN]",
  tagline:
    "Practical security, supply chain, and operations consulting for small and mid-size organizations.",
  consultationHref:
    "mailto:inquiry@yalgar.com?subject=Consultation%20request",
} as const;

export const navItems: NavItem[] = [
  { key: "services", label: "Services", hash: "#services", href: "#services" },
  { key: "work", label: "Work", hash: "#work", href: "#work" },
  { key: "about", label: "About", hash: "#about", href: "#about" },
  {
    key: "capabilities",
    label: "Capabilities",
    hash: "#capabilities",
    href: "/capabilities",
  },
  { key: "contact", label: "Contact", hash: "#contact", href: "#contact" },
];

export const hero = {
  headline:
    "Practical security, supply chain, and operations consulting for small and mid-size organizations.",
  subhead:
    "I run fixed-scope reviews and write plain-language deliverables that answer what to fix, why it matters, and who owns it.",
  primaryCta: "Request a consultation",
  secondaryCta: "View selected work",
} as const;

export const capabilities: Capability[] = [
  {
    title: "Security Risk Assessments",
    body: "I map how your systems are actually configured against the NIST Cybersecurity Framework and CIS benchmarks, then give you a gap analysis, a prioritized risk register, and a roadmap in plain language.",
  },
  {
    title: "Vendor & Supply Chain Reviews",
    body: "I review the third parties you depend on with a scoring model I can show you line by line, a structured vendor questionnaire, and remediation requirements tied to specific findings.",
  },
  {
    title: "Web Application Reviews",
    body: "I test web applications for implementation defects, exposure points, and misconfigurations, and I write each fix as a specific code change.",
  },
];

export const capabilityDetails: CapabilityDetail[] = [
  {
    title: "Security Risk Assessments",
    body: "I assess how your systems are actually configured, not how the last questionnaire said they were. Every gap is mapped to the NIST Cybersecurity Framework and CIS benchmarks, so it has a reference, a reason, and a place in the queue.",
    includes: [
      "Identity and access: who can reach what, and whether that access is reviewed.",
      "Logging and monitoring: what gets recorded, where it goes, and who reads it.",
      "Backup and recovery: whether a restore has been tested, not only scheduled.",
      "Host and container configuration: default users, privileged flags, writable filesystems, and resource limits.",
      "Patch state and exposure: what is reachable, and from where.",
    ],
    deliverable:
      "A gap analysis mapped to the standard, a prioritized risk register with owners and target dates, and an executive summary you can hand to leadership without rewriting it.",
  },
  {
    title: "Vendor & Supply Chain Reviews",
    body: "I review the third parties you depend on and show you where the dependency could break. The scoring model is transparent: you can see every line that produced a score, and I check the supplier claims that can be checked.",
    includes: [
      "What data and systems the supplier can reach.",
      "Whether their security answers are specific or boilerplate.",
      "How they notify you when something goes wrong.",
      "What happens to your data when the contract ends.",
      "Whether their own suppliers sit inside the risk boundary.",
    ],
    deliverable:
      "A vendor risk register with scores, evidence notes, and the remediation requirements to place in the contract or carry into the next review cycle.",
  },
  {
    title: "Web Application Reviews",
    body: "I test web applications for the defects that lead to real exposure, and I write the fix as a specific change rather than general advice.",
    includes: [
      "Security headers and content security policy: what is missing, wrong, or too permissive.",
      "Session handling: how sessions are created, renewed, and ended.",
      "Exposure of staging, debug, and administrative surfaces.",
      "Configuration and dependency mistakes visible from outside.",
      "Implementation defects in authentication and input handling.",
    ],
    deliverable:
      "A findings list with reproduction steps, severity, and an explicit code-level fix for each item, followed by a re-test once the fixes are applied.",
  },
];

export const selectedWork: WorkItem[] = [
  {
    slug: "container-environment-baseline",
    label: "Lab Project",
    title: "Container Environment Baseline & CIS Audit",
    body: "I measured a read-only, 13-control CIS-aligned Docker baseline plus a separate connectivity check, against a hardened reference container and a deliberately weak companion environment, with reproducible evidence.",
    href: "/work/container-environment-baseline",
  },
  {
    slug: "nist-csf-2-0-assessment",
    label: "Lab Project",
    title: "Small Business NIST CSF 2.0 Assessment Simulation",
    body: "I produced a prioritized 90-day remediation roadmap for a simulated 45-person distributor, focusing capital spend on identity governance and offsite backup isolation.",
    href: "/work#nist-csf-2-0-assessment",
  },
  {
    slug: "web-application-surface-audit",
    label: "Lab Project",
    title: "Web Application Surface Audit & Header Hardening",
    body: "I analyzed and remediated security header policies, CSP directives, and session termination flaws on my own lab systems.",
    href: "/work#web-application-surface-audit",
  },
];

export const approachSteps: ApproachStep[] = [
  {
    number: "01.",
    title: "Scope",
    body: "I agree exact targets, timelines, and deliverables with you before work begins. No open-ended hourly billing.",
  },
  {
    number: "02.",
    title: "Assess",
    body: "I test, verify, and document findings against recognized standards rather than a proprietary checklist.",
  },
  {
    number: "03.",
    title: "Report",
    body: "You get an executive summary, a prioritized remediation register, and exact technical instructions.",
  },
  {
    number: "04.",
    title: "Support",
    body: "I walk your team through the findings for 60 minutes and re-test what you have fixed within 30 days.",
  },
];

export const about = {
  eyebrow: "The Practice",
  heading: "About me",
  body: "I am Yash Patel. I run Yalgar Consulting LLC, where I do hands-on security, supply chain, and operations work for small and mid-size organizations. I keep scopes fixed, test against recognized standards, and report what I found in plain language. The case studies on this site come from lab systems I control, so you can check the method and the evidence.",
  linkLabel: "Read my full background",
} as const;

export const contact = {
  eyebrow: "Inquiries",
  heading: "Direct inquiry",
  body: "Write to me directly at",
  responseNote: "or send a consultation request. I reply within two business days.",
  cta: "Request a consultation",
  directLabel: "Direct:",
} as const;

export const footerLinks = [
  { label: "Email", href: "mailto:inquiry@yalgar.com" },
  { label: "LinkedIn", href: siteConfig.linkedin },
  { label: "GitHub", href: siteConfig.github },
  { label: "Resume (PDF)", href: siteConfig.resume },
  { label: "Privacy", href: "/privacy" },
  { label: ".well-known/security.txt", href: "/.well-known/security.txt" },
];
