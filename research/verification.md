# Verification — 31 October 2026

- Syntax checks passed for application, game modules and catalogue.
- Seven Node tests passed: Oware opening sow, feeding, grand-slam cancellation, capture, origin skipping, 100 seeded full games with 48-seed conservation, and catalogue/source consistency.
- Browser tested at 1280×850 and 390×844, plus the native narrow Codex panel viewport. Desktop hero, mobile detail dialog and mobile Oware board inspected visually.
- All nine playable games launched in the browser. Ampe, Pilolo, Chaskele and Counters ball completed full rounds. Oware turn/seed changes, Stay early response, Alikoto scoring, Tumatu wrong-input handling, and football controls were checked.
- Search found Sulia and displayed the unverified-rules note. Saved games persisted through reload. Removing the final saved game produced the intended empty state. Notes saved locally, showed the explicit no-submission message and could be deleted. QA notes and saves were removed.
- Browser console returned no warnings/errors during these checks.
- OWASP review: static application, no authentication/API/upload/backend surfaces, no runtime dependencies, no secrets in published files. Search and note text are written with textContent. Template HTML contains only authored catalogue data; stored notes are type-checked. External links use noopener and an explicit referrer policy. Hosting-level access and headers belong to Sites; this is not an independent infrastructure audit.
- Only dist is published; research reports and REA input evidence are source artifacts, not website assets.
- Limits: browser play is smoke-tested, not a comprehensive gameplay balance or accessibility certification. REA's deep parse failed due to the host Swift compiler, as documented separately.
