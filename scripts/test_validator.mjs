#!/usr/bin/env node
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const validator = new URL("./validate_decision_map.mjs", import.meta.url);
const scratch = mkdtempSync(join(tmpdir(), "decision-map-validator-"));

const baseModel = {
  meta: {
    title: "Fixture",
    decisionQuestion: "What blocks delivery?",
    schemaVersion: 2,
    modelVersion: "fixture-1.0.0",
    baseRevision: "fixture-base",
    mapGrammar: "dependency-graph"
  },
  sources: [
    {
      id: "source-brief",
      label: "Fixture brief",
      type: "first-party",
      status: "verified",
      claims: ["The input contract controls delivery."],
      vocabulary: ["source", "delivery"]
    }
  ],
  nodes: [
    {
      id: "source",
      title: "Source",
      layer: "input",
      priority: "now",
      maturity: "validated",
      owner: "product",
      summary: "Supplies the required input.",
      decisions: [],
      risks: [],
      interfaces: ["Input"],
      openQuestions: [],
      sourceRefs: ["source-brief"]
    },
    {
      id: "delivery",
      title: "Delivery",
      layer: "product",
      priority: "next",
      maturity: "design",
      owner: "engineering",
      summary: "Consumes the input.",
      decisions: [],
      risks: [],
      interfaces: ["Output"],
      openQuestions: [],
      sourceRefs: ["source-brief"]
    }
  ],
  edges: [
    {
      id: "source-enables-delivery",
      from: "source",
      to: "delivery",
      type: "enables",
      label: "validated input",
      strength: "high",
      impact: "Delivery needs a validated input.",
      ifRemoved: "Delivery becomes speculative.",
      sourceRefs: ["source-brief"]
    }
  ],
  decisions: [
    {
      id: "ship-input-contract",
      title: "Freeze the input contract",
      status: "proposed",
      priority: "now",
      reversibility: "costly",
      context: "The input contract controls delivery.",
      options: ["Freeze now", "Wait"],
      rationale: "A stable contract makes delivery testable.",
      tradeoffs: ["Earlier constraint versus less rework"],
      consequences: ["Changes require versioning"],
      confidence: "medium",
      driver: "product",
      reviewers: ["engineering"],
      approvers: ["product"],
      acceptanceCriteria: ["Contract reviewed"],
      rollbackPlan: "Restore the prior contract.",
      affects: ["source", "delivery"],
      sourceRefs: ["source-brief"]
    }
  ],
  reviews: [
    {
      id: "review-contract",
      area: "engineering",
      finding: "The input contract needs versioning.",
      severity: "medium",
      linkedNodes: ["source", "delivery"],
      sourceRefs: ["source-brief"]
    }
  ]
};

function page(model, { handlers = true } = {}) {
  return `<!doctype html>
  <style>
    button:focus-visible { outline: 2px solid blue; }
    @media (prefers-reduced-motion: reduce) { * { transition: none; } }
  </style>
  <input type="search" data-search>
  <button data-action="export">Export JSON</button>
  <button data-action="clear-state">Clear saved state</button>
  <script type="application/json" id="decision-map-model">${JSON.stringify(model)}</script>
  <script>
    try { localStorage.setItem("fixture", "1"); } catch (error) {}
    ${handlers ? 'document.addEventListener("click", () => {});' : ""}
    function exportDecisionMap() {}
  </script>`;
}

const cases = [
  { name: "valid canonical model", mutate: (model) => model, expected: 0 },
  { name: "empty delivery model", mutate: (model) => ({ ...model, nodes: [], edges: [] }), expected: 1 },
  { name: "missing model version", mutate: (model) => ({ ...model, meta: { ...model.meta, modelVersion: "" } }), expected: 1 },
  { name: "invalid grammar", mutate: (model) => ({ ...model, meta: { ...model.meta, mapGrammar: "mind-map" } }), expected: 1 },
  { name: "duplicate node id", mutate: (model) => ({ ...model, nodes: [...model.nodes, { ...model.nodes[0] }] }), expected: 1 },
  { name: "dangling edge", mutate: (model) => ({ ...model, edges: [{ ...model.edges[0], to: "missing" }] }), expected: 1 },
  { name: "bad decision affect", mutate: (model) => ({ ...model, decisions: [{ ...model.decisions[0], affects: ["missing"] }] }), expected: 1 },
  { name: "bad review link", mutate: (model) => ({ ...model, reviews: [{ ...model.reviews[0], linkedNodes: ["missing"] }] }), expected: 1 },
  { name: "bad source reference", mutate: (model) => ({ ...model, nodes: [{ ...model.nodes[0], sourceRefs: ["missing"] }, model.nodes[1]] }), expected: 1 },
  {
    name: "all grounding removed",
    mutate: (model) => ({
      ...model,
      sources: [],
      nodes: model.nodes.map(({ sourceRefs, openQuestions, ...node }) => ({ ...node, openQuestions: [] })),
      edges: model.edges.map(({ sourceRefs, ...edge }) => edge),
      decisions: model.decisions.map(({ sourceRefs, ...decision }) => decision),
      reviews: model.reviews.map(({ sourceRefs, ...review }) => review)
    }),
    expected: 1
  },
  { name: "unknown edge type", mutate: (model) => ({ ...model, edges: [{ ...model.edges[0], type: "mystery-link" }] }), expected: 1 },
  { name: "accepted decision missing history fields", mutate: (model) => ({ ...model, decisions: [{ ...model.decisions[0], status: "accepted" }] }), expected: 1 },
  { name: "bad supersedes reference", mutate: (model) => ({ ...model, decisions: [{ ...model.decisions[0], supersedes: "missing" }] }), expected: 1 },
  { name: "loop grammar without cycle", mutate: (model) => ({ ...model, meta: { ...model.meta, mapGrammar: "system-loop-map" } }), expected: 1 },
  { name: "dependency graph relabeled as decision tree", mutate: (model) => ({ ...model, meta: { ...model.meta, mapGrammar: "decision-tree" } }), expected: 1 },
  {
    name: "backwards stage sequence",
    mutate: (model) => ({
      ...model,
      meta: { ...model.meta, mapGrammar: "stage-gated-roadmap" },
      stages: [
        { id: "stage-one", title: "Stage one", order: 1 },
        { id: "stage-two", title: "Stage two", order: 2 }
      ],
      nodes: [
        { ...model.nodes[0], stage: "stage-two" },
        { ...model.nodes[1], stage: "stage-one" }
      ],
      edges: [{ ...model.edges[0], type: "sequence" }]
    }),
    expected: 1
  },
  { name: "missing interaction handler", mutate: (model) => model, expected: 1, handlers: false }
];

let failed = 0;
try {
  for (const testCase of cases) {
    const model = structuredClone(baseModel);
    const file = join(scratch, `${testCase.name.replaceAll(" ", "-")}.html`);
    writeFileSync(file, page(testCase.mutate(model), { handlers: testCase.handlers !== false }));
    const result = spawnSync(process.execPath, [validator.pathname, file], { encoding: "utf8" });
    const passed = result.status === testCase.expected;
    console.log(`${passed ? "PASS" : "FAIL"}  ${testCase.name} (exit ${result.status}, expected ${testCase.expected})`);
    if (!passed) {
      failed += 1;
      console.error(result.stdout);
      console.error(result.stderr);
    }
  }
} finally {
  rmSync(scratch, { recursive: true, force: true });
}

if (failed) process.exit(1);
console.log(`Validator self-test passed: ${cases.length}/${cases.length}`);
