import { Button } from "@/components/ui/button";
import { contact, siteConfig } from "@/lib/content";

export function ContactBand() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="w-full scroll-mt-20 border-y border-outline-variant bg-surface-container-low py-section-mobile md:py-section-desktop"
    >
      <div className="mx-auto max-w-[1120px] px-margin md:px-margin-tablet lg:px-margin-desktop">
        <div className="max-w-2xl">
          <span className="font-label-md text-label-md uppercase tracking-wider text-outline">
            {contact.eyebrow}
          </span>
          <h2
            id="contact-heading"
            className="mb-space-md mt-space-xs font-headline-lg text-headline-md text-primary md:text-headline-lg"
          >
            {contact.heading}
          </h2>
          <p className="mb-space-xl font-body-md text-body-md text-on-surface-variant">
            {contact.body}{" "}
            <a
              className="font-body-bold text-primary underline underline-offset-4 hover:text-on-surface-variant"
              href={`mailto:${siteConfig.email}`}
            >
              {siteConfig.email}
            </a>{" "}
            {contact.responseNote}
          </p>
          <div className="flex flex-col gap-space-lg sm:flex-row sm:items-center">
            <Button asChild>
              <a href={siteConfig.consultationHref}>{contact.cta}</a>
            </Button>
            <span className="font-body-md text-body-md text-on-surface-variant">
              {contact.directLabel}{" "}
              <strong className="font-body-bold text-primary">
                <a href={`mailto:${siteConfig.email}`} className="inline-flex min-h-[var(--control-min-height)] items-center underline underline-offset-4">
                  {siteConfig.email}
                </a>
              </strong>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
