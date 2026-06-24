---
name: map-product-decisions
description: |
  Turn complex product design, architecture, market-structure, or "copy this
  structure" discussions into a stable interactive HTML decision map. Use
  when the user is exploring components, priorities, dependencies, settlement
  paths, privacy/security architecture, internal agent loops, or tradeoff
  impacts and needs a team-discussion artifact rather than prose, slides, or a
  static diagram.
---

# Map Product Decisions

## Target Outcome

Given a messy product, architecture, market-structure, or "copy this structure"
discussion, produce a single-file interactive HTML decision map that a team can
open, inspect, debate, and use to set priorities.

The artifact must model the system as a decision graph: components are nodes,
relationships are typed edges, and tradeoffs are visible through selected-node
and selected-edge details. A beautiful static page is not sufficient.

The artifact must also choose the right **map grammar** for the source material.
Do not default to a free-form component graph. If the discussion is primarily
about time, gates, milestones, sequencing, or "what happens after what," use a
stage-gated timeline or roadmap spine with parallel workstreams. If the
discussion is primarily about architecture components, use a dependency graph.
If it is primarily about alternatives, use an option/tradeoff map. The visual
shape should encode the dominant decision structure.

## Required Resource

Load `references/interactive_decision_map_spec.md` before drafting or editing
the HTML. That file is the output contract for graph schema, UI behavior, edge
taxonomy, review expectations, and known traps.

Before drafting the HTML, write a short internal design note with:

- chosen map grammar;
- why that grammar fits the source material;
- what should be represented as sequential gates;
- what can be represented as parallel workstreams;
- what vocabulary must be preserved or explicitly excluded from the source;
- whether the map is likely to exceed one viewport and therefore needs fit/zoom
  and collapsible panels from the first draft;
- which edge classes should be visible by default, which should appear only on
  focus/selection, and whether a line-density control is needed;
- how selection state should behave when filters, tabs, or collapsed panels hide
  the currently selected node or edge.

If the source material changes during the conversation, reassess the grammar
instead of continuing with the previous layout. If the user reports that the
artifact feels chaotic, first question whether the chosen grammar or viewport
controls are wrong before adding more nodes.

## Visual Style Source

