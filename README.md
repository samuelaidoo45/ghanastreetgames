# Ghana Street Games — 3D Arcade

A fullscreen Three.js arcade with 33 playable interpretations of Ghanaian street and childhood games. Its textured compound, rigged human players, natural sky lighting, gold lettering, woven trim and parchment menus take visual direction from Four Corners GH. No proprietary Four Corners code, custom models or artwork are included. The three football modes use independently converted Gameplay Football assets from the same licensed upstream family identified in the reference.

## Run and verify

```sh
npm ci
npm run vendor
npm run dev
```

Open http://localhost:4173 . `npm run check` validates module syntax; `npm test` exercises the rules engines and every 3D mode without WebGL. Current menu/counter-count verification is recorded in `research/verification-menu-v44.md`; street-variant checks are in `research/verification-street-variants-v43.md`; earlier football reconstruction checks are in `research/verification-football-reference.md`; the earlier expansion is recorded in `research/verification-expansion.md`. Earlier browser QA applies only to the preceding builds in `research/verification-realism.md` and `research/verification-3d.md`.

The runtime and fonts are vendored in `dist`; the hosted game requires no external runtime downloads. Their upstream licences are included. Serving `dist` directly needs no build step.

## Play

- Move with WASD, arrow keys, the touch joystick, or a point on the ground. Use the labelled action buttons or their keyboard shortcuts. Escape pauses. The camera button changes view.
- Football: a two-minute match with 1–7 players per side and selectable small/big goals with acceleration, sprint stamina, charged shots, tackling, directional passing, player switching, team AI, pitch radar and a player-following camera.
- Oware, Ghana-inspired 10×10 Dame and Ludo: CPU or local two-player games on physical 3D boards. Counters Ball uses a concrete floor, folded-paper goals, Coke/Pepsi/water-bottle caps and a small paper ball. Setup selects 1–11 counters per player, with spaced formations and cap collisions. Dame includes mandatory/backward captures, flying kings, captured-piece blocking during chained jumps and end-of-turn crowning. Variant conventions are stated in Rules & stories.
- Four Corners places one goal at the midpoint of each side, with selectable 1/3/5 lives and dribbling or alternating touches. Football, Four Corners, penalties and Laski offer blocks, sticks, footwear or net goals; One Pole offers a single stick, block or shoe target per end. Penalties has timing/free-aim controls, a contact-timed run-up, keeper dives, attempt history and early-clinch scoring. One Pole has contact-timed run-ups, selectable starting positions, ball tracking and actual target collisions. Laski lets the scorer select the eliminated rival and the winner select their next role.
- Pampanaa/Shooting is a neighbourhood free-for-all with sightlines blocked by buildings, mouth calls, and one-hit elimination. Tyre — rubber-band target is separate from tyre rolling.
- Pilolo uses fourteen concealed-object hiding places throughout the neighbourhood and competing seekers who route around buildings; Stay uses eight players with hit-and-catch role transfers, loose-ball clearances and retrieval; Tumatu follows an out-and-back hop route; Alikoto and Kpitinge score actual landings; Pempenaa tracks individual legs; Mbobagor gives every player a stone; Chempε alternates food-holder and claimant roles.
- Pause → Watch replay plays and saves actual gameplay as WebM where supported, with an MP4 fallback. Recordings stay on the device, contain the 3D canvas and game audio, and are bounded to five minutes per clip. Viewing a replay finalizes that segment; resuming starts a new segment. The HUD is not part of the recording.
- The other games use character movement, hiding/searching, chase-and-rescue, jumping, timing, spinning, throwing, recall and role-play mechanics. Each has a setup screen with its digital rules.
- Settings include four shirt colours, CC0 menu music and softer recorded claps, CPU/local board opponents, football difficulty and lower graphics quality. Settings remain in this browser. No online multiplayer or accounts.

## Cultural accuracy and scope

This is a growing collection of 33 games, not an exhaustive census of every Ghanaian children's game. Digital scoring, timers and several mechanics are original arcade adaptations. Research sources remain accessible in Rules & stories.

**Sulia for Beatings** now follows the nutmeg-and-score rule supplied by the user. The ball must cross between a rival’s legs; the nutmegged player receives a brief non-graphic chase-and-tag reaction. The five-player, five-point/two-minute preset is a digital adaptation. **Shooting/Pampanana**, One Pole, Laski and the rubber-band Tyre variant follow the local rules supplied by the user; published corroboration and selected digital presets are distinguished in the rules.  Sources document remembered and present-day practices; they do not establish nationwide current participation.

REA was attempted against the reference's public bundle in the initial investigation. Its macOS ownership helper failed to compile with a SwiftBridging duplication error. Partial evidence is retained in `research/reverse-engineering.md` and `research/rea-evidence.json`. The reference's visible live game and menus were inspected for this rebuild.

## Main source files

