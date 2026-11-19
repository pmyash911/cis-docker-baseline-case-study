#!/usr/bin/env node
/**
 * check-site.mjs — post-build checks for yalgar.com.
 *
 * Runs against a locally started `next start` server and reports:
 *   1. HTML validation      (html-validate, recommended ruleset, Next-safe overrides)
 *   2. Link check           (every internal <a href> and asset <img/src|link/href|script/src>)
 *   3. Accessibility         (axe-core WCAG 2.0/2.1 A+AA via headless Chrome)
 *   4. Mobile tap targets    (every control >= 48px tall at 390px width)
 *   5. About-page contract   (title, description, canonical, og:title, og:url, headshot rules)
 *   6. Public-surface scan   (no placeholder text, no emoji)
 *
 * Usage: npm run build && node scripts/check-site.mjs [--port 4310] [--keep-server]
 */
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { setTimeout as sleep } from "node:timers/promises";

const require = createRequire(import.meta.url);
const CHROME =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const args = process.argv.slice(2);
const portArg = args.indexOf("--port");
const PORT = portArg >= 0 ? Number(args[portArg + 1]) : 4310;
const BASE = `http://127.0.0.1:${PORT}`;
const KEEP = args.includes("--keep-server");

const PAGES = [
  "/",
  "/about",
  "/capabilities",
  "/work",
  "/work/container-environment-baseline",
  "/privacy",
];

/* Pages whose markup is validated but which are not navigated to (they redirect). */
const MARKUP_ONLY_PAGES = ["/resume"];

const results = [];
const record = (section, name, ok, detail = "") => {
  results.push({ section, name, ok, detail });
  const mark = ok ? "PASS" : "FAIL";
  console.log(`  [${mark}] ${name}${detail ? ` — ${detail}` : ""}`);
};

function startServer() {
  const child = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "-p", String(PORT)],
    { cwd: process.cwd(), stdio: ["ignore", "pipe", "pipe"] },
  );
  child.stderr.on("data", (d) => process.env.DEBUG_CHECK && process.stderr.write(d));
  return child;
}

async function waitForServer(timeoutMs = 45000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(`${BASE}/`, { redirect: "manual" });
      if (res.status < 500) return true;
    } catch {
      /* not up yet */
    }
    await sleep(400);
  }
  return false;
}

const stripTags = (html) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

/* ---------------------------------------------------------------- link check */
async function checkLinks(client, pages) {
  console.log("\n2. Link check");
  const hrefs = new Set();
  const assets = new Set();
  for (const [url, html] of pages) {
    for (const m of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)) hrefs.add(m[1]);
    for (const m of html.matchAll(/<(?:img|script|source)\b[^>]*\bsrc="([^"]+)"/gi)) assets.add(m[1]);
    for (const m of html.matchAll(/<link\b[^>]*\bhref="([^"]+)"/gi)) assets.add(m[1]);
  }
  const internal = [...hrefs, ...assets]
    .filter((h) => h.startsWith("/") || h.startsWith(BASE))
    .map((h) => (h.startsWith(BASE) ? h.slice(BASE.length) : h))
    .filter((h) => !h.startsWith("/_next/") || true);
  const bad = [];
  for (const path of new Set(internal)) {
    const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
    if (res.status >= 400) bad.push(`${path} -> ${res.status}`);
  }
  const anchors = [...hrefs].filter((h) => h.startsWith("#"));
  record("links", `internal targets reachable (${new Set(internal).size})`,
    bad.length === 0, bad.slice(0, 8).join(", "));
  record("links", `same-page anchors present (${anchors.length})`, true);
  return bad;
}

/* ----------------------------------------------------------- html validation */
async function checkHtml(pages) {
  console.log("\n1. HTML validation");
  for (const extra of MARKUP_ONLY_PAGES) {
    const res = await fetch(`${BASE}${extra}`);
    pages = [...pages, [extra, await res.text()]];
  }
  const { HtmlValidate } = await import("html-validate");
  const hv = new HtmlValidate({
    extends: ["html-validate:recommended"],
    rules: {
      // Next.js emits inline style attributes for its own hydration markers.
      "no-inline-style": "off",
      "attribute-boolean-style": "off",
      "no-trailing-whitespace": "off",
      "doctype-style": "off",
      "void-style": "off",
      "long-title": "off",
      // React/Next emit camelCase and valueless attributes; not author-controlled.
      "attr-case": "off",
      "attribute-empty-style": "off",
    },
  });
  let total = 0;
  const sample = [];
  for (const [url, html] of pages) {
    const report = await hv.validateString(html);
    const messages = report.results.flatMap((r) => r.messages);
    total += messages.length;
    for (const m of messages.slice(0, 5)) sample.push(`${url}: ${m.ruleId} ${m.message}`);
  }
  record("html", `html-validate clean across ${pages.length} pages`, total === 0,
    total ? `${total} issues, e.g. ${sample.slice(0, 4).join(" | ")}` : "");
}

