# Menu and counter selection, version 4.4 — 31 October 2026

## User-requested changes

- Counters setup selects 1–11 caps per player and saves the preference. Formations stay within the floor markings without starting overlaps; E cycles the selected count safely, including a one-cap match. Moving caps collide with stationary caps.
- Counters remains floor-based with paper goals. The separate floor control class and its instructions replace the board-control shortcut. Stale tabletop wording in source data is removed. A broad concrete surface avoids the visual appearance of a separate tabletop slab.
- Three portrait featured previews and three compact actions replace the six equally dominant tiles. Mobile featured cards use a swipe row with the compact choices below. The stretched card-category badge bug is removed. Controls, restrained borders, warm overlay and a facade-facing background camera follow the supplied reference’s hierarchy.
- Preview renders use portrait dimensions with a new cache revision, refreshed Counters floor view and deliberate football framing. The screenshot supplied by the user preceded v4.3 publication and showed the previous tabletop scene.
- Vercel configuration declares dist as the static output. Before this change, the existing public project served the game at /dist/index.html (HTTP200, matching title), while / returned NOT_FOUND. The existing Vercel/GitHub commit status confirms this repository is connected to the exact project named by the user.

## Validation

- npm run check: all 27 modules, HTML/assets/imports and the stylesheets pass.
- npm test: 102 tests pass, including all modes, 1–11 counter formations/selection/CPU simulation and cap collisions.
- Local HTTP preview returned200 and was opened in the desktop browser.
- git diff --check passed.

## Limits

Browser control remains disabled, so there is no fresh rendered visual/interactive browser QA or screenshot. CSS and scene changes are grounded in the user’s supplied screenshots and source analysis. The Vercel local auth file was empty; deployment uses the repository’s already-authorized Vercel Git integration, without changing project ownership or sharing. Deployment results are verified separately after push.
