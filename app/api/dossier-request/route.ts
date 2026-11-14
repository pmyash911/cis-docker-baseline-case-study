import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import { dossierFileExists } from "@/lib/dossier-files";
import { hasSigningSecret, signDossierPath } from "@/lib/dossier-token";
import { getDossier } from "@/lib/dossiers";
import { renderDossierEmail } from "@/lib/email-template";
import {
  clientFingerprint,
  logRequest,
  rateLimit,
} from "@/lib/request-store";
import {
  addLeadNote,
  createLead,
  findLeadByEmail,
  isZohoConfigured,
  sendLeadMail,
  updateLead,
} from "@/lib/zoho";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LIMITS = {
  name: 120,
  email: 254,
  organization: 160,
  role: 120,
  intent: 2000,
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_MAX = 10;

function clean(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .trim()
    .slice(0, max);
}

function respond(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status });
}

function readAttribution(body: Record<string, unknown>) {
  const raw =
    body.attribution && typeof body.attribution === "object"
      ? (body.attribution as Record<string, unknown>)
      : {};

  return {
    referrer: clean(raw.referrer, 500),
    landingPath: clean(raw.landingPath, 300),
    utmSource: clean(raw.utmSource, 120),
    utmMedium: clean(raw.utmMedium, 120),
    utmCampaign: clean(raw.utmCampaign, 120),
  };
}

