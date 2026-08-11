# UI/UX Simplicity Contract

Use this reference when building or revising a `map-product-decisions` HTML
artifact. It converts patterns from popular GitHub design systems and component
libraries into decision-map rules.

## Research Snapshot

Checked on 2026-07-01:

- shadcn/ui: https://github.com/shadcn-ui/ui
- Radix Primitives: https://github.com/radix-ui/primitives
- MUI Material UI: https://github.com/mui/material-ui
- Tailwind CSS: https://github.com/tailwindlabs/tailwindcss
- Storybook: https://github.com/storybookjs/storybook
- Primer React: https://github.com/primer/react
- Carbon Design System: https://github.com/carbon-design-system/carbon
- Mantine: https://github.com/mantinedev/mantine
- Chakra UI: https://github.com/chakra-ui/chakra-ui

The consistent pattern is not a visual style. It is a control system:
small primitives, explicit state, tokenized styling, composition over monoliths,
accessible defaults, documentation/testing surfaces, and progressive disclosure.

## Core Rule

Make the decision structure simple before making the surface beautiful.

A decision map should reveal:

1. The primary grammar.
2. The selected impact chain.
3. The evidence, risk, or decision detail only when requested.

If all three are visible with equal weight, the UI is too complex.

## First-Viewport Rule

The first viewport must answer exactly one dominant question:

| Grammar | First question |
|---|---|
| `stage-gated-roadmap` | What unlocks the next stage? |
| `swimlane-operating-map` | Which lanes move in parallel, and where do they hand off? |
| `dependency-graph` | What blocks, enables, or constrains what? |
| `decision-tree` | Which condition changes the path? |
| `option-tradeoff-map` | Which option wins or fails against which criterion? |
| `system-loop-map` | What loop changes future behavior? |

Everything else belongs in Focus or Detail.

## Disclosure Ladder

Use three levels of disclosure:

- **Overview**: primary grammar, essential nodes, essential edges, sparse labels.
- **Focus**: selected node/edge, direct neighbors, blockers, affected decisions,
  and visible impact chain.
- **Detail**: full metadata, source notes, edge explanations, reviews, decision
  ledger, and exported state.

Never use All-lines mode as the default. All-lines mode is for audit and
debugging, not team discussion.

## Layout Budget

Default shell:

- center graph is mandatory;
- left navigation/filter panel is optional;
- right detail/review panel is optional;
- no more than two persistent side panels;
- panels collapse when they prevent seeing the whole primary grammar;
- controls live in one compact toolbar that wraps without covering the graph.

Escalate to grouping, collapse, search, zoom, and line-density controls when the
first view would otherwise show more than roughly:

- 24 visible nodes;
- 35 visible edges;
- 8 visible lanes or stages;
- 2 persistent panels;
- 2 lines of copy inside a node card.

These are review triggers, not hard schema limits. The question is whether the
team can understand the map before reading the side panels.

## Component Discipline

Design-system repos converge on primitive composition. Apply that discipline to
decision maps:

- Treat graph node, edge, filter, panel, tab, toolbar, badge, and ledger row as
  reusable primitives with consistent state rules.
- Keep visual tokens semantic: surface, border, text, muted text, accent,
  selected, warning, danger, focus.
- Use one accent for active selection and primary action. Do not use color as
  the main layer taxonomy.
- State must be visible through more than color: line style, label, icon,
  border, density, or position.
- Use stable dimensions for graph cards and controls so labels, hover states,
  and dynamic metadata do not shift the layout.

## Interaction Rules

Popular UI libraries optimize for predictable primitives. A decision map should
do the same:

- Single click selects nodes, edges, stages, lanes, and collapsible groups.
- Double click may be a shortcut but cannot be the only path.
- Hover can preview. Selection must persist until changed or cleared.
- Keyboard focus must be visible.
- Hidden filtered edges should not remain clickable.
- If filters, search, tabs, or collapsed panels hide the selected item, clear
  the selection or intentionally keep it visible as a focused exception.
- Export, reset, and destructive actions need explicit labels or confirmation.

## Copy Rules

The artifact is a decision interface:

- Node card: title plus compact metadata. No paragraph blocks.
- Edge label: relationship phrase, not explanation.
- Detail panel: one to two direct sentences per field.
- Review finding: specific failure mode plus linked node/edge.
- Empty state: state what is missing and the first useful action.

Remove decorative lines such as "why this matters", "key insight", "strategic
foundation", and generic claims of importance.

## Accessibility And Responsiveness

Apply baseline design-system behavior:

- focus-visible styles for all controls and graph selections;
- no `outline: none` without replacement;
- touch targets large enough for mobile;
- toolbar wraps before it overlaps content;
- side panels stack below the graph on narrow screens;
- node labels and buttons do not rely on viewport-scaled font sizes;
- reduced-motion mode disables decorative transitions;
- color contrast remains legible in selected, muted, warning, and disabled
  states.

## Visual Style Adapter

Use **Night Signal** as the default surface language for sustained product and
architecture work:

- tinted dark neutrals rather than pure black or uncalibrated grey;
- a second neutral surface for panels and toolbars;
- one cyan accent for selection, focus, and primary actions;
- amber for review risk and red only for destructive or blocking states;
- compact sans-serif UI type, with mono reserved for IDs, counts, and data;
- 12–14px node/panel radii, 8–10px control radii, and pills only for compact
  status labels;
- borders or soft offset shadows for elevation, never both on every surface;
- 150–220ms state transitions, no page-load choreography, glow, or glass;
- a map canvas that owns the highest contrast and largest area.

Treat these as semantic constraints, not a palette costume. Every interactive
primitive must have default, hover, active, disabled, and `:focus-visible`
states. Keep inactive nodes quiet. Communicate selection and risk with border,
line style, labels, or position as well as color.

Use Precision Grid as the light adapter when printing, daylight use, or a user
brief requires it. Use Editorial Ledger only for strategy/narrative maps where
discussion and screenshot legibility matter more than maximum density.

Do not inherit slide mechanics, hero pages, decorative cards, or horizontal deck
pagination from presentation tools.

## Simplicity Review

Before finalizing, answer:

- Can the primary decision structure be understood in five seconds?
- Can a selected node show blockers and downstream impact without reading all
  side text?
- Are secondary edges hidden until Focus or All mode?
- Are long explanations moved out of node cards?
- Would removing a panel make the first view clearer?
- Is color doing too much work?
- Can the map be used on a laptop screen without manual horizontal scrolling
  before fit-to-view?

If the answer is weak, reduce visible detail before adding visual polish.
