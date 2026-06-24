# Interactive Decision Map Specification

This reference defines the stable output shape for `map-product-decisions`.

## Core Outcome

Create a browser-openable HTML UI for team discussion of product and
architecture structure. It should feel like an interactive decision map, not a
presentation, blog post, org chart, or static canvas screenshot.

The artifact should let a team inspect components, traverse relationships,
change priorities, record decisions, and see which choices affect other parts of
the product or architecture.

The artifact's visual grammar must match the source material. A component graph
is only one possible grammar. If the discussion is about timing, readiness,
rollout, or "after this gate, then that stage," the map should be a stage-gated
roadmap or swimlane operating map. If the discussion is about alternative
choices, the map should emphasize options and criteria. If the discussion is
about feedback loops, the loop should be visible as the primary structure.

## Non-Negotiable Result Properties

- The artifact is interactive HTML, not slides, markdown, or a static image.
- The data model has explicit `nodes[]`, `edges[]`, `decisions[]`, and
  `reviews[]`.
- The model declares `meta.mapGrammar` and the UI layout follows it.
- Every nontrivial component relationship is represented as an edge.
- Dense maps may hide secondary edges in the default view, but the hidden edges
  must remain present in `edges[]` and inspectable through focus/all controls.
- Selection state changes visible details in the UI.
- Team discussion state can be captured and exported.
- Review findings change the map or appear as linked risks; they are not buried
  as unstructured prose.

## Recommended Graph Schema

Embed the data directly in the HTML as JavaScript objects unless the project has
an existing data-loading pattern.

```js
const model = {
  meta: {
    title: "AICX Architecture Decision Map",
    generatedAt: "2026-06-22",
    version: 1,
    mapGrammar: "dependency-graph",
    sourceNotes: []
  },
  nodes: [
    {
      id: "settlement-layer",
      title: "Settlement Layer",
      layer: "protocol",
      priority: "now",
      maturity: "design",
      owner: "engineering",
      summary: "Defines how economic finality is recorded and later moved on-chain.",
      decisions: ["Keep event schema EVM-compatible from day one"],
      risks: ["Retrofit cost if off-chain state is not canonical"],
      interfaces: ["SettlementEvent", "ProofPacket"],
      openQuestions: ["Which state transitions require on-chain finality?"]
    }
  ],
  edges: [
    {
      id: "settlement-to-evm",
      from: "settlement-layer",
      to: "evm-compatibility",
      type: "constrains",
      label: "event schema",
      strength: "high",
      impact: "Settlement event design constrains future contract interfaces.",
      ifRemoved: "On-chain migration becomes a rewrite instead of a settlement adapter."
    }
  ],
  decisions: [
    {
      id: "d1",
      title: "Separate matching engine from differentiated product logic",
      status: "proposed",
      priority: "now",
      affects: ["matching-engine", "market-integrations", "risk-engine"]
    }
  ],
  reviews: [
    {
      area: "security",
      finding: "Automated agent actions need audit logs and kill switches.",
      severity: "high",
      linkedNodes: ["internal-agentic-loop", "security-review"]
    }
  ]
};
```

Keep IDs stable, lowercase, and hyphenated. The UI should use IDs, not display
text, as references.

For stage-gated or swimlane maps, add explicit stage/lane arrays while keeping
`nodes[]` and `edges[]` as the canonical graph:

```js
const model = {
  meta: {
    title: "AICX Market Launch Stage Map",
    generatedAt: "2026-06-24",
    version: 1,
    mapGrammar: "stage-gated-roadmap",
    sourceNotes: []
  },
  stages: [
    { id: "stage-1", title: "Closed RFQ", order: 1, gate: false },
    { id: "gate-1", title: "Market Proof", order: 2, gate: true }
  ],
  lanes: [
    { id: "demand", title: "Demand Proof" },
    { id: "supply", title: "Supply Proof" }
  ],
  nodes: [
    {
      id: "repeat-buyer-score",
      title: "Repeat Buyer Score",
      stage: "gate-1",
      lane: "demand",
      layer: "data",
      priority: "gate",
      maturity: "design",
      owner: "data science",
      summary: "Blocks open market access until recurring demand is proven.",
      decisions: ["Require repeat buyer threshold before opening"],
      risks: ["GMV can rise while repeat demand remains absent"],
      interfaces: ["DemandScore"],
      openQuestions: ["What is the minimum repeat rate?"]
    }
  ],
  edges: [],
  decisions: [],
  reviews: []
};
```

