#!/usr/bin/env node
import { readFileSync } from "node:fs";

const file = process.argv[2];
if (!file) {
  console.error("Usage: validate_decision_map.mjs <outputs/map.html>");
  process.exit(2);
}

const html = readFileSync(file, "utf8");
const checkedHtml = html
  .replace(/<!--[\s\S]*?-->/g, "")
  .replace(/\/\*[\s\S]*?\*\//g, "");
const controlHtml = sanitizeForControlFlow(checkedHtml);
const failures = [];
const warnings = [];

function fail(message) {
  failures.push(message);
}

function warn(message) {
  warnings.push(message);
}

function sanitizeForControlFlow(text) {
  let output = "";
  let quote = null;
  let escaped = false;
  let inLineComment = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (inLineComment) {
      if (char === "\n") {
        inLineComment = false;
        output += char;
      } else {
        output += " ";
      }
      continue;
    }

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      output += " ";
      continue;
    }

    if (char === "/" && next === "/") {
      inLineComment = true;
      output += "  ";
      index += 1;
    } else if (char === "\"" || char === "'" || char === "`") {
      quote = char;
      output += " ";
    } else {
      output += char;
    }
  }

  return output;
}

function hasArrayField(name) {
  const value = `(?:\\[|[A-Za-z_$][\\w$]*(?:\\s*\\()?)`;
  const objectLiteral = new RegExp(`\\b${name}\\s*:\\s*${value}`);
  const standalone = new RegExp(`\\b(?:const|let|var)\\s+${name}\\s*=\\s*${value}`);
  return objectLiteral.test(controlHtml) || standalone.test(controlHtml);
}

if (!/\bmapGrammar\s*:/.test(controlHtml)) {
  fail("Missing model.meta.mapGrammar");
}

for (const field of ["nodes", "edges", "decisions", "reviews"]) {
  if (!hasArrayField(field)) fail(`Missing model.${field}[]`);
}

for (const field of ["nodes", "edges"]) {
  if (new RegExp(`\\b${field}\\s*:\\s*\\[\\s*\\]`).test(controlHtml)) {
    warn(`model.${field}[] is empty. This is acceptable only for a scaffold, not a delivered map.`);
  }
}

if (!/localStorage\./.test(html)) {
  warn("No localStorage usage found for team decision state.");
}

function findMatchingBrace(text, openBraceIndex) {
  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let index = openBraceIndex; index < text.length; index += 1) {
    const char = text[index];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === "\"" || char === "'" || char === "`") {
      quote = char;
    } else if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }

  return -1;
}

function isInsideTryCatch(text, index) {
  for (const match of text.matchAll(/\btry\s*{/g)) {
    const openBraceIndex = text.indexOf("{", match.index);
    const closeBraceIndex = findMatchingBrace(text, openBraceIndex);
    if (closeBraceIndex === -1) continue;
    if (index <= openBraceIndex || index >= closeBraceIndex) continue;

    const after = text.slice(closeBraceIndex + 1, closeBraceIndex + 120);
    if (/^\s*(?:catch\s*(?:\(|{)|finally\s*{)/.test(after)) return true;
  }

  return false;
}

const setItemMatches = [...controlHtml.matchAll(/localStorage\.setItem/g)];
for (const match of setItemMatches) {
  if (!isInsideTryCatch(controlHtml, match.index)) {
    warn("localStorage.setItem appears outside a nearby try/catch/finally guard.");
    break;
  }
}

if (/(?:svg\.edges|\.edges)[^{]*{[^}]*pointer-events\s*:\s*none/.test(html)) {
  warn("Check SVG edge pointer-events. Parent layers can make edge clicks fail.");
}

if (!/(data-edge-mode|edgeMode|line-density|Line Density)/.test(html)) {
  fail("Dense-map edge visibility control not found.");
}

if (!/(data-action=["']fit["']|fitToView|fit-to-view)/.test(html)) {
  fail("Fit-to-view control not found.");
}

if (!/(data-action=["']zoom-in["']|zoomIn)/.test(html) || !/(data-action=["']zoom-out["']|zoomOut)/.test(html)) {
  fail("Zoom controls not found.");
}

if (!/(data-left-panel|collapse-left|collapsed)/.test(html) || !/(data-detail-panel|collapse-right|collapsed)/.test(html)) {
  warn("Panel collapse controls or panel markers not found.");
}

if (/\b(card|panel|node)[^{}]*{[^{}]*border-radius:\s*(1[7-9]|[2-9][0-9])px/.test(html)) {
  warn("Oversized card/panel radius found. Night Signal uses 12–14px information surfaces.");
}

for (const token of ["--surface", "--surface-raised", "--ink", "--muted", "--line", "--accent", "--focus"]) {
  if (!html.includes(token)) warn(`Semantic UI token not found: ${token}`);
}

if (!/:focus-visible/.test(html)) {
  warn("No :focus-visible state found for interactive controls.");
}

if (!/prefers-reduced-motion/.test(html)) {
  warn("No prefers-reduced-motion handling found.");
}

if (/--(?:base|surface)\s*:\s*(?:#000(?:000)?\b|black\b)/i.test(html)) {
  warn("Pure black surface found. Night Signal uses tinted dark neutrals.");
}

if (/linear-gradient\([^)]*purple|#8b5cf6|#7c3aed|#a855f7/i.test(html)) {
  warn("Purple gradient/palette token found. Check for one-note AI UI styling.");
}

const forbidden = ["HYPE", "AAVE", "ONDO", "JUP", "pump.fun"];
for (const term of forbidden) {
  const pattern = term.includes(".")
    ? new RegExp(`(^|[^A-Za-z0-9])${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^A-Za-z0-9]|$)`, "i")
    : new RegExp(`\\b${term}\\b`);
  if (pattern.test(checkedHtml)) warn(`Potential imported vocabulary found: ${term}`);
}

if (failures.length) {
  console.error("Decision map validation failed:");
  for (const item of failures) console.error(`- ${item}`);
  if (warnings.length) {
    console.error("\nWarnings:");
    for (const item of warnings) console.error(`- ${item}`);
  }
  process.exit(1);
}

if (warnings.length) {
  console.warn("Decision map validation passed with warnings:");
  for (const item of warnings) console.warn(`- ${item}`);
} else {
  console.log("Decision map validation passed.");
}
