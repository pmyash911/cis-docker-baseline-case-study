import Link from "next/link";

import { about } from "@/lib/content";

export function AboutSection() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="w-full scroll-mt-20 bg-surface-container-lowest py-section-mobile md:py-section-desktop"
    >
      <div className="mx-auto max-w-[1120px] px-margin md:px-margin-tablet lg:px-margin-desktop">
        <div className="grid grid-cols-1 gap-space-lg md:grid-cols-12">
          <div className="md:col-span-4">
            <span className="mb-space-xs block font-label-md text-label-md uppercase tracking-wider text-outline">
              {about.eyebrow}
            </span>
            <h2
              id="about-heading"
              className="font-headline-lg text-headline-md text-primary md:text-headline-lg"
            >
              {about.heading}
            </h2>
          </div>
          <div className="flex flex-col justify-between md:col-span-8">
            <p className="mb-space-lg font-body-lg leading-relaxed text-body-lg text-on-surface-variant">
              {about.body}
            </p>
            <div>
              <Link
                href="/about"
                className="inline-flex min-h-[var(--control-min-height)] items-center font-label-md text-label-md text-primary underline underline-offset-4 hover:text-on-surface-variant"
              >
                {about.linkLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
