# ContainerHub handoff

Last updated: 2026-08-20

## Current state
ContainerHub is a working static GitHub Pages catalog with no backend and no required build step. The current seed contains 15 source-backed products from Sterilite, IRIS USA, Akro-Mils, and Rubbermaid Commercial.

The UI supports:
- free-text search across product identity and taxonomy fields;
- brand, lid, translucency, and wheel filters;
- imperial/metric input and display conversion;
- shelf width/depth/height fit search;
- base rotation by default and optional tipping;
- ranking by number of identical containers that fit, then bounding-box utilization;
- source links and purchase links, including an iframe preview dialog with a new-tab fallback;
- lightweight SVG dimensional thumbnails.

Canonical data is `data/containers.json`; the contract is `data/schema.json`. Unknown product facts are `null`, not estimates.

## Verified commands
Run from the repository root:
```sh
npm run check
python3 tests/browser_test.py
node --check app.js
git diff --check
```

At handoff, the expected catalog validator result is 15 records / 15 unique IDs and the Node test suite has 6 passing tests. The Playwright smoke test checks initial rendering, HDPE search, brand filtering, exact SKU search, shelf fit, unit conversion, and the purchase preview dialog.

## Browser testing lesson
The VM has `/usr/bin/chromium`, but environment policy can block normal localhost navigation even when a local server is healthy. Do not weaken browser security to get around this. `tests/browser_test.py` creates one self-contained HTML document, injects the checked-in CSS and JavaScript, and replaces `fetch()` with the checked-in catalog. It then exercises the real DOM with Chromium through Playwright.

If future behavior depends on actual URL navigation, add a second harness only if the environment supports it; keep the in-memory smoke test as the reliable baseline.

## Deployment lesson
There are no GitHub Actions credits available for this project, and deployment must not depend on Actions. The site is intentionally raw static content, so no production build is needed today.

Preferred publication shape:
- `main`: source-of-truth repository contents;
- `gh-pages`: ready-to-serve static tree;
- while no build step exists, both branches can point to the same verified commit;
- if a build step is introduced later, run it on the VM and commit/push only the built site to `gh-pages`.

The VM may not be able to resolve or reach `github.com` for a normal `git push`. The connected GitHub API can create commits/refs without Actions and should be used as the fallback publishing path.

## Data/research lessons
Good records need a stable manufacturer + SKU identity. Prefer manufacturer specification pages, then established retailers that clearly match the same SKU. Capture external and internal dimensions separately and retain qualifiers in `notes` when dimensions are measured at the bottom, top, usable interior, etc.

Do not derive missing capacity, weight, material, or interior dimensions from a nearby size in the same product family. Leave those fields `null` until sourced.

Every record should retain a valid specification source and a place-to-buy URL. Retailers can block iframe embedding, so the purchase preview must always keep the explicit new-tab fallback.

`research/checkpoint.json` is the resumable mining cursor. Seed wave 1 is complete. Next manufacturers currently queued are:
1. Cambro
2. Quantum Storage
3. Buckhorn
4. Really Useful Box
5. Uline house brands

When adding a source batch, update the checkpoint after the batch rather than only at the end of a long session.

## Next useful implementation work
1. Expand the catalog substantially while preserving source quality.
2. Add field-level provenance if one product record starts depending on several specification pages.
3. Add more container types: milk crates, lattice bins, open totes, food-service boxes, liquid-capable vessels, small parts bins, and nested/stacking industrial families.
4. Add product photography only where reuse/hotlinking is appropriate; keep the current SVG schematic fallback for low bandwidth.
5. Add multi-container packing/combination search for a shelf or cupboard after the single-SKU fit engine has enough catalog breadth.
6. Add stale-record tooling that selects records by `verified_at` and refreshes them in resumable batches.

## Repository philosophy
Keep copy concise and non-duplicative. Avoid AI-flavored filler and comments that merely restate code. Favor auditable data and deterministic search behavior. Each session should leave the codebase, data quality, tests, or research checkpoint measurably better than it found them.
