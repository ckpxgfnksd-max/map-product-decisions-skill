#!/usr/bin/env node
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const scratch = mkdtempSync(join(tmpdir(), "decision-map-builder-"));
const modelFile = join(scratch, "hostile.json");
const outputFile = join(scratch, "hostile.html");
const hostileTitle = '</title><script>window.__builderXss = true</script><title>';

try {
  writeFileSync(modelFile, JSON.stringify({ meta: { title: hostileTitle } }));
  const result = spawnSync(process.execPath, [new URL("./build_example.mjs", import.meta.url).pathname, modelFile, outputFile], { encoding: "utf8" });
  if (result.status !== 0) {
    console.error(result.stdout);
    console.error(result.stderr);
    process.exit(1);
  }
  const html = readFileSync(outputFile, "utf8");
  const executableProbe = "</title><script>window.__builderXss = true</script><title>";
  if (html.includes(executableProbe)) {
    console.error("FAIL  hostile title remained executable");
    process.exit(1);
  }
  if (!html.includes("&lt;/title&gt;&lt;script&gt;window.__builderXss = true&lt;/script&gt;&lt;title&gt;")) {
    console.error("FAIL  hostile title was not encoded into inert title text");
    process.exit(1);
  }
  console.log("PASS  hostile title is inert in the generated HTML");
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
