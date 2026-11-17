import fs from "node:fs";

const CANDIDATES = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
];

export function findChrome() {
  return CANDIDATES.find((candidate) => candidate && fs.existsSync(candidate)) ?? null;
}

export async function openBrowser() {
  const executablePath = findChrome();
  if (!executablePath) return null;

  const { default: puppeteer } = await import("puppeteer-core");
  const browser = await puppeteer.launch({
    executablePath,
    headless: "new",
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  return browser;
}
