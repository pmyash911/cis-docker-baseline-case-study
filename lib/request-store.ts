import crypto from "node:crypto";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

/**
 * Lightweight request bookkeeping.
 *
 * - `rateLimit` is an in-process sliding window; good enough for a single
 *   Node/Vercel instance. Swap for Upstash/Redis when running multi-instance.
 * - `logRequest` appends JSONL under `.data/` for local auditing. On read-only
 *   serverless filesystems it silently no-ops — the CRM is the system of record.
 */
const memory = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const entry = memory.get(key);

  if (!entry || entry.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;

  entry.count += 1;
  return true;
}

export function clientFingerprint(
  ip: string | null,
  userAgent: string | null,
): string {
  return crypto
    .createHash("sha256")
    .update(`${ip ?? "unknown"}|${userAgent ?? "unknown"}`)
    .digest("hex")
    .slice(0, 20);
}

export async function logRequest(record: Record<string, unknown>): Promise<void> {
  try {
    const dir = path.join(process.cwd(), ".data");
    await mkdir(dir, { recursive: true });
    await appendFile(
      path.join(dir, "dossier-requests.jsonl"),
      `${JSON.stringify({ ...record, loggedAt: new Date().toISOString() })}\n`,
      "utf8",
    );
  } catch {
    /* read-only filesystem or permissions: CRM remains the record */
  }
}
