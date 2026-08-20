# Akro-Mils KeepBox — 2026-08-20

Current Akro-Mils KeepBoxes have two physical sizes: 66486CLDBL (12 gal, clear body/blue lid) and 66497CLDGN (marketed as 18 gal, clear body/green lid). The 66486FILEB hanging-file configuration uses the same 12 gal KeepBox geometry with two steel file rails, so it should be represented as an additional offer on the 66486 physical product rather than a duplicate container.

Primary manufacturer sources:
- https://akro-mils.com/products/containers-totes-and-tubs/keepboxes-and-tubs/
- https://akro-mils.com/product/keepbox-attached-lid-container-66486/
- https://akro-mils.com/product/keepbox-attached-lid-container-66497/
- https://akro-mils.com/download/akro-mils-full-line-catalog/?tmstv=1768843399

Purchase verification:
- 66486CLDBL: https://www.grainger.com/product/AKRO-MILS-Attached-Lid-Tote-12-gal-8YVJ5
- 66486FILEB: https://www.grainger.com/product/AKRO-MILS-Attached-Lid-Tote-12-gal-21R451
- 66497CLDGN: https://hosewarehouse.com/products/66497cldgn-by-akro-mils

Data decisions:
- Use Akro-Mils bottom interior length/width plus published inside height for conservative fit dimensions.
- Keep liquid capability null; secure/dust-free storage is not a liquid-containment rating.
- Store published contents capacity in `max_load_g`, not stack capacity.
- The current 66497 product page calls the product 18 gallons while the current full-line table lists 17 gallons. Preserve the marketed 18-gallon nominal value in `capacity_ml` and retain the conflict in notes.
- Keep tare weight null because no single-container empty weight was verified from the manufacturer sources.