- `dist/arcade.js`, `index.html`, `arcade.css`: game shell, input, menus, audio and lifecycle.
- `dist/world.js`, `athletes.js`, `surfaces.js`: Three.js scene, licensed character assembly, PBR materials, lighting, cameras and picking.
- `dist/goal-markers.js`, `counter-assets.js`, `venue-details.js`: original street equipment and detailed neighbourhood geometry.
- `dist/sulia.js`: geometric nutmeg scoring and chase/restart phases.
- `dist/football-assets.js`, `football-physics.js`: reusable upstream goal/ball/surface assets, continuous frame collisions, shootout rules and ball-aware cameras.
- `dist/stay.js`, `football.js`, `football-variants.js`, `neighbourhood-games.js`, `venues.js`, `traditional.js`, `modes.js`, `motion-modes.js`, `board-modes.js`: 33 game adaptations.
- `dist/audio.js`, `replay.js`: game-specific sound profiles and local gameplay video.
- `dist/assets/CREDITS.txt`: media attribution and licence provenance.
- `dist/board-rules.js`, `oware.js`: pure board rules.
- `dist/catalogue.js`, `data.js`: research and mode metadata.
- `tests/`: rules and simulation checks.
- `.openai/hosting.json`: private Sites identity for the current connected account.

Previous saved notes/favourites are left untouched in local storage. The 2D prototype source remains in Git history; its web-page interface has been replaced.

## Asset scope

The original CC0 African instrumental (`v43/menu-loop.mp3`) and street/crowd backgrounds remain. The separate continuous `outdoor-ambience.ogg` bed is excluded from preload and playback to remove the hissing layer. Game-specific cues reuse the existing licensed effects, and footsteps follow dirt/concrete/grass surfaces. Music, ambience and effects have separate saved sliders; hidden tabs are silent.

The CC0 character output is derived from CharacterCreator/MakeHuman, with the author’s clothing coverage mask, fitted shirt/shorts/shoes, two hairstyles and embedded locomotion. No GPL generator/runtime code was copied. Poly Haven supplies photographic PBR maps and HDR sky lighting; Freesound, LaSonotheque, OpenGameArt and Kenney supply credited recordings. These are generic licensed materials and recordings, not Ghana location scans or authenticated traditional chants. See `research/assets-realism.md` and the two new rules research reports for provenance.

This is an independent browser arcade, not EA Sports production quality or a replica of proprietary Four Corners assets. It has no motion capture, online multiplayer, commentary system, full-body collision solver or per-game studio animation set. Some rules are explicit digital presets: Tumatu begins with a marker already placed, Dame uses a declared one-piece-loss rule with conflicting source conventions, and Four Corners uses finite knockout rounds instead of a queue of replacement players. The rebuilt modes are not a byte-identical clone: the original networking, authored venues, custom models and studio animation catalogue are not included.

The menu uses shipped scene JPEGs immediately, with lazy loading, so starting the game does not require rendering all 33 previews. Manual preview authoring can still store scene JPEGs in IndexedDB. Local `?generate-previews` remains available for manual asset authoring. No screenshots from the preceding release should be mistaken for validation of this expansion.

The expanded project is independent of the previous account's hosted site. The user authorized use of the currently connected account; `.openai/hosting.json` holds its newly registered identity.
# ghanastreetgames


## Vercel

The existing GitHub integration deploys main to the Ghana Street Games Vercel project. `vercel.json` sets the framework to Other, runs `npm run check` and serves `dist` as the static output directory, so the game opens at `/`. Source files and research are outside that served directory. HTML, JavaScript and CSS revalidate on subsequent visits; preview images are also versioned in the browser cache.


Version 4.5 fixes miniature-game scale and camera framing, provides distinct sand-school / concrete-coastal / grass-park surroundings for every football venue choice, and replaces Stay with the user-specified neighbourhood rules. See `research/verification-v45.md`.

The menu follows the supplied two-column landscape-card design, with compact category badges and a single column on narrow phones. Character materials preserve glossy eyes, softer skin highlights and textured matte clothing; subtle build/height/skin/hair variation and grounded, smoothed gestures improve the existing licensed models.


### Version 4.6 — desktop shelf and venue rendering

Large desktop windows show two rows of games: 6, 8 or 10 cards according to available CSS width and height. The category row, page arrows and footer fit inside the viewport. Left/right arrows and Page Up/Down navigate the catalogue; window resizing keeps the current first game on the appropriate page. Smaller and short windows retain scrolling.

Concrete and grass courts now have a genuine opening in the surrounding terrain instead of several overlapping ground planes. School, coastal and park venues have additional architecture, verandas, planted edges, detailed trees and overhead wiring. Foliage remains instanced where possible. Football action labels use complete words. The original African music and Ghanaian street/crowd recordings are unchanged; the previously disabled continuous outdoor-noise layer remains disabled.


### Version 4.9 — keeper balance and clearer action cameras

Big-goal keepers have reaction delays, imperfect committed reads and bounded movement/reach. Soft reachable balls can be caught; hard shots produce playable parries. Human shots with no directional input aim away from the keeper, and directional aiming reaches the goal corners. Penalty keepers commit to a side instead of following the exact target; difficulty controls reads and reaction time.

Street football uses closer framing with an end-on portrait view. Four Corners shows all four side goals in landscape and follows the action in portrait. Laski, Stay and Sulia follow the player and ball in their default view, while alternate overview cameras remain available. Framing keeps space for HUD and controls and pulls back as the action separates. Penalties and One Pole avoid the extra portrait zoom-out. Rigged characters are taller and broader while preserving their animations and planted feet. No additional model or texture downloads were added. Verification: `research/verification-v49.md`.

### Version 4.9.1 — camera and input follow-up

Charged actions now retain one pointer or keyboard owner and cancel safely on interruption. Focused controls no longer also invoke global shooting shortcuts. Movement follows the displayed camera direction in alternate views. Sulia's overview stays selected, and portrait Pampanaa retains its wall-adjusted camera distance. All 157 automated checks pass; see `research/verification-v491.md` for validation limits.