export async function POST(request: Request) {
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (declaredLength > 20_000) {
    return respond(413, { ok: false, error: "Request too large." });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return respond(400, { ok: false, error: "Invalid request body." });
  }

  // Honeypot + submission-timing guard: pretend success, store nothing useful.
  const honeypot = clean(body.website, 200);
  const startedAt = Number(body.startedAt);
  const elapsed = Number.isFinite(startedAt) ? Date.now() - startedAt : null;
  if (honeypot || (elapsed !== null && elapsed < 600)) {
    await logRequest({
      event: "spam_rejected",
      reason: honeypot ? "honeypot" : "too_fast",
    });
    return respond(200, { ok: true, delivery: "sent", requestId: "ignored" });
  }

  const name = clean(body.name, LIMITS.name);
  const email = clean(body.email, LIMITS.email).toLowerCase();
  const organization = clean(body.organization, LIMITS.organization);
  const role = clean(body.role, LIMITS.role);
  const intent = clean(body.intent, LIMITS.intent);
  const dossier = getDossier(body.caseStudy);

  if (name.length < 2) {
    return respond(422, { ok: false, error: "Enter your full name." });
  }
  if (!EMAIL_PATTERN.test(email)) {
    return respond(422, { ok: false, error: "Enter a valid work email address." });
  }
  if (organization.length < 2) {
    return respond(422, { ok: false, error: "Enter your organization." });
  }
  if (!dossier) {
    return respond(400, { ok: false, error: "Unknown case study." });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip");
  const userAgent = request.headers.get("user-agent");
  const fingerprint = clientFingerprint(ip, userAgent);

  if (!rateLimit(`dossier:${fingerprint}`, RATE_MAX, RATE_WINDOW_MS)) {
    await logRequest({ event: "rate_limited", caseStudy: dossier.key });
    return respond(429, {
      ok: false,
      error: "Too many requests. Try again later or email us directly.",
    });
  }

  const requestId = randomUUID();
  const dryRun = process.env.DOSSIER_DRY_RUN === "1";
  const siteUrl = (process.env.SITE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
  const contactEmail =
    process.env.DOSSIER_NOTIFY_EMAIL ??
    process.env.DOSSIER_FROM_EMAIL ??
    "inqury@yalgar.com";
  const publicUrl = `${siteUrl}${dossier.pagePath}`;
  const attribution = readAttribution(body);
  const submittedAt = new Date().toISOString();
  const signedLink =
    dossier.dossierFile &&
    hasSigningSecret() &&
    (await dossierFileExists(dossier.dossierFile))
      ? signDossierPath(dossier.key)
      : null;
  const dossierUrl = signedLink ? `${siteUrl}${signedLink.path}` : null;
  const downloadPath = signedLink?.path ?? null;


  const description = [
    "Website dossier request",
    `Research: ${dossier.caseStudyTitle} (${dossier.ref})`,
    `Dossier key: ${dossier.key}`,
    role ? `Role: ${role}` : null,
    intent ? `Evaluation context: ${intent}` : null,
    `Page: ${publicUrl}`,
    attribution.referrer ? `Referrer: ${attribution.referrer}` : null,
    attribution.utmSource
      ? `UTM: ${attribution.utmSource} / ${attribution.utmMedium || "-"} / ${
          attribution.utmCampaign || "-"
        }`
      : null,
    `Dossier delivery: ${
      downloadPath ? "in-page signed link (72h)" : "PDF pending — team follow-up"
    }`,
    `Submitted: ${submittedAt}`,
    `Request ID: ${requestId}`,
  ]
    .filter(Boolean)
    .join("\n");

  const baseLog = {
    event: "dossier_request",
    requestId,
    caseStudy: dossier.key,
    ref: dossier.ref,
    email,
    organization,
    role,
    attribution,
    dryRun,
  };

  // Local/staging safety: validate + log without touching the CRM or mailboxes.
  if (dryRun) {
    await logRequest({ ...baseLog, outcome: "dry_run" });
    return respond(200, {
      ok: true,
      delivery: "dry-run",
      requestId,
      caseStudy: dossier.key,
      downloadPath,
    });
  }

  if (!isZohoConfigured()) {
    await logRequest({ ...baseLog, outcome: "zoho_not_configured" });
    return respond(503, {
      ok: false,
      error: "The request pipeline is not configured yet. Please email us directly.",
    });
  }

  const [firstName, ...rest] = name.split(/\s+/);
  const lastName = rest.length > 0 ? rest.join(" ") : firstName;

  let leadId: string;
  let noteError: string | null = null;
  try {
    const existingLead = await findLeadByEmail(email);
    if (existingLead) {
      leadId = existingLead.id;

      // Never overwrite a lead's history: append this request under a rule.
      const prior =
        typeof existingLead.Description === "string"
          ? existingLead.Description.trim()
          : "";
      const merged = (prior ? `${prior}\n\n---\n${description}` : description).slice(
        -30_000,
      );
      const updates: Record<string, unknown> = { Description: merged };
      if (organization) updates.Company = organization;
      if (role) updates.Designation = role;
      if (firstName) updates.First_Name = firstName;
      if (lastName) updates.Last_Name = lastName;

      await updateLead(leadId, updates);
    } else {
      leadId = await createLead({
        email,
        firstName,
        lastName,
        company: organization,
        designation: role || undefined,
        description,
      });
    }

    try {
      await addLeadNote(
        leadId,
        `Dossier request — ${dossier.ref}`,
        [
          description,
          "",
          `Source: ${attribution.referrer || "direct"} · ${userAgent ?? "unknown UA"}`,
          `Client fingerprint: ${fingerprint}`,
        ].join("\n"),
      );
    } catch (noteFailure) {
      noteError =
        noteFailure instanceof Error
          ? noteFailure.message.slice(0, 200)
          : "note creation failed";
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message.slice(0, 200) : "unknown error";
    await logRequest({
      ...baseLog,
      outcome: "crm_failed",
      error: message,
    });
    return respond(502, {
      ok: false,
      error:
        "We could not record your request. Please email us directly and we will send the dossier.",
    });
  }

  let delivery: "sent" | "manual" | "none" = "none";
  let emailError: string | null = null;
  const emailEnabled = process.env.DOSSIER_SEND_EMAIL === "1";

  if (!emailEnabled) {
    await logRequest({
      ...baseLog,
      leadId,
      delivery,
      noteError,
      dossierLink: signedLink ? "signed" : "missing",
      email: "disabled",
      outcome: "processed",
    });

    return respond(200, {
      ok: true,
      delivery,
      requestId,
      caseStudy: dossier.key,
      email,
      downloadPath,
    });
  }

  try {
    const subject = dossierUrl
      ? dossier.emailSubject
      : `Request received — ${dossier.caseStudyTitle} (${dossier.ref})`;

    const html = renderDossierEmail({
      dossier,
      recipientName: name,
      dossierUrl,
      publicUrl,
      contactEmail,
      expiresInHours: 72,
    });

    await sendLeadMail({
      leadId,
      toEmail: email,
      toName: name,
      subject,
      html,
      bcc: process.env.DOSSIER_NOTIFY_EMAIL,
    });

    delivery = dossierUrl ? "sent" : "manual";
  } catch (error) {
    emailError =
      error instanceof Error ? error.message.slice(0, 300) : "unknown error";
    delivery = "manual";
  }

  await logRequest({
    ...baseLog,
    leadId,
    delivery,
    emailError,
    noteError,
    dossierLink: signedLink ? "signed" : "missing",
    email: delivery,
    outcome: "processed",
  });

  return respond(200, {
    ok: true,
    delivery,
    requestId,
    caseStudy: dossier.key,
    email,
    downloadPath,
  });
}