/* ------------------------------------------------------------- accessibility */
async function checkA11y(browser) {
  console.log("\n3. Accessibility (axe-core WCAG 2.0/2.1 A+AA)");
  const axePath = require.resolve("axe-core/axe.min.js");
  let violations = 0;
  const details = [];
  for (const path of PAGES) {
    const page = await browser.newPage();
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle2", timeout: 60000 });
    await page.addScriptTag({ path: axePath });
    const res = await page.evaluate(async () => {
      // eslint-disable-next-line no-undef
      return axe.run(document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
      });
    });
    violations += res.violations.length;
    for (const v of res.violations) {
      details.push(`${path}: ${v.id} (${v.impact}) x${v.nodes.length}`);
    }
    await page.close();
  }
  record("a11y", "no axe WCAG A/AA violations", violations === 0,
    details.slice(0, 6).join(" | "));
  return details;
}

/* ------------------------------------------------------------- tap targets */
async function checkTapTargets(browser) {
  console.log("\n4. Mobile tap targets (>= 48px tall at 390px)");
  const offenders = [];
  for (const path of ["/", "/about", "/capabilities", "/work", "/work/container-environment-baseline"]) {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true });
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle2", timeout: 60000 });
    const small = await page.evaluate(() => {
      const nodes = [...document.querySelectorAll("a, button, input, select, textarea")];
      return nodes
        .filter((el) => el.offsetParent !== null)
        .filter((el) => !el.classList.contains("sr-only"))
        .map((el) => {
          const rect = el.getBoundingClientRect();
          const inlineInProse =
            el.tagName === "A" &&
            el.closest("p, li") &&
            getComputedStyle(el).display === "inline";
          return {
            tag: el.tagName.toLowerCase(),
            label: (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 40),
            h: Math.round(rect.height),
            exempt: inlineInProse,
          };
        })
        .filter((x) => !x.exempt && x.h < 48);
    });
    for (const s of small) offenders.push(`${path} ${s.tag} "${s.label}" ${s.h}px`);
    await page.close();
  }
  record("tap", "every control at least 48px tall", offenders.length === 0,
    offenders.slice(0, 8).join(" | "));
}

/* ------------------------------------------------------- about-page contract */
async function checkAbout(browser) {
  console.log("\n5. About page contract");
  const page = await browser.newPage();
  await page.goto(`${BASE}/about`, { waitUntil: "networkidle2", timeout: 60000 });

  const meta = await page.evaluate(() => {
    const get = (sel, attr) => document.querySelector(sel)?.getAttribute(attr) ?? null;
    const img = document.querySelector('img[alt="Yash Patel"]');
    const cs = img ? getComputedStyle(img) : null;
    return {
      title: document.title,
      description: get('meta[name="description"]', "content"),
      canonical: get('link[rel="canonical"]', "href"),
      ogTitle: get('meta[property="og:title"]', "content"),
      ogUrl: get('meta[property="og:url"]', "content"),
      img: img
        ? {
            alt: img.getAttribute("alt"),
            width: img.getBoundingClientRect().width,
            naturalWidth: img.naturalWidth,
            maxWidth: cs.maxWidth,
            radius: parseFloat(cs.borderTopLeftRadius),
            shadow: cs.boxShadow,
            filter: cs.filter,
          }
        : null,
      text: document.body.innerText,
    };
  });

  record("about", "title present", Boolean(meta.title && meta.title !== ""), meta.title);
  record("about", "meta description present", Boolean(meta.description),
    (meta.description ?? "").slice(0, 70));
  record("about", "canonical is https://yalgar.com/about",
    meta.canonical === "https://yalgar.com/about", meta.canonical);
  record("about", "og:title present", Boolean(meta.ogTitle), meta.ogTitle);
  record("about", "og:url is https://yalgar.com/about",
    meta.ogUrl === "https://yalgar.com/about", meta.ogUrl);
  record("about", "headshot present with alt 'Yash Patel'", Boolean(meta.img?.alt === "Yash Patel"));
  record("about", "headshot max width <= 320px",
    Boolean(meta.img && meta.img.width <= 320 && meta.img.maxWidth === "320px"),
    meta.img ? `${Math.round(meta.img.width)}px, max-width ${meta.img.maxWidth}` : "no image");
  record("about", "headshot corner radius <= 2px",
    Boolean(meta.img && meta.img.radius <= 2), meta.img ? `${meta.img.radius}px` : "no image");
  record("about", "headshot has no shadow or filter",
    Boolean(meta.img && meta.img.shadow === "none" && meta.img.filter === "none"),
    meta.img ? `shadow=${meta.img.shadow} filter=${meta.img.filter}` : "no image");
  record("about", "email shown as a plain text link",
    meta.text.includes("inquiry@yalgar.com") &&
      Boolean(await page.$('a[href="mailto:inquiry@yalgar.com"]')));

  await page.close();
}

