import { NextResponse } from "next/server";

import { readDossierFile } from "@/lib/dossier-files";
import { verifyDossierSignature } from "@/lib/dossier-token";
import { getDossier } from "@/lib/dossiers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } },
) {
  const dossier = getDossier(params.slug);
  if (!dossier?.dossierFile) {
    return NextResponse.json(
      { ok: false, error: "Dossier not available." },
      { status: 404 },
    );
  }

  const url = new URL(request.url);
  if (
    !verifyDossierSignature(
      dossier.key,
      url.searchParams.get("exp"),
      url.searchParams.get("sig"),
    )
  ) {
    return NextResponse.json(
      { ok: false, error: "This dossier link is invalid or has expired." },
      { status: 403 },
    );
  }

  const file = await readDossierFile(dossier.dossierFile);
  if (!file) {
    return NextResponse.json(
      { ok: false, error: "Dossier file is not available yet." },
      { status: 404 },
    );
  }

  return new NextResponse(new Uint8Array(file), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${dossier.dossierFile}"`,
      "Content-Length": String(file.byteLength),
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
