#!/usr/bin/env node
/**
 * make-og-image.mjs — render public/og.png, the 1200x630 social preview.
 *
 * Typographic only, per DESIGN.md: warm paper background, navy 1px rules,
 * Source Serif 4 headline, Source Sans 3 footnote. No images, icons or colour
 * blocks. Uses Node built-ins plus a headless Chrome already on the machine
 * (CHROME_PATH overrides the lookup); no npm packages and no network calls.
 *
 * Source Serif 4 / Source Sans 3 are embedded from the copies Next.js has
 * already downloaded under .next/static/media. If that build cache is absent,
 * the template falls back to Georgia / Helvetica.
 *
 * Usage: node scripts/make-og-image.mjs
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "public", "og.png");
const WIDTH = 1200;
const HEIGHT = 630;

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

/**
 * Reuse Next's downloaded font subset for a family by reading its @font-face
 * rules. The latin-basic subset is the one with "u+00??" in unicode-range.
 */
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
<title>Yalgar Consulting LLC — social preview</title>
<style>
${embeddedFontFaces()}
:root {
  --paper: #fcf9f8;
  --ink: #00152d;
  --navy: #0b2a4a;
  --line: #c4c6cf;
  --muted: #74777f;
  --body: #43474e;
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  width: ${WIDTH}px;
  height: ${HEIGHT}px;
  overflow: hidden;
  background: var(--paper);
  color: var(--body);
  font-family: "Source Sans 3", Helvetica, Arial, sans-serif;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.frame {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: ${HEIGHT}px;
  padding: 64px 72px 56px;
}
.top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--ink);
}
.brand {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--ink);
}
.site { font-size: 15px; letter-spacing: 0.04em; color: var(--muted); }
h1 {
  margin: 0;
  max-width: 1000px;
  font-family: "Source Serif 4", Georgia, "Times New Roman", serif;
  font-weight: 600;
  font-size: 58px;
  line-height: 1.12;
  letter-spacing: -0.02em;
  color: var(--ink);
}
.bottom {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid var(--line);
  font-size: 16px;
}
.bottom .name { font-weight: 600; color: var(--ink); }
.bottom .meta { color: var(--muted); }
</style>
</head>
<body>
  <div class="frame">
    <div class="top">
      <div class="brand">Yalgar Consulting LLC</div>
      <div class="site">yalgar.com</div>
    </div>
    <h1>Practical security, supply chain, and operations consulting for small and mid-size organizations.</h1>
    <div class="bottom">
      <div class="name">Yash Patel &middot; inquiry@yalgar.com</div>
      <div class="meta">linkedin.com/in/yash-patelycc</div>
    </div>
  </div>
</body>
</html>
`;

function pngSize(file) {
  const buffer = fs.readFileSync(file);
  if (buffer.toString("ascii", 1, 4) !== "PNG") return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function main() {
  const chrome = findChrome();
  if (!chrome) {
    console.error(
      "No Chrome found. Set CHROME_PATH to a Chrome/Chromium binary and re-run.",
    );
    process.exit(1);
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ycc-og-"));
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
        "--force-device-scale-factor=1",
        `--window-size=${WIDTH},${HEIGHT}`,
        `--user-data-dir=${profileDir}`,
        "--no-first-run",
        "--no-default-browser-check",
        `--screenshot=${OUT}`,
        pathToFileURL(htmlPath).href,
      ],
      { stdio: "pipe", timeout: 60000 },
    );
  } catch (error) {
    // Some Chrome builds exit non-zero even when the screenshot is written.
    if (!fs.existsSync(OUT) || fs.statSync(OUT).size < 1024) throw error;
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }

  const size = pngSize(OUT);
  if (!size || size.width !== WIDTH || size.height !== HEIGHT) {
    console.error(`Unexpected PNG dimensions: ${JSON.stringify(size)}`);
    process.exit(1);
  }
  console.log(
    `Wrote ${path.relative(ROOT, OUT)} (${size.width}x${size.height}, ${fs.statSync(OUT).size} bytes)`,
  );
}

main();
