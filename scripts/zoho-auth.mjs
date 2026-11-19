#!/usr/bin/env node
/**
 * Exchange a Zoho Self-Client grant code for a long-lived refresh token and
 * write it into `.env` (never prints the token).
 *
 * One-time setup:
 *   1. https://api-console.zoho.com → Self Client → CREATE NOW
 *   2. Scope: ZohoCRM.modules.ALL
 *   3. Copy Client ID + Client Secret into .env:
 *        ZOHO_CLIENT_ID=...
 *        ZOHO_CLIENT_SECRET=...
 *   4. Same dialog → “Generate Code” tab → same scope, 10 minutes → CREATE
 *   5. Run:  node scripts/zoho-auth.mjs <CODE>
 *
 * The code is single-use and expires in minutes; if it fails, generate a new one.
 */
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";

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

function upsertEnv(key, value) {
  const lines = fs.existsSync(ENV_FILE)
    ? fs.readFileSync(ENV_FILE, "utf8").split("\n")
    : [];
  const index = lines.findIndex((line) => line.startsWith(`${key}=`));
  if (index >= 0) lines[index] = `${key}=${value}`;
  else lines.push(`${key}=${value}`);

  // collapse trailing blank lines
  while (lines.length > 0 && lines[lines.length - 1].trim() === "") lines.pop();
  fs.writeFileSync(ENV_FILE, `${lines.join("\n")}\n`, { mode: 0o600 });
}

async function main() {
  const env = { ...loadEnv(), ...process.env };
  const { ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET } = env;
  const accountsHost = env.ZOHO_ACCOUNTS_HOST ?? "accounts.zoho.com";

  if (!ZOHO_CLIENT_ID || !ZOHO_CLIENT_SECRET) {
    console.error(
      "\n✖ Add ZOHO_CLIENT_ID and ZOHO_CLIENT_SECRET to .env first (Self Client page).\n",
    );
    process.exit(1);
  }

  let code = process.argv[2]?.trim();
  if (!code) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    code = (await rl.question("Paste the Self Client grant code: ")).trim();
    rl.close();
  }
  if (!code) {
    console.error("\n✖ No grant code provided.\n");
    process.exit(1);
  }

  const url = new URL(`https://${accountsHost}/oauth/v2/token`);
  url.searchParams.set("grant_type", "authorization_code");
  url.searchParams.set("client_id", ZOHO_CLIENT_ID);
  url.searchParams.set("client_secret", ZOHO_CLIENT_SECRET);
  url.searchParams.set("code", code);

  const response = await fetch(url, { method: "POST" });
  const body = await response.json().catch(() => ({}));

  if (!response.ok || body.error || !body.refresh_token) {
    console.error(
      `\n✖ Token exchange failed (HTTP ${response.status}): ${
        body.error ?? "unknown_error"
      }\n`,
    );
    if (body.error === "invalid_code") {
      console.error(
        "The grant code is single-use and expires quickly. Generate a new one and retry.\n",
      );
    }
    process.exit(1);
  }

  upsertEnv("ZOHO_REFRESH_TOKEN", body.refresh_token);
  if (body.scope) upsertEnv("ZOHO_SCOPES", body.scope);

  console.log("\n✓ Refresh token saved to .env (not printed).");
  console.log(`  scope: ${body.scope ?? "unknown"}`);
  console.log(`  access token expires in: ${body.expires_in ?? "?"}s\n`);
  console.log("Next: node scripts/delete-zoho-test-leads.mjs --confirm\n");
}

main().catch((error) => {
  console.error(`\n✖ ${error.message}\n`);
  process.exit(1);
});
