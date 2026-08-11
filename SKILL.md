---
name: map-product-decisions
description: |
  Turn a complex product, architecture, workflow, protocol, operating-model,
  rollout, or option discussion into a browser-openable interactive HTML
  decision map. Use when a team needs to inspect typed dependencies, impact
  chains, stage gates, parallel workstreams, feedback loops, tradeoffs, risks,
  evidence, or editable decision state in one shared artifact. Do not use for a
  simple memo, an ADR about one isolated choice, a static Mermaid diagram, a
  sitemap, slides, or an engineering review whose architecture is already fixed.
---

# Map Product Decisions

## Outcome

Produce one interactive HTML file that helps a team make or revisit a concrete
decision. The first viewport must show the dominant decision question and the
structure that changes its answer.

The artifact is a decision interface, not a decorative graph. If a table, one
ADR, or a short sequence would answer the question more clearly, use that
simpler format and explain why a map would add noise.

## Required Resources

Before building or editing HTML, load:

- `references/interactive_decision_map_spec.md` for the canonical schema,
  grammar rules, edge semantics, interaction contract, and known traps.
- `references/ui_ux_simplicity.md` for first-viewport, progressive-disclosure,
  accessibility, and layout rules.
- `references/source_quality_pipeline.md` when claims are research-heavy,
  time-sensitive, disputed, or expected to evolve.

Use `assets/decision-map-seed.html` when no stronger local scaffold exists. It
contains a working renderer, filters, node and relation focus, safe personal
draft persistence, versioned import/export, fit/zoom, panel collapse, and
responsive behavior. Replace the example model and storage identity; preserve
the tested interaction shell unless the chosen grammar needs a different
layout.

## Decision Brief

Resolve these before modeling. Record them in `model.meta` or the internal
design note:

- `decisionQuestion`: the one question the meeting must answer;
- audience and accountable decision owner;
- `decisionHorizon`: when the choice must be made or revisited;
- what is in scope, explicitly out of scope, and still unknown;
- which choices are two-way, costly, or one-way doors;
- what evidence or gate would change the current recommendation;
- chosen map grammar and why a simpler artifact is insufficient.

If the question is really “what does the system contain?”, sharpen it. A useful
map asks what blocks, enables, constrains, branches, unlocks, or changes future
behavior.

## Grammar Selection

Choose one dominant grammar and make the layout visibly match it:

- `dependency-graph`: what blocks, enables, or constrains what;
- `stage-gated-roadmap`: what sequence and evidence unlock the next stage;
- `swimlane-operating-map`: what moves in parallel and where handoffs occur;
- `decision-tree`: which condition changes the path; include an explicit
  `decision` node with labeled branches to `option`, `outcome`, or `branch`
  nodes;
- `option-tradeoff-map`: which option wins or fails against which criterion;
- `system-loop-map`: which feedback loop changes future behavior.

Hybrid maps are allowed only when the primary grammar remains obvious in five
seconds. Put time and gates on a spine, parallel work in lanes, and secondary
relationships behind Focus or All.

## Canonical Model Contract

Embed the canonical model as parseable JSON:

```html
<script type="application/json" id="decision-map-model">
{
  "meta": {
    "title": "Example",
    "decisionQuestion": "What must be true before release?",
    "schemaVersion": 2,
    "modelVersion": "1.0.0",
    "baseRevision": "brief-2026-08-11",
    "mapGrammar": "dependency-graph"
  },
  "sources": [],
  "nodes": [],
  "edges": [],
  "decisions": [],
  "reviews": []
}
</script>
```

The delivered map must contain non-empty `nodes[]` and `edges[]`. Use stable,
lowercase-hyphenated IDs and keep references machine-valid.

Each node exposes purpose, owner/actor, priority, maturity, decisions, risks,
open questions, interfaces, provenance, and downstream impact. Each edge is
directed and typed; it explains its impact and what changes if removed. A
parent/child hierarchy is not enough.

Treat edge types as semantics, not line decoration. Preserve direction in
incoming/outgoing views. Do not propagate downstream impact through ownership,
grouping, or other non-causal relations unless the type explicitly allows it.

## Decisions, Evidence, and Reviews

Model important choices as compact ADRs rather than editable labels. A decision
should include context, options, rationale, tradeoffs, consequences, confidence,
reversibility, owner/driver, reviewers/approvers, acceptance criteria, rollback
plan, status, and affected nodes where relevant.

Accepted decisions are historical records. Do not silently rewrite them. Create
a new proposal with `supersedes` / `supersededBy` links when the team changes
course. Keep blocking concerns or dissent visible; silence is not acceptance.

For source-backed maps:

- include `sources[]` and attach `sourceRefs` to non-obvious nodes, edges,
  decisions, and reviews;
