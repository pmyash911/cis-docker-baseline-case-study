import Script from "next/script";

/**
 * Optional, cookieless visitor analytics.
 *
 * Set NEXT_PUBLIC_PLAUSIBLE_DOMAIN (e.g. "yalgar.com") to enable Plausible;
 * leave it unset and nothing loads. Page-level conversion data is also captured
 * server-side on dossier submissions, so CRM attribution works without this.
 */
export function Analytics() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) return null;

  return (
    <Script
      defer
      data-domain={domain}
      src="https://plausible.io/js/script.js"
      strategy="afterInteractive"
    />
  );
}
