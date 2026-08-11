# Autoresearch evaluation

This file records the optimization loop used for the public `map-product-decisions` skill. The score is intentionally decision-oriented: a beautiful diagram that cannot preserve or challenge a decision should not pass.

## Rubric

Each dimension is scored from 0–10 by three personas. Maximum score: 150.

| Dimension | What earns a high score |
|---|---|
| Decision usefulness | The map exposes the real decision question, choices, owners, trade-offs, risks, consequences, and rollback path. |
| Determinism and validation | The same inputs produce a canonical, inspectable model; malformed or semantically incomplete maps fail closed. |
| Interaction and accessibility | Overview, focus, filtering, relation inspection, keyboard use, narrow screens, and text alternatives work coherently. |
| Evidence and decision integrity | Claims remain traceable; accepted decisions are append-only; conflicts and version mismatches cannot silently overwrite team state. |
| Skill clarity and trigger boundary | A beginner can tell when to use the skill, when not to use it, and what a finished artifact must contain. |

Personas:

1. **Beginner product manager** — needs a guided way to see the whole system without learning graph theory.
2. **Technical lead** — needs explicit interfaces, dependencies, failure modes, evidence, versioning, and validator guarantees.
3. **Meeting facilitator** — needs a discussion artifact that turns disagreement into named decisions and next actions.

## Baseline

The first independent blind HOLD snapshot produced a calibrated baseline of **104/150**. Its strongest traits were decision usefulness and trigger clarity; its weakest traits were delivery validation, interaction-state integrity, and decision/source safeguards.

| Persona | Decision usefulness | Determinism | Interaction | Integrity | Trigger clarity | Total |
|---|---:|---:|---:|---:|---:|---:|
| Beginner product manager | 8 | 7 | 6 | 6 | 8 | 35 |
| Technical lead | 9 | 6 | 6 | 5 | 8 | 34 |
| Meeting facilitator | 9 | 6 | 6 | 5 | 9 | 35 |
| **Baseline total** | **26** | **19** | **18** | **16** | **25** | **104/150** |

## Optimization rounds

| Round | Change | Why it mattered | Gate |
|---:|---|---|---|
| 0 | Reproduced the old seed/validator behavior. | The validator accepted an empty scaffold as a successful delivery. | Baseline recorded. |
| 1 | Narrowed the trigger and added explicit non-triggers. | “Make a map” was too broad; simple one-shot diagrams should not invoke a decision system. | Beginner can choose the skill without guessing. |
| 2 | Added a decision brief and six named map grammars. | Layout now follows the decision question instead of a fixed decorative shell. | Grammar must match the question. |
| 3 | Introduced canonical JSON with `schemaVersion`, `modelVersion`, and `baseRevision`. | The HTML now has a stable semantic source of truth and a version boundary. | Missing identity fields fail. |
| 4 | Replaced substring checks with semantic validation and a `--scaffold` mode. | Delivery maps now fail on empty decisions/reviews, dangling links, invalid grammar, or weak ADR records. | Delivery and scaffold are distinct. |
| 5 | Added 17 validator mutation tests plus a hostile-title builder test. | Negative cases make fail-closed behavior reproducible rather than aspirational. | Validator and builder security tests pass. |
| 6 | Rebuilt the seed as a working single-file renderer. | Search, filters, overview/focus/all, node and relation details, zoom, fit, collapse, import, and export became real behaviors. | No external runtime required. |
| 7 | Separated personal browser drafts from the canonical team model. | `localStorage` is a personal cache; versioned import/export is the team exchange boundary. | Unknown targets, revision mismatch, and conflicting edits block. |
| 8 | Added ADR-style decisions with approvers, consequences, acceptance criteria, supersession, and rollback. | A map now preserves why a choice was made, not only what components exist. | Accepted decisions are canonical and append-only. |
| 9 | Added a typed edge registry, direction checks, crossing/overlap limits, and stronger source grounding. | Relationships become testable product claims, not unlabeled lines. | Unknown edge types and ungrounded modeled items fail. |
| 10 | Added relation-list accessibility, visible focus, touch targets, progressive disclosure, and responsive fit. | The graph remains navigable without relying only on pointer precision or color. | Desktop and 390×844 QA pass. |
| 11 | Built a sanitized X content-learning-loop example. | It proves the skill on a realistic feedback system without exposing private handles, prompts, metrics, keys, or infrastructure. | 14 nodes, 17 edges, 3 decisions, 4 reviews. |
| 12 | Ran two independent forward tasks plus a blind score. | Option-tradeoff and stage-gated artifacts both passed the validator; blind review still found XSS, merge, history, and stale-selection defects. | HOLD until defects fixed. |
| 13 | Escaped all model-controlled HTML, blocked local acceptance, made canonical acceptance immutable, deep-merged imports by event ID, and cleared stale Overview state. | These were release blockers that static happy-path checks missed. | Second blind review required. |

## Forward tests

- **Option trade-off:** onboarding rollout choice; 13 nodes, 25 edges, 1 decision, 4 reviews. Passed the current validator.
- **Stage-gated roadmap:** community launch; 13 nodes, 17 edges, 4 decisions, 5 reviews. Passed the current validator.
- **Public sample:** X content learning loop; desktop, relation-focus, decision-focus, and 390×844 browser QA completed on localhost.

## Final score

Independent blind verdict: **SHIP**, **128/150**, a gain of **24 points** over the first HOLD snapshot.

| Persona | Decision usefulness | Determinism | Interaction | Integrity | Trigger clarity | Total |
|---|---:|---:|---:|---:|---:|---:|
| Beginner product manager | 8 | 9 | 8 | 9 | 8 | 42 |
| Technical lead | 9 | 9 | 8 | 9 | 8 | 43 |
| Meeting facilitator | 9 | 8 | 8 | 9 | 9 | 43 |
| **Final total** | **26** | **26** | **24** | **27** | **25** | **128/150** |

The remaining non-blocking limitation is independent browser trace coverage. The parent run completed desktop and 390×844 localhost browser QA and captured the public screenshots; the blind evaluator independently verified the static runtime, negative import paths, build reproducibility, and executable JavaScript, but could not access that localhost browser session.

## Release gates

- `node scripts/test_validator.mjs`
- `node scripts/test_builder.mjs`
- `node scripts/validate_decision_map.mjs assets/decision-map-seed.html --scaffold`
- `node scripts/validate_decision_map.mjs examples/x-auto-loop-public.html`
- `python3 .../skill-creator/scripts/quick_validate.py .`
- Browser QA at desktop and 390×844
- Independent blind verdict: `SHIP`