## Required Field Semantics

Node fields:

- `id`: stable machine key, lowercase hyphenated.
- `title`: human-readable label.
- `layer`: architectural or product layer.
- `priority`: current sequencing recommendation.
- `maturity`: assumption/design/prototype/validated/etc.
- `owner`: likely accountable function or actor.
- `summary`: one or two sentences explaining the node's role.
- `decisions`: concrete choices attached to this node.
- `risks`: failure modes, unknowns, or coupling hazards.
- `interfaces`: APIs, events, contracts, packets, handoffs, or governance
  boundaries exposed by the node.
- `openQuestions`: questions the team must answer later.
- `stage` / `lane` / `stream`: optional but recommended when the selected
  grammar is time-based or operating-model-based. If present, filters and layout
  should expose them.

Edge fields:

- `id`: stable machine key.
- `from` and `to`: valid node IDs.
- `type`: one of the edge taxonomy values or a domain-specific extension.
- `label`: short visible label.
- `strength`: low/medium/high or equivalent.
- `impact`: why this relationship matters.
- `ifRemoved`: what breaks, gets cheaper, or changes if the relationship is
  removed.

Decision fields:

- `id`, `title`, `status`, `priority`, and `affects`.
- `status` should distinguish proposed, accepted, rejected, blocked, and needs
  review.

Review fields:

- `area`, `finding`, `severity`, and `linkedNodes`.
- Review findings should be traceable back to graph elements.

## Node Taxonomy

Use layers that match the domain. Common layers:

- product
- market
- protocol
- infrastructure
- data
- security
- privacy
- operations
- governance
- agentic-loop
- user-experience

Common priority values:

- now
- next
- later
- monitor
- reject

Common maturity values:

- assumption
- design
- prototype
- validated
- outsourced
- mature
- blocked

## Map Grammar Taxonomy

Choose the map grammar before laying out nodes. The model should include the
chosen grammar in `model.meta.mapGrammar`.

### `dependency-graph`

Use when the source is primarily about components, interfaces, blockers,
ownership, and coupling. Layout can be clustered by layer or subsystem. Cross
links are expected. Avoid using this grammar for rollout plans where the main
question is sequence.

### `stage-gated-roadmap`

Use when the source is primarily about time, maturity, milestones, launch order,
readiness thresholds, or "only after X can we do Y." The main stages should form
a clearly ordered spine. Gates should be first-class nodes or stage objects, and
edge types like `sequence`, `blocks`, `feeds`, and `audits` should show why a
stage can or cannot advance. Parallel workstreams should be visually separated
from the spine.

### `swimlane-operating-map`

Use when multiple workstreams move in parallel: product, engineering, data,
risk, compliance, supply, agentic ops, etc. Rows or columns should make
parallelism obvious. Cross-lane edges should show handoffs and constraints.

### `decision-tree`

Use when the main structure is conditional branching or go/no-go logic. Nodes
should include decision conditions, required evidence, and consequences. Edges
should be labeled by conditions, not generic dependency labels.

### `option-tradeoff-map`

Use when the team is comparing alternatives. Model options, criteria,
constraints, risks, and consequences as distinct nodes. Edges should show which
criteria support, reject, or constrain each option.

### `system-loop-map`

Use when the source is primarily about feedback loops, flywheels, monitoring, or
agentic iteration. The loop should be visible as the dominant structure, with
control points, escalation points, and failure modes attached.

Hybrid maps are allowed, but the primary grammar must remain visually dominant.
A stage-gated roadmap may include dependency edges; a dependency graph may
include a small rollout lane. Do not let the secondary grammar obscure the main
decision structure.

## Edge Taxonomy

Every important relationship should be an edge. Avoid treating a parent/child
tree as enough.

Recommended edge types:

- `depends_on`: source needs target to work.
- `enables`: source makes target possible or cheaper.
- `blocks`: source can prevent target until resolved.
- `constrains`: source limits target's design space.
- `feeds`: source sends data, signals, liquidity, or workflow into target.
- `settles_to`: source finality is recorded by target.
- `proves`: source produces proof or verification for target.
- `protects`: source reduces risk for target.
- `audits`: source reviews or monitors target.
- `automates`: source executes repeated internal work for target.
- `escalates_to`: source hands uncertainty or risk to target.
- `competes_with`: source creates a strategic alternative or tension.
- `outsources`: source should use an external mature component.
- `sequence`: source happens before target in an ordered process.
- `gates`: source is a milestone or threshold target must pass.

