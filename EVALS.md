# Night Signal evaluation

## Selection record

On 2026-08-11, three UI directions were compared qualitatively:

| Direction | Character | Decision |
|---|---|---|
| Precision Grid | Light, exact, document-like | Retained as a light adapter |
| **Night Signal** | Dark, signal-led, operational | **Selected as the default for this branch** |
| Editorial Ledger | Narrative, editorial, evidence-forward | Retained as a narrative adapter |

The selected direction prioritizes graph legibility, hierarchy, state clarity, and low-light workshop use over decorative novelty.

## Acceptance criteria

- Night Signal is the default renderer and visual contract.
- Node hierarchy, edge direction, focus, hover, selected, muted, warning, and blocked states remain distinguishable.
- The graph canvas is allowed to use a restrained grid because the grid carries spatial meaning.
- Contrast checks cover primary text, secondary text, controls, badges, borders, and graph labels.
- Precision Grid and Editorial Ledger remain documented alternatives rather than being deleted.
- The artifact stays single-file and browser-openable with no external runtime dependency.

## Release checks

- Skill package validation passes.
- Seed JavaScript parses successfully.
- The decision-map validator passes the scaffold structure; empty nodes and edges remain expected warnings.
- Contrast checks pass for the Night Signal palette.
- No machine-local paths, credentials, tokens, or private operational data are included.

This evaluation records a qualitative product choice and deterministic release gates. It does not claim an independent blind score for the Night Signal branch.
