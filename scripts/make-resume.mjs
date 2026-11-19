#!/usr/bin/env node
/**
 * make-resume.mjs — render public/resume.pdf from an HTML template.
 *
 * Typographic and single-column, per DESIGN.md: Source Serif 4 headings,
 * Source Sans 3 body, navy rules, no photo, no icons, no colour blocks.
 * Job-search resume, not a capability sheet: verb-led bullets, no first-person
 * sentences, no photo, no placeholders. Facts come from the supplied profile
 * document. The consulting capability version of this material lives on the
 * /capabilities page, not here.
 *
 * Uses Node built-ins plus a headless Chrome already on the machine
 * (CHROME_PATH overrides the lookup); no npm packages and no network calls.
 * The web fonts are embedded from Next's downloaded copies under
 * .next/static/media, with a Georgia / Helvetica fallback when absent.
 *
 * Usage: node scripts/make-resume.mjs
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "public", "resume.pdf");

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
];

const FACTS = {
  name: "Yash Patel",
  headline: "Supply Chain Operations & Security | Ex-Amazon",
  location: "Dallas–Fort Worth Metroplex",
  email: "pmyash911@gmail.com",
  linkedin: "linkedin.com/in/yash-patelycc",
  github: "github.com/pmyash911",
  website: "yalgar.com",
  company: "Yalgar Consulting LLC",
  founded: "October 2026",
};

const esc = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function findChrome() {
  return CHROME_CANDIDATES.find((p) => p && fs.existsSync(p)) ?? null;
}

/** Reuse Next's downloaded latin subset of a font family, when present. */
function latinSubsetUrl(fontToken) {
  const cssDir = path.join(ROOT, ".next", "static", "css");
  if (!fs.existsSync(cssDir)) return null;
  for (const name of fs.readdirSync(cssDir).filter((f) => f.endsWith(".css"))) {
    const css = fs.readFileSync(path.join(cssDir, name), "utf8");
    const rules = css.match(/@font-face\{[^}]*\}/g) ?? [];
    for (const rule of rules) {
      if (!rule.includes(fontToken) || !rule.includes("u+00??")) continue;
      const match = rule.match(/url\(([^)]+)\)/);
      if (match) return match[1];
    }
  }
  return null;
}

