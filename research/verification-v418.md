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

- Gameplay release commit: `c6940f5`. Vercel reported a successful production deployment. All 17 changed/new deployed assets matched local SHA-256 hashes.
- Cloudflare Worker version: `18e3bf48-8b80-4f6d-9eb1-afdb54dca7b3`. A read-only fetch of `/leaderboard?game=abedemu` returned HTTP 200 with an entries array.
- Production browser showed the 34-game catalogue, Ab3d3mu card, updated kick-off/save instructions and CB/DM formation explanation.
- The automatic approval review rejected a proposed test that would create temporary production players because its cleanup was not part of the same operation. No such test records were created. Private-room behavior and score persistence were verified locally; live checks remained read-only.
- Proof image: `../gameplay-v418/live-football-setup.png`.
