import { approachSteps } from "@/lib/content";

export function Approach() {
  return (
    <section
      id="capabilities"
      aria-labelledby="approach-heading"
      className="w-full scroll-mt-20 bg-surface-container-lowest py-section-mobile md:py-section-desktop"
    >
      <div className="mx-auto max-w-[1120px] px-margin md:px-margin-tablet lg:px-margin-desktop">
        <div className="mb-space-xl">
          <span className="font-label-md text-label-md uppercase tracking-wider text-outline">
            Methodology
          </span>
          <h2
            id="approach-heading"
            className="mt-space-xs font-headline-lg text-headline-md text-primary md:text-headline-lg"
          >
            My approach
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-space-lg border-t border-outline-variant pt-space-xl md:grid-cols-2 lg:grid-cols-4">
          {approachSteps.map((step) => (
            <div key={step.number} className="flex flex-col">
              <span className="mb-space-sm font-headline-md text-headline-md text-outline">
                {step.number}
              </span>
              <h3 className="mb-space-xs font-headline-sm text-headline-sm text-primary">
                {step.title}
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