function embeddedFontFaces() {
  const families = [
    { token: "__Source_Serif_4", family: "Source Serif 4" },
    { token: "__Source_Sans_3", family: "Source Sans 3" },
  ];
  const faces = [];
  for (const { token, family } of families) {
    const url = latinSubsetUrl(token);
    if (!url) continue;
    const file = path.join(ROOT, ".next", url.replace(/^\//, ""));
    if (!fs.existsSync(file)) continue;
    const base64 = fs.readFileSync(file).toString("base64");
    faces.push(
      `@font-face{font-family:"${family}";font-style:normal;font-weight:200 900;font-display:block;` +
        `src:local("${family}"),url("data:font/woff2;base64,${base64}") format("woff2");}`,
    );
  }
  return faces.join("\n");
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${esc(FACTS.name)} — Resume</title>
<style>
${embeddedFontFaces()}
:root {
  --ink: #00152d;
  --navy: #0b2a4a;
  --body: #1c1b1b;
  --soft: #43474e;
  --muted: #74777f;
  --line: #c4c6cf;
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  background: #ffffff;
  color: var(--body);
  font-family: "Source Sans 3", Helvetica, Arial, sans-serif;
  font-size: 9pt;
  line-height: 1.3;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.page { padding: 10mm 13mm 8mm; }
h1, h2 { font-family: "Source Serif 4", Georgia, "Times New Roman", serif; color: var(--ink); margin: 0; }
h1 {
  font-size: 21pt;
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.05;
}
.role {
  margin-top: 2mm;
  font-size: 10.5pt;
  color: var(--soft);
}
.contact {
  margin-top: 2.5mm;
  font-size: 8.8pt;
  color: var(--muted);
}
.contact a { color: var(--muted); text-decoration: none; }
.rule {
  border: 0;
  border-top: 1px solid var(--ink);
  margin: 4mm 0 0;
}
.thin { border: 0; border-top: 1px solid var(--line); margin: 4mm 0; }
section { margin-top: 3mm; }
h2 {
  font-size: 11pt;
  font-weight: 600;
  letter-spacing: 0.01em;
  padding-bottom: 1.2mm;
  border-bottom: 1px solid var(--line);
  margin-bottom: 2.2mm;
}
p { margin: 0 0 1.8mm; }
ul { margin: 0; padding-left: 4mm; }
li { margin-bottom: 0.9mm; }
li::marker { color: var(--navy); }
.entry { margin-bottom: 2mm; }
.entry:last-child { margin-bottom: 0; }
.entry-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 4mm;
}
.entry-title { font-weight: 600; color: var(--ink); font-size: 9.9pt; }
.entry-meta { font-size: 8.6pt; color: var(--muted); white-space: nowrap; }
.entry-sub { font-size: 8.8pt; color: var(--muted); margin: 0.4mm 0 1.6mm; }
.facts {
  display: grid;
  grid-template-columns: 46mm 1fr;
  gap: 1.4mm 4mm;
  margin: 0;
  font-size: 9pt;
}
.facts dt { color: var(--muted); margin: 0; }
.facts dd { margin: 0; color: var(--body); }
.skills { color: var(--soft); }
.foot {
  margin-top: 4.5mm;
  padding-top: 1.8mm;
  border-top: 1px solid var(--line);
  font-size: 7.6pt;
  color: var(--muted);
}
@page { size: A4; margin: 0; }
</style>
</head>
<body>
<div class="page">
  <header>
    <h1>${esc(FACTS.name)}</h1>
    <div class="role">${esc(FACTS.headline)}</div>
    <div class="contact">
      ${esc(FACTS.location)} &middot; ${esc(FACTS.email)} &middot; ${esc(FACTS.linkedin)} &middot; ${esc(FACTS.github)} &middot; ${esc(FACTS.website)}
    </div>
    <hr class="rule" />
  </header>

  <section>
    <h2>Summary</h2>
    <p>
      Operations manager across supply chain, inventory integrity, and
      security program delivery. Led a 50&ndash;100 person team inside
      Amazon&rsquo;s fulfillment network, pairing Lean process work with
      data-driven variance containment. Founded ${esc(FACTS.company)} in
      ${esc(FACTS.founded)} and built three reproducible lab projects mapped to
      the NIST Cybersecurity Framework and CIS benchmarks.
    </p>
  </section>

  <section>
    <h2>Experience</h2>

    <div class="entry">
      <div class="entry-head">
        <span class="entry-title">Amazon &mdash; Manager, Operations &amp; Variance Containment</span>
        <span class="entry-meta">May 2024 &ndash; September 2025</span>
      </div>
      <ul>
        <li>Directed a 50&ndash;100 person operations team across receiving, kitting, staging, and outbound, keeping physical inventory synchronized with digital records.</li>
        <li>Partnered with Loss Prevention and Quality Assurance to launch rapid-response protocols for inventory leakage, closing gaps between automated warehouse systems and floor-level staging.</li>
        <li>Led cross-functional overhauls aligning floor execution with enterprise throughput targets; applied Lean methods to receiving, kitting, and outbound logistics.</li>
        <li>Converted variance logs into weekly operational directives, reducing reconciliation blind spots that threatened customer delivery commitments.</li>
      </ul>
    </div>

    <div class="entry">
      <div class="entry-head">
        <span class="entry-title">${esc(FACTS.company)} &mdash; Founder</span>
        <span class="entry-meta">${esc(FACTS.founded)} &ndash; Present</span>
      </div>
      <div class="entry-sub">Dallas, Texas &middot; independent practice</div>
      <ul>
        <li>Founded a security and supply chain practice offering three fixed-scope services: security risk assessments, vendor and supply chain reviews, and web application reviews.</li>
        <li>Built three reproducible lab projects from scratch, publishing the method, raw JSON evidence, and a 9-page dossier so the results can be checked.</li>
        <li>Wrote the practice deliverables: a prioritized risk register, a vendor scoring model with line-by-line evidence notes, and a code-level remediation list.</li>
      </ul>
    </div>
  </section>

  <section>
    <h2>Projects</h2>

    <div class="entry">
      <div class="entry-head">
        <span class="entry-title">Container Environment Baseline &amp; CIS Audit</span>
        <span class="entry-meta">Docker &middot; Linux &middot; POSIX shell</span>
      </div>
      <ul>
        <li>Built a read-only harness covering 13 CIS-aligned controls plus a separate connectivity check, then measured a hardened reference container against a deliberately weak companion environment.</li>
        <li>Recorded 6 failures on the weak environment with 5 controls flipping from pass to fail; published machine-readable JSON evidence and the dossier.</li>
      </ul>
    </div>

    <div class="entry">
      <div class="entry-head">
        <span class="entry-title">NIST CSF 2.0 Assessment Simulation</span>
        <span class="entry-meta">45-person distributor</span>
      </div>
      <ul>
        <li>Produced a 90-day prioritized remediation roadmap weighted to identity governance and offsite backup isolation.</li>
      </ul>
    </div>

    <div class="entry">
      <div class="entry-head">
        <span class="entry-title">Web Application Surface Audit &amp; Header Hardening</span>
        <span class="entry-meta">Own lab systems</span>
      </div>
      <ul>
        <li>Analyzed and remediated header policies, CSP directives, and session termination flaws across five staging environments built and maintained in a personal lab.</li>
      </ul>
    </div>
  </section>

  <section>
    <h2>Education</h2>
    <div class="entry">
      <div class="entry-head">
        <span class="entry-title">Drexel University &mdash; MBA; MS, Supply Chain Management &amp; Logistics</span>
        <span class="entry-meta">2021</span>
      </div>
    </div>
    <div class="entry">
      <div class="entry-head">
        <span class="entry-title">Drexel University &mdash; BSBA; B.S., Supply Chain Management</span>
        <span class="entry-meta">2021</span>
      </div>
    </div>
  </section>

  <section>
    <h2>Professional</h2>
    <p>Member, Council of Supply Chain Management Professionals (CSCMP).</p>
  </section>

  <section>
    <h2>Skills</h2>
    <p class="skills">
      Supply chain operations &middot; inventory variance and loss prevention
      &middot; Lean process improvement &middot; cross-functional program
      leadership &middot; vendor risk reviews &middot; NIST Cybersecurity
      Framework &middot; CIS benchmarks &middot; Docker and container hardening
      &middot; security headers and content security policy &middot; remediation
      planning &middot; technical writing
    </p>
  </section>

  <div class="foot">
    ${esc(FACTS.name)} &middot; ${esc(FACTS.email)} &middot; ${esc(FACTS.linkedin)} &middot; ${esc(FACTS.github)}
  </div>
</div>
</body>
</html>
`;

function main() {
  const chrome = findChrome();
  if (!chrome) {
    console.error(
      "No Chrome found. Set CHROME_PATH to a Chrome/Chromium binary and re-run.",
    );
    process.exit(1);
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ycc-resume-"));
  const htmlPath = path.join(tmpDir, "resume.html");
  const profileDir = path.join(tmpDir, "chrome-profile");
  fs.writeFileSync(htmlPath, html, "utf8");
  fs.mkdirSync(path.dirname(OUT), { recursive: true });

  try {
    execFileSync(
      chrome,
      [
        "--headless=new",
        "--disable-gpu",
        "--no-first-run",
        "--no-default-browser-check",
        "--no-pdf-header-footer",
        `--user-data-dir=${profileDir}`,
        `--print-to-pdf=${OUT}`,
        pathToFileURL(htmlPath).href,
      ],
      { stdio: "pipe", timeout: 60000 },
    );
  } catch (error) {
    // Some Chrome builds exit non-zero even when the PDF is written.
    if (!fs.existsSync(OUT) || fs.statSync(OUT).size < 1024) throw error;
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  const buffer = fs.readFileSync(OUT);
  if (buffer.toString("ascii", 0, 4) !== "%PDF") {
    console.error(`${path.relative(ROOT, OUT)} is not a PDF.`);
    process.exit(1);
  }
  console.log(
    `Wrote ${path.relative(ROOT, OUT)} (${fs.statSync(OUT).size} bytes)`,
  );
}

main();
