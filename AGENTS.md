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
- Record `verified_at` whenever a source is checked.
- Dimensions must say whether they are external or internal. Preserve source semantics such as "interior at bottom" in `notes`.
- Prefer manufacturer specifications, then established retailers with manufacturer SKU matching.
- Every non-obvious field should be supportable by `sources` or the record's specification source.
- Re-check purchase links and high-change fields before merging refreshed data.
- Do not invent values to complete a record. Nullable fields are intentional.

## Research checkpoints
- Work is chunked in `research/checkpoint.json` so mining can stop and resume.
- Update `cursor`, `completed_sources`, and `updated_at` after each source batch.
- Refresh stale records in batches; do not rewrite verified fields unless the newer source is stronger.
- Seed wave 1 covers Sterilite, IRIS USA, Akro-Mils, and Rubbermaid Commercial. The checkpoint lists the next manufacturers to mine.

## Fit/search behavior
- A shelf fit is based on external dimensions.
- Rotation on the base is allowed by default; tipping onto a side is opt-in.
- Rank fit results by count first, then space utilization. Do not replace this with a per-dimension boolean check.
- Text search should cover brand, model/SKU, material, category, color, closure, and notes.
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
Read `HANDOFF.md` before starting a new implementation or research session. Update it when architecture, deployment constraints, testing workarounds, or research priorities materially change.