Give each edge a short label plus a longer `impact` or `ifRemoved` explanation.

## UI Requirements

Minimum useful UI:

- full-screen or split-screen graph area plus detail panel;
- node cards or bubbles with layer/status/priority visual encoding;
- visible edges with labels or hover/click labels;
- filter chips or checkboxes matched to the grammar:
  - dependency graph: layer, priority, maturity, edge type;
  - stage-gated roadmap: stage, workstream/lane, status, edge type;
  - option map: option, criterion, status, edge type;
  - loop map: loop phase, control type, status, edge type;
- layer expand/collapse must use a single click or tap; do not require double
  click for layer navigation;
- search;
- selected node panel with incoming/outgoing/blocking relationships;
- selected edge panel with impact and "if removed" explanation;
- priority editor or decision notes saved to `localStorage`;
- export JSON button;
- reset/clear saved decisions button;
- review/risk panel;
- for large maps, collapsible left/right panels plus fit-to-view, zoom in/out,
  and zoom reset controls;
- for dense maps, line-density controls or an equivalent edge visibility
  strategy. The default view should show the primary grammar's essential edges,
  not every modeled edge;
- coherent selection behavior after filters, search, tab switches, panel
  collapse, or zoom changes. If the selected node or edge becomes hidden, the UI
  should clear the stale edge selection or move to the first visible node.

The HTML should also expose enough state in the DOM or JavaScript model that a
future agent can revise the artifact without reverse-engineering visual layout.

Prefer familiar controls: icon buttons for zoom/reset/export where available,
checkboxes/toggles for filters, tabs for graph vs review if the surface is
crowded. For large maps, include an explicit overview affordance: fit-to-view
and collapsible side panels are the default. Do not hide relationship meaning
behind decoration.

### Edge Rendering And Line Clutter

The graph model should be complete; the overview should be readable. These are
different requirements. Avoid treating "all edges exist" as "all edges and all
labels must be visible at once."

Recommended edge visibility modes for dense maps:

- `Spine` or Overview: shows only the primary grammar's essential lines. For a
  stage-gated roadmap, this is usually sequence plus gate/blocking edges on the
  milestone spine.
- `Focus`: shows the overview lines plus edges touching the selected node or
  selected edge.
- `All`: shows every edge for debugging, review, and deep inspection.

Rendering rules:

- Give edge roles visual hierarchy. Use solid lines for sequence/spine,
  dashed lines for gates/blocks, lighter dotted lines for feeds, and quieter
  styles for audit/automation/supporting relationships.
- Keep edge labels off the default overview unless they are part of the primary
  grammar. Show labels for selected or related edges.
- Prefer orthogonal routing for timeline and swimlane maps. Curved cross-lane
  lines quickly create a tangled mesh and should be used sparingly.
- Avoid crossing the main stage spine with secondary dependency lines in the
  default view. If a secondary relation must cross the spine, make it appear
  only in Focus or All mode.
- Keep click targets for hidden edges disabled. A hidden or visually suppressed
  edge should not remain misleadingly clickable.

### Interaction And Viewport Requirements

Large decision maps fail when the graph is technically correct but practically
uninspectable. Apply these rules before finalizing:

- If the map is wider or taller than the central viewport with side panels open,
  provide fit-to-view, zoom in/out, and reset zoom controls.
- Left filter/navigation and right detail/review panels must be collapsible when
  the full map cannot be seen comfortably on a desktop viewport.
- Tabs such as Map and Review should be mutually clear. Avoid showing stale node
  details and review content as if both are active at once.
- Filter/search actions must keep selection state coherent. A detail panel must
  not keep describing a node or edge that has become hidden by the current
  filters.
- Repeated controls created from stages, lanes, layers, or headings must have
  unique coordinates or layout slots. Duplicate positions are a visible bug.
- Node cards should have stable dimensions or measured anchors. Variable-height
  summaries can create visual overlap and edge-anchor drift.
