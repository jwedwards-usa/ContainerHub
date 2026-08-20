# ContainerHub implementation plan

## Current slice
1. Define one normalized product model with field provenance and nullable unknowns.
2. Ship a static client-side catalog with text, taxonomy, dimension, and shelf-fit search.
3. Support imperial/metric display without changing canonical data.
4. Link every seeded record to a specification source and a place to buy.
5. Use tiny generated dimensional thumbnails so every record has a low-bandwidth visual.
6. Keep research resumable with a checked-in checkpoint and validation tooling.
7. Verify data invariants with Node tests and UI behavior with Playwright against a local HTTP server.

## Next mining wave
Expand manufacturer and retailer coverage, capture product photography where reuse is permitted, add field-level evidence URLs where source pages split details, and refresh records older than the configured review window.
