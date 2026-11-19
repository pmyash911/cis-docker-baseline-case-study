#!/usr/bin/env node
/**
 * Delete the test leads created while wiring the dossier pipeline.
 *
 * The Zoho MCP servers we use have no delete tool, so this script talks to the
 * Zoho CRM REST API with an OAuth token instead. It is allowlist-only: it will
 * only delete the IDs below, and it re-checks each record's name/email against a
 * test pattern before sending DELETE. Real prospects can never be touched.
 *
 * Usage:
 *   node scripts/delete-zoho-test-leads.mjs            # dry run (default)
 *   node scripts/delete-zoho-test-leads.mjs --confirm  # actually delete
 *
 * Requires one of:
 *   ZOHO_ACCESS_TOKEN            (short-lived access token)
 *   ZOHO_CLIENT_ID + ZOHO_CLIENT_SECRET + ZOHO_REFRESH_TOKEN  (preferred)
 * Optional: ZOHO_ACCOUNTS_HOST (default accounts.zoho.com),
 *           ZOHO_API_HOST (default www.zohoapis.com)
 *
 * Zoho moves deleted records to the Recycle Bin (~60 days), so this is reversible
 * there if something looks wrong.
 */
import fs from "node:fs";
import path from "node:path";

const ENV_FILE = path.join(process.cwd(), ".env");

function loadEnv() {
  if (!fs.existsSync(ENV_FILE)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(ENV_FILE, "utf8")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const i = line.indexOf("=");
        return [line.slice(0, i), line.slice(i + 1)];
      }),
  );
}

const env = { ...loadEnv(), ...process.env };

const TEST_LEADS = [
  {
    id: "4470081000000807001",
    expected: "YCC-PIPELINE-ENVELOPE-PROBE",
    note: "created during API envelope probing",
  },
  {
    id: "4470081000000806001",
    expected: "YCC Integration Test",
    note: "created during the first live pipeline test",
  },
  {
    id: "4470081000000785001",
    expected: "DELIVERABILITY-TEST",
    note: "pre-existing Zoho deliverability test",
  },
  {
    id: "4470081000000783002",
    expected: "DELIVERABILITY-TEST",
    note: "pre-existing Zoho deliverability test",
  },
  {
    id: "4470081000000779001",
    expected: "DKIM SEED-TEST",
    note: "pre-existing Zoho deliverability test",
  },
  {
    id: "4470081000000777011",
    expected: "DELIVERABILITY-TEST",
    note: "pre-existing Zoho deliverability test",
  },
  {
    id: "4470081000000776002",
    expected: "ORGEMAIL-PROBE",
    note: "pre-existing Zoho deliverability test",
  },
  {
    id: "4470081000000774003",
    expected: "DELIVERABILITY-TEST",
    note: "pre-existing Zoho deliverability test",
  },
];

const TEST_PATTERN = /DELETE-ME|PROBE|Integration Test|DKIM|DELIVERABILITY-TEST/i;
const confirm = process.argv.includes("--confirm");

function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

async function getAccessToken() {
  if (env.ZOHO_ACCESS_TOKEN) return env.ZOHO_ACCESS_TOKEN;

  const { ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN } = env;
  if (!ZOHO_CLIENT_ID || !ZOHO_CLIENT_SECRET || !ZOHO_REFRESH_TOKEN) {
    fail(
      "Missing Zoho OAuth credentials.\n" +
        "  Set ZOHO_CLIENT_ID + ZOHO_CLIENT_SECRET + ZOHO_REFRESH_TOKEN in .env\n" +
        "  (Zoho API Console → Self Client), or set ZOHO_ACCESS_TOKEN.\n" +
        "  Alternatively delete the leads in the Zoho CRM UI — see below.",
    );
  }

  const accountsHost = env.ZOHO_ACCOUNTS_HOST ?? "accounts.zoho.com";
  const url = new URL(`https://${accountsHost}/oauth/v2/token`);
  url.searchParams.set("refresh_token", ZOHO_REFRESH_TOKEN);
  url.searchParams.set("client_id", ZOHO_CLIENT_ID);
  url.searchParams.set("client_secret", ZOHO_CLIENT_SECRET);
  url.searchParams.set("grant_type", "refresh_token");

  const response = await fetch(url, { method: "POST" });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.access_token) {
    fail(`Token refresh failed: HTTP ${response.status} ${JSON.stringify(body)}`);
  }
  return body.access_token;
}

async function api(accessToken, pathName, init = {}) {
  const apiHost = env.ZOHO_API_HOST ?? "www.zohoapis.com";
  const response = await fetch(`https://${apiHost}/crm/v8${pathName}`, {
    ...init,
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  const text = await response.text();
  let body = null;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: response.status, body };
}

async function main() {
  console.log(`\nZoho test-lead cleanup — ${confirm ? "DELETE mode" : "DRY RUN"}`);
  console.log(`Target: ${TEST_LEADS.length} allowlisted test leads\n`);

  for (const lead of TEST_LEADS) {
    console.log(`  • ${lead.id}  ${lead.expected}  (${lead.note})`);
  }

  if (!confirm) {
    console.log(
      "\nNothing was deleted. Re-run with --confirm to delete these records.\n" +
        "This requires Zoho OAuth credentials in .env (see the header of this script).\n",
    );
    return;
  }

  const accessToken = await getAccessToken();
  const ids = [];

  for (const lead of TEST_LEADS) {
    const { status, body } = await api(
      accessToken,
      `/Leads/${lead.id}?fields=Full_Name,Email`,
    );
    const record = body?.data?.[0];
    const name = String(record?.Full_Name ?? "");

    if (status === 404) {
      console.log(`= ${lead.id}  already gone`);
      continue;
    }
    if (status !== 200 || !record) {
      fail(`Could not read ${lead.id}: HTTP ${status} ${JSON.stringify(body)}`);
    }
    if (!TEST_PATTERN.test(name)) {
      fail(
        `Refusing to delete ${lead.id}: name "${name}" does not look like a test record.`,
      );
    }
    console.log(`✓ ${lead.id}  verified "${name}"`);
    ids.push(lead.id);
  }

  if (ids.length === 0) {
    console.log("\nNothing left to delete.\n");
    return;
  }

  const { status, body } = await api(
    accessToken,
    `/Leads?ids=${ids.join(",")}`,
    { method: "DELETE" },
  );

  const results = body?.data ?? [];
  const deleted = results.filter((row) => row.status === "success").length;
  console.log(`\nDELETE HTTP ${status}: ${deleted}/${ids.length} records moved to Recycle Bin.`);
  for (const row of results) {
    console.log(`  - ${row.details?.id ?? "?"}: ${row.code ?? "?"} ${row.message ?? ""}`);
  }
  console.log("\nZoho keeps deleted records in the Recycle Bin (~60 days).\n");
}

main().catch((error) => fail(error.message));
