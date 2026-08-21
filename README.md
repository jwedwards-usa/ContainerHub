# ContainerHub

A static, source-backed catalog for comparing plastic containers by real dimensions and shelf fit. No backend and no build step are required.

**Live site:** https://jwedwards-usa.github.io/ContainerHub/

## What works
- Search across brand, model/SKU, material, closure, category, color, notes, source retailer, and additional seller offers, ranked by weighted text relevance.
- Filter by brand, lid, transparency, wheels, and common paper/file formats.
- Switch dimensional search between **outside dimensions** (fit a shelf/cubby) and **inside dimensions** (find the smallest published usable interior that can hold a required width/depth/height).
- Enter shelf width, depth and height to rank fitting containers by dimensional closeness; near misses stay below true fits unless fit-only is enabled.
- Flag containers whose published internal geometry fits US Letter, US Legal, A4, or a standard letter hanging-file envelope. Hanging-file flags are dimensional only and do not claim built-in rails.
- Switch sorting to most per shelf, one-layer footprint use, or A–Z when a different geometric objective matters.
- See mixed one-layer shelf plans that combine up to three container sizes using physically valid top-down row layouts.
- Keep sellable products with unpublished external or internal dimensions searchable and purchasable while excluding them only from the geometric mode that needs the missing measurement.
- Rotate containers on their base by default; tipping onto a side is opt-in. In inside mode the same option permits the required item envelope to rotate onto its side.
- Count vertical packing layers only when the catalog explicitly marks a product stackable.
- Toggle imperial and metric display while canonical catalog data stays metric.
- Compare external dimensions, internal dimensions, capacity and empty weight when published.
- Open source specifications, product previews, primary purchase pages, and additional retailer offers.
- Render large result sets progressively instead of creating every product card at once.

The 2026-08-20 reconciliation contains **1,076 unique product records across 67 shards**, plus **12 additional retailer/pack/configuration offers**. It reconciles every worker branch surfaced in that pass, preserving richer source-backed records when branches overlap and retaining sparse index records only for genuinely unique sellable models. Run `npm run validate` for the current count after later mining work.

Retailer enumeration is tracked in `research/retailer-coverage.json`; no retailer is marked exhaustive until every in-scope sellable SKU or variant has an explicit outcome.

## Run locally
```sh
python3 -m http.server 4173
```
Open `http://localhost:4173`.

## Verify
```sh
npm run check
python3 tests/browser_test.py
```

`npm run check` validates catalog invariants and retailer offers, then runs the fit/search unit tests. The Playwright smoke test uses an in-memory bundle so it also runs in network-restricted environments.

## Data
`data/catalog.json` is the manifest; each listed JSON file is a product shard using `data/schema.json`. Additional sellers, packs, or configurations for an existing physical product live in `data/offers.json` rather than duplicate product records. Measurements are canonicalized to millimeters, milliliters and grams. Unknown values are `null`, never estimates. See `AGENTS.md` for research rules.

Generated SVG thumbnails are dimensional schematics rather than product photography and keep the catalog usable on low-bandwidth connections.