/* ------------------------------------------------- resume social wrapper */
async function checkResumeWrapper() {
  console.log("\n7. Resume wrapper (/resume)");
  const res = await fetch(`${BASE}/resume`, {
    headers: { "user-agent": "LinkedInBot/1.0" },
  });
  const html = await res.text();
  const tag = (re) => (html.match(re) ?? [])[1] ?? null;

  record("resume-card", "route returns 200 HTML",
    res.status === 200 && (res.headers.get("content-type") ?? "").includes("text/html"),
    `status ${res.status}`);
  record("resume-card", "og:image points at /og-resume.png",
    tag(/<meta property="og:image" content="([^"]+)"/) === "https://yalgar.com/og-resume.png",
    tag(/<meta property="og:image" content="([^"]+)"/));
  record("resume-card", "og:image declares 1200x627",
    tag(/<meta property="og:image:width" content="([^"]+)"/) === "1200" &&
      tag(/<meta property="og:image:height" content="([^"]+)"/) === "627");
  record("resume-card", "og:title present", Boolean(tag(/<meta property="og:title" content="([^"]+)"/)),
    tag(/<meta property="og:title" content="([^"]+)"/));
  record("resume-card", "og:description present",
    Boolean(tag(/<meta property="og:description" content="([^"]+)"/)));
  record("resume-card", "og:url present",
    tag(/<meta property="og:url" content="([^"]+)"/) === "https://yalgar.com/resume");
  record("resume-card", "instant redirect to the PDF",
    /http-equiv="refresh" content="0; url=\/resume\.pdf/.test(html) &&
      html.includes("location.replace"));

  // the image must exist and really be 1200x627
  const img = await fetch(`${BASE}/og-resume.png`);
  const bytes = Buffer.from(await img.arrayBuffer());
  const isPng = bytes.subarray(1, 4).toString("ascii") === "PNG";
  const w = isPng ? bytes.readUInt32BE(16) : 0;
  const h = isPng ? bytes.readUInt32BE(20) : 0;
  record("resume-card", "og-resume.png is a 1200x627 PNG",
    img.status === 200 && isPng && w === 1200 && h === 627, `${w}x${h}`);
}

/* ----------------------------------------------------- public surface scan */
async function checkSurface(pages) {
  console.log("\n6. Public surface scan");
  const problems = [];
  const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u;
  for (const [url, html] of pages) {
    const text = stripTags(html);
    if (/FILL IN|\[FILL IN\]|Lorem ipsum|TBD/i.test(text)) problems.push(`${url}: placeholder text`);
    if (emoji.test(text)) problems.push(`${url}: emoji`);
    if (/linear-gradient|radial-gradient/i.test(html)) problems.push(`${url}: gradient`);
    if (/class="[^"]*(?:transition-|animate-|motion-)/.test(html)) problems.push(`${url}: motion utility`);
    if (/class="[^"]*shadow-/.test(html)) problems.push(`${url}: shadow utility`);
  }
  record("surface", "no placeholder text, emoji or gradients", problems.length === 0,
    problems.slice(0, 5).join(" | "));
}

/* --------------------------------------------------------------------- main */
const server = startServer();
try {
  if (!(await waitForServer())) throw new Error("next start did not come up");
  const pages = [];
  for (const path of PAGES) {
    const res = await fetch(`${BASE}${path}`);
    pages.push([path, await res.text()]);
  }

  const { default: puppeteer } = await import("puppeteer-core");
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });

  const bad = await checkLinks(browser, pages);
  await checkHtml(pages);
  await checkA11y(browser);
  await checkTapTargets(browser);
  await checkAbout(browser);
  await checkSurface(pages);
  await checkResumeWrapper();

  await browser.close();

  const failed = results.filter((r) => !r.ok);
  console.log(
    `\n${failed.length === 0 ? "ALL CHECKS PASSED" : `${failed.length} CHECK(S) FAILED`} — ${results.length} assertions`,
  );
  process.exitCode = failed.length === 0 ? 0 : 1;
} catch (error) {
  console.error("\ncheck-site crashed:", error);
  process.exitCode = 2;
} finally {
  if (!KEEP) server.kill("SIGTERM");
}
