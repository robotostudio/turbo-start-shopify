#!/usr/bin/env node

/**
 * `pnpm dev:tunnel` — the Next.js dev server behind your ngrok domain, so
 * customer sign-in works locally.
 *
 * Shopify's Customer Account API rejects `http://localhost` callbacks, so
 * signing in needs HTTPS on a URL registered in the Headless channel. Every
 * ngrok account, free included, has a dev domain that stays the same between
 * runs, so the Shopify side is registered once.
 *
 * Steps: start ngrok, read the URL it reports, print the three URIs to
 * register in Shopify, then start `next dev` with NEXT_PUBLIC_SITE_URL set to
 * that URL for this process only (`.env` is not touched, so a production value
 * kept there is unaffected). Ctrl-C, or either process exiting, stops both.
 *
 * Optional overrides (shell or apps/web/.env, `.env.local` wins as in Next.js):
 *   NGROK_URL  a specific ngrok domain (paid or custom); default: your dev domain
 *   PORT       local port, default 3000
 *   NGROK_BIN  path to ngrok if it is not in a standard location
 *
 * Binaries are run by absolute path, never looked up on PATH: `next` through
 * pnpm's wrapper in this app's node_modules/.bin, ngrok and lsof from fixed
 * system locations. macOS and Linux only (Windows has no lsof or sh wrappers).
 */

import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { connect } from "node:net";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const appDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const TUNNEL_TIMEOUT_MS = 30_000;

const NGROK_LOCATIONS = [
  "/opt/homebrew/bin/ngrok", // Homebrew, Apple silicon
  "/usr/local/bin/ngrok", // Homebrew, Intel; manual installs
  "/usr/bin/ngrok", // apt
  "/snap/bin/ngrok", // snap
];
const LSOF = ["/usr/sbin/lsof", "/usr/bin/lsof"].find((p) => existsSync(p));
// pnpm's bin wrapper, not next's own entry file: the wrapper sets NODE_PATH,
// without which Turbopack cannot resolve PostCSS plugins such as
// @tailwindcss/postcss and every page fails with a 500.
const NEXT_BIN = join(appDir, "node_modules", ".bin", "next");

const log = (message) => console.log(`[dev:tunnel] ${message}`);

function fail(message) {
  console.error(`\n[dev:tunnel] ${message}\n`);
  process.exit(1);
}

function readEnvVar(name) {
  if (process.env[name]) return process.env[name];
  for (const file of [".env.local", ".env"]) {
    const path = join(appDir, file);
    if (!existsSync(path)) continue;
    const match = new RegExp(`^${name}=(.*)$`, "m").exec(
      readFileSync(path, "utf8")
    );
    if (match?.[1]) return match[1].trim().replace(/^["']|["']$/g, "");
  }
  return undefined;
}

// --- Checks before starting anything -----------------------------------

const port = readEnvVar("PORT") ?? "3000";

const ngrokBin =
  readEnvVar("NGROK_BIN") ?? NGROK_LOCATIONS.find((p) => existsSync(p));
if (!ngrokBin || !existsSync(ngrokBin)) {
  fail(
    "ngrok is not installed. One-time setup:\n" +
      "  brew install ngrok                    # or https://ngrok.com/download\n" +
      "  ngrok config add-authtoken <token>    # https://dashboard.ngrok.com/get-started/your-authtoken\n" +
      `(Looked in ${NGROK_LOCATIONS.join(", ")}; set NGROK_BIN for another path.)`
  );
}
if (!existsSync(NEXT_BIN)) {
  fail("next is not installed in apps/web. Run `pnpm install` from the repo root.");
}

let requestedUrl;
const ngrokUrlSetting = readEnvVar("NGROK_URL");
if (ngrokUrlSetting) {
  try {
    const url = new URL(
      ngrokUrlSetting.includes("://") ? ngrokUrlSetting : `https://${ngrokUrlSetting}`
    );
    requestedUrl = `https://${url.host}`;
  } catch {
    fail(`NGROK_URL is not a valid domain or URL: "${ngrokUrlSetting}".`);
  }
}

// If the port is taken, `next dev` quietly moves to the next free one while
// the tunnel keeps pointing at this port, which serves whatever app holds it.
// Probe by connecting, not by listening: a listen on `::` can succeed while
// another server holds the same port on IPv4.
const portInUse = await new Promise((resolve) => {
  const socket = connect({ host: "localhost", port: Number(port) });
  socket.once("connect", () => {
    socket.destroy();
    resolve(true);
  });
  socket.once("error", () => resolve(false));
});
if (portInUse) {
  const pid = LSOF
    ? spawnSync(LSOF, ["-t", `-iTCP:${port}`, "-sTCP:LISTEN"], {
        encoding: "utf8",
      }).stdout?.trim()
    : "";
  fail(
    `Port ${port} is already in use${pid ? ` (pid ${pid.split("\n")[0]})` : ""}, ` +
      "probably another dev server.\nStop it, or use another port: PORT=3001 pnpm dev:tunnel"
  );
}

// --- Process handling ---------------------------------------------------

const children = [];
let stopping = false;

function stopAll(code) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (child.exitCode === null) child.kill("SIGTERM");
  }
  process.exitCode = code;
}

