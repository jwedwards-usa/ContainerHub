# ContainerHub handoff

Last updated: 2026-08-20

## Current state
ContainerHub is a working static GitHub Pages catalog with no backend and no required build step. The catalog now contains 48 source-backed products: the original 15-record manufacturer seed, an 11-record retailer expansion, a 14-record Sterilite breadth wave, and an 8-record Really Useful Box U.S. wave.

The retailer expansion covers The Container Store, Target, Walmart, Ace Hardware, The Home Depot, Lowe's, H-E-B, Hobby Lobby, Michaels, Brookshire's, and IRIS USA. Tom Thumb and Safeway were researched but not added because the current indexed listings did not expose SKU-level external dimensions required for shelf fit.

The Sterilite breadth wave adds seven clear storage boxes from 6–90 qt plus a storage crate, three open bins, two dishpans, and a dual-spout utility pail. Unsupported interior dimensions, weights, and load ratings remain null rather than inferred.

The Really Useful Box wave adds clear 4, 6.5, 9, 17, 19, 32, 42, and 64 L boxes. The manufacturer U.S. table supplies exterior dimensions, minimum interior dimensions, and empty weights; current Staples listings supply U.S. purchase links and retailer model identifiers.

The UI supports:
- free-text search across product identity and taxonomy fields;
- brand, lid, translucency, and wheel filters;
- imperial/metric input and display conversion;
- shelf width/depth/height fit search;
- base rotation by default and optional tipping;
- ranking by number of identical containers that fit, then bounding-box utilization;
- source links and purchase links, including an iframe preview dialog with a new-tab fallback;
- lightweight SVG dimensional thumbnails.

`data/catalog.json` lists five catalog shards: `data/containers.json`, `data/retailer-containers.json`, `data/sterilite-clear-storage.json`, `data/sterilite-open-utility.json`, and `data/really-useful-box.json`. All shards use `data/schema.json`. Unknown product facts are `null`, not estimates.

## Verified commands
Run from the repository root:
```sh
npm run check
python3 tests/browser_test.py
node --check app.js
git diff --check
```

The expected catalog validator result is 48 records / 48 unique IDs across 5 shards. The browser smoke test verifies a retailer-wave SKU before re-running the original HDPE, brand, fit, unit conversion, and purchase-preview checks.

## Browser testing lesson
The VM has `/usr/bin/chromium`, but environment policy can block normal localhost navigation even when a local server is healthy. Do not weaken browser security to get around this. `tests/browser_test.py` creates one self-contained HTML document, injects the checked-in CSS and JavaScript, and replaces `fetch()` with all catalog manifest/shard data. It then exercises the real DOM with Chromium through Playwright.

## Deployment lesson
There are no GitHub Actions credits available for this project, and deployment must not depend on Actions. The site is intentionally raw static content, so no production build is needed today.

Preferred publication shape:
- `main`: source-of-truth repository contents;
- `gh-pages`: ready-to-serve static tree;
- while no build step exists, both branches can point to the same verified commit;
- if a build step is introduced later, run it on the VM and commit/push only the built site to `gh-pages`.

The VM may not be able to resolve or reach `github.com` for a normal `git push`. The connected GitHub API can create commits/refs without Actions and should be used as the fallback publication path.

## Data/research lessons
Good records need a stable manufacturer + SKU identity. Prefer manufacturer specification pages, then established retailers that clearly match the same SKU. Capture external and internal dimensions separately and retain qualifiers in `notes` when dimensions are measured at the bottom, top, usable interior, etc.

Catalog mining is sharded. Add each source wave to `data/catalog.json`, validate globally for duplicate IDs, and keep source-specific progress in `research/`. A retailer can still be a purchase source when dimensions come from a stronger SKU-matched source; document that join in `notes`.

Do not derive missing capacity, weight, material, or interior dimensions from a nearby size in the same product family. Leave those fields `null` until sourced.

Tom Thumb and Safeway remain unresolved for the retailer wave. Both expose current food-storage products, but the searchable listings lacked physical dimensions, so adding them would make shelf-fit data speculative.

## Next useful implementation work
1. Resolve Tom Thumb and Safeway with exact SKU-to-dimension matches.
2. Expand completed retailers and manufacturers beyond representative SKUs using resumable source batches.
3. Add field-level provenance if one product record starts depending on several specification pages.
4. Expand milk crates, food-service boxes, small-parts bins, nested industrial families, and liquid-capable vessels.
5. Add product photography only where reuse/hotlinking is appropriate; keep the current SVG schematic fallback for low bandwidth.
6. Add stale-record tooling that selects records by `verified_at` and refreshes them in resumable batches.

## Repository philosophy
Keep copy concise and non-duplicative. Avoid AI-flavored filler and comments that merely restate code. Favor auditable data and deterministic search behavior. Each session should leave the codebase, data quality, tests, or research checkpoint measurably better than it found them.
