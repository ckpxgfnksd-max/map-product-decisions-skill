# Interactive Decision Map Specification

This reference defines the stable output shape for `map-product-decisions`.

## Core Outcome

Create a browser-openable HTML UI for team discussion of product and
architecture structure. It should feel like an interactive decision map, not a
presentation, blog post, org chart, or static canvas screenshot.

The artifact should let a team inspect components, traverse relationships,
change priorities, record decisions, and see which choices affect other parts of
the product or architecture.

## Recommended Graph Schema

Embed the data directly in the HTML as JavaScript objects unless the project has
an existing data-loading pattern.

```js
const model = {
  meta: {
    title: "AICX Architecture Decision Map",
    generatedAt: "2026-06-22",
    version: 1,
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

Give each edge a short label plus a longer `impact` or `ifRemoved` explanation.

## UI Requirements

Minimum useful UI:

- full-screen or split-screen graph area plus detail panel;
- node cards or bubbles with layer/status/priority visual encoding;
- visible edges with labels or hover/click labels;
- filter chips or checkboxes for edge type, layer, priority, and maturity;
- search;
- selected node panel with incoming/outgoing/blocking relationships;
- selected edge panel with impact and "if removed" explanation;
- priority editor or decision notes saved to `localStorage`;
- export JSON button;
- reset/clear saved decisions button;
- review/risk panel.

Prefer familiar controls: icon buttons for zoom/reset/export where available,
checkboxes/toggles for filters, tabs for graph vs review if the surface is
crowded. Do not hide relationship meaning behind decoration.

## Visual Style

Use the prior AICX artifact style as the baseline: calm, serious, internal-team
tooling; not PPT slides, not marketing. It can borrow the polish of a deck, but
it must operate as a discussion UI.

Avoid:

- a one-direction hierarchy with no cross-links;
- huge hero sections;
- decorative cards inside cards;
- text explaining how to use the UI inside the artifact;
- generic SaaS landing page visuals;
- single-hue palettes that make layers hard to distinguish.

## Review Protocol

Before finalizing, run an adversarial pass. If subagents are available, use
independent reviewers for product, engineering, security/privacy, and UI. If not,
simulate separate passes with clear separation and then merge findings.

The review should ask:

- What critical relationship is missing?
- What decision is being treated as reversible but is actually expensive?
- What mature component should be bought or isolated instead of reinvented?
- What future constraint must be represented now?
- What safety/security/privacy loop is implied but absent?
- Does the UI make impact chains visible without reading prose?
- Can a team use the artifact to decide priority this week?

For web3 or settlement-aware architectures, also ask:

- Which off-chain events must become canonical settlement events later?
- Which interfaces need EVM-compatible semantics now?
- Where do ZK, ZKML, FHE, TEEs, selective disclosure, and auditability attach?
- Which proof boundary can survive implementation swaps?

## Known Traps From The AICX Session

- Static PPT-like HTML is a failure mode. The artifact must be interactive.
- A tree is insufficient. Component relationships and decision impacts require
  typed `edges[]`.
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
- Heavy CSS transitions on large transformed graph containers can make panning
  and zoom sluggish.
- External links opened in a new tab need `rel="noopener noreferrer"`.

## Validation Checklist

The final response should only claim success after checking:

- the HTML file exists in `outputs/`;
- the page renders nonblank in a browser or equivalent renderer;
- node click, edge click, filters, search, and export work;
- no visible text overlap at common desktop and mobile widths;
- console errors are absent or explicitly documented;
- review findings have either been fixed or listed as remaining risks.
