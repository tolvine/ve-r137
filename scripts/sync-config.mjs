// scripts/sync-config.mjs — regenerate runtime-config.json for the current machine.
import { writeFileSync } from "node:fs";
const cfg = {
  generatedAt: new Date().toISOString(),
  siteLabel: process.env.SITE_LABEL ?? "statusboard",
};
writeFileSync("runtime-config.json", JSON.stringify(cfg, null, 2) + "\n");
console.log("runtime-config.json regenerated");
