import crypto from "node:crypto";

/**
 * Signed, expiring download links for gated dossier PDFs.
 *
 * The PDFs live outside `public/` (in `private/dossiers/`), so they are never
 * directly fetchable. The emailed URL carries `exp` + `sig`; the download route
 * verifies both before streaming the file.
 */
const TTL_HOURS = 72;

function secret(): string {
  return process.env.DOSSIER_SIGNING_SECRET ?? "";
}

export function hasSigningSecret(): boolean {
  return secret().length >= 32;
}

function signature(key: string, expiresAt: number): string {
  return crypto
    .createHmac("sha256", secret())
    .update(`${key}.${expiresAt}`)
    .digest("base64url");
}

export type SignedDossierLink = {
  path: string;
  expiresAt: number;
};

export function signDossierPath(
  key: string,
  ttlHours = TTL_HOURS,
): SignedDossierLink | null {
  if (!hasSigningSecret()) return null;

  const expiresAt = Date.now() + ttlHours * 60 * 60 * 1000;
  const sig = signature(key, expiresAt);
  return {
    path: `/api/dossier/${encodeURIComponent(key)}?exp=${expiresAt}&sig=${sig}`,
    expiresAt,
  };
}

export function verifyDossierSignature(
  key: string,
  expiresAtRaw: string | null,
  sig: string | null,
): boolean {
  if (!hasSigningSecret() || !sig) return false;

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return false;

  const expected = signature(key, expiresAt);
  const encoder = new TextEncoder();
  const a = encoder.encode(expected);
  const b = encoder.encode(sig);

  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
