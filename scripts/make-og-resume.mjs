#!/usr/bin/env node
/**
 * make-og-resume.mjs — render public/og-resume.png, the 1200x627 card used by
 * the /resume HTML wrapper for LinkedIn (and every other unfurler).
 *
 * Composition: left paper panel with the brand mark, "Resume", the tagline and
 * a one-line descriptor; right panel is the supplied portrait card cropped to
 * fill. The original upload is preserved as public/og-resume-source.png.
 *
 * Uses Node built-ins plus a headless Chrome already on the machine
 * (CHROME_PATH overrides the lookup); no npm packages and no network calls.
 * Source Serif 4 / Source Sans 3 are embedded from Next's downloaded copies
 * under .next/static/media, with a Georgia / Helvetica fallback.
 *
 * Usage: node scripts/make-og-resume.mjs
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "public", "og-resume.png");
const SOURCE = path.join(ROOT, "public", "og-resume-source.png");
const WIDTH = 1200;
const HEIGHT = 627;

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
];

function findChrome() {
  return CHROME_CANDIDATES.find((p) => p && fs.existsSync(p)) ?? null;
}

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

function main() {
  const chrome = findChrome();
  if (!chrome) {
    console.error("No Chrome found. Set CHROME_PATH and re-run.");
    process.exit(1);
  }
  if (!fs.existsSync(SOURCE)) {
    console.error(
      "Missing public/og-resume-source.png — copy the supplied portrait card there first.",
    );
    process.exit(1);
  }

  const sourceBase64 = fs.readFileSync(SOURCE).toString("base64");

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8" /><title>Yash Patel — Resume</title>
<style>
${embeddedFontFaces()}
:root { --paper:#fcf9f8; --ink:#00152d; --navy:#0b2a4a; --line:#c4c6cf; --muted:#6b6f77; --body:#43474e; }
* { box-sizing:border-box; }
html,body { margin:0; padding:0; }
body { width:${WIDTH}px; height:${HEIGHT}px; overflow:hidden; background:var(--paper);
  font-family:"Source Sans 3",Helvetica,Arial,sans-serif; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
.card { display:grid; grid-template-columns: 1fr 470px; height:${HEIGHT}px; }
.left { padding:56px 44px 44px 64px; display:flex; flex-direction:column; justify-content:space-between; }
.mark { width:64px; height:64px; background:var(--ink); color:#fff; display:flex; align-items:center;
  justify-content:center; font-size:20px; font-weight:600; letter-spacing:0.06em; }
h1 { margin:0; font-family:"Source Serif 4",Georgia,serif; font-weight:600; font-size:76px;
  line-height:1.02; letter-spacing:-0.02em; color:var(--ink); }
.tagline { margin:14px 0 0; font-family:"Source Serif 4",Georgia,serif; font-size:29px; line-height:1.25;
  color:var(--navy); }
.rule { width:220px; border-top:1px solid var(--line); margin:26px 0 0; }
.desc { margin:18px 0 0; max-width:430px; font-size:17px; line-height:1.45; color:var(--body); }
.foot { display:flex; align-items:baseline; justify-content:space-between; border-top:1px solid var(--line);
  padding-top:14px; font-size:15px; color:var(--muted); }
.foot .name { font-weight:600; color:var(--ink); }
.right { position:relative; overflow:hidden; border-left:1px solid var(--line);
  background-image:url("data:image/png;base64,${sourceBase64}");
  background-repeat:no-repeat; background-size:300% auto; background-position:88% 58%; }
</style></head>
<body>
  <div class="card">
    <div class="left">
      <div class="mark">YCC</div>
      <div>
        <h1>Resume</h1>
        <p class="tagline">Practical Security.<br />Stronger Outcomes.</p>
        <div class="rule"></div>
        <p class="desc">Experience and expertise in security risk assessments, vendor &amp;
          supply chain reviews, and web application &amp; baseline audits.</p>
      </div>
      <div class="foot">
        <span class="name">Yash Patel</span>
        <span>yalgar.com/resume</span>
      </div>
    </div>
    <div class="right"></div>
  </div>
</body></html>`;

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ycc-og-resume-"));
  const htmlPath = path.join(tmpDir, "og.html");
  const profileDir = path.join(tmpDir, "chrome-profile");
  fs.writeFileSync(htmlPath, html, "utf8");
  fs.mkdirSync(path.dirname(OUT), { recursive: true });

  try {
    execFileSync(
      chrome,
      [
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--no-first-run",
        "--no-default-browser-check",
        `--user-data-dir=${profileDir}`,
        `--window-size=${WIDTH},${HEIGHT}`,
        `--screenshot=${OUT}`,
        pathToFileURL(htmlPath).href,
      ],
      { stdio: "pipe", timeout: 60000 },
    );
  } catch (error) {
    if (!fs.existsSync(OUT) || fs.statSync(OUT).size < 1024) throw error;
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  const header = fs.readFileSync(OUT).subarray(0, 24);
  if (header.toString("ascii", 1, 4) !== "PNG") {
    console.error("og-resume.png is not a PNG.");
    process.exit(1);
  }
  const width = header.readUInt32BE(16);
  const height = header.readUInt32BE(20);
  console.log(
    `Wrote ${path.relative(ROOT, OUT)} (${width}x${height}, ${fs.statSync(OUT).size} bytes)`,
  );
}

main();
