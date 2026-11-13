import type { ReactNode } from "react";

import { IconShieldCheck } from "@/components/icons";

type Pillar = {
  section: string;
  title: string;
  body: ReactNode;
};

const pillars: Pillar[] = [
  {
    section: "Section 1.0",
    title: "Host Configuration",
    body: (
      <>
        Auditing Linux kernel parameter namespaces, separate partitions for
        container storage (
        <code className="bg-surface-container px-1 py-0.5 font-mono text-xs text-primary">
          /var/lib/docker
        </code>
        ), and auditd surveillance of container daemons.
      </>
    ),
  },
  {
    section: "Section 2.0",
    title: "Daemon Configuration",
    body: (
      <>
        Evaluation of IPC namespaces, TLS mutual authentication parameters,
        network bridge IP tables enforcement, and deprecation of legacy
        unconfined capabilities.
      </>
    ),
  },
  {
    section: "Section 3.0",
    title: "Daemon File Perms",
    body: (
      <>
        Strict POSIX permissions audits of{" "}
        <code className="bg-surface-container px-1 py-0.5 font-mono text-xs text-primary">
          docker.service
        </code>
        , socket handles, systemd unit files, and client certificate bundles with
        verification against UID 0.
      </>
    ),
  },
  {
    section: "Section 4.0",
    title: "Container Images & Builds",
    body: (
      <>
        Validation of explicit non-privileged user directives, removal of package
        manager caches, verification of signed trust content, and restriction of{" "}
        <code className="bg-surface-container px-1 py-0.5 font-mono text-xs text-primary">
          setuid
        </code>{" "}
        binaries.
      </>
    ),
  },
  {
    section: "Section 5.0",
    title: "Container Runtime",
    body: (
      <>
        Runtime memory limits, CPU shares, read-only root filesystems,
        AppArmor/SELinux profile pinning, privileged flag containment, and
        sensitive host path mounts.
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
            CIS Audit Scoping &amp; Assessment Architecture
          </h2>
          <p className="mt-space-xs max-w-2xl font-body-md text-body-md text-on-surface-variant">
            Evaluation protocol segmented into five distinct control planes per
            CIS specifications, executed via read-only introspection.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-space-md md:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar) => (
            <div key={pillar.section} className="bg-surface-container-lowest p-space-lg">
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

          <div className="flex flex-col justify-between bg-primary p-space-lg text-on-primary">
            <div>
              <div className="mb-space-xs font-caption text-caption uppercase tracking-wider text-on-primary-container">
                Operating Protocol
              </div>
              <h3 className="mb-space-sm font-headline-sm text-headline-sm text-on-primary">
                Zero Agent Overhead
              </h3>
              <p className="text-sm font-body-md leading-relaxed text-body-md text-surface-container-highest">
                No long-running daemons, sidecars, or elevated RPC calls. Audits
                can be injected cleanly into GitHub Actions, GitLab CI, or
                air-gapped staging nodes via curl/sh pipelines.
              </p>
            </div>
            <div className="pt-space-md">
              <span className="font-caption font-mono text-caption uppercase text-outline-variant">
                POSIX.1-2008 Compliant
              </span>
            </div>
          </div>
        </div>

        <div className="mt-space-lg border-l-4 border-primary bg-surface-container p-space-md">
          <div className="flex items-start gap-space-sm">
            <IconShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p className="font-caption leading-relaxed text-caption text-on-surface-variant">
              <strong className="font-semibold text-primary">
                Disclosure Policy:
              </strong>{" "}
              Detailed test harnesses, customer infrastructure topology, and
              vulnerability reproduction code are withheld from this public
              brief. Verified prospective clients may request the unredacted
              technical annex.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
