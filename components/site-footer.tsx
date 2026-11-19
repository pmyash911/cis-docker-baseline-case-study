import Link from "next/link";

import { BrandLockup } from "@/components/brand-lockup";
import { footerLinks, siteConfig } from "@/lib/content";

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-outline-variant bg-surface-container-lowest py-section-mobile">
      <div className="mx-auto max-w-[1120px] px-margin md:px-margin-tablet lg:px-margin-desktop">
        <div className="flex flex-col justify-between gap-space-xl pb-space-xl md:flex-row md:items-start">
          <div className="space-y-space-xs">
            <div className="mb-space-xs">
              <BrandLockup />
            </div>
            <p className="max-w-md font-caption text-caption text-on-surface-variant">
              © {new Date().getFullYear()} {siteConfig.name}. Practical security,
              supply chain, and operations consulting.
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="flex flex-wrap items-center gap-x-space-lg gap-y-space-sm"
          >
            {footerLinks.map((link) =>
              link.href.startsWith("http") ||
              link.href.startsWith("mailto:") ? (
                <a
                  key={link.label}
                  href={link.href}
                  className="inline-flex min-h-[var(--control-min-height)] items-center font-label-md text-label-md text-on-surface-variant hover:text-on-surface"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="inline-flex min-h-[var(--control-min-height)] items-center font-label-md text-label-md text-on-surface-variant hover:text-on-surface"
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>
        </div>

        <div className="border-t border-outline-variant pt-space-md">
          <p className="font-caption text-caption uppercase tracking-wider text-outline">
            Independent Advisory • Security • Supply Chain • Operations
          </p>
        </div>
      </div>
    </footer>
  );
}
