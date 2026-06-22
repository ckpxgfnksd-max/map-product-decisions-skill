---
name: map-product-decisions
description: |
  Turn complex product design, architecture, market-structure, or "copy this
  structure" discussions into a stable interactive HTML decision mind map. Use
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

## Required Resource

Load `references/interactive_decision_map_spec.md` before drafting or editing
the HTML. That file is the output contract for graph schema, UI behavior, edge
taxonomy, review expectations, and known traps.

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
- Typed, labeled relationships between components.
- Clickable node detail showing purpose, owner/actor, priority, maturity, risks,
  open decisions, and downstream impact.
- Clickable edge detail showing why the relationship matters and what breaks or
  changes if it is removed.
- Filters for component layer, priority, relationship type, and maturity/status.
- An editable or persistable team-discussion layer for priorities, notes, or
  decisions. `localStorage` is acceptable, but failures must be handled.
- Export of the current decision state as JSON.
- A visible review or risk panel covering product, engineering, security/privacy,
  and agentic-loop concerns.
- Responsive layout that works on desktop and mobile without text overlap.

## Reasoning Quality Bar

Model the structure as a decision system, not a sitemap. A useful map should make
these questions answerable from the UI:

- Which components depend on this decision?
- Which components block or constrain this component?
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
3. Cross-component relationships are visible as typed edges with labels.
4. Decision impact is explicit: changing a node or edge shows affected
   components, blockers, risks, or priority shifts.
5. Internal agentic loops are represented as internal operating/control loops,
   including safety review where relevant.
6. The artifact includes team-priority and decision-capture affordances.
7. The artifact has been checked in a browser or equivalent rendering path for
   nonblank output, layout sanity, clickability, and console errors.
8. Any adversarial review findings are either fixed or called out as remaining
   risks in the final response.
9. The final response includes the artifact path and a concise verification
   summary.
