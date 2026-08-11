---
name: map-product-decisions
description: |
  Turn complex product design, architecture, market-structure, workflow,
  protocol, operating-model, or "copy this structure" discussions into a clear
  single-file interactive HTML decision map. Use when the user needs a
  team-discussion artifact that makes components, priorities, dependencies,
  stage gates, tradeoffs, risks, and decision impact inspectable through nodes,
  typed edges, focused details, and editable decision state rather than prose,
  slides, or a static diagram.
---

# Map Product Decisions

## Target Outcome

Produce one browser-openable HTML file that lets a team inspect a product or
architecture decision system, debate priorities, and export the current
decision state.

The artifact is a decision map, not a sitemap, slide deck, blog post, or pretty
static diagram. It must include a graph model with explicit `nodes[]`, `edges[]`,
`decisions[]`, and `reviews[]`. The UI should make the dominant decision
question obvious in the first viewport.

## Required Resources

Before drafting or editing the HTML, load:

- `references/interactive_decision_map_spec.md` for schema, interaction,
  validation, edge taxonomy, and known traps.
- `references/ui_ux_simplicity.md` for the UI simplicity contract and research
  patterns from popular design libraries.

Also load `references/source_quality_pipeline.md` when the source material is
research-heavy, time-sensitive, evidence-backed, or likely to evolve across
multiple revisions.

Prefer `assets/decision-map-seed.html` when the current project has no stronger
local scaffold. Replace its model and task-specific behavior; keep its stable
tokens, graph slots, zoom/fit/export controls, edge-density modes, and
responsive shell unless the source material requires a better grammar-specific
layout.

## Output Contract

Create:

```text
outputs/<topic>_decision_map.html
```

The file must open directly in a browser unless the current project already
requires a dev server. Avoid external runtime dependencies. If a library is
used, explain why and preserve a local or graceful fallback.

The artifact must include:

- `model.meta.mapGrammar`, matching the visual layout.
- `nodes[]`, `edges[]`, `decisions[]`, and `reviews[]`.
- `sources[]` plus `sourceRefs`, `assumption`, or `openQuestions` for
  source-backed or uncertain claims.
- Typed, inspectable edges. A parent/child hierarchy is not enough.
- Clickable node details: purpose, owner/actor, priority, maturity, decisions,
  risks, open questions, interfaces, and downstream impact.
- Clickable edge details: relationship type, label, impact, and what changes if
  removed.
- Filters matched to the map grammar.
- Team decision capture with safe `localStorage` handling.
- JSON export of the current model plus persisted decision state.
- A visible review/risk surface covering product, engineering,
  security/privacy, and internal agentic-loop concerns where relevant.
- Responsive desktop and mobile layout with no overlapping text or controls.

## UI Simplicity Contract

The first view should answer one question:

- For `stage-gated-roadmap`: What sequence unlocks progress?
- For `swimlane-operating-map`: Which lanes move in parallel, and where do they
  hand off?
- For `dependency-graph`: What blocks, constrains, or enables what?
- For `decision-tree`: Which condition changes the path?
- For `option-tradeoff-map`: Which option wins or fails against which
  criterion?
- For `system-loop-map`: What feedback loop changes future behavior?

Use progressive disclosure:

1. Overview: show the primary grammar and only essential edges.
2. Focus: show selected node or edge, direct neighbors, blockers, and impacts.
3. Detail: show full metadata, source notes, decisions, reviews, and all edge
   explanations.

Keep the chrome simple:

- One center map.
- At most one left navigation/filter panel and one right detail/review panel.
- Side panels collapse when they reduce the map's readability.
- Top controls are compact and wrap safely.
- Use familiar controls: tabs for major modes, checkboxes/toggles for filters,
  icon buttons for zoom/export/reset when available, and direct command labels
  for destructive or persisted actions.
- Do not place cards inside cards. Do not add hero sections, decorative blobs,
  deck pagination, or explanatory onboarding text.

Default to the simplest readable representation. If the map needs more than
about 24 visible nodes, 35 visible edges, or two persistent side panels, add
grouping, collapse, search, fit-to-view, and line-density controls before adding
more visible detail.

## Map Grammar Selection

Pick the grammar that encodes the dominant structure:

- `stage-gated-roadmap`: rollout, cold start, maturity, launch order, readiness
  thresholds, milestones, or "only after X can Y happen."
- `swimlane-operating-map`: multiple teams, loops, workstreams, or functions
  moving in parallel across time.
- `dependency-graph`: components, ownership, interfaces, coupling, blockers,
  and constraints.
- `decision-tree`: conditional branching, go/no-go paths, or yes/no evidence
  gates.
- `option-tradeoff-map`: alternatives, criteria, constraints, consequences, and
  decision status.
- `system-loop-map`: feedback loops, flywheels, monitoring, control systems, or
  agentic iteration.

Hybrid maps are allowed, but the primary grammar must remain visually dominant.
If the source changes or the artifact feels chaotic, reassess the grammar before
adding nodes.

## Design Note Before Building

