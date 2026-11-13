"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { BrandLockup } from "@/components/brand-lockup";
import { navItems, siteConfig } from "@/lib/content";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const markWork = pathname.startsWith("/work");
  const [activeKey, setActiveKey] = useState<string>(() =>
    isHome ? "" : markWork ? "work" : "",
  );

  // Close the mobile panel on navigation.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Scroll-spy: highlight the nav item whose section is in view.
  useEffect(() => {
    if (!isHome) {
      setActiveKey(markWork ? "work" : "");
      return;
    }

    const sections = navItems.flatMap((item) => {
      const element = document.getElementById(item.hash.slice(1));
      return element ? [{ key: item.key, element }] : [];
    });

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;
        const match = sections.find(
          (section) => section.element === visible.target,
        );
        if (match) setActiveKey(match.key);
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    sections.forEach((section) => observer.observe(section.element));
    return () => observer.disconnect();
  }, [isHome, markWork]);

  // Prevent background scroll while the mobile menu is open.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const hrefFor = (hash: string) => (isHome ? hash : `/${hash}`);

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-outline-variant bg-surface-container-lowest">
      <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between px-margin md:px-margin-tablet lg:px-margin-desktop">
        <BrandLockup />

        <div className="hidden items-center gap-space-lg lg:flex">
          <nav aria-label="Primary" className="flex h-16 items-center gap-6 md:gap-7">
            {navItems.map((item) => {
              const isActive = activeKey === item.key;
              return (
                <a
                  key={item.key}
                  href={hrefFor(item.hash)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "inline-flex h-full items-center border-b-2 px-1 text-[15px] no-underline transition-colors",
                    isActive
                      ? "border-[#0B2A4A] font-semibold text-[#0B2A4A]"
                      : "border-transparent font-medium text-[#4D4D4D] hover:text-[#0B2A4A]",
                  )}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-[2px] text-primary transition-colors hover:bg-surface-container-low lg:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          )}
        </button>
      </div>

      {menuOpen ? (
        <div className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto border-t border-outline-variant bg-surface-container-lowest lg:hidden">
          <nav
            id="mobile-navigation"
            aria-label="Primary mobile"
            className="mx-auto max-w-[1120px] px-margin py-space-sm md:px-margin-tablet"
          >
            <ul>
              {navItems.map((item) => (
                <li key={item.key} className="border-b border-outline-variant last:border-b-0">
                  <a
                    href={hrefFor(item.hash)}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex items-center px-1 py-space-md text-[15px] no-underline transition-colors",
                      activeKey === item.key
                        ? "font-semibold text-[#0B2A4A]"
                        : "font-medium text-[#4D4D4D] hover:text-[#0B2A4A]",
                    )}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-space-xl border-t border-outline-variant pt-space-lg">
              <a
                href={siteConfig.consultationHref}
                className="inline-flex min-h-[48px] items-center justify-center rounded-[2px] bg-primary-container px-space-lg font-label-md text-label-md text-on-primary transition-colors hover:bg-secondary"
              >
                Request a consultation
              </a>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
