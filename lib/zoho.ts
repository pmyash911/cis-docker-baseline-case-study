/**
 * Minimal MCP client for the Zoho MCP servers configured in `.env`.
 *
 * Zoho hosts one MCP endpoint per app (leads, e-mail, notes, ...). Each is a
 * stateless Streamable-HTTP JSON-RPC endpoint with the access token embedded in
 * the URL path, which is why these values must stay server-side only.
 */
type ZohoKind = "crm" | "mail" | "notes";

type JsonRecord = Record<string, unknown>;

const ENDPOINT_ENV: Record<ZohoKind, string> = {
  crm: "ZOHO_CRM_URL",
  mail: "ZOHO_EMAIL_URL",
  notes: "ZOHO_NOTES_URL",
};

function endpoint(kind: ZohoKind): string {
  const url = process.env[ENDPOINT_ENV[kind]];
  if (!url) {
    throw new Error(`Zoho endpoint ${ENDPOINT_ENV[kind]} is not configured`);
  }
  return url;
}

function parsePayload(text: string, contentType: string | null): unknown {
  if (contentType?.includes("text/event-stream")) {
    const dataLines = text
      .split("\n")
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trim());

    for (const line of dataLines.reverse()) {
      try {
        return JSON.parse(line);
      } catch {
        /* keep looking */
      }
    }
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === "object" ? (value as JsonRecord) : null;
}

async function callTool(
  kind: ZohoKind,
  tool: string,
  args: JsonRecord,
): Promise<JsonRecord> {
  const response = await fetch(endpoint(kind), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: { name: tool, arguments: args },
    }),
    signal: AbortSignal.timeout(20_000),
    cache: "no-store",
  });

  const text = await response.text();
  const payload = asRecord(parsePayload(text, response.headers.get("content-type")));

  if (!response.ok) {
    throw new Error(`Zoho ${tool} failed with HTTP ${response.status}`);
  }

  const error = asRecord(payload?.error);
  if (error) {
    throw new Error(`Zoho ${tool}: ${String(error.message ?? "unknown error")}`);
  }

  const result = asRecord(payload?.result);
  if (!result) throw new Error(`Zoho ${tool}: empty result`);

  if (result.isError) {
    const message = asRecord(result.content) ?? result.content;
    throw new Error(`Zoho ${tool}: ${JSON.stringify(message).slice(0, 300)}`);
  }

  // Zoho MCP wraps every tool payload as { data: <Zoho API response>, headers, status }.
  let envelope = asRecord(result.structuredContent);

  if (!envelope) {
    const content = Array.isArray(result.content) ? result.content[0] : null;
    const contentRecord = asRecord(content);
    if (typeof contentRecord?.text === "string") {
      try {
        envelope = asRecord(JSON.parse(contentRecord.text));
      } catch {
        envelope = null;
      }
    }
  }

  if (!envelope) return {};

  const api = asRecord(envelope.data) ?? envelope;

  if (envelope.status === "failure" || api.status === "failure") {
    const detail =
      typeof api.message === "string"
        ? api.message
        : JSON.stringify(api).slice(0, 300);
    throw new Error(`Zoho ${tool}: ${detail}`);
  }

  return api;
}

export function isZohoConfigured(): boolean {
  return Boolean(process.env.ZOHO_CRM_URL && process.env.ZOHO_EMAIL_URL);
}

/* ------------------------------------------------------------------ leads */

export type LeadSearchResult = {
  id: string;
  [key: string]: unknown;
};

export async function findLeadByEmail(
  email: string,
): Promise<LeadSearchResult | null> {
  const payload = await callTool("crm", "ZohoCRM_searchRecords", {
    path_variables: { module: "Leads" },
    query_params: {
      email,
      per_page: 1,
      fields: "id,Email,First_Name,Last_Name,Company,Designation,Description,Lead_Status",
    },
  });

  // Zoho answers 204 with `{ data: { message } }` when nothing matches.
  const data = payload.data;
  const rows = Array.isArray(data) ? data : [];
  const first = asRecord(rows[0]);
  if (!first?.id) return null;

  return { ...first, id: String(first.id) };
}

export type LeadPayload = {
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  designation?: string;
  description: string;
};

export async function createLead(payload: LeadPayload): Promise<string> {
  const result = await callTool("crm", "ZohoCRM_createRecords", {
    path_variables: { module: "Leads" },
    body: {
      data: [
        {
          Last_Name: payload.lastName,
          First_Name: payload.firstName,
          Email: payload.email,
          Company: payload.company,
          Designation: payload.designation || undefined,
          Lead_Source: "Web Download",
          Lead_Status: "Not Contacted",
          Description: payload.description,
        },
      ],
    },
  });

  const rows = Array.isArray(result.data) ? result.data : [];
  const row = asRecord(rows[0]);
  const details = asRecord(row?.details);
  const id = details?.id ?? row?.id;

  if (!id) {
    throw new Error(`Zoho createRecords returned no lead id: ${JSON.stringify(row).slice(0, 200)}`);
  }
  return String(id);
}

export async function updateLead(
  id: string,
  fields: JsonRecord,
): Promise<void> {
  await callTool("crm", "ZohoCRM_updateRecords", {
    path_variables: { module: "Leads" },
    body: { data: [{ id, ...fields }] },
  });
}

export async function addLeadNote(
  leadId: string,
  title: string,
  content: string,
): Promise<void> {
  await callTool("notes", "ZohoCRM_createNotesModule", {
    body: {
      data: [
        {
          Note_Title: title.slice(0, 120),
          Note_Content: content.slice(0, 60_000),
          Parent_Id: {
            id: leadId,
            module: { api_name: "Leads" },
          },
        },
      ],
    },
  });
}

/* ------------------------------------------------------------------- mail */

export async function sendLeadMail(options: {
  leadId: string;
  toEmail: string;
  toName: string;
  subject: string;
  html: string;
  bcc?: string;
}): Promise<void> {
  const fromEmail = process.env.DOSSIER_FROM_EMAIL;
  if (!fromEmail) {
    throw new Error("DOSSIER_FROM_EMAIL is not configured");
  }

  const data: JsonRecord = {
    from: {
      email: fromEmail,
      user_name: process.env.DOSSIER_FROM_NAME ?? "Yalgar Consulting",
    },
    to: [{ email: options.toEmail, user_name: options.toName }],
    subject: options.subject.slice(0, 240),
    content: options.html,
    mail_format: "html",
    // The CRM org from-address is not provisioned; use the user's allowed
    // sender (pmyash911@gmail.com) until a verified yalgar.com alias is added.
    org_email: false,
  };

  if (options.bcc) data.bcc = [{ email: options.bcc }];

  await callTool("mail", "ZohoCRM_sendMail", {
    path_variables: { moduleName: "Leads", id: options.leadId },
    body: { data: [data] },
  });
}
