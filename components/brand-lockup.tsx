import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * Header/footer brand lockup.
 *
 * The Stitch wordmark SVG bakes "YALGAR CONSULTING / PRACTICAL ADVISORY" into a
 * 460×110 canvas at 10–23px, so at a 32px header height that text collapses to
 * ~3px and is unreadable. This renders the same lockup as real text at fixed,
 * legible sizes instead.
 */
export function BrandLockup({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex min-h-[var(--control-min-height)] items-center gap-2.5 no-underline transition-opacity hover:opacity-90",
        className,
      )}
    >
      <span
        className="[font-family:var(--font-source-sans)] text-[28px] font-extrabold leading-none tracking-[-0.05em] text-[#0B2A4A] sm:text-[30px]"
      >
        YCC
      </span>
      <span aria-hidden="true" className="h-9 w-px shrink-0 bg-[#D6D6D1]" />
      <span
        className="flex flex-col justify-center leading-none"
      >
        <span className="font-display text-[11px] font-semibold uppercase leading-none tracking-[0.18em] text-[#0B2A4A] sm:text-[12px]">
          Yalgar
        </span>
        <span className="mt-[3px] font-display text-[10px] font-medium uppercase leading-none tracking-[0.14em] text-[#1A1A1A] sm:text-[11px]">
          Consulting
        </span>
        <span className="mt-[4px] hidden [font-family:var(--font-source-sans)] text-[8px] font-semibold uppercase leading-none tracking-[0.22em] text-[#4D4D4D] sm:block">
          Practical Advisory
        </span>
      </span>
    </Link>
  );
}
