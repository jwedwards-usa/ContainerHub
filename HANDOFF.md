# ContainerHub handoff

Last updated: 2026-08-20

## Current state
ContainerHub is a static GitHub Pages catalog with no backend and no required build step. The catalog now contains 155 source-backed products across 21 shards.

The current catalog combines the original manufacturer and retailer seeds with Sterilite breadth, Cambro food-service, Quantum and Uline industrial bins, Really Useful Box, IRIS and retailer expansions, Buckhorn straight-wall totes, and complete Cambro Classic CamSquares and CamRounds families.

The latest 24-record CamRounds expansion adds every 1, 2, 4, 6, 8, 12, 18, and 22 qt Classic size in three materials: clear Camwear polycarbonate, translucent polypropylene, and natural-white polyethylene. Current Cambro family specifications provide capacities, diameters, and heights; model-matched KaTom listings provide direct purchase links and cross-check the sellable SKUs. Round diameters are stored as both length and width for shelf-fit calculations. Cambro labels these heights with the compatible cover installed while covers are sold separately, so that qualifier is retained in every record.

The UI supports free-text search, brand/lid/translucency/wheel filters, imperial/metric conversion, shelf width/depth/height fit search, base rotation and optional tipping, ranked fit counts, source/purchase links, purchase previews with new-tab fallback, and lightweight SVG dimensional thumbnails.

`data/catalog.json` lists 21 catalog shards. All shards use `data/schema.json`. Unknown product facts are `null`, not estimates. Keep source families in separate shards so workers can add products concurrently and reconcile only the manifest during integration.

## Verification
Run from the repository root:
```sh
npm run check
python3 tests/browser_test.py
node --check app.js
git diff --check
```

The expected catalog validator result is 155 records / 155 unique IDs across 21 shards. During coordination passes, compare `main` immediately before publication. Never replace a newer manifest with a stale feature-branch manifest; merge shard lists or abandon overlapping work. The connected GitHub API is the publication fallback when the VM cannot reach GitHub directly.

## Data and sourcing rules
Prefer stable manufacturer + SKU identity. Prefer manufacturer specifications, then established retailers that clearly match the same SKU. Capture external and internal dimensions separately and preserve qualifiers such as bottom measurements or dimensions with a lid/cover. Do not infer missing material, capacity, load rating, internal dimensions, or empty weight from nearby products. Case/shipping weights are not individual empty-container weights unless the source explicitly says so.

A retailer can be the purchase source while a manufacturer is the stronger specification source; document the join in notes. Do not treat water resistance or a gasketed dust/moisture seal as proof of liquid containment without an explicit claim.

The Cambro 182612P148 food box has conflicting capacity values across current official pages; its record documents the discrepancy and uses the internally consistent value rather than silently selecting the outlier.

Tom Thumb and Safeway remain unresolved because indexed listings lacked SKU-level physical dimensions required for shelf fit.

## Next useful work
1. Resolve Tom Thumb and Safeway with exact SKU-to-dimension matches.
2. Continue exhaustive remaining-SKU mining at Target, Walmart, Lowe's, Home Depot, Michaels, Hobby Lobby, The Container Store, and Ace.
3. Expand Buckhorn into attached-lid and bulk containers.
4. Expand Cambro into FreshPro CamRounds/CamSquares and other storage families.
5. Expand Quantum and Uline beyond the currently verified industrial-bin families.
6. Add field-level provenance and stale-record refresh tooling as the catalog grows.

## Repository philosophy
Keep copy concise and non-duplicative. Avoid filler and comments that restate code. Favor auditable data and deterministic behavior. Leave the codebase, data quality, tests, or research checkpoint measurably better than you found it.
