# ContainerHub handoff

Last updated: 2026-08-26

## Current state

ContainerHub is a static GitHub Pages catalog with no backend and no required build step. The completed 2026-08-26 catalog audit establishes **3,000 unique registered product records across 156 product shards**, plus **12 retailer/pack/configuration offers** in `data/offers.json`.

`data/catalog.json` is the authoritative shard manifest. `research/checkpoint.json` is the operational checkpoint. `research/catalog-audit-2026-08-26.md` records the count reconciliation and 3,000-record milestone. Do not use the historical 1,076-record reconciliation as the current count; it remains useful only as an audit baseline.

The current execution VM cannot reliably resolve GitHub, so repository reads/writes, branch verification and publication use the connected GitHub API. There are no GitHub Actions credits available.

## Catalog behavior

The UI supports weighted free-text search across identity, taxonomy, source/purchase retailer and offers; brand/lid/translucency/wheel filters; imperial/metric conversion; source and purchase links; product-preview dialogs with retained direct buy links; progressive rendering for large result sets; outside/inside dimensional search; standard paper/file fit flags derived from published internal dimensions; and mixed-container shelf planning.

Sellable products may have `external_mm: null` or `internal_mm: null` when geometry is unpublished. They remain searchable and purchasable but are excluded only from geometric modes that require the missing measurement. Grouped, compact, index and tabular shards expand to the same runtime record shape.

Unknown product facts stay `null`; never infer them from adjacent sizes or related models.

## Geometry/search rules

- **Outside dimensions — fit into a space** uses `external_mm`. Entered width/depth/height is the maximum shelf or cubby envelope. True fits sort above near misses.
- **Inside dimensions — hold an item** uses `internal_mm`. Entered width/depth/height is the minimum usable interior. Missing interiors never pass fit-only.
- Base rotation is automatic; tipping is opt-in.
- Shelf-combination planning is an outside-dimension workflow and never assumes vertical stacking unless `stackable === true`.
- `Most per shelf`, `Footprint use`, and closest-size ranking remain deterministic geometry modes.

Standard-format badges are conservative and never substitute external dimensions for missing interiors:
- US Letter: 215.9 × 279.4 mm
- US Legal: 215.9 × 355.6 mm
- A4: 210 × 297 mm
- Letter hanging-file envelope: 12.75 in rod span × 9.25 in upright folder-body height

Clearly round/cylindrical interiors require the paper diagonal to fit the published internal diameter rather than using a bounding box.

## Search implementation

Text search is token-aware and weighted. Exact model/SKU and seller-SKU matches score strongest, followed by name, brand, category/material, construction, descriptive fields and source/retailer. All query tokens must match somewhere, so multi-field searches remain selective.

Only the first 60 result cards render initially; `Show more` adds cards in 60-item batches while the full match count remains visible.

Outside shelf searches generate up to three one-layer combination plans. The planner allows base rotation, mixes up to three product identities, and uses bounded beam search to balance coverage, depth use, height harmony and SKU simplicity.

## 3,000-record milestone

The pre-milestone 2026-08-26 audit reconciled current `main` to **2,796 records across 152 shards**. The U.S. Plastic / Tamco tray wave adds exactly 204 unique retailer item identities:

- lightweight HDPE fabricated trays: 63
- polypropylene fabricated trays: 65
- polypropylene fabricated trays with spigots: 67
- polypropylene dipping trays: 9

The plain polypropylene family excludes U.S. Plastic items 14685 and 15442 because the retailer marks them out of stock. Made-to-order spigot configurations remain included as current sellable products. Pack and color variants are not multiplied into separate product identities.

U.S. Plastic explicitly publishes inside dimensions for the fabricated HDPE/polypropylene families, so those values belong in `internal_mm` and `external_mm` remains null. The dipping-tray listing publishes approximate outside dimensions, so those values belong in `external_mm`.

## Data and sourcing rules

Prefer manufacturer specifications, then established retailers that clearly match the same model or SKU. Capture external and internal dimensions separately and preserve source qualifiers.

A second retailer, pack, color-only variant, or accessory configuration using the same physical product belongs in `data/offers.json` rather than becoming a duplicate product. A materially different size, material, neck/closure construction, compartment layout, wall construction, or included functional configuration may be a distinct physical product when the source assigns a distinct sellable identity.

Do not reject a current sellable SKU solely because physical dimensions are unpublished. Geometric modes degrade independently: outside search requires `external_mm`; inside search and standard-fit badges require `internal_mm`.

Keep source families in separate shard files so workers can add products without editing the same data file. Reconcile `data/catalog.json` at integration time. If `main` advances, rebuild from the newer tree and retain the stronger/newer duplicate before adding only genuinely new identities.

`research/retailer-coverage.json` remains the source of truth for exhaustive retailer progress.

## Verification

Run from the repository root when a fully networked checkout is available:

```sh
npm run check
python3 tests/browser_test.py
node --check app.js
git diff --check
```

`tests/geometry.test.mjs` covers closest-fit ranking, pack-sort compatibility, near-miss ordering, internal-fit ranking and fit-only behavior, SKU/model relevance, cross-field text search, paper/file flags, round-interior geometry, conservative stacking and mixed shelf plans.

For data-only waves, independently verify JSON parseability, unique IDs/models, source semantics, manifest registration and arithmetic against `research/checkpoint.json`. Do not claim a full npm/browser run when the current VM cannot materialize a current checkout.

## Branch reconciliation history

The 2026-08-20 all-branch reconciliation produced the historical 1,076-record baseline. Historical branches such as `catalog/bulk-wave-1-572-20260820`, `catalog/scale-1000-20260820`, and `catalog/1000-product-expansion-20260820` contain many superseded or duplicate sparse identities. Do not reintroduce those files merely because their branch names imply additional scale.

`research/branch-reconciliation-2026-08-20.md` documents that historical union. `research/catalog-audit-2026-08-26.md` supersedes it for current counts.

## Next useful work

1. Continue retailer-by-retailer enumeration from `research/retailer-coverage.json`; 3,000 is a milestone, not exhaustive coverage.
2. Prioritize Walmart, Target, Home Depot and Lowe's because their inventories are broad and change frequently.
3. Continue U.S. Plastic beyond the completed Tamco tray families into distinct tanks, drums, buckets, bottles, jars, carboys and industrial containers.
4. Continue Grainger shelf bins, stack/nest totes, attached-lid totes and bulk containers while reconciling Akro-Mils/Quantum against existing manufacturer identities.
5. Continue H-E-B, Tom Thumb, Safeway, Brookshire's, Hobby Lobby, Michaels, The Container Store and Ace.
6. Expand IRIS USA, Quantum non-QUS, Buckhorn modular/bulk and remaining Cambro families.
7. Enrich index-first Uline and Sterilite records with model-specific external and internal dimensions and other published facts.
8. Add stale-record refresh tooling and field-level provenance as coverage grows.

## Deployment

The site is raw static content. Keep `main` as source of truth and advance `gh-pages` through normal Git history to the exact same verified tree. Never force shared refs.

## Repository philosophy

Keep copy concise and non-duplicative. Avoid filler and comments that merely restate code. Favor auditable data and deterministic behavior. Leave data quality, coverage, tests or research checkpoints measurably better than you found them.
