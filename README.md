# Map Product Decisions — Night Signal

Turn complex product, architecture, workflow, and operating-model discussions into a single-file interactive HTML decision map.

## Choose a version

Both versions live in this repository and can be downloaded from the same project page.

| Version | Best for | Download |
|---|---|---|
| **Classic** (`main`) | Light, document-like decision maps and the latest hardened runtime | [Download ZIP](https://github.com/ckpxgfnksd-max/map-product-decisions-skill/archive/refs/heads/main.zip) |
| **Night Signal** (`night-signal`) | Dense system maps, live workshops, and low-light operational review | [Download ZIP](https://github.com/ckpxgfnksd-max/map-product-decisions-skill/archive/refs/heads/night-signal.zip) |

Night Signal keeps the same decision-map workflow while changing the default visual language to a dark, signal-led operating surface. Precision Grid remains available as the light adapter, and Editorial Ledger remains available for narrative-heavy work.

## Install this version

```bash
git clone --branch night-signal --single-branch \
  https://github.com/ckpxgfnksd-max/map-product-decisions-skill.git \
  map-product-decisions
```

Copy the resulting directory into your agent's skills directory, then invoke `$map-product-decisions` with a product, workflow, architecture, protocol, rollout, or operating-model decision.

## Validate

```bash
node scripts/validate_decision_map.mjs assets/decision-map-seed.html
```

The seed is intentionally an empty scaffold, so empty-node and empty-edge warnings are expected until real decision data is added.

See [`SKILL.md`](SKILL.md) for the workflow and [`EVALS.md`](EVALS.md) for the qualitative selection record and release checks.