The UI style should inherit from `ckpxgfnksd-max/guizang-ppt-skill`
(https://github.com/ckpxgfnksd-max/guizang-ppt-skill), but the artifact must
remain an interactive decision map, not a horizontal swipe deck.

Default to the Guizang Swiss International style for product, architecture,
engineering, data, and protocol maps: strict grid, high contrast, restrained
accent color, hairline dividers, strong type hierarchy, and information-dense
panels. Use the Guizang electronic magazine style only when the map is more
strategy/narrative/culture than technical architecture.

## Trigger Boundary

Use this skill when the user asks to:

- discuss or design a product structure, system architecture, marketplace,
  protocol, workflow, operating model, or component hierarchy;
- convert a deck, memo, notes, or conversation into an architecture artifact;
- compare component priorities or reason about decision impact;
- "copy", "replicate", or generalize an existing product/market/system
  structure into a reusable design;
- revise an existing HTML architecture map so relationships and dependencies
  become visible;
- build an internal discussion surface for founders, product, engineering,
  security, or strategy review.

Do not use this skill for:

- a static PPT-style deck;
- a marketing landing page;
- end-user UI/UX mockups;
- pure written analysis with no artifact;
- a normal code review or implementation task.

If the user explicitly asks for one of those outputs, respect the request and do
not force the decision-map format.

## Output Contract

The primary output is a single HTML file in the current project's `outputs/`
directory, named with a clear slug such as:

```text
outputs/<topic>_decision_map.html
```

The HTML must work by opening the file directly in a browser unless the current
project already requires a dev server. Prefer no external runtime dependency for
the artifact. If an external library is used, explain why and preserve a local or
graceful fallback.

The artifact must include:

- A graph model with `nodes[]` and `edges[]`, not only nested sections.
- A declared map grammar in `model.meta.mapGrammar`, such as
  `dependency-graph`, `stage-gated-roadmap`, `swimlane-operating-map`,
  `decision-tree`, `option-tradeoff-map`, or `system-loop-map`.
- Typed, labeled relationships between components.
- Clickable node detail showing purpose, owner/actor, priority, maturity, risks,
  open decisions, and downstream impact.
- Clickable edge detail showing why the relationship matters and what breaks or
  changes if it is removed.
- Filters appropriate to the grammar. Examples: layer/priority/maturity for a
  dependency graph; stage/workstream/status for a stage-gated roadmap; option,
  evaluation criterion, and decision status for a tradeoff map.
- An editable or persistable team-discussion layer for priorities, notes, or
  decisions. `localStorage` is acceptable, but failures must be handled.
- Export of the current decision state as JSON.
- A visible review or risk panel covering product, engineering, security/privacy,
  and agentic-loop concerns.
- Responsive layout that works on desktop and mobile without text overlap.
- For large maps, controls to inspect both detail and overview: collapsible left
  and right panels, fit-to-view, zoom in/out, and reset zoom. These controls are
  required when the graph cannot fit alongside both sidebars at common desktop
  widths.
- For dense maps, a line-visibility strategy. The default view should show the
  primary grammar's essential edges, not every relationship. Provide controls
  such as Spine / Focus / All, or equivalent, when all edges would visually
  overwhelm the map.
- Interaction-state consistency: filters, search, tab switches, collapsed
  panels, and hidden nodes must not leave the UI focused on an invisible or
  stale node/edge.

## Reasoning Quality Bar

Model the structure as a decision system, not a sitemap. A useful map should make
these questions answerable from the UI:

- Which components depend on this decision?
- Which components block or constrain this component?
- Which decisions must happen in sequence, and which workstreams can move in
  parallel?
- Which milestone gates must be passed before the next stage opens?
- Which decisions are reversible, expensive, or one-way doors?
- Which parts can be outsourced or bought as mature infrastructure?
- Which interfaces must be designed early even if implementation is later?
- Which privacy, security, settlement, data, or governance assumptions create
  long-term architecture constraints?
- What should be prioritized now, next, and later?

For complex tasks, use parallel subagents or equivalent independent passes when
available. Split them by concern, not by file:

- product/market structure and wedge;
- technical architecture, interfaces, data, and settlement;
- security, privacy, adversarial risk, and compliance boundaries;
- artifact UI/interaction design;
- internal agentic loop and operating system design.

Synthesize disagreements into the graph itself. Do not merely append reviewer
comments below the artifact.

### Map Grammar Selection

Pick the grammar that makes the dominant decision structure obvious:

- Use `stage-gated-roadmap` when the discussion is about cold start, rollout,
  maturity, launch order, readiness thresholds, milestones, or "only after X can
  we do Y." Main stages should form a left-to-right or top-to-bottom spine.
  Parallel workstreams hang off the spine. Gates should be first-class nodes,
  not buried in prose.
- Use `swimlane-operating-map` when multiple teams or loops move in parallel
  across time, such as product, data, risk, compliance, supply, and agentic ops.
  Each lane needs its own nodes and cross-lane edges.
- Use `dependency-graph` when the main question is component coupling,
  ownership, interfaces, or what blocks what.
- Use `decision-tree` when the main question is conditional branching,
  sequencing by yes/no outcomes, or go/no-go decisions.
- Use `option-tradeoff-map` when the main question is choosing among
  alternatives. Options, criteria, constraints, and consequences should be
  distinct nodes.
- Use `system-loop-map` when the main question is feedback loops, flywheels,
  control systems, monitoring, or agentic iteration.

Hybrid maps are allowed, but the main grammar must stay visually dominant. For
example, a stage-gated roadmap may include dependency edges, but the timeline
spine and gates should remain more legible than the dependency mesh. For large
stage or swimlane maps, reserve screen real estate for the primary grammar:
sidebars should be collapsible and a fit-to-view control should expose the full
spine without requiring manual horizontal scrolling first.

### Edge Visibility Discipline

Represent every important relationship in `edges[]`, but do not necessarily
render every edge at once. A map can be structurally complete and visually
unusable if every dependency line and label is visible by default.

For dense or hybrid maps:

- Default to the primary grammar's essential edges. In a stage-gated roadmap,
  this usually means the sequential spine and gate/blocking edges.
- Show secondary dependency edges through an explicit mode such as Focus or All,
  or when the user selects a related node or edge.
- Edge labels should be sparse by default. Show labels for selected or related
  edges; avoid labeling every edge in the overview.
- Use different visual treatments for different edge roles: solid for sequence,
  dashed for gates/blocks, dotted or lighter lines for feeds, audits, or
  secondary dependencies.
- Prefer predictable orthogonal routing for swimlanes and timelines. Avoid a
  dense mesh of curved lines crossing the main spine.
- The visible-line count should serve the current task. Overview mode should
  explain the structure; focus mode should explain impact; all-lines mode is for
  debugging or deep inspection.

### Source Vocabulary Discipline

Preserve the user's domain vocabulary. Do not import terms, token names,
regulatory assumptions, or product objects from earlier related sessions unless
the current source material explicitly includes them. If a prior term is useful
as an analogy, put it in `openQuestions` or `sourceNotes`, not as a node label
or product primitive.

Before finalizing, run a vocabulary pass:

- list the source-specific nouns that should appear;
- list terms that must not appear because they came from an earlier draft,
  adjacent project, or model inference;
- search the HTML for forbidden terms.

## Resources And Boundaries

Usable resources:

- Existing decks, notes, docs, HTML artifacts, code, and local project files.
- Web or GitHub research when the user asks to learn from current UI repos,
  libraries, or market examples.
- Parallel subagents for broad, uncertain, or adversarial architecture work.
- Browser QA tools for checking the generated HTML.

Boundaries:

- Do not invent precise facts about current libraries, protocols, laws, or
  vendor capabilities when they matter; verify current information first.
- Do not hide important uncertainty in confident node labels. Put uncertainty in
  `openQuestions`, `risks`, or review findings.
- Do not move private strategy, credentials, or unpublished user material to
  external tools unless the user has authorized it.
- Do not let UI polish replace architecture quality. A decision map with missing
  edges has failed even if it looks good.
- Do not let an attractive network graph replace the right structure. A roadmap
  discussion drawn as a dense component graph has failed even if every node is
  individually correct.
- Do not copy the horizontal deck interaction model from Guizang. Borrow the
  visual language and single-file HTML discipline, not the slide format.
- Do not ship a map where the first useful view is trapped between permanent
  sidebars. If the graph is wider than the available viewport, include overview
  controls and collapsible panels so the team can see the whole structure.
- Do not render every relationship line and label by default when doing so makes
  the primary structure unreadable. Store all edges in the model, but use visual
  hierarchy and line-density controls in the UI.

## Domain Defaults From The AICX Session

When the product resembles an exchange, marketplace, protocol, or AI-output
market, carry these defaults unless the user overrides them:

- Treat trading/matching as its own component. Mature exchange cores, matching
  engines, order management, and custody/inventory systems should be separated
  from product differentiation.
- If future on-chain settlement is plausible, define the settlement event model,
  state transition boundaries, and EVM-compatible interfaces early, even if v1
  settlement is off-chain.
- Model privacy as an interface, not decoration. ZK, ZKML, FHE, TEEs, selective
  disclosure, and audit logs should hang behind explicit proof/privacy packet
  boundaries.
- Agentic loops in this workflow are internal product, safety, review, and
  iteration loops. Do not reinterpret them as end-user UI/UX automation unless
  the user asks.
- Separate "can be automated" from "should be automated." Escalation, kill
  switches, auditability, and human sign-off should be first-class nodes.

These defaults are examples of reusable product judgment, not hardcoded AICX
requirements. Adapt them to the domain rather than copying labels blindly.

## Failure Handling

If a browser check, subagent run, network lookup, or external review tool is not
available, still produce the HTML artifact and mark the missing verification in
the final response. Missing optional tools is not a reason to return only prose.

If source material is thin, build the graph around explicit assumptions and open
questions. Do not fabricate certainty to make the map look complete.

## Acceptance Criteria

The skill run is complete only when:

1. The user has a browser-openable HTML artifact, not only prose or a diagram.
2. Every major component appears as a node with inspectable metadata.
3. The chosen map grammar is declared in `model.meta.mapGrammar` and matches the
   source material.
4. Cross-component relationships are visible as typed edges with labels.
5. If timing, maturity, or rollout is central, sequential gates and parallel
   workstreams are visually separated.
6. Decision impact is explicit: changing a node or edge shows affected
   components, blockers, risks, or priority shifts.
7. Internal agentic loops are represented as internal operating/control loops,
   including safety review where relevant.
8. The artifact includes team-priority and decision-capture affordances.
9. The artifact uses the Guizang-derived visual language without becoming a
   horizontal slide deck.
10. For large maps, side panels are collapsible and fit/zoom controls let the
    user see the full map overview.
11. Dense maps use a clear edge visibility strategy: the default view preserves
    the primary grammar, secondary edges can be revealed through focus/all modes,
    and labels do not clutter the overview.
12. Filter, search, tab, collapse, and zoom interactions keep selection state
    coherent; the detail panel never points at a hidden stale node or edge.
13. The artifact has been checked in a browser or equivalent rendering path for
   nonblank output, layout sanity, clickability, and console errors.
14. The final vocabulary pass found no imported terms from adjacent projects or
    earlier drafts unless explicitly intended.
15. Any adversarial review findings are either fixed or called out as remaining
   risks in the final response.
16. The final response includes the artifact path and a concise verification
   summary.
