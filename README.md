# Ghana Street Games — 3D Arcade

A fullscreen Three.js arcade with 33 playable interpretations of Ghanaian street and childhood games. Its textured compound, rigged human players, natural sky lighting, gold lettering, woven trim and parchment menus take visual direction from Four Corners GH. No original Four Corners code, models or artwork are included.

## Run and verify

```sh
npm ci
npm run vendor
npm run dev
```

Open http://localhost:4173 . `npm run check` validates module syntax; `npm test` exercises the rules engines and every 3D mode without WebGL. Current expansion verification is recorded in `research/verification-expansion.md`. Earlier browser QA applies only to the preceding builds in `research/verification-realism.md` and `research/verification-3d.md`.

The runtime and fonts are vendored in `dist`; the hosted game requires no external runtime downloads. Their upstream licences are included. Serving `dist` directly needs no build step.

## Play

- Move with WASD, arrow keys, the touch joystick, or a point on the ground. Use the labelled action buttons or their keyboard shortcuts. Escape pauses. The camera button changes view.
- Football: a two-minute match with 1–7 players per side and selectable small/big goals with acceleration, sprint stamina, charged shots, tackling, directional passing, player switching, team AI, pitch radar and a player-following camera.
- Oware, Ghana-inspired 10×10 Dame, Ludo and Counters ball: CPU or local two-player games on correctly scaled physical 3D boards. Dame includes mandatory/backward captures, flying kings, captured-piece blocking during chained jumps and end-of-turn crowning. Variant conventions are stated in Rules & stories.
- Four Corners has four defended corner goals and alternating touches. Penalties alternates striking/keeping. One Pole scores actual pole collisions. Laski lets the scorer select the eliminated rival and the winner select their next role.
- Pampanaa/Shooting is a neighbourhood free-for-all with sightlines blocked by buildings, mouth calls, and one-hit elimination. Tyre — rubber-band target is separate from tyre rolling.
- Pilolo uses fourteen concealed-object hiding places throughout the neighbourhood and competing seekers who route around buildings; Stay uses planted-foot kick/header returns; Tumatu follows an out-and-back hop route; Alikoto and Kpitinge score actual landings; Pempenaa tracks individual legs; Mbobagor gives every player a stone; Chempε alternates food-holder and claimant roles.
- Pause → Watch replay plays and saves actual gameplay as WebM where supported, with an MP4 fallback. Recordings stay on the device, contain the 3D canvas and game audio, and are bounded to five minutes per clip. Viewing a replay finalizes that segment; resuming starts a new segment. The HUD is not part of the recording.
- The other games use character movement, hiding/searching, chase-and-rescue, jumping, timing, spinning, throwing, recall and role-play mechanics. Each has a setup screen with its digital rules.
- Settings include four shirt colours, recorded sound effects, CPU/local board opponents, football difficulty and lower graphics quality. Settings remain in this browser. No online multiplayer or accounts.

## Cultural accuracy and scope

This is a growing collection of 33 games, not an exhaustive census of every Ghanaian children's game. Digital scoring, timers and several mechanics are original arcade adaptations. Research sources remain accessible in Rules & stories.

Traditional **Sulia for Beatings** rules could not be verified; its keep-away mode is explicitly labelled experimental. **Shooting/Pampanana**, One Pole, Laski and the rubber-band Tyre variant follow the local rules supplied by the user; published corroboration and selected digital presets are distinguished in the rules. No corporal punishments are implemented. Sources document remembered and present-day practices; they do not establish nationwide current participation.

REA was attempted against the reference's public bundle in the initial investigation. Its macOS ownership helper failed to compile with a SwiftBridging duplication error. Partial evidence is retained in `research/reverse-engineering.md` and `research/rea-evidence.json`. The reference's visible live game and menus were inspected for this rebuild.

## Main source files

- `dist/arcade.js`, `index.html`, `arcade.css`: game shell, input, menus, audio and lifecycle.
- `dist/world.js`, `athletes.js`, `surfaces.js`: Three.js scene, licensed character assembly, PBR materials, lighting, cameras and picking.
- `dist/football.js`, `football-variants.js`, `neighbourhood-games.js`, `venues.js`, `traditional.js`, `modes.js`, `motion-modes.js`, `board-modes.js`: 33 game adaptations.
- `dist/audio.js`, `replay.js`: recorded soundscape and local gameplay video.
- `dist/assets/CREDITS.txt`: media attribution and licence provenance.
- `dist/board-rules.js`, `oware.js`: pure board rules.
- `dist/catalogue.js`, `data.js`: research and mode metadata.
- `tests/`: rules and simulation checks.
- `.openai/hosting.json`: private Sites identity for the current connected account.

Previous saved notes/favourites are left untouched in local storage. The 2D prototype source remains in Git history; its web-page interface has been replaced.

## Asset scope

Menu music uses Michał Jałochowski’s licensed instrumental “The Soul is a Pulse” (CC BY 3.0). Ghana street and crowd atmosphere uses attributed GESMA recordings from Ayeduase and Kejetia (CC BY 4.0). The launch screen unlocks music on the first tap; music, venue ambience and effects have separate saved volume sliders. Hidden tabs are silent. See `research/verification-sound-style.md` for this release’s checks and limitations.

The CC0 character output is derived from CharacterCreator/MakeHuman, with the author’s clothing coverage mask, fitted shirt/shorts/shoes, two hairstyles and embedded locomotion. No GPL generator/runtime code was copied. Poly Haven supplies photographic PBR maps and HDR sky lighting; Freesound, LaSonotheque, OpenGameArt and Kenney supply credited recordings. These are generic licensed materials and recordings, not Ghana location scans or authenticated traditional chants. See `research/assets-realism.md` and the two new rules research reports for provenance.

This is an independent browser arcade, not EA Sports production quality or a replica of proprietary Four Corners assets. It has no motion capture, online multiplayer, commentary system, full-body collision solver or per-game studio animation set. Some rules are explicit digital presets: Tumatu begins with a marker already placed, Dame uses a declared one-piece-loss rule with conflicting source conventions, and Four Corners uses finite knockout rounds instead of a queue of replacement players.

Scene thumbnails render from the actual 3D scenes on first load of this release, then stay in a local IndexedDB cache. The cache contains only scene JPEGs. Local `?generate-previews` remains available for manual asset authoring. No screenshots from the preceding release should be mistaken for validation of this expansion.

The expanded project is independent of the previous account's hosted site. The user authorized use of the currently connected account; `.openai/hosting.json` holds its newly registered identity.
