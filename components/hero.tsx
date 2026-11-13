import { Button } from "@/components/ui/button";
import { hero, siteConfig } from "@/lib/content";

export function Hero() {
  return (
    <section className="w-full bg-surface-container-lowest">
      <div className="mx-auto max-w-[1120px] px-margin py-section-mobile md:px-margin-tablet md:py-section-desktop lg:px-margin-desktop">
        <div className="max-w-3xl">
          <h1 className="mb-space-lg font-display text-headline-lg font-semibold tracking-tight text-primary text-balance md:text-display">
            {hero.headline}
          </h1>
          <p className="mb-space-xl max-w-[70ch] font-body-lg text-body-lg text-on-surface-variant text-pretty">
            {hero.subhead}
          </p>
          <div className="flex flex-wrap items-center gap-space-lg">
            <Button asChild>
              <a href={siteConfig.consultationHref}>{hero.primaryCta}</a>
            </Button>
            <Button asChild variant="link">
              <a href="#work">{hero.secondaryCta}</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
