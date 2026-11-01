# v4.23.0 — High Jump, Agawowa and launch autoplay

## Rules and implementation

The player supplied the names and neighbourhood rules on 1 November 2026. High Jump uses palm wood to set a bar for players to jump over. Agawowa uses arranged blocks with one inclined block for a run-up, airborne somersault and feet-first sand landing; the most beautiful style wins. The combined variant adds a bar to somersault over.

Original Three.js equipment includes palm uprights, a loose bar, stacked and inclined blocks, a textured sand landing patch and runway marks. Character poses rotate around the hips, with tuck, pike, layout and opening gestures. Collision checks test clearance at the bar plane; bad take-offs, body contact, insufficient rotation and non-feet landings earn zero. Landing timing rewards control. Three attempts, rising heights, named styles and numerical judging are explicitly digital presets. This is not a claim of universal traditional rules.

2–4 local participants alternate attempts, with computer opponents or pass-the-phone humans. Existing private-room infrastructure supports 2–8 humans, each completing three attempts while everyone watches. Room settings create one active jumper with no CPU; Agawowa friend rooms use the sand-landing preset. Existing actor-frame fields carry rotation and pose; no network schema change. Both IDs have bounded practice points and leaderboard access.

Launch music attempts Web Audio resume at boot, respects saved mute settings, and retries on the first tap/key. Autoplay rejection is handled without an unhandled promise or blocking the game. Browsers may still require a trusted interaction.

## Validation

- 397 tests pass; 57 application modules pass syntax/import/asset checks.
- Jump coverage: valid high-bar clearance, rising height, early take-off failure, controlled flip, failed landing, three styles, combined-bar failure/success, CPU turns, all local players receiving three attempts, timed landing scores, shared human controls and rotation snapshots, hip-pivot pose reset.
- Existing catalogue-wide tests cover both new games’ mobile controls, finite simulations, cloud points and room frame validation.
- Browser checks at 390×844 portrait and 844×390 landscape: setup selections, run-up, Jump switching to visible Tuck/Open/Land controls, sand/bar/block rendering and readable runway views. Instructions moved above the runway. The two card images are actual rendered scenes from the new modes.
- Fresh-launch autoplay was blocked in this browser; tapping the title started the music and the UI confirmed playback. Automated tests also cover permitted resume and blocked-then-permitted recovery without duplicate music.
- Actual physical phones and a multi-device remote friend session were not tested. Multiplayer uses the already-deployed shared-turn framework and its simulation/protocol tests.
- Scoped security review: no new permissions, secrets, dependencies, account endpoints or schema migrations. Existing Cloudflare authentication, input validation and bounded score handling apply. New UI strings use fixed local data/textContent.
