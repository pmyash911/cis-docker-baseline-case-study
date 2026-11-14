import { access, readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Gated dossier assets live outside `public/` so they can only be fetched with a
 * signed, expiring link. Paths come from the registry, never from user input.
 */
function dossierPath(fileName: string): string {
  const safeName = path.basename(fileName);
  return path.join(process.cwd(), "private", "dossiers", safeName);
}

export async function dossierFileExists(fileName: string): Promise<boolean> {
  try {
    await access(dossierPath(fileName));
    return true;
  } catch {
    return false;
  }
}

export async function readDossierFile(
  fileName: string,
): Promise<Buffer | null> {
  try {
    return await readFile(dossierPath(fileName));
  } catch {
    return null;
  }
}
