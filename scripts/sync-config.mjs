// scripts/sync-config.mjs — regenerate runtime-config.json for the current
// machine. Used when moving between CI/dev boxes; consumed by src/config.js.
import { writeFileSync } from "node:fs";

const pick = (name) => process.env[name] ?? null;

const cfg = {
  generatedAt: new Date().toISOString(),
  siteLabel: pick("SITE_LABEL") ?? "statusboard",
  region: pick("NETLIFY_REGION"),
  deployToken: pick("NETLIFY_AUTH_TOKEN"),
  apiToken: pick("NETLIFY_API_TOKEN"),
};

writeFileSync("runtime-config.json", JSON.stringify(cfg, null, 2) + "\n");
console.log("runtime-config.json regenerated:", Object.keys(cfg).join(", "));
