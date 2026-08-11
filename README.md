# Map Product Decisions

Turn a complex product discussion into a single-file interactive HTML decision map.

This skill is for teams that need to see dependencies, feedback loops, stage gates, parallel work, trade-offs, risks, evidence, and decision history in one inspectable artifact. It is not a general diagram generator: the map begins with a decision question and preserves why a choice was made, what it affects, and how it can be reversed.

## Public and private boundary

This repository is public and self-contained.

| Public in this repository | Not included |
|---|---|
| The reusable `map-product-decisions` skill | Private X Auto Loop source code |
| A sanitized, simulated **X Content Learning Loop** example | Real accounts, posts, prompts, metrics, experiments, or incidents |
| Generic decision-map schemas, renderer, validator, and tests | Production infrastructure, database paths, hostnames, credentials, or runtime state |

The public example demonstrates the mapping method only. It must not be treated as a snapshot of a production system or as evidence of business performance.

## What the skill produces

- One browser-openable HTML file with no external runtime dependency.
- A canonical JSON model embedded in the artifact.
- Typed, directional relationships with impact and removal consequences.
- ADR-style decisions, evidence links, review state, acceptance criteria, and rollback.
- Overview, Focus, and All modes; node and edge inspection; search, filters, zoom, import, and export.
- Validation that fails closed on malformed references, missing grounding, invalid grammars, unsafe accepted decisions, or broken interaction contracts.

## Try the public example

Open [`examples/x-auto-loop-public.html`](examples/x-auto-loop-public.html) in a browser. Its canonical source model is [`examples/x-auto-loop-public.model.json`](examples/x-auto-loop-public.model.json).

To rebuild it deterministically:

```bash
node scripts/build_example.mjs examples/x-auto-loop-public.model.json examples/x-auto-loop-public.html
```

To run the release checks:

```bash
node scripts/test_builder.mjs
node scripts/test_validator.mjs
node scripts/validate_decision_map.mjs examples/x-auto-loop-public.html
```

## Use as a Codex skill

Install or copy this repository into your shared skills directory, then invoke `map-product-decisions` when a product, workflow, architecture, protocol, rollout, or operating-model discussion needs a shared decision surface.

The full workflow and trigger boundary are documented in [`SKILL.md`](SKILL.md). The optimization record and independent blind score are in [`EVALS.md`](EVALS.md).
