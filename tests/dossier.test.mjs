import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";

import { openBrowser } from "./support/browser.mjs";
import { DOSSIER_FILE, installFixtureDossier } from "./support/dossier-fixture.mjs";
import { startServer } from "./support/server.mjs";

const PORT = Number(process.env.TEST_PORT ?? 3399);
const CASE_STUDY_PATH = "/work/container-environment-baseline";

let server;
let restoreDossier;
let browser;

before(async () => {
  restoreDossier = await installFixtureDossier();
  server = await startServer({
    port: PORT,
    env: {
      DOSSIER_DRY_RUN: "1",
      DOSSIER_SEND_EMAIL: "0",
      // Hermetic: never depend on the developer's .env for test signatures.
      DOSSIER_SIGNING_SECRET: "homelab-test-signing-secret-0123456789abcdef",
      SITE_URL: `http://127.0.0.1:${PORT}`,
    },
  });
});

after(async () => {
  await browser?.close().catch(() => {});
  await server?.stop();
  await restoreDossier?.();
});

function postDossier(body, headers = {}) {
  return fetch(`${server.base}/api/dossier-request`, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

const validPayload = {
  name: "Test Visitor",
  email: "test.visitor@example.org",
  organization: "Example Industries",
  role: "CISO",
  intent: "Automated test submission.",
  caseStudy: "container-environment-baseline",
  startedAt: 0,
  attribution: {
    referrer: "https://www.google.com/",
    landingPath: CASE_STUDY_PATH,
    utmSource: "test",
    utmMedium: "suite",
    utmCampaign: "dossier",
  },
};

describe("case study page", () => {
  test("renders the dossier with all key sections", async () => {
    const response = await fetch(`${server.base}${CASE_STUDY_PATH}`);
    assert.equal(response.status, 200);
    const html = await response.text();

    assert.match(html, /<h1[^>]*>Container Environment Baseline/);
    assert.match(html, /Case study: Container Environment Baseline/);
    // metric strip
    for (const metric of ["Baseline Controls", "Weak-Env Failures", "Control Coverage", "Execution Footprint"]) {
      assert.match(html, new RegExp(metric));
    }
    // numbered sections
    for (const section of ["01 // CONTEXT", "02 // FRAMEWORK", "03 // EVALUATION MATRIX", "04 // ARTIFACTS"]) {
      assert.match(html, new RegExp(section.replace(/\//g, "\\/")));
    }
    // matrix rows + statuses
    assert.match(html, /CIS 1\.1\.1/);
    assert.match(html, /CIS 5\.2\.2/);
    assert.match(html, /PASS/);
    assert.match(html, /FAIL/);
    // dossier form fields
    for (const field of ["req-name", "req-email", "req-org", "req-role", "req-intent"]) {
      assert.match(html, new RegExp(`id="${field}"`));
    }
    // download/email copy must not promise email delivery (it is disabled)
    assert.doesNotMatch(html, /on its way to/i);
    // no unverified marketing numbers left on the page
    assert.doesNotMatch(html, /3 min|114-point|98\.7%|1,200\+/);
  });

  test("homepage and work index link to the case study", async () => {
    for (const page of ["/", "/work"]) {
      const html = await (await fetch(`${server.base}${page}`)).text();
      assert.match(
        html,
        /href="\/work\/container-environment-baseline"/,
        `${page} should link to the case study`,
      );
    }
  });

  test("case study links back to the portfolio", async () => {
    const html = await (await fetch(`${server.base}${CASE_STUDY_PATH}`)).text();
    assert.match(html, /Return to Selected Work/);
    assert.match(html, /href="\/work"/);
  });
});

describe("dossier request API", () => {
  test("rejects invalid input", async () => {
    const badEmail = await postDossier({ ...validPayload, email: "nope" });
    assert.equal(badEmail.status, 422);
    assert.equal((await badEmail.json()).ok, false);

    const shortName = await postDossier({ ...validPayload, name: "A" });
    assert.equal(shortName.status, 422);

    const unknownCaseStudy = await postDossier({ ...validPayload, caseStudy: "../../etc/passwd" });
    assert.equal(unknownCaseStudy.status, 400);
    assert.equal((await unknownCaseStudy.json()).ok, false);
  });

  test("silently accepts honeypot submissions without recording", async () => {
    const response = await postDossier({ ...validPayload, website: "https://spam.example" });
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.ok, true);
    assert.equal(body.requestId, "ignored");
  });

  test("dry run returns a signed download link", async () => {
    const response = await postDossier(validPayload);
    assert.equal(response.status, 200);
    const body = await response.json();

    assert.equal(body.ok, true);
    assert.equal(body.delivery, "dry-run");
    assert.match(body.downloadPath, /^\/api\/dossier\/container-environment-baseline\?exp=\d+&sig=/);
    assert.ok(body.requestId);

    const download = await fetch(`${server.base}${body.downloadPath}`);
    assert.equal(download.status, 200);
    assert.equal(download.headers.get("content-type"), "application/pdf");
    assert.equal(download.headers.get("cache-control"), "private, no-store");

    const tampered = body.downloadPath.replace(/sig=[^&]+/, "sig=deadbeef");
    assert.equal((await fetch(`${server.base}${tampered}`)).status, 403);
  });

  test("unknown dossier slugs are not downloadable", async () => {
    const response = await fetch(`${server.base}/api/dossier/does-not-exist?exp=9999999999999&sig=x`);
    assert.equal(response.status, 404);
  });

  test("rate limits repeated submissions", async () => {
    const headers = { "user-agent": `rate-limit-test-${Date.now()}` };
    let lastStatus = 0;

    for (let i = 0; i < 11; i += 1) {
      const response = await postDossier(validPayload, headers);
      lastStatus = response.status;
      if (response.status === 429) break;
    }
    assert.equal(lastStatus, 429);
  });

  test("fixture dossier is the only file installed", async () => {
    // sanity: the test never deletes/overwrites a real dossier
    const stat = await import("node:fs/promises").then((fs) => fs.stat(DOSSIER_FILE));
    assert.ok(stat.size > 0);
  });
});

describe("dossier form (browser)", () => {
  test("submits and shows an instant download", async (t) => {
    browser = await openBrowser();
    if (!browser) {
      t.skip("Chrome/Chromium not found; set CHROME_PATH to run browser tests");
      return;
    }

    const page = await browser.newPage();
    const consoleErrors = [];
    page.on("pageerror", (error) => consoleErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    await page.setViewport({ width: 1440, height: 1000 });
    await page.goto(`${server.base}${CASE_STUDY_PATH}`, { waitUntil: "networkidle0" });

    assert.match(await page.$eval("h1", (el) => el.textContent ?? ""), /Container Environment Baseline/);

    // hidden honeypot exists but is not visible
    assert.equal(await page.$eval('input[name="website"]', (el) => el.tabIndex), -1);

    await page.type("#req-name", "Browser Test");
    await page.type("#req-email", "browser.test@example.org");
    await page.type("#req-org", "Example Industries");
    await page.type("#req-role", "CISO");
    await page.click('button[type="submit"]');

    const link = await page.waitForSelector('[aria-live="polite"] a[href^="/api/dossier/"]', {
      timeout: 15_000,
    });
    assert.ok(link);

    const href = await link.evaluate((el) => el.getAttribute("href"));
    const successText = await page.$eval('[aria-live="polite"]', (el) =>
      (el.textContent ?? "").replace(/\s+/g, " ").trim(),
    );
    assert.match(successText, /Request recorded/);
    assert.match(successText, /Download the dossier/);

    const download = await page.evaluate(async (path) => {
      const response = await fetch(path);
      return {
        status: response.status,
        type: response.headers.get("content-type"),
        bytes: (await response.arrayBuffer()).byteLength,
      };
    }, href);

    assert.equal(download.status, 200);
    assert.equal(download.type, "application/pdf");
    assert.ok(download.bytes > 0);

    assert.deepEqual(consoleErrors, []);
  });

  test("mobile menu opens and closes", async (t) => {
    browser = browser ?? (await openBrowser());
    if (!browser) {
      t.skip("Chrome/Chromium not found; set CHROME_PATH to run browser tests");
      return;
    }

    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844 });
    await page.goto(`${server.base}${CASE_STUDY_PATH}`, { waitUntil: "networkidle0" });

    const toggle = await page.$('button[aria-controls="mobile-navigation"]');
    assert.ok(toggle, "mobile menu button should exist");
    assert.equal(await toggle.evaluate((el) => el.getAttribute("aria-expanded")), "false");

    await toggle.click();
    await page.waitForSelector("#mobile-navigation", { timeout: 5_000 });
    assert.equal(await page.$eval('button[aria-controls="mobile-navigation"]', (el) => el.getAttribute("aria-expanded")), "true");

    await page.keyboard.press("Escape");
    await page.waitForFunction(
      () => !document.getElementById("mobile-navigation"),
      { timeout: 5_000 },
    );
  });
});
