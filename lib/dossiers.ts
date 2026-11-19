/**
 * Dossier registry — the single source of truth for "which document belongs to
 * which research page".
 *
 * The browser only sends a dossier *key* (a hard-coded hidden field rendered by
 * the case-study page). The server resolves the key against this registry, so a
 * visitor can never swap in a different document or path.
 *
 * To add a new case study:
 *   1. add an entry here,
 *   2. drop its PDF at `private/dossiers/<dossierFile>` (optional — see below),
 *   3. render <DossierRequestForm caseStudy="<key>" /> on that page.
 *
 * `dossierFile` may stay `null` while the PDF is being prepared: requests are
 * still captured in the CRM and the email points to the public brief instead of
 * a signed full-dossier link.
 */
export type Dossier = {
  /** Stable key used by the form and the API. Never trust it for filesystem paths. */
  key: string;
  /** Case reference shown in the UI and stored in the CRM. */
  ref: string;
  /** Human title used in emails + CRM notes. */
  caseStudyTitle: string;
  /** Public page for this research. */
  pagePath: string;
  /** File name inside `private/dossiers/`, or null when the full PDF is not ready. */
  dossierFile: string | null;
  /** Subject used for the auto-delivered email. */
  emailSubject: string;
};

export const DOSSIERS: Record<string, Dossier> = {
  "container-environment-baseline": {
    key: "container-environment-baseline",
    ref: "YLG-AUD-2026-084",
    caseStudyTitle: "Container Environment Baseline & CIS-Aligned Audit",
    pagePath: "/work/container-environment-baseline",
    dossierFile: "container-environment-baseline.pdf",
    emailSubject:
      "Your dossier — Container Environment Baseline & CIS-Aligned Audit (YLG-AUD-2026-084)",
  },
};

export function getDossier(key: unknown): Dossier | null {
  if (typeof key !== "string" || key.length === 0) return null;
  return Object.prototype.hasOwnProperty.call(DOSSIERS, key)
    ? DOSSIERS[key]
    : null;
}

export function dossierKeys(): string[] {
  return Object.keys(DOSSIERS);
}
