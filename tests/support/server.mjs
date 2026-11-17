import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

/**
 * Starts the production Next.js server on a test port and waits until it answers.
 * The caller must stop() it in an after() hook.
 */
export async function startServer({ port, env = {} }) {
  const child = spawn("npm", ["run", "start", "--", "-p", String(port)], {
    env: { ...process.env, ...env },
    stdio: ["ignore", "pipe", "pipe"],
    detached: true, // own process group, so stop() can kill npm + next-server
  });

  let output = "";
  child.stdout.on("data", (chunk) => {
    output += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    output += chunk.toString();
  });

  const base = `http://127.0.0.1:${port}`;
  const deadline = Date.now() + 45_000;

  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Test server exited early:\n${output}`);
    }
    try {
      const response = await fetch(`${base}/`);
      if (response.status === 200) {
        return { base, stop: () => stop(child) };
      }
    } catch {
      /* not up yet */
    }
    await delay(250);
  }

  await stop(child);
  throw new Error(`Test server did not become ready:\n${output}`);
}

function stop(child) {
  if (child.exitCode !== null) return Promise.resolve();

  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      if (child.exitCode === null) child.kill("SIGKILL");
    }, 5_000);
    timer.unref?.();

    child.once("exit", () => {
      clearTimeout(timer);
      resolve();
    });
    try {
      process.kill(-child.pid, "SIGTERM");
    } catch {
      child.kill("SIGTERM");
    }
  });
}
