import Link from "next/link";

import { capabilities } from "@/lib/content";

export function Capabilities() {
  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="w-full scroll-mt-20 bg-surface-container-lowest py-section-mobile md:py-section-desktop"
    >
      <div className="mx-auto max-w-[1120px] px-margin md:px-margin-tablet lg:px-margin-desktop">
        <div className="mb-space-xl">
          <span className="font-label-md text-label-md uppercase tracking-wider text-outline">
            Capabilities
          </span>
          <h2
            id="services-heading"
            className="mt-space-xs font-headline-lg text-headline-md text-primary md:text-headline-lg"
          >
            What I do
          </h2>
        </div>

        <div className="grid grid-cols-1 divide-y divide-outline-variant border-y border-outline-variant md:grid-cols-3 md:divide-x md:divide-y-0">
          {capabilities.map((capability, index) => (
            <div
              key={capability.title}
              className={
                "py-space-xl md:px-space-lg " +
                (index === 0 ? "md:pl-0" : "") +
                (index === capabilities.length - 1 ? " md:pr-0" : "")
              }
            >
              <h3 className="mb-space-sm font-headline-sm text-headline-sm text-primary">
                {capability.title}
              </h3>
              <p className="font-body-md leading-relaxed text-body-md text-on-surface-variant">
                {capability.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-space-lg">
          <Link
            href="/capabilities"
            className="font-label-md text-label-md text-primary underline underline-offset-4 transition-colors hover:text-on-surface-variant"
          >
            Read how each review works
          </Link>
        </div>
      </div>
    </section>
  );
}