process.on("SIGINT", () => stopAll(0));
process.on("SIGTERM", () => stopAll(0));

// --- ngrok --------------------------------------------------------------

// Headless (no ngrok TUI, which would fight Next's output for the screen),
// logging logfmt to stdout so the tunnel URL and errors can be read off it.
const ngrokArgs = ["http", port, "--log=stdout", "--log-format=logfmt"];
if (requestedUrl) ngrokArgs.push(`--url=${requestedUrl}`);

log(`Starting ngrok${requestedUrl ? ` on ${requestedUrl}` : ""}…`);
const ngrok = spawn(ngrokBin, ngrokArgs, { stdio: ["ignore", "pipe", "pipe"] });
children.push(ngrok);

const tunnelUrl = await new Promise((resolve) => {
  const timer = setTimeout(() => {
    console.error(
      `\n[dev:tunnel] ngrok did not report a tunnel within ${TUNNEL_TIMEOUT_MS / 1000}s.`
    );
    resolve(null);
  }, TUNNEL_TIMEOUT_MS);

  let buffered = "";
  let authHintShown = false;
  const onOutput = (chunk) => {
    buffered += chunk.toString();
    const lines = buffered.split("\n");
    buffered = lines.pop() ?? "";
    for (const line of lines) {
      const url = line.includes('msg="started tunnel"')
        ? /\burl=(https:\/\/\S+)/.exec(line)?.[1]
        : undefined;
      if (url) {
        clearTimeout(timer);
        resolve(url);
      } else if (line.includes("lvl=eror") || line.includes("ERR_NGROK")) {
        const err = /err="([^"]+)"/.exec(line)?.[1] ?? line;
        console.error(`\n[dev:tunnel] ngrok: ${err.replaceAll("\\n", "\n")}`);
        if (!authHintShown && (err.includes("4018") || /authtoken/i.test(err))) {
          authHintShown = true;
          console.error(
            "[dev:tunnel] Run: ngrok config add-authtoken <token>  " +
              "(https://dashboard.ngrok.com/get-started/your-authtoken)"
          );
        }
      }
    }
  };
  ngrok.stdout.on("data", onOutput);
  ngrok.stderr.on("data", onOutput);
  ngrok.once("exit", () => {
    clearTimeout(timer);
    resolve(null);
  });
});

if (!tunnelUrl) {
  stopAll(1);
  // ngrok's own error, if any, is printed above.
  fail("Could not open the tunnel. Fix the ngrok error above and run again.");
}

ngrok.on("exit", (code) => {
  if (!stopping) {
    console.error(`\n[dev:tunnel] ngrok exited (code ${code}); stopping the dev server.`);
    stopAll(code || 1);
  }
});

// --- Banner -------------------------------------------------------------

const envSiteUrl = readEnvVar("NEXT_PUBLIC_SITE_URL");
const accountsOn =
  Boolean(readEnvVar("SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID")) &&
  Boolean(readEnvVar("CUSTOMER_SESSION_SECRET"));

console.log(`
[dev:tunnel] Tunnel up → ${tunnelUrl}
             Open this URL, not localhost.

  Shopify admin → Sales channels → Headless → your storefront →
  Customer Account API → Application setup. Register once (the domain
  does not change between runs):
    Callback URI       ${tunnelUrl}/account/authorize
    JavaScript origin  ${tunnelUrl}
    Logout URI         ${tunnelUrl}/
${
  accountsOn
    ? ""
    : "\n  Customer accounts are OFF: set SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID and\n  CUSTOMER_SESSION_SECRET in apps/web/.env, then run again.\n"
}${
  envSiteUrl && envSiteUrl !== tunnelUrl
    ? `\n  NEXT_PUBLIC_SITE_URL in .env (${envSiteUrl}) is overridden by the\n  tunnel URL for this run only.\n`
    : ""
}`);

// --- Next.js ------------------------------------------------------------

const next = spawn(
  NEXT_BIN,
  ["dev", "--turbopack", "--port", port],
  {
    cwd: appDir,
    stdio: "inherit",
    // Process env beats .env in Next.js, so this reaches getBaseUrl(),
    // redirectUri() and allowedDevOrigins without editing any file.
    env: { ...process.env, NEXT_PUBLIC_SITE_URL: tunnelUrl },
  }
);
children.push(next);
next.on("exit", (code) => stopAll(code ?? 0));
