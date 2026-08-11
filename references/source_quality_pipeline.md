# Source And Quality Pipeline

Use this reference when the source material is messy, research-heavy, or meant
to compound across multiple decision-map revisions.

The goal is to make the map source-backed without turning the artifact into a
research report. Borrow the useful patterns from content-writing and decision
system skills: keep evidence, assumptions, open questions, and result backfill
separate.

## Source Ledger

Before drafting the graph, maintain a short internal source ledger:

```text
source_id / origin / stable facts / claims needing verification / vocabulary
```

For generated HTML, add `model.sources[]` when there is more than one source or
when source provenance affects trust:

```js
sources: [
  {
    id: "s1",
    label: "Founder notes",
    type: "notes",
    status: "provided",
    claims: ["stage order", "primary workstreams"],
    vocabulary: ["RFQ", "market proof", "risk gate"]
  }
]
```

Attach `sourceRefs` to nodes, edges, decisions, and reviews when a claim comes
from a specific source. Use source IDs, not long URLs or prose paragraphs.

## Four Buckets

Classify source material into four buckets before modeling:

| Bucket | Put in graph as | Rule |
|---|---|---|
| Facts | nodes, edges, sourceRefs | Stable claims the source explicitly supports. |
| Patterns | reviews, decisions, risks | Repeated mechanisms or constraints inferred from facts. |
| Snapshots | meta.sourceNotes, review findings | A time-bounded view of the system. Do not treat as permanent truth. |
| Open Questions | node.openQuestions, decision.status | Unknowns, assumptions, verification tasks, and gates needing evidence. |

Do not let a single sentence become both a fact and a conclusion. If the source
implies a conclusion, preserve the original fact through `sourceRefs` and put
the inference in `risks`, `decisions`, or `reviews`.

## Decision Ledger

If the user expects the map to evolve, add `model.decisionLedger[]`:

```js
decisionLedger: [
  {
    id: "dl-1",
    date: "2026-06-24",
    status: "proposed",
    decision: "Keep settlement event model stable before implementation swaps.",
    evidence: ["s1"],
    affects: ["settlement-layer", "proof-boundary"],
    revisitWhen: "on-chain settlement scope changes"
  }
]
```

The visible UI can render this as a compact "Decision Log" tab or panel. Keep it
editable only when the artifact already supports persisted local decision state.

Treat accepted decisions as append-only history. A later change creates a new
decision with `supersedes`; it does not rewrite the old rationale. Keep
unresolved blocking concerns visible and separate from ordinary notes so a lack
of comments cannot be mistaken for agreement.

`localStorage` is a personal draft cache, not a collaboration database. When
state moves between people or revisions, export a versioned envelope with
`schemaVersion`, `modelVersion`, `baseRevision`, `exportedAt`, and append-only
events. Imports with a stale or different base revision must stop for comparison
instead of silently replacing state.

## Quality Lint

Run this pass before finalizing text in the artifact:

- Remove throat-clearing labels such as "This matters because" and "The key
  insight is". Let the graph show the relationship.
- Replace vague risk statements with specific failure modes.
- Avoid binary slogan patterns such as "not X, but Y" in node summaries.
- Cut decorative one-liners from review panels.
- Preserve the user's source vocabulary. Do not import adjacent-project nouns.
- Keep copy short enough for card bounds. If a node needs a long explanation,
  move detail into the selected-node panel.

The artifact is an interface for decisions, not a post. Direct labels beat
performative writing.

## Source-Backed Acceptance Checks

For source-heavy maps, success requires:

- every non-obvious node, edge, review, and decision has either `sourceRefs` or
  an explicit `assumption` / `openQuestions` entry;
- the UI exposes sources or source notes without crowding the graph;
- unsupported claims are not written as facts;
- current or unstable facts were verified, or the limitation is visible in the
  final response;
- source vocabulary was checked before delivery.
