"use client";

import { useEffect, useState, type FormEvent } from "react";

import { siteConfig } from "@/lib/content";

type Status = "idle" | "submitting" | "success" | "error";
type Delivery = "sent" | "manual" | "none" | "dry-run" | null;

const fieldClass =
  "h-12 w-full border border-outline-variant bg-surface-container-lowest px-space-md font-body-md text-on-surface transition-colors focus:border-primary focus:outline-none";

const labelClass = "mb-space-xs block font-label-md text-label-md text-primary";

export function DossierRequestForm({ caseStudy }: { caseStudy: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [delivery, setDelivery] = useState<Delivery>(null);
  const [error, setError] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [downloadPath, setDownloadPath] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState(0);
  const [attribution, setAttribution] = useState({
    referrer: "",
    landingPath: "",
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setAttribution({
      referrer: document.referrer,
      landingPath: window.location.pathname,
      utmSource: params.get("utm_source") ?? "",
      utmMedium: params.get("utm_medium") ?? "",
      utmCampaign: params.get("utm_campaign") ?? "",
    });
    setStartedAt(Date.now());
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const value = (key: string) => String(data.get(key) ?? "").trim();
    const email = value("email");

    const payload = {
      name: value("name"),
      email,
      organization: value("organization"),
      role: value("role"),
      intent: value("intent"),
      website: value("website"),
      caseStudy,
      startedAt,
      attribution,
    };

    setStatus("submitting");
    setError("");

    try {
      const response = await fetch("/api/dossier-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        delivery?: Delivery;
        error?: string;
        downloadPath?: string | null;
      };

      if (!response.ok || !result.ok) {
        throw new Error(
          result.error ?? "Something went wrong. Please try again or email us.",
        );
      }

      setSubmittedEmail(email);
      setDelivery(result.delivery ?? "manual");
      setDownloadPath(result.downloadPath ?? null);
      setStatus("success");
      form.reset();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Something went wrong. Please try again or email us.",
      );
      setStatus("error");
    }
  }

  const buttonLabel =
    status === "submitting" ? "Sending request…" : "Request Case Brief & Findings";

  return (
    <form onSubmit={handleSubmit} className="space-y-space-md">
      {/* Honeypot: real people never fill this. */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="req-website">Website</label>
        <input
          id="req-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="req-name">
            Full Name <span className="text-outline">*</span>
          </label>
          <input
            className={fieldClass}
            id="req-name"
            name="name"
            placeholder="Dr. Julian Vance"
            required
            type="text"
            autoComplete="name"
            minLength={2}
            maxLength={120}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="req-email">
            Corporate / Institution Email <span className="text-outline">*</span>
          </label>
          <input
            className={fieldClass}
            id="req-email"
            name="email"
            placeholder="vance@institution.gov"
            required
            type="email"
            autoComplete="email"
            maxLength={254}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="req-org">
            Organization <span className="text-outline">*</span>
          </label>
          <input
            className={fieldClass}
            id="req-org"
            name="organization"
            placeholder="National Defense Research"
            required
            type="text"
            autoComplete="organization"
            minLength={2}
            maxLength={160}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="req-role">
            Operational Role
          </label>
          <input
            className={fieldClass}
            id="req-role"
            name="role"
            placeholder="Chief Information Security Officer"
            type="text"
            autoComplete="organization-title"
            maxLength={120}
          />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="req-intent">
          Evaluation Context
        </label>
        <textarea
          className="w-full border border-outline-variant bg-surface-container-lowest p-space-md font-body-md text-on-surface transition-colors focus:border-primary focus:outline-none"
          id="req-intent"
          name="intent"
          placeholder="Briefly specify intended application, compliance scope, or prospective advisory evaluation..."
          rows={3}
          maxLength={2000}
        />
      </div>

      <div className="flex flex-col items-center justify-between gap-space-md pt-space-xs sm:flex-row">
        <button
          className="h-12 w-full cursor-pointer select-none bg-primary px-space-xl font-label-md uppercase tracking-wider text-on-primary transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          type="submit"
          disabled={status === "submitting"}
        >
          {buttonLabel}
        </button>
        <div className="font-caption text-caption text-outline">
          Strictly non-commercial distribution
        </div>
      </div>

      <div aria-live="polite">
        {status === "success" ? (
          <div className="border-l-2 border-primary bg-surface-container p-space-md font-caption text-caption text-primary">
            {downloadPath ? (
              <>
                <p>
                  Request recorded. Your dossier is ready to download — the link
                  is valid for 72 hours. Your details are logged with our team.
                </p>
                <a
                  href={downloadPath}
                  className="mt-space-sm inline-flex h-11 items-center justify-center bg-primary px-space-lg font-label-md uppercase tracking-wider text-on-primary transition-colors hover:bg-secondary"
                >
                  Download the dossier (PDF)
                </a>
              </>
            ) : delivery === "dry-run" ? (
              <>
                Request received (dry run). No CRM write or email was sent.
              </>
            ) : (
              <>
                Request recorded. Our team will follow up at{" "}
                <strong>{submittedEmail}</strong> with the dossier.
              </>
            )}
          </div>
        ) : null}

        {status === "error" ? (
          <div
            role="alert"
            className="border-l-2 border-error bg-error-container p-space-md font-caption text-caption text-on-error-container"
          >
            {error}{" "}
            <a
              className="font-semibold underline underline-offset-4"
              href={`mailto:${siteConfig.email}`}
            >
              Email {siteConfig.email}
            </a>{" "}
            and we will send it directly.
          </div>
        ) : null}
      </div>
    </form>
  );
}
