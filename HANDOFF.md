# ContainerHub handoff

Last updated: 2026-08-20

## Current state
ContainerHub is a working static GitHub Pages catalog with no backend and no required build step. The catalog now contains 148 source-backed products across 19 shards.

The current catalog combines the original 15-record manufacturer seed, the 11-record retailer expansion, the 14-record Sterilite breadth wave, a 24-record food-service/industrial/direct-buy wave, a 30-record retailer/manufacturer expansion, a 16-record Buckhorn straight-wall wave, a 21-record Cambro CamSquares Classic wave, and a 17-record Quantum QUS completion wave.

The 24-record wave adds eight Cambro polyethylene food boxes, five Quantum Storage Systems QUS stack-and-hang bins, eight Uline stackable bins, and three Really Useful Box latching storage boxes. The 30-record wave adds five IRIS USA WeatherPro/file-storage SKUs; seven Home Depot/Lowe's/Target/Walmart SKUs; seven additional Target Brightroom latching-bin sizes from 5.8–110 qt; six additional Home Depot HDX totes from 7–55 gal; and five Michaels Simply Tidy bins, cases, and an open crate.

The 16-record Buckhorn wave adds the current straight-wall family from SW12070502 through SW48150802, using current sellable distributor listings with Buckhorn specification cross-checks and explicit notes for source conflicts.

The 21-record CamSquares Classic wave adds seven polyethylene, seven translucent polypropylene, and seven clear Camwear polycarbonate square food-storage containers spanning 2–22 qt. Dimensions come from current Cambro specifications, and each record links to a model-matched KaTom purchase page. Cambro publishes the current exterior dimensions with covers installed even though lids are sold separately; that qualifier is retained in every record.

The 17-record Quantum wave adds the remaining current QUS standard sizes from QUS232 through QUS270 plus the QUS275MOB mobile bin. Together with the five earlier QUS records, the catalog now covers 21 standard QUS sizes plus the mobile model. Current manufacturer pages supply exterior/interior dimensions and load ratings where published. QUS232, QUS236, QUS238, and QUS248 currently omit load ratings, so those fields remain null. QUS275MOB shelf-fit height includes its four 3-inch casters.

Retailer coverage includes The Container Store, Target, Walmart, Ace Hardware, The Home Depot, Lowe's, H-E-B, Hobby Lobby, Michaels, Brookshire's, IRIS USA, Uline, Really Useful Box, and KaTom Restaurant Supply, with manufacturer/direct-source families from Sterilite, Cambro, Quantum Storage Systems, Akro-Mils, Rubbermaid Commercial, and Buckhorn. Tom Thumb and Safeway were researched but not added because indexed listings did not expose SKU-level external dimensions required for shelf fit.

The UI supports:
- free-text search across product identity and taxonomy fields;
- brand, lid, translucency, and wheel filters;
- imperial/metric input and display conversion;
- shelf width/depth/height fit search;
- base rotation by default and optional tipping;
- ranking by number of identical containers that fit, then bounding-box utilization;
- source links and purchase links, including an iframe preview dialog with a new-tab fallback;
- lightweight SVG dimensional thumbnails.

`data/catalog.json` lists 19 catalog shards. All shards use `data/schema.json`. Unknown product facts are `null`, not estimates. Source notes preserve qualifiers such as bottom-interior dimensions, dimensions published with accessory covers, caster-inclusive dimensions, pack-level SKUs, water-resistance claims, and retailer-specific product identifiers.

## Verification
Run from the repository root:
```sh
npm run check
python3 tests/browser_test.py
node --check app.js
git diff --check
```

The expected catalog validator result is 148 records / 148 unique IDs across 19 shards. During coordination passes, connected GitHub comparisons are used to detect concurrent branch movement and verify that merge trees retain all workers' shard sets rather than replacing one manifest with another. This wave encountered an overlapping Cambro CamSquares contribution: the concurrent worker's broader 21-record wave was retained, this branch's duplicate 14-record Cambro shard was deliberately excluded from the merge tree, and only the non-overlapping Quantum shard was integrated.

The current VM may be unable to resolve `github.com`, so publication and branch verification can use the connected GitHub API; rerun the local validator/browser commands from a checkout when network-independent checkout access is available.

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
Good records need a stable manufacturer + SKU identity. Prefer manufacturer specification pages, then established retailers that clearly match the same SKU. Capture external and internal dimensions separately and retain qualifiers in `notes` when dimensions are measured at the bottom, top, usable interior, with a lid/cover, or with casters.

Catalog mining is sharded. Keep source families in separate shard files so parallel workers can add products without editing the same data file; reconcile only `data/catalog.json` at integration time. Validate globally for duplicate IDs and keep source-specific progress in `research/`.

When another worker advances `main`, do not replace its manifest with a stale feature-branch manifest. Reconcile the shard lists and create a merge commit whose tree contains the stronger or broader non-duplicative data from both workers. If two workers mine the same SKU family, compare coverage and discard the weaker duplicate shard instead of publishing duplicate IDs.

A retailer can still be a purchase source when dimensions come from a stronger SKU-matched source; document that join in `notes`. Do not derive missing capacity, weight, material, or interior dimensions from a nearby size in the same product family. Leave nullable fields `null` until sourced. Do not treat water resistance or a gasketed dust/moisture seal as a liquid-containment rating unless the source explicitly supports that claim.

The Cambro 182612P148 food box has conflicting capacity values across current official Cambro pages. Its record documents the discrepancy and uses the internally consistent 64.4 L value rather than silently choosing the outlier.

For CamSquares Classic, current Cambro tables publish dimensions with the compatible cover installed while the containers are sold without covers. Keep that qualifier attached to the dimensions unless a bare-container specification becomes available.

Tom Thumb and Safeway remain unresolved. Their searchable listings lacked physical dimensions, so adding them would make shelf-fit data speculative.

## Next useful implementation work
1. Resolve Tom Thumb and Safeway with exact SKU-to-dimension matches.
2. Continue exhaustive mining of remaining SKUs at completed retailers, especially Target, Walmart, Lowe's, Home Depot, Michaels, Hobby Lobby, Container Store, and Ace.
3. Expand Buckhorn beyond the straight-wall family into attached-lid and bulk containers.
4. Expand Cambro into FreshPro CamSquares, CamRounds, and additional food-storage families.
5. Expand Quantum into clear-view, recycled-material, and other non-standard QUS/industrial-bin families.
6. Expand Uline into additional house-brand bin, tote, crate, and liquid-capable families.
7. Add direct retailer purchase joins for manufacturer-only records where exact model matching is available.
8. Add field-level provenance and stale-record refresh tooling as the catalog grows.

## Repository philosophy
Keep copy concise and non-duplicative. Avoid AI-flavored filler and comments that merely restate code. Favor auditable data and deterministic search behavior. Each session should leave the codebase, data quality, tests, or research checkpoint measurably better than it found them.
