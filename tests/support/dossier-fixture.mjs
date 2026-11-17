import fs from "node:fs";
import { mkdir, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export const DOSSIER_KEY = "container-environment-baseline";
export const DOSSIER_FILE = path.join(
  process.cwd(),
  "private",
  "dossiers",
  `${DOSSIER_KEY}.pdf`,
);

const MINIMAL_PDF = Buffer.from(
  "%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n",
  "utf8",
);

/**
 * The download route only exists when a dossier PDF is present. Tests install a
 * tiny fixture and restore whatever was there before, so a real dossier PDF is
 * never overwritten or deleted.
 */
export async function installFixtureDossier() {
  await mkdir(path.dirname(DOSSIER_FILE), { recursive: true });

  let backup = null;
  if (fs.existsSync(DOSSIER_FILE)) {
    backup = `${DOSSIER_FILE}.test-backup`;
    await rename(DOSSIER_FILE, backup);
  }

  await writeFile(DOSSIER_FILE, MINIMAL_PDF);

  return async () => {
    await unlink(DOSSIER_FILE).catch(() => {});
    if (backup) await rename(backup, DOSSIER_FILE).catch(() => {});
  };
}
