# Version 4.18 verification

## Gameplay

- 356 tests pass, including 17 additional tests/cases covering centre kick-offs for small and big poles, legal human kick-off ownership, timed physical keeper saves, player-triggered pressing, tackle ownership, CB/DM recovery and dynamic challenges, Ab3d3mu passing/interceptions/turnovers and friend-room seats.
- 51 application modules pass syntax and local import/asset checks.
- All 34 games remain in the catalogue, points registry and private-room choices. Ab3d3mu has 3–6 human seats, with no bot movement in friend rooms; the existing host simulation and bounded input validation are preserved.
- Three-player formation options remain 2–1 and 1–2. Central defensive roles appear from three outfield players; keepers are separate from the selected outfield count.

## Browser checks

- Rendered Ab3d3mu with the real rigged-player assets and saved its own 640×400 JPEG thumbnail.
- Desktop launch, game selection and a ground pass verified.
- 390×844 touch viewport: big-poles centre kick-off, Shoot/Pass/Save thumb-pad layout, pass release and contextual Press/Tackle labels verified.
- Mobile Ab3d3mu initially clipped passing options. Updated its camera to frame the whole group, then confirmed all six players are visible with the thumb pad clear of the arena. Projection regression test covers six viewport sizes.
- These are browser-emulation checks, not physical-device performance benchmarks. Local previews show offline points status because production CORS only permits the deployed origin.

## Security scope

Applied the OWASP security-check guidance to the new shared game registration and adapter paths: room membership/host-only frames and results, bounded movement/role metadata, parameterized score persistence, text rendering of player names and duplicate-award protections remain in place. No credentials, new permissions or new third-party endpoints are introduced. Live arena scores are host-reported, as labelled in the existing product; this release does not add an anti-cheat authority.

## Deployment

Production verification is recorded after deployment.
