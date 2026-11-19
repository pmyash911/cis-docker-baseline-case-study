# Gated dossier PDFs

Files in this directory are **never** served as static assets. They are only
reachable through `/api/dossier/[slug]?exp=…&sig=…`, a signed, expiring link the
API emails to the requester.

## Adding a dossier

1. Drop the PDF here, e.g. `container-environment-baseline.pdf`.
2. Make sure `dossierFile` in [`lib/dossiers.ts`](../../lib/dossiers.ts) matches
   that filename exactly.
3. Done — requests for that case study now deliver a signed download link.

If the file is missing, the pipeline still records the lead and sends an
acknowledgement that points at the public brief, and the team is BCC'd for
manual follow-up. It never sends the wrong document: the file name comes from
the registry, never from the request.
