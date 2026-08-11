#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const [modelFile, outputFile] = process.argv.slice(2);
if (!modelFile || !outputFile) {
  console.error("Usage: build_example.mjs <model.json> <output.html>");
  process.exit(2);
}

const seed = readFileSync(new URL("../assets/decision-map-seed.html", import.meta.url), "utf8");
const model = JSON.parse(readFileSync(resolve(modelFile), "utf8"));
const serialized = JSON.stringify(model, null, 2).replace(/<\/script/gi, "<\\/script");
const escapedTitle = String(model.meta?.title || "Decision map")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#39;");
const modelPattern = /(<script\s+type="application\/json"\s+id="decision-map-model">)[\s\S]*?(<\/script>)/;
if (!modelPattern.test(seed)) {
  console.error("Seed does not contain the canonical decision-map-model slot");
  process.exit(1);
}

const html = seed
  .replace(modelPattern, `$1\n${serialized}\n  $2`)
  .replace(/<title>[^<]*<\/title>/, `<title>${escapedTitle}</title>`);
writeFileSync(resolve(outputFile), html);
console.log(`Built ${resolve(outputFile)}`);