- mark inference with `assumption` and uncertainty with `openQuestions`;
- separate facts, inferred patterns, time-bounded snapshots, and open questions;
- preserve source vocabulary and reject nouns imported from adjacent projects.

Reviews must link back to graph elements. Cover product, engineering,
security/privacy, and internal agentic-loop concerns when those surfaces exist.
Turn review findings into nodes, edges, decisions, or visible risks rather than
appending an unstructured essay.

## Interaction Contract

Use progressive disclosure:

1. **Overview**: dominant grammar, essential nodes, essential edges.
2. **Focus**: selection, direct neighbors, blockers, downstream effects.
3. **Detail**: metadata, evidence, decision records, reviews, and full relation
   explanations.

Provide grammar-appropriate filters and search. Hidden nodes and edges must not
remain selected or clickable. Node and relation selection must work by keyboard;
if SVG edges are hidden from the accessibility tree, generate an equivalent
text relation list from the same model.

`localStorage` is only a best-effort personal draft cache. It can fail and is
not team collaboration. Cross-person exchange uses versioned Import/Export JSON
with at least `schemaVersion`, `modelVersion`, `baseRevision`, timestamps, and
append-only event IDs. Reject or surface stale-base conflicts instead of
silently overwriting state.

For dense maps, default to Overview and add Focus/All, grouping, fit-to-view,
zoom, and collapsible panels. Prioritize fewer edge crossings and text overlaps
over visual symmetry. All-lines mode is for audit, never the opening view.

## Design Note Before Build

Write a short internal note covering:

- decision question, owner, horizon, grammar, and first-viewport answer;
- sequential gates versus parallel workstreams;
- source nouns to preserve and forbidden imported terms;
- facts, patterns, snapshots, assumptions, and open questions;
- essential versus focus-only edges;
- reversibility, interfaces that must be decided early, and rollback points;
- viewport pressure, crossing/overlap risks, and stale-selection behavior.

## Visual Discipline

Use Guizang Swiss International by default: strict grid, paper/ink contrast,
one restrained accent, hairline dividers, rectangular information surfaces,
strong type hierarchy, and compact mono metadata. Borrow visual discipline from
`ckpxgfnksd-max/guizang-ppt-skill`, not its slide mechanics.

Do not add a hero, decorative blobs, cards inside cards, deck pagination,
rainbow layer colors, or onboarding prose inside the map. Node cards carry a
title and compact metadata; explanations belong in Detail.

## Conditional Domain Review

Do not inject exchange, settlement, EVM, proof, privacy-tech, or agentic-loop
objects unless the source supports them. When the product actually resembles an
exchange, marketplace, protocol, or AI-output market, raise the relevant items
as review questions first:

- which mature infrastructure should be isolated or bought;
- which state, settlement, proof, privacy, audit, or governance boundaries must
  remain stable if implementations change;
- what can be automated, what should be automated, and where escalation,
  human sign-off, rollback, audit logs, or kill switches belong.

Promote an answer into the model only when it is sourced, explicitly assumed,
or left as an open question.

## Validation

Create:

```text
outputs/<topic>_decision_map.html
```

Run delivery validation:

```bash
node scripts/validate_decision_map.mjs outputs/<topic>_decision_map.html
```

Use `--scaffold` only while intentionally validating an incomplete template.
Use `--legacy` only to inspect a pre-v2 artifact that has not migrated to the
canonical JSON block; a legacy pass does not prove model integrity.

Also run browser QA at a normal desktop width and a narrow mobile width. Verify
nonblank render, console errors, node and relation clicks, keyboard focus,
filters/search, stale-selection cleanup, Overview/Focus/All, fit/zoom/panel
collapse where present, personal-draft failure handling, versioned export,
import conflict behavior, and text/control overlap.

## Acceptance Criteria

Complete the run only when:

1. The HTML opens in a browser and the first viewport answers the declared
   `decisionQuestion` through the selected grammar.
2. Canonical JSON passes schema and referential-integrity validation.
3. Nodes, typed edges, decisions, reviews, sources, uncertainty, and vocabulary
   follow the contracts above.
4. Impact chains, gates, parallel lanes, conditions, criteria, or feedback loops
   are inspectable without reading every detail panel.
5. Accepted decisions remain traceable; reversibility, concerns, rollback, and
   revisit conditions are visible where material.
6. Filters, search, density modes, tabs, collapse, and zoom never leave stale or
   misleading selection state.
7. Personal draft persistence fails safely and team exchange is versioned and
   conflict-aware.
8. Keyboard users can reach the same relationship meaning as pointer users;
   color is not the only state signal.
9. Source-backed claims preserve provenance and unsupported claims are labeled.
10. Static validation, browser checks, vocabulary search, and an adversarial
    review have run; remaining limitations are stated.
