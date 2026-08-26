# ContainerHub

ContainerHub is a static catalog for finding plastic containers by real dimensions, usable interior space, and shelf fit. Product data is source-backed, searchable in the browser, and published without a backend.

**Live site:** https://jwedwards-usa.github.io/ContainerHub/

## Features

- Search by brand, model or SKU, material, category, color, closure, retailer, and product notes.
- Find containers that fit a shelf or cubby using published external dimensions.
- Find the smallest suitable container for an item using published internal dimensions.
- Rank valid fits ahead of near misses, with optional base rotation and side tipping.
- Compare shelf utilization, container counts, and mixed one-layer packing plans.
- Switch between imperial and metric units.
- Filter for published interior dimensions that accommodate US Letter, US Legal, A4, or a letter hanging-file envelope.
- Follow specification sources, purchase links, and additional retailer offers.

## Data

`data/catalog.json` is the catalog manifest. Product records are stored in JSON shards and validated against `data/schema.json`. Additional sellers, packs, and configurations for an existing physical product belong in `data/offers.json` rather than duplicate product records.

Canonical measurements use millimeters, milliliters, and grams. Unknown values remain `null`; the catalog does not estimate unpublished dimensions or specifications.

Retailer coverage is tracked in `research/retailer-coverage.json`. A retailer is considered complete only when every in-scope sellable SKU or variant has an explicit outcome.

Generated SVG thumbnails are dimensional schematics, not product photography.

## Development

No production build step or runtime backend is required.

Start a local server:

```sh
npm run serve
```

Then open `http://localhost:4173`.

Run validation and unit tests:

```sh
npm run check
```

Run the browser smoke test:

```sh
python3 tests/browser_test.py
```

## Repository structure

- `app.js`, `src/` — search, fit, packing, and UI logic
- `data/` — catalog manifest, schema, product shards, and retailer offers
- `research/` — coverage tracking and mining checkpoints
- `tests/` — unit and browser tests
- `assets/` — static site assets and generated thumbnails

## Deployment

The site is published to GitHub Pages from the `gh-pages` branch. The deployable site is plain static content; GitHub Actions are not required.

See `AGENTS.md` for catalog research, validation, and implementation rules. See `HANDOFF.md` for current architecture and project status.
