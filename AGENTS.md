# ContainerHub agent rules

ContainerHub is a static GitHub Pages catalog. Keep it dependency-light, source-backed, auditable, and directly deployable from `gh-pages` without GitHub Actions.

## Code
- Leave the codebase simpler than you found it.
- Prefer small pure functions and browser-native APIs.
- Do not add generated filler, defensive comments, duplicated copy, or dependencies without a clear payoff.
- Canonical measurements are millimeters, milliliters, and grams. Convert only for display.
- Unknown data stays `null`; never infer a product fact from a similar SKU.
- Keep the deployable site as plain static files unless a build step has a material payoff. If a build step is added, run it locally and commit the built output to `gh-pages`.

## Catalog research
- A product record needs a stable manufacturer/SKU identity, a source URL, and a purchase URL.
- Product identity is the manufacturer/brand plus model or SKU. Do not duplicate one physical product just because several retailers sell it; put additional sellers in `data/offers.json`.
- A sellable SKU may be cataloged with `external_mm: null` when dimensions are genuinely unpublished. It remains searchable and purchasable but must be excluded from shelf-fit ranking until geometry is sourced.
- Record `verified_at` whenever a source is checked.
- Dimensions must say whether they are external or internal. Preserve source semantics such as "interior at bottom" in `notes`.
- Prefer manufacturer specifications, then established retailers with manufacturer SKU matching.
- Every non-obvious field should be supportable by `sources` or the record's specification source.
- Re-check purchase links and high-change fields before merging refreshed data.
- Do not invent values to complete a record. Nullable fields are intentional.
- `data/catalog.json` is the catalog manifest. Add shards there rather than hard-coding new catalog files in the app.
- Retailer shards may use a stronger specification source with a separate retailer purchase URL when the retailer listing alone cannot support dimensions.
- A retailer is not complete because a representative SKU was found. `research/retailer-coverage.json` is the enumeration ledger; mark a retailer complete only after every in-scope sellable SKU/variant has an explicit outcome.

## Research checkpoints
- Work is chunked in `research/checkpoint.json` so mining can stop and resume.
- Update the cursor, active/completed batches, counts, and `updated_at` after each source batch.
- Refresh stale records in batches; do not rewrite verified fields unless the newer source is stronger.
- `research/retailer-wave-1.json` records the first retailer expansion; `research/retailer-coverage.json` tracks ongoing exhaustive coverage.
- Seed wave 1 covers Sterilite, IRIS USA, Akro-Mils, and Rubbermaid Commercial. The checkpoint lists the next work.

## Fit/search behavior
- A shelf fit is based on external dimensions. Records without external dimensions never participate in geometric calculations.
- Rotation on the base is allowed by default; tipping onto a side is opt-in.
- Default shelf sorting is **closest valid size**, not smallest-bin count. True fits always rank above near misses. The size score combines geometric-mean axis fill, the worst-filled axis, average axis fill, and shape balance.
- Keep `Most per shelf` and `Footprint use` as explicit alternate objectives; do not silently blend them into closest-size ranking.
- Vertical layers count toward `fit.count` only when `stackable === true`. Unknown or explicitly non-stackable products use one layer; shelf combination plans are always one layer.
- Shelf combinations are deterministic, physically bounded top-down row layouts. The solver may mix up to three product identities and should favor footprint coverage without producing excessive SKU complexity.
- Text search is weighted and token-aware. Exact model/SKU and seller-SKU matches outrank names, then brand/category/material and descriptive fields. All query tokens must match somewhere in the record/search offers.
- Text search must cover brand, model/SKU, material, category, color, closure, notes, source/purchase site, and attached retailer offers.
- Large catalogs must not render every card at once. Keep progressive result rendering and preserve the full match count.
- Imperial/metric toggling changes display/input units only; stored values remain metric.

## Development environment used on 2026-08-20
- Debian GNU/Linux 13 (trixie), Linux 6.18 x86_64.
- 5 CPU cores, about 6 GiB RAM.
- Node.js 22.16.0, npm 10.9.2.
- Python 3.13.5.
- Git 2.47.3.
- Playwright for Python 1.57.0.
- System Chromium 144.0.7559.96 at `/usr/bin/chromium`.
- The VM can run Chromium headlessly with `--no-sandbox`.
- Direct Chromium navigation to a localhost HTTP server can be blocked by environment policy. `tests/browser_test.py` avoids that by bundling the app into `page.set_content()` and shimming `fetch()` with the checked-in catalog. Keep that pattern unless the environment changes.
- Outbound `git push` from the VM may fail because `github.com` DNS/network access is restricted. Use the connected GitHub API tools for publication when that happens; this consumes no GitHub Actions minutes.
- A synthetic 10,000-record benchmark for the geometry/search v2 code measured about 196 ms for the first weighted shelf search, 50 ms after search-index caching, and 94 ms for shelf-plan generation on this VM. Treat these as regression guidance, not hard test thresholds.

## Local workflow
```sh
npm run check
python3 tests/browser_test.py
```

For manual viewing when localhost is permitted:
```sh
npm run serve
```

Before publishing, also run `node --check app.js` and inspect `git diff --check` plus `git status` so generated caches or unrelated files do not enter the commit.

## Deployment
- The project has no required production build step today: `index.html`, `styles.css`, `app.js`, `src/`, `data/`, and `assets/` are already deployable.
- GitHub Actions must not be required for deployment.
- Keep source on `main` and ready-to-serve content on `gh-pages`. They may point to the same commit while the app remains raw static files.
- `.nojekyll` is intentional.

## Handoff
Read `HANDOFF.md` before starting a new implementation or research session. Update it when architecture, deployment constraints, testing workarounds, search geometry, or research priorities materially change.