- Edge layers must be tested for actual clickability. SVG parent layers with
  disabled pointer events can swallow child path/label interactions.
- Line-density controls must not create stale state. If an edge becomes hidden
  after switching modes, the selected edge should clear or remain visible as an
  intentional exception.

## Visual Style

Use `ckpxgfnksd-max/guizang-ppt-skill`
(https://github.com/ckpxgfnksd-max/guizang-ppt-skill) as the visual style
source. Borrow its single-file HTML discipline, editorial polish, typography,
grid logic, curated themes, and high-contrast presentation quality.

Do not borrow its horizontal slide/deck interaction. This artifact is a
continuous interactive decision map with graph navigation, layer expansion,
filters, detail panels, and editable decision state.

### Guizang Style Adapter

Default for product/architecture maps: Guizang Swiss International style.

- Use a strict modular grid, ideally 12 or 16 columns.
- Use Inter / Helvetica Neue / Noto Sans SC for the main UI and JetBrains Mono
  or an equivalent mono face for IDs, metadata, node counts, and edge labels.
- Use a light paper background, near-black ink, calibrated greys, and a single
  high-saturation accent. Default accent: IKB blue `#002FA7`.
- Use the accent sparingly for selected nodes, active filters, key counts,
  active edge paths, and high-priority decisions.
- Use hairline dividers, rectangular panels, minimal shadows, and tight
  alignment. Cards and panels should feel like information surfaces, not
  marketing cards.
- Favor large, thin strategic labels for map headings and compact semibold
  metadata labels for controls.
- Use dot-matrix, fine-grid, rule-line, or mono-index details as subtle texture
  only when they do not compete with graph readability.

Optional for strategy/narrative maps: Guizang electronic magazine style.

- Use warm paper/ink palettes and a stronger editorial title treatment.
- Serif headings are acceptable for narrative sections, but controls and graph
  labels should stay readable and mostly sans-serif.
- Fluid or contour backgrounds may appear only as passive atmosphere outside the
  graph interaction area; they must not reduce performance or readability.

Theme defaults:

```css
:root {
  --paper: #fafaf8;
  --ink: #0a0a0a;
  --grey-1: #f0f0ee;
  --grey-2: #d4d4d2;
  --grey-3: #737373;
  --accent: #002FA7;
  --accent-on: #ffffff;
  --line: rgba(10, 10, 10, 0.14);
}
```

For Swiss style, keep one accent color per artifact. Do not mix IKB, lemon
yellow, lemon green, and safety orange in the same map as peer accents. Different
layers should be distinguished primarily by layout, labels, line style, icons,
or subtle tints, not by turning the UI into a rainbow.

Avoid:

- a one-direction hierarchy with no cross-links;
- huge hero sections;
- horizontal slide pagination or deck chrome;
- decorative cards inside cards;
- text explaining how to use the UI inside the artifact;
- generic SaaS landing page visuals;
- single-hue palettes that make layers hard to distinguish.

## Review Protocol

Before finalizing, run an adversarial pass. If subagents are available, use
independent reviewers for product, engineering, security/privacy, and UI. If not,
simulate separate passes with clear separation and then merge findings.

The review should ask:

- Is the chosen `mapGrammar` right for the source material?
- Is the main visual structure showing sequence, dependency, options, or loops
  according to the actual discussion?
- Are sequential gates visually separated from parallel workstreams?
- What critical relationship is missing?
- What decision is being treated as reversible but is actually expensive?
- What mature component should be bought or isolated instead of reinvented?
- What future constraint must be represented now?
- What safety/security/privacy loop is implied but absent?
- Does the UI make impact chains visible without reading prose?
- Does the default line mode preserve the primary grammar, or does an edge mesh
  obscure the map's main point?
- Are secondary edges discoverable through focus/all controls without cluttering
  the first view?
- Can a team use the artifact to decide priority this week?

For web3 or settlement-aware architectures, also ask:

- Which off-chain events must become canonical settlement events later?
- Which interfaces need EVM-compatible semantics now?
- Where do ZK, ZKML, FHE, TEEs, selective disclosure, and auditability attach?
- Which proof boundary can survive implementation swaps?

## Degraded Mode

When tool access is limited:

- If browser QA is unavailable, inspect the HTML/CSS/JS statically and say that
  browser verification was not run.
- If subagents are unavailable, run independent self-review passes with explicit
  headings and merge findings into the graph.
- If current GitHub/UI research is blocked, avoid claiming current best practice
  and rely on local patterns or previously verified examples.
- If source material is incomplete, use assumption and open-question fields
  rather than filling gaps with invented certainty.

## Known Traps From The AICX Session

- Static PPT-like HTML is a failure mode. The artifact must be interactive.
- A tree is insufficient. Component relationships and decision impacts require
  typed `edges[]`.
- Defaulting to a dense component graph is a failure when the source material is
  primarily a staged rollout, cold start path, maturity model, or readiness-gate
  discussion. Use `stage-gated-roadmap` or `swimlane-operating-map` instead.
- Mixing sequential milestones and parallel workstreams in one undifferentiated
  graph makes the artifact hard to use. Time/gates belong on the spine;
  workstreams belong in lanes.
- Do not import domain terms from adjacent projects or earlier drafts. In the
  AICX cold-start discussion, bringing in unrelated token names created a false
  product primitive. Preserve only the current source vocabulary.
- Matching/trading infrastructure should often be isolated as a mature market
  component, not mixed into differentiated product logic.
- Future settlement cannot be hand-waved. If on-chain migration is plausible,
  define EVM-compatible event and state boundaries early.
- Privacy tech names are not architecture. ZK, ZKML, and FHE need explicit proof
  boundaries, data boundaries, and verification consumers.
- "Agentic loop" means internal product/security/iteration operating loop in
  this workflow, not end-user UI automation.
- `localStorage.setItem` can fail; catch persistence errors.
- Filtered or dimmed edges should not remain misleadingly clickable.
- Rendering every edge and every edge label by default can turn a correct graph
  into an unusable tangle. Default to the primary grammar's essential lines and
  expose secondary edges through focus/all modes.
- SVG edge layers with `pointer-events: none` can make edges and edge labels
  unclickable even when child elements set pointer events. Verify edge clicks.
- Reused heading or lane coordinates can stack controls on top of each other.
  Check for duplicate positions in timeline/swimlane layouts.
- Variable-height cards can make edge anchors visually drift. Use stable card
  dimensions or compute anchors from measured boxes.
- Permanent sidebars can make a correct large map feel broken because the user
  cannot see the whole structure. Add collapsible sidebars and fit-to-view.
- Filter and tab clicks can create stale UI: the detail panel may continue to
  describe a hidden node or an inactive view. Reconcile selection state after
  every filter/search/tab/collapse action.
- Top toolbars can overlap map content on narrow desktop widths. Let controls
  wrap and keep the graph shell below the toolbar's actual height.
- Curved lines across swimlanes can create visual knots. Prefer straight or
  orthogonal routing for time/spine/lane maps.
- Edge labels are information, not decoration. Showing every label in overview
  mode usually creates text clutter; reveal labels on selection or focus.
- Heavy CSS transitions on large transformed graph containers can make panning
  and zoom sluggish.
- External links opened in a new tab need `rel="noopener noreferrer"`.
- Double-click layer expansion is too hidden for team discussion. Use single
  click/tap for layer expand and collapse.

## Validation Checklist

The final response should only claim success after checking:

- the HTML file exists in `outputs/`;
- `model.meta.mapGrammar` exists and the layout matches it;
- for time-based maps, sequential gates and parallel workstreams are visually
  distinct;
- the page renders nonblank in a browser or equivalent renderer;
- the UI follows Guizang-derived style rules without horizontal deck pagination;
- node click, edge click, single-click layer expand/collapse, filters, search,
  and export work;
- for large maps, left/right panel collapse, fit-to-view, zoom in/out, and zoom
  reset work;
- filter/search/tab/collapse actions do not leave detail panels pointing at
  hidden stale nodes or edges;
- dense maps have a default line mode that preserves the primary grammar, plus
  a way to reveal secondary edges intentionally;
- edge labels do not clutter the overview; selected/focused edges expose labels
  and impact details;
- SVG edges and edge labels are actually clickable;
- repeated stage/lane/heading controls do not overlap at duplicate coordinates;
- no visible text overlap at common desktop and mobile widths;
- vocabulary search finds no imported terms from adjacent projects unless
  explicitly intended;
- console errors are absent or explicitly documented;
- review findings have either been fixed or listed as remaining risks.
