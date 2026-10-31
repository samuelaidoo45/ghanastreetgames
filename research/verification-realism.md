# Realism build verification — 31 October 2026

## Implemented and checked

- Three.js 0.187.0, self-hosted addons and fonts. All 28 playable catalogue entries load into the full-screen 3D game, expose actions, accept an action, pause and return to the library in the real browser. No console warnings or errors were reported during this 28-game pass.
- Dressed skinned GLB players use the authored body coverage mask, fitted clothing, two hair variants, embedded idle/run animation and additive game gestures. Screenshots confirm human proportions, seated Pempenaa participants, real-scale boards and stools, textured red earth, weathered buildings and sky lighting.
- Football keyboard movement and a charged shot were exercised. The HUD changed from Shoot/Pass to Tackle/Press after the shot. Player selection, stamina, power and pitch overview are rendered. The close camera and 390×844 phone controls were checked. The player meter was moved away from the clock; the near net no longer obscures the player when the camera is behind the goal.
- Oware CPU responded after a legal human move, then returned control to the player. The close board camera restored after toggling overview. Board texture clones now release their GPU resources when scenes/turns are replaced.
- A live replay played in the HTML video element with readyState 4 and no media error. Save clip downloaded a 2,406,006-byte WebM. ffprobe confirmed VP9 video at 390×844 and Opus audio. Decoded audio was non-silent (mean −35.1 dB, peak −7.7 dB). An earlier desktop replay played at 1920×1080. Recordings are device-local canvas/game-audio captures, with no microphone, camera or server upload.
- Normal startup uses 28 saved scene previews instead of instantiating and rendering every game. Local preview generation remains available for asset maintenance. One local module-loading stall cleared on reload; subsequent startup and gameplay completed normally.

## Automated checks

`npm run check`: all 16 application JavaScript modules passed syntax validation.

`node --test --test-reporter=dot tests/*.test.mjs`: all 54 tests passed. Coverage includes 28 scene simulations, finite transforms, control availability, football pass scoring, full Antoakyire chases, Stay's planted feet, physically reachable Kpitinge landings, Tumatu tap distance, Pilolo collection before a home win, Alasa sunk-seed-only scoring, open-ended role play, legal Oware CPU turns and 48-seed conservation, Dame capture blocking/deferred crowning, and Ludo entry/capture/home rules.

## Source and security review

Runtime media and scripts are self-hosted. The HTML CSP restricts scripts to this origin, permits blob URLs for embedded GLB images and local replay media, and disables objects and form submissions. Game metadata is rendered with textContent; empty innerHTML assignments only clear owned containers. Settings are validated against finite supported choices. There are no credentials, personal information, backend APIs, uploads or analytics in the runtime. Hosting identity and existing owner-private access are preserved. External research links use rel=noopener. Asset provenance is in assets/CREDITS.txt and research/assets-realism.md.

## Scope of verification

Browser checks used the desktop in-app browser at its default 1280×720 size and a temporary 390×844 viewport. This does not claim testing on physical Android/iPhone devices or all GPU/browser combinations. MP4 fallback exists but was not exercised; WebM was verified. No FPS benchmark or full match-balance study is claimed. Replays contain the 3D canvas, not DOM HUD overlays; clips are bounded to five minutes.

The result is a substantially improved browser arcade, not EA Sports production parity. Generic licensed assets are not presented as Ghana location scans or traditional field recordings. The catalogue retains explicit arcade/uncertain labels and declared house rules; it is not a definitive national census of childhood games. See rules-realism-active.md and rules-realism-compound.md for source-specific corrections and disagreements.