Write a short internal design note before drafting the HTML:

- chosen grammar and why it fits;
- first-viewport decision question;
- sequential gates vs parallel workstreams;
- source vocabulary to preserve and terms to exclude;
- facts, inferred patterns, snapshots, assumptions, and open questions;
- default visible edges, focus-only edges, and all-lines/debug edges;
- expected viewport pressure and required collapse/zoom/fit controls;
- temporal logic risks, including backwards dependencies;
- selection behavior when filters, tabs, search, or collapsed panels hide the
  current selection.

## Reasoning Quality Bar

The UI must let a team answer:

- Which components depend on this decision?
- Which components block or constrain it?
- Which decisions must happen in sequence?
- Which workstreams can move in parallel?
- Which gates must pass before the next stage opens?
- Which cross-workstream inputs does each gate require?
- Which edges imply backwards causality or late governance?
- Which decisions are reversible, expensive, or one-way doors?
- Which interfaces must be designed early even if implementation comes later?
- Which privacy, security, settlement, data, governance, or agentic-loop
  assumptions create long-term constraints?
- What should be prioritized now, next, later, monitored, or rejected?

For complex tasks, use independent passes or subagents when available. Split by
concern: product/market, architecture/data/interfaces, security/privacy,
UI/interaction, and internal agentic loops. Merge disagreements into graph
nodes, edges, decisions, or review findings rather than appending loose prose.

## Visual Style

Default product, architecture, engineering, data, and protocol maps to **Night
Signal**, a low-light operating surface derived from Impeccable's product-UI
discipline (https://github.com/pbakaus/impeccable): tinted dark neutrals, one
cyan selection accent, amber risk, compact metadata, and a dominant canvas.

Use the dark direction because teams inspect dense maps for sustained periods,
not because technical products are automatically dark. Keep familiar controls,
complete state behavior, restrained motion, and semantic tokens. Do not add
glow, glass, decorative gradients, saturated inactive states, or monospace as a
technical costume.

Keep Guizang-derived information discipline: strict alignment, hairline
relationships, direct labels, and strong hierarchy. Use a light Precision Grid
adapter when daylight, printing, or accessibility evidence favors it. Use the
editorial adapter only for strategy, narrative, or culture maps; controls and
graph labels must remain task-focused.

## Source Vocabulary Discipline

Preserve the user's domain vocabulary. Do not import token names, product
objects, regulatory assumptions, or architecture primitives from earlier
sessions unless the current source explicitly includes them.

Before finalizing:

- list nouns that must appear because they came from the source;
- list forbidden terms that came from adjacent projects or model inference;
- search the HTML for forbidden terms;
- shorten card copy and move long explanations into detail panels.

## Domain Defaults

When the product resembles an exchange, marketplace, protocol, or AI-output
market, carry these defaults unless the user overrides them:

- Treat trading/matching as its own component.
- Separate mature exchange, matching, order-management, custody, and inventory
  infrastructure from differentiated product logic.
- If future on-chain settlement is plausible, define settlement events, state
  transition boundaries, and EVM-compatible interfaces early.
- Model privacy as an interface: proof packets, data boundaries, verification
  consumers, audit logs, and selective disclosure points.
- Treat agentic loops as internal product, safety, review, and iteration loops
  unless the user asks for end-user automation.
- Separate "can be automated" from "should be automated"; escalation, kill
  switches, auditability, and human sign-off are first-class map elements.

## Validation

If available, run the validator from the skill folder:

```bash
node scripts/validate_decision_map.mjs outputs/<topic>_decision_map.html
```

Treat failures as blockers. Treat warnings as review prompts.

Also check the HTML in a browser or equivalent rendering path for nonblank
output, layout sanity, clickability, console errors, zoom/fit/panel collapse,
filters/search, JSON export, localStorage failure handling, and stale selection
behavior after filtering or tab changes.

## Acceptance Criteria

The run is complete only when:

1. A browser-openable HTML artifact exists in `outputs/`.
2. `model.meta.mapGrammar` exists and matches the layout.
3. Major components are nodes with inspectable metadata.
4. Major relationships are typed edges with impact details.
5. The first view exposes the primary decision structure without edge clutter.
6. Dense maps use Overview/Focus/All or an equivalent line-density strategy.
7. Large maps include collapsible panels plus fit/zoom/reset controls.
8. Time-based maps separate sequential gates from parallel workstreams.
9. Gate order, required inputs, and cross-workstream dependencies are logically
   consistent.
10. Team priority, notes, or decisions can be captured and exported.
11. Review findings are linked to graph elements or visible risks.
12. Source-backed maps preserve provenance and uncertainty.
13. Filters, search, tabs, collapse, and zoom do not leave stale hidden
    selections in the detail panel.
14. The UI uses Night Signal by default, or documents why another adapter fits
    the use scene better; no deck mechanics or decorative dark chrome appear.
15. The vocabulary pass finds no unintended imported terms.
16. Static validation and browser checks have been run when available, and
    remaining limitations are stated in the final response.
