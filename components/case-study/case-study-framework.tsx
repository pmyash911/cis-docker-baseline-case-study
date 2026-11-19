import type { ReactNode } from "react";

type Pillar = {
  section: string;
  title: string;
  body: ReactNode;
};

const pillars: Pillar[] = [
  {
    section: "Section 1",
    title: "Host configuration",
    body: (
      <>
        auditd rules covering the Docker daemon, a separate partition for
        container storage (
        <code className="bg-surface-container px-1 py-0.5 font-mono text-xs text-primary">
          /var/lib/docker
        </code>
        ), and the daemon configuration file permissions.
      </>
    ),
  },
  {
    section: "Section 2",
    title: "Daemon configuration",
    body: (
      <>
        Whether the daemon declares default ulimits for containers, and whether
        the remote API is protected by TLS with client certificate verification.
      </>
    ),
  },
  {
    section: "Section 3",
    title: "Daemon file permissions",
    body: (
      <>
        POSIX permission audits of the Docker socket handle and the{" "}
        <code className="bg-surface-container px-1 py-0.5 font-mono text-xs text-primary">
          docker.service
        </code>{" "}
        systemd unit file.
      </>
    ),
  },
  {
    section: "Section 4",
    title: "Container images and builds",
    body: (
      <>
        Verification that running containers declare an explicit non-root user
        rather than inheriting root from the image.
      </>
    ),
  },
  {
    section: "Section 5",
    title: "Container runtime",
    body: (
      <>
        AppArmor profile enforcement, read-only root filesystems, privileged
        flags, memory and CPU limits, and docker-socket mounts into containers.
      </>
    ),
  },
];

export function CaseStudyFramework() {
  return (
    <section className="w-full bg-surface-container-low py-space-xl">
      <div className="mx-auto max-w-[1120px] px-margin md:px-margin-tablet lg:px-margin-desktop">
        <div className="mb-space-xl">
          <span className="mb-space-xs block font-caption text-caption uppercase tracking-widest text-outline">
            02 // FRAMEWORK
          </span>
          <h2 className="font-headline-md text-headline-md text-primary">
            CIS-aligned audit scoping and assessment
          </h2>
          <p className="mt-space-xs max-w-2xl font-body-md text-body-md text-on-surface-variant">
            The control set is segmented into five areas and executed via
            read-only introspection. It is mapped to the areas the CIS Docker
            Benchmark covers, using our own AUD-01 to AUD-13 identifiers rather
            than asserted CIS rule numbers.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-space-md md:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar) => (
            <div
              key={pillar.section}
              className="border-t border-outline-variant bg-surface-container-lowest p-space-lg pt-space-md"
            >
              <div className="mb-space-xs font-caption text-caption uppercase tracking-wider text-outline">
                {pillar.section}
              </div>
              <h3 className="mb-space-sm font-headline-sm text-headline-sm text-primary">
                {pillar.title}
              </h3>
              <p className="text-sm font-body-md text-body-md text-on-surface-variant">
                {pillar.body}
              </p>
            </div>
          ))}

          <div className="flex flex-col justify-between border-t border-outline-variant bg-surface-container-lowest p-space-lg pt-space-md">
            <div>
              <div className="mb-space-xs font-caption text-caption uppercase tracking-wider text-outline">
                Operating Protocol
              </div>
              <h3 className="mb-space-sm font-headline-sm text-headline-sm text-primary">
                Zero agent overhead
              </h3>
              <p className="text-sm font-body-md leading-relaxed text-body-md text-on-surface-variant">
                No long-running daemons, sidecars, or elevated RPC calls. Audits
                can be injected cleanly into GitHub Actions, GitLab CI, or
                air-gapped staging nodes via sh pipelines.
              </p>
            </div>
            <div className="pt-space-md">
              <span className="font-caption font-mono text-caption uppercase text-outline">
                POSIX.1-2008 compliant
              </span>
            </div>
          </div>
        </div>

        <div className="mt-space-lg border-t border-outline-variant pt-space-md">
          <p className="font-caption leading-relaxed text-caption text-on-surface-variant">
            <strong className="font-semibold text-primary">
              Disclosure policy:
            </strong>{" "}
            Detailed test harnesses, customer infrastructure topology, and
            vulnerability reproduction code are withheld from this public brief.
            Verified prospective clients may request the unredacted technical
            annex.
          </p>
        </div>
      </div>
    </section>
  );
}
