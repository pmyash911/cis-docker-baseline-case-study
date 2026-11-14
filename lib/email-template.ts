import type { Dossier } from "@/lib/dossiers";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type RenderOptions = {
  dossier: Dossier;
  recipientName: string;
  dossierUrl: string | null;
  publicUrl: string;
  contactEmail: string;
  expiresInHours: number;
};

export function renderDossierEmail({
  dossier,
  recipientName,
  dossierUrl,
  publicUrl,
  contactEmail,
  expiresInHours,
}: RenderOptions): string {
  const name = escapeHtml(recipientName.split(" ")[0] || "there");
  const title = escapeHtml(dossier.caseStudyTitle);
  const ref = escapeHtml(dossier.ref);
  const contact = escapeHtml(contactEmail);
  const safePublicUrl = escapeHtml(publicUrl);

  const delivery = dossierUrl
    ? `<p style="margin:0 0 20px;font:16px/24px Georgia,'Times New Roman',serif;color:#43474e;">
         The full write-up and evidence dossier is ready. Use the button below to download it.
         The link is personal and expires in ${expiresInHours} hours.
       </p>
       <p style="margin:0 0 28px;">
         <a href="${escapeHtml(dossierUrl)}"
            style="display:inline-block;background:#0b2a4a;color:#ffffff;text-decoration:none;font:600 13px/1 Helvetica,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;padding:16px 24px;border-radius:2px;">
           Download the dossier (PDF)
         </a>
       </p>
       <p style="margin:0 0 24px;font:12px/18px Helvetica,Arial,sans-serif;color:#74777f;">
         If the button does not work, copy this link into your browser:<br />
         <span style="color:#0b2a4a;word-break:break-all;">${escapeHtml(dossierUrl)}</span>
       </p>`
    : `<p style="margin:0 0 20px;font:16px/24px Georgia,'Times New Roman',serif;color:#43474e;">
         Your request has been recorded. The full dossier for this research is released after a
         short verification; the public brief is available in the meantime.
       </p>
       <p style="margin:0 0 28px;">
         <a href="${safePublicUrl}"
            style="display:inline-block;background:#0b2a4a;color:#ffffff;text-decoration:none;font:600 13px/1 Helvetica,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;padding:16px 24px;border-radius:2px;">
           Read the public brief
         </a>
       </p>`;

  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:32px 16px;background:#f6f3f2;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;margin:0 auto;">
      <tr>
        <td style="background:#ffffff;border:1px solid #c4c6cf;padding:40px;">
          <p style="margin:0 0 24px;font:600 11px/1 Helvetica,Arial,sans-serif;letter-spacing:.22em;text-transform:uppercase;color:#74777f;">
            Yalgar Consulting · Controlled Release
          </p>
          <h1 style="margin:0 0 12px;font:600 28px/36px Georgia,'Times New Roman',serif;color:#00152d;">
            ${title}
          </h1>
          <p style="margin:0 0 24px;font:12px/18px Helvetica,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#74777f;">
            Ref: ${ref} · Public excerpt
          </p>
          <p style="margin:0 0 16px;font:16px/24px Georgia,'Times New Roman',serif;color:#43474e;">
            Thank you, ${name}. Your request for the ${title} dossier has been received.
          </p>
          ${delivery}
          <p style="margin:24px 0 0;padding-top:20px;border-top:1px solid #eae7e7;font:13px/20px Helvetica,Arial,sans-serif;color:#43474e;">
            Questions or a different research brief? Reply to this email or write to
            <a href="mailto:${contact}" style="color:#0b2a4a;">${contact}</a>.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 4px 0;font:11px/16px Helvetica,Arial,sans-serif;color:#74777f;">
          You received this email because you requested a dossier at yalgar.com. If this was not
          you, ignore this message or contact us to remove your details.
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
