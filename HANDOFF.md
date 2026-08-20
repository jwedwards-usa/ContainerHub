# ContainerHub handoff

Last updated: 2026-08-20

## Current state
ContainerHub is a working static GitHub Pages catalog with no backend and no required build step. The catalog now contains 70 source-backed products: the original 15-record manufacturer seed, an 11-record retailer expansion, a 14-record Sterilite breadth wave, and a 30-record catalog expansion completed in five source-specific batches.

The 30-record expansion adds:
- 5 IRIS USA WeatherPro/file-storage SKUs;
- 7 retailer SKUs from The Home Depot, Lowe's, Target, and Walmart;
- 7 additional Target Brightroom latching-bin sizes from 5.8–110 qt;
- 6 additional Home Depot HDX totes from 7–55 gal, including flip-top and wheeled/large formats already represented in the broader family;
- 5 Michaels Simply Tidy bins, cases, and an open crate.

A concurrent worker added the 14-record Sterilite breadth wave while the 30-record expansion was in progress. The work was reconciled with a two-parent merge commit rather than overwriting either catalog manifest. The Sterilite wave remains intact alongside all five new shards.

The retailer coverage includes The Container Store, Target, Walmart, Ace Hardware, The Home Depot, Lowe's, H-E-B, Hobby Lobby, Michaels, Brookshire's, and IRIS USA. Tom Thumb and Safeway were researched but not added because the indexed listings did not expose SKU-level external dimensions required for shelf fit.

The UI supports:
- free-text search across product identity and taxonomy fields;
- brand, lid, translucency, and wheel filters;
- imperial/metric input and display conversion;
- shelf width/depth/height fit search;
- base rotation by default and optional tipping;
- ranking by number of identical containers that fit, then bounding-box utilization;
- source links and purchase links, including an iframe preview dialog with a new-tab fallback;
- lightweight SVG dimensional thumbnails.

`data/catalog.json` lists nine catalog shards:
- `data/containers.json`;
- `data/retailer-containers.json`;
- `data/sterilite-clear-storage.json`;
- `data/sterilite-open-utility.json`;
- `data/iris-wave-2.json`;
- `data/retail-wave-2.json`;
- `data/target-brightroom-wave-2.json`;
- `data/homedepot-hdx-wave-3.json`;
- `data/michaels-wave-2.json`.

All shards use `data/schema.json`. Nullable product facts remain `null` rather than estimated. Source notes preserve qualifiers such as bottom-interior dimensions, pack-level SKUs, water-resistance claims, and retailer-specific product identifiers.

## Verification
Run from the repository root when network-independent checkout access is available:
```sh
npm run check
python3 tests/browser_test.py
node --check app.js
git diff --check
```

The expected catalog validator result is 70 records / 70 unique IDs across 9 shards. The connected GitHub comparison from the concurrent Sterilite `main` to the merged catalog branch shows the branch ahead with no commits behind and exactly 30 added thumbnail files, five added data shards, and the manifest update. The current VM cannot resolve `github.com`, so publication and branch verification use the connected GitHub API instead of a local clone.

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

When another worker advances `main`, do not replace its manifest with a stale feature-branch manifest. Reconcile the shard lists and create a merge commit whose tree contains both workers' files before publication.

Do not derive missing capacity, weight, material, or interior dimensions from a nearby size in the same product family. Leave nullable fields `null` until sourced.

Tom Thumb and Safeway remain unresolved for the retailer wave. Both expose current food-storage products, but the searchable listings lacked physical dimensions, so adding them would make shelf-fit data speculative.

## Next useful implementation work
1. Resolve Tom Thumb and Safeway with exact SKU-to-dimension matches.
2. Continue exhaustive retailer/manufacturer mining in resumable source shards, especially remaining Target, Walmart, Lowe's, Home Depot, Michaels, Hobby Lobby, Container Store, and Ace families.
3. Add direct retailer purchase joins for manufacturer-only Sterilite records where exact model matching is available.
4. Add field-level provenance if one product record starts depending on several specification pages.
5. Expand Cambro, Quantum Storage, Buckhorn, Really Useful Box, Uline house brands, food-service boxes, small-parts bins, nested industrial families, and liquid-capable vessels.
6. Add product photography only where reuse/hotlinking is appropriate; keep the SVG schematic fallback for low bandwidth.
7. Add stale-record tooling that selects records by `verified_at` and refreshes them in resumable batches.

## Repository philosophy
Keep copy concise and non-duplicative. Avoid AI-flavored filler and comments that merely restate code. Favor auditable data and deterministic search behavior. Each session should leave the codebase, data quality, tests, or research checkpoint measurably better than it found them.
