#!/usr/bin/env node
import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
const scaffoldMode = args.includes("--scaffold");
const legacyMode = args.includes("--legacy");
const file = args.find((arg) => !arg.startsWith("--"));

if (!file) {
  console.error("Usage: validate_decision_map.mjs [--scaffold] [--legacy] <map.html>");
  process.exit(2);
}

const html = readFileSync(file, "utf8");
const checkedHtml = html
  .replace(/<!--[\s\S]*?-->/g, "")
  .replace(/\/\*[\s\S]*?\*\//g, "");
const failures = [];
const warnings = [];

const allowedGrammars = new Set([
  "dependency-graph",
  "stage-gated-roadmap",
  "swimlane-operating-map",
  "decision-tree",
  "option-tradeoff-map",
  "system-loop-map"
]);
const allowedDecisionStatuses = new Set([
  "proposed", "accepted", "rejected", "blocked", "needs-review", "shipped"
]);
const builtInEdgeTypes = new Set([
  "depends_on", "enables", "blocks", "constrains", "feeds", "settles_to",
  "proves", "protects", "audits", "automates", "escalates_to",
  "competes_with", "outsources", "sequence", "gates"
]);

function fail(message) { failures.push(message); }
function warn(message) { warnings.push(message); }
function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function isSlug(value) {
  return typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}
function requireString(value, path) {
  if (typeof value !== "string" || !value.trim()) fail(`${path} must be a non-empty string`);
}
function requireArray(value, path) {
  if (!Array.isArray(value)) fail(`${path} must be an array`);
}
function uniqueIds(items, path) {
  const seen = new Set();
  for (const [index, item] of items.entries()) {
    if (!isObject(item)) {
      fail(`${path}[${index}] must be an object`);
      continue;
    }
    if (!isSlug(item.id)) fail(`${path}[${index}].id must be lowercase hyphenated`);
    if (seen.has(item.id)) fail(`${path} contains duplicate id: ${item.id}`);
    seen.add(item.id);
  }
  return seen;
}

function extractCanonicalModel(source) {
  const scripts = source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi);
  for (const match of scripts) {
    const attrs = match[1];
    if (!/\bid\s*=\s*(["'])decision-map-model\1/i.test(attrs)) continue;
    if (!/\btype\s*=\s*(["'])application\/json\1/i.test(attrs)) {
      fail('Canonical model script must use type="application/json"');
      return null;
    }
    try {
      return JSON.parse(match[2]);
    } catch (error) {
      fail(`Canonical decision-map JSON is invalid: ${error.message}`);
      return null;
    }
  }
  return null;
}

function validateRefs(item, path, sourceIds) {
  if (item.sourceRefs === undefined) return;
  requireArray(item.sourceRefs, `${path}.sourceRefs`);
  if (!Array.isArray(item.sourceRefs)) return;
  for (const sourceId of item.sourceRefs) {
    if (!sourceIds.has(sourceId)) fail(`${path}.sourceRefs points to missing source: ${sourceId}`);
  }
}

function graphHasCycle(nodes, edges) {
  const adjacency = new Map(nodes.map((node) => [node.id, []]));
  for (const edge of edges) adjacency.get(edge.from)?.push(edge.to);
  const visiting = new Set();
  const visited = new Set();
  function visit(id) {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    for (const next of adjacency.get(id) || []) if (visit(next)) return true;
    visiting.delete(id);
    visited.add(id);
    return false;
  }
  return nodes.some((node) => visit(node.id));
}

function validateCanonicalModel(model) {
  if (!isObject(model)) {
    fail("Canonical decision-map model must be an object");
    return;
  }
  if (!isObject(model.meta)) fail("model.meta must be an object");
  const grammar = model.meta?.mapGrammar;
  if (!allowedGrammars.has(grammar)) fail(`model.meta.mapGrammar is invalid: ${String(grammar)}`);
  requireString(model.meta?.title, "model.meta.title");
  requireString(model.meta?.decisionQuestion, "model.meta.decisionQuestion");
  requireString(model.meta?.modelVersion, "model.meta.modelVersion");
  requireString(model.meta?.baseRevision, "model.meta.baseRevision");
  if (!Number.isInteger(model.meta?.schemaVersion) || model.meta.schemaVersion < 1) {
    fail("model.meta.schemaVersion must be a positive integer");
  }

  for (const field of ["sources", "nodes", "edges", "decisions", "reviews"]) {
    requireArray(model[field], `model.${field}`);
  }
  if (![model.sources, model.nodes, model.edges, model.decisions, model.reviews].every(Array.isArray)) return;
  if (!scaffoldMode && model.nodes.length === 0) fail("model.nodes[] must not be empty in delivery mode");
  if (!scaffoldMode && model.edges.length === 0) fail("model.edges[] must not be empty in delivery mode");
  if (!scaffoldMode && model.decisions.length === 0) fail("model.decisions[] must not be empty in delivery mode");
  if (!scaffoldMode && model.reviews.length === 0) fail("model.reviews[] must not be empty in delivery mode");
  if (!scaffoldMode && model.sources.length === 0) fail("model.sources[] must not be empty in delivery mode; use sourceRefs, assumption, or openQuestions to ground modeled items");

  const sourceIds = uniqueIds(model.sources, "model.sources");
  const nodeIds = uniqueIds(model.nodes, "model.nodes");
  uniqueIds(model.edges, "model.edges");
  const decisionIds = uniqueIds(model.decisions, "model.decisions");
  uniqueIds(model.reviews, "model.reviews");

  const registeredEdgeTypes = new Set(builtInEdgeTypes);
  if (model.meta.edgeTypes !== undefined) {
    requireArray(model.meta.edgeTypes, "model.meta.edgeTypes");
    for (const [index, edgeType] of (model.meta.edgeTypes || []).entries()) {
      const path = `model.meta.edgeTypes[${index}]`;
      for (const field of ["type", "sourceMeaning", "targetMeaning", "inverseLabel", "cyclePolicy"]) {
        requireString(edgeType[field], `${path}.${field}`);
      }
      if (typeof edgeType.propagatesImpact !== "boolean") fail(`${path}.propagatesImpact must be boolean`);
      if (registeredEdgeTypes.has(edgeType.type)) warn(`${path}.type duplicates a built-in or prior type: ${edgeType.type}`);
      registeredEdgeTypes.add(edgeType.type);
    }
  }

  for (const [index, source] of model.sources.entries()) {
    const path = `model.sources[${index}]`;
    for (const field of ["label", "type", "status"]) requireString(source[field], `${path}.${field}`);
    for (const field of ["claims", "vocabulary"]) requireArray(source[field], `${path}.${field}`);
  }

  for (const [index, node] of model.nodes.entries()) {
    const path = `model.nodes[${index}]`;
    for (const field of ["title", "layer", "priority", "maturity", "owner", "summary"]) {
      requireString(node[field], `${path}.${field}`);
    }
    for (const field of ["decisions", "risks", "interfaces", "openQuestions"]) {
      requireArray(node[field], `${path}.${field}`);
    }
    validateRefs(node, path, sourceIds);
  }

  for (const [index, edge] of model.edges.entries()) {
    const path = `model.edges[${index}]`;
    for (const field of ["from", "to", "type", "label", "strength", "impact", "ifRemoved"]) {
      requireString(edge[field], `${path}.${field}`);
    }
    if (!nodeIds.has(edge.from)) fail(`${path}.from points to missing node: ${edge.from}`);
    if (!nodeIds.has(edge.to)) fail(`${path}.to points to missing node: ${edge.to}`);
    if (edge.type && !registeredEdgeTypes.has(edge.type)) fail(`${path}.type is unknown and not registered: ${edge.type}`);
    if (edge.from === edge.to) warn(`${path} is a self-edge; verify that it is intentional`);
    validateRefs(edge, path, sourceIds);
  }

  for (const [index, decision] of model.decisions.entries()) {
    const path = `model.decisions[${index}]`;
    for (const field of ["title", "status", "priority", "reversibility", "context", "rationale", "confidence", "driver", "rollbackPlan"]) {
      requireString(decision[field], `${path}.${field}`);
    }
    for (const field of ["affects", "options", "tradeoffs", "consequences", "reviewers", "approvers", "acceptanceCriteria"]) {
      requireArray(decision[field], `${path}.${field}`);
    }
    if (decision.status && !allowedDecisionStatuses.has(decision.status)) {
      fail(`${path}.status is invalid: ${decision.status}`);
    }
    for (const nodeId of decision.affects || []) {
      if (!nodeIds.has(nodeId)) fail(`${path}.affects points to missing node: ${nodeId}`);
    }
    if (decision.status === "accepted") {
      requireString(decision.rationale, `${path}.rationale`);
      requireString(decision.decidedAt, `${path}.decidedAt`);
      requireArray(decision.consequences, `${path}.consequences`);
      requireArray(decision.approvers, `${path}.approvers`);
      requireArray(decision.acceptanceCriteria, `${path}.acceptanceCriteria`);
      if (Array.isArray(decision.approvers) && decision.approvers.length === 0) fail(`${path}.approvers must not be empty when accepted`);
    }
    if (decision.supersedes && !decisionIds.has(decision.supersedes)) fail(`${path}.supersedes points to missing decision: ${decision.supersedes}`);
    if (decision.supersededBy && !decisionIds.has(decision.supersededBy)) fail(`${path}.supersededBy points to missing decision: ${decision.supersededBy}`);
    validateRefs(decision, path, sourceIds);
  }

  for (const [index, decision] of model.decisions.entries()) {
    if (decision.supersedes) {
      const prior = model.decisions.find((item) => item.id === decision.supersedes);
      if (prior && prior.supersededBy !== decision.id) fail(`model.decisions[${index}].supersedes is not reciprocated by ${prior.id}.supersededBy`);
    }
    if (decision.supersededBy) {
      const next = model.decisions.find((item) => item.id === decision.supersededBy);
      if (next && next.supersedes !== decision.id) fail(`model.decisions[${index}].supersededBy is not reciprocated by ${next.id}.supersedes`);
    }
  }

  for (const [index, review] of model.reviews.entries()) {
    const path = `model.reviews[${index}]`;
    for (const field of ["area", "finding", "severity"]) requireString(review[field], `${path}.${field}`);
    requireArray(review.linkedNodes, `${path}.linkedNodes`);
    for (const nodeId of review.linkedNodes || []) {
      if (!nodeIds.has(nodeId)) fail(`${path}.linkedNodes points to missing node: ${nodeId}`);
    }
    validateRefs(review, path, sourceIds);
  }

  if (grammar === "stage-gated-roadmap") {
    requireArray(model.stages, "model.stages");
    if (Array.isArray(model.stages)) {
      const stageIds = uniqueIds(model.stages, "model.stages");
      const order = new Map();
      for (const [index, stage] of model.stages.entries()) {
        if (!Number.isFinite(stage.order)) fail(`model.stages[${index}].order must be numeric`);
        if ([...order.values()].includes(stage.order)) fail(`model.stages has duplicate order: ${stage.order}`);
        order.set(stage.id, stage.order);
      }
      for (const [index, node] of model.nodes.entries()) {
        if (!stageIds.has(node.stage)) fail(`model.nodes[${index}].stage points to missing stage: ${String(node.stage)}`);
      }
      for (const [index, edge] of model.edges.entries()) {
        if (edge.type !== "sequence") continue;
        const fromStage = model.nodes.find((node) => node.id === edge.from)?.stage;
        const toStage = model.nodes.find((node) => node.id === edge.to)?.stage;
        if (order.has(fromStage) && order.has(toStage) && order.get(fromStage) > order.get(toStage)) {
          fail(`model.edges[${index}] creates backwards sequence causality`);
        }
      }
    }
  }

  if (grammar === "swimlane-operating-map") {
    requireArray(model.lanes, "model.lanes");
    if (Array.isArray(model.lanes)) {
      const laneIds = uniqueIds(model.lanes, "model.lanes");
      for (const [index, node] of model.nodes.entries()) {
        if (!laneIds.has(node.lane)) fail(`model.nodes[${index}].lane points to missing lane: ${String(node.lane)}`);
      }
    }
  }

  if (grammar === "system-loop-map" && model.nodes.length > 1 && !graphHasCycle(model.nodes, model.edges)) {
    fail("system-loop-map must contain at least one directed cycle");
  }

  if (grammar === "decision-tree") {
    const outgoing = new Map(model.nodes.map((node) => [node.id, []]));
    for (const edge of model.edges) outgoing.get(edge.from)?.push(edge);
    const nodeById = new Map(model.nodes.map((node) => [node.id, node]));
    const decisionNodes = model.nodes.filter((node) => String(node.kind || node.layer).toLowerCase() === "decision");
    const branch = decisionNodes.find((node) => {
      const branches = outgoing.get(node.id) || [];
      const labels = new Set(branches.map((edge) => edge.label.trim().toLowerCase()));
      const targetsAreBranches = branches.every((edge) => ["option", "outcome", "branch"].includes(String(nodeById.get(edge.to)?.kind || nodeById.get(edge.to)?.layer).toLowerCase()));
      return branches.length >= 2 && labels.size >= 2 && targetsAreBranches;
    });
    if (!decisionNodes.length) fail("decision-tree must contain an explicit decision node (node.kind or node.layer = decision)");
    if (!branch) fail("decision-tree decision node must have at least two distinctly labeled edges to option, outcome, or branch nodes");
  }

  if (grammar === "option-tradeoff-map") {
    const kinds = new Set(model.nodes.map((node) => String(node.kind || node.layer).toLowerCase()));
    if (!kinds.has("option") || !kinds.has("criterion")) {
      fail("option-tradeoff-map must contain explicit option and criterion nodes");
    }
  }

  const ungrounded = [...model.nodes, ...model.edges, ...model.decisions, ...model.reviews]
    .filter((item) => !(item.sourceRefs?.length) && !item.assumption && !(item.openQuestions?.length));
  if (ungrounded.length) fail(`${ungrounded.length} modeled items have no sourceRefs, assumption, or openQuestions`);

  const dense = model.nodes.length > 24 || model.edges.length > 35;
  validateSurface(dense);
}

function validateSurface(dense) {
  if (!/localStorage\.(?:getItem|setItem)/.test(html)) warn("No localStorage usage found for team decision state");
  if (/localStorage\.setItem/.test(html) && !/try\s*{[\s\S]*localStorage\.setItem[\s\S]*}\s*catch/.test(html)) {
    warn("localStorage.setItem does not appear inside try/catch");
  }
  if (!/(data-action=["']export["']|exportDecisionMap|exportModel|btnExport)/.test(html)) fail("JSON export action not found");
  if (!/(data-action=["']clear-state["']|clearSavedState|clearTeamState|btnClear)/.test(html)) warn("Clear/reset persisted state action not found");
  if (!/(type=["']search["']|data-search)/.test(html)) warn("Search control not found");
  if (!/(addEventListener|onclick\s*=)/.test(html)) fail("No interaction handlers found");
  if (!/:focus-visible/.test(html)) warn("No focus-visible styles found");
  if (!/prefers-reduced-motion/.test(html)) warn("No reduced-motion fallback found");
  if (/pointer-events\s*:\s*none/.test(html) && !/\.edge-(?:path|hit)[\s\S]{0,220}pointer-events\s*:\s*(stroke|auto)/.test(html)) {
    warn("Check SVG edge pointer-events; parent layers can make edge clicks fail");
  }
  if (dense) {
    if (!/(data-edge-mode|edgeMode|line-density|Line Density)/.test(html)) fail("Dense map needs Overview/Focus/All edge visibility controls");
    if (!/(data-action=["']fit["']|fitToView|fit-to-view)/.test(html)) fail("Dense map needs fit-to-view");
    if (!/(data-action=["']zoom-in["']|zoomIn)/.test(html) || !/(data-action=["']zoom-out["']|zoomOut)/.test(html)) {
      fail("Dense map needs zoom in/out controls");
    }
    if (!/(data-left-panel|collapse-left)/.test(html) || !/(data-detail-panel|collapse-right)/.test(html)) {
      warn("Dense map should expose collapsible side panels");
    }
  }
  if (/\b(card|panel)[^{}]*{[^{}]*border-radius:\s*(1[0-9]|[2-9][0-9])px/.test(html)) {
    warn("Large rounded corners found; Guizang Swiss maps should stay rectangular");
  }
  if (/linear-gradient\([^)]*purple|#8b5cf6|#7c3aed|#a855f7/i.test(html)) {
    warn("Purple gradient/palette token found; check for generic AI UI styling");
  }
}

const canonicalModel = extractCanonicalModel(checkedHtml);
if (canonicalModel) {
  validateCanonicalModel(canonicalModel);
} else if (!failures.length) {
  if (!legacyMode) {
    fail('Missing canonical <script type="application/json" id="decision-map-model"> model. Use --legacy only for pre-v2 artifacts.');
  } else {
    warn("Legacy validation cannot prove schema or referential integrity; migrate this map to canonical JSON");
    if (!/\bmapGrammar\s*:/.test(checkedHtml)) fail("Missing model.meta.mapGrammar");
    for (const field of ["nodes", "edges", "decisions", "reviews"]) {
      if (!new RegExp(`\\b${field}\\s*:`).test(checkedHtml)) fail(`Missing model.${field}[]`);
    }
    validateSurface(true);
  }
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
