# Ghana Street Games — 3D Arcade

A fullscreen Three.js arcade with 34 playable interpretations of Ghanaian street and childhood games. Its textured compound, rigged human players, natural sky lighting, gold lettering, woven trim and parchment menus take visual direction from Four Corners GH. No proprietary Four Corners code, custom models or artwork are included. The three football modes use independently converted Gameplay Football assets from the same licensed upstream family identified in the reference.

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
- Settings include four shirt colours, CC0 menu music and softer recorded claps, CPU/local board opponents, football difficulty and lower graphics quality. Settings remain in this browser. Private friend rooms and persistent points are available through Friends & Scores.

## Cultural accuracy and scope

This is a growing collection of 34 games, not an exhaustive census of every Ghanaian children's game. Digital scoring, timers and several mechanics are original arcade adaptations. Research sources remain accessible in Rules & stories.

**Sulia for Beatings** now follows the nutmeg-and-score rule supplied by the user. The ball must cross between a rival’s legs; the nutmegged player receives a brief non-graphic chase-and-tag reaction. The five-player, five-point/two-minute preset is a digital adaptation. **Shooting/Pampanana**, One Pole, Laski and the rubber-band Tyre variant follow the local rules supplied by the user; published corroboration and selected digital presets are distinguished in the rules.  Sources document remembered and present-day practices; they do not establish nationwide current participation.

REA was attempted against the reference's public bundle in the initial investigation. Its macOS ownership helper failed to compile with a SwiftBridging duplication error. Partial evidence is retained in `research/reverse-engineering.md` and `research/rea-evidence.json`. The reference's visible live game and menus were inspected for this rebuild.

## Main source files

- `dist/arcade.js`, `index.html`, `arcade.css`: game shell, input, menus, audio and lifecycle.
- `dist/world.js`, `athletes.js`, `surfaces.js`: Three.js scene, licensed character assembly, PBR materials, lighting, cameras and picking.
- `dist/goal-markers.js`, `counter-assets.js`, `venue-details.js`: original street equipment and detailed neighbourhood geometry.
- `dist/sulia.js`: geometric nutmeg scoring and chase/restart phases.
- `dist/football-assets.js`, `football-physics.js`: reusable upstream goal/ball/surface assets, continuous frame collisions, shootout rules and ball-aware cameras.
- `dist/stay.js`, `football.js`, `football-variants.js`, `neighbourhood-games.js`, `venues.js`, `traditional.js`, `modes.js`, `motion-modes.js`, `board-modes.js`: 34 game adaptations.
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

### Version 4.9.2 — compact mobile controls

Camera, zoom and fullscreen controls now sit inside one collapsible View menu. Game surfaces suppress accidental long-press text selection and Copy/Select All callouts, while search fields remain editable. See `research/verification-v492.md`.

### Version 4.10 — active Sulia and Laski football

Sulia and Laski now use visible rolling dribbles, one main challenger, off-ball spacing and recovery intervals between possession changes. Laski attackers advance and shoot into space; Sulia carriers approach and attempt nutmegs. Existing elimination and chase/tag rules remain. Keeper hands use blended reaches fitted to the character's arm lengths, and moving keepers use lateral shuffle animations. See `research/verification-v410.md` for the 168-test validation and visual-testing limits.

### Version 4.11 — live Laski rallies and fluid football positioning

Laski continues beyond the chalk lines: human and CPU players can retrieve missed shots and keep attacking, with the distant compound edge keeping balls reachable. Formations now provide recovery positions while players make attacking runs, mark opponents, support passes and challenge nearby carriers. Uncontrolled attackers on both teams can dribble, pass and shoot. Three-player Balanced uses 2–1 and Attacking uses 1–2; 1–1–1 is removed. Verification is recorded in `research/verification-v411.md`.

### Version 4.12 — six playground games

Stay uses a spread-out street court, individual roaming/dodging and one nearby loose-ball challenger. Body separation includes boundaries in Stay and Sulia; Sulia’s tag phase no longer sends every player into the same point. Stay’s glancing rebounds use impact direction rather than automatically returning toward the thrower. Chaskele adds physical tyre-entry scoring and can retrieval, Tumatu adds a landing preview and return-trip marker pickup, Counters Ball adds momentum-sharing cap collisions and touchline restarts, and Antoakyire adds cloth pickup and runner/seat exchanges. Details, sources and 209 passing tests are recorded in `research/verification-v412.md`.

### Version 4.13 — mobile play across all 33 games

Phone controls now use a compact two-thumb layout. Pushing the movement stick to its outer ring sprints, while aiming controls never trigger sprint. Settings can restore a separate Sprint button or put actions on the left. Football keeps Shoot, Pass and Switch beside a More button for Low shot and Chip. Timing actions respond on contact; charged actions preserve hold/release behavior and cancel safely on pause, rotation or lost touch capture.

Phone setup instructions cover every game. Small pieces get a 24 CSS-pixel near-touch selection allowance, keeping direct hits and mouse precision unchanged. Equipment and action cameras fit between the measured HUD and controls in portrait and landscape; zoom and alternate views remain available. The phone catalogue uses two columns.

The 3D engine loads only after Play, with loading progress. Menus, paused games and hidden tabs do not schedule continuous render frames. Phone graphics use the smaller existing assets, a pixel budget and sustained-load resolution adjustment. Physics retains 60 Hz substeps while character skeletons update once per displayed frame; the hidden phone radar is not drawn. Identical sounds share decoded audio buffers and compressed copies are released. Validation and remaining device checks: `research/verification-v413.md`.

## Private friend rooms and saved progress (4.15)

All 34 games have private rooms and completion points. A player profile is created automatically on the first round. Open **Play with friends** to rename it, save the private recovery key, create a room, or join with an eight-character code. The host starts after the game's minimum human count joins. No computer opponents fill vacant seats.

Football, chase and group games share one live simulation. Counters Ball, One Pole and other alternating games share the same match. Individual skill games (including Tumatu, Alikoto, Kpitinge, Numbers, Skipping, Zanzama, Tyre and pretend play) give each friend a live turn while everyone watches the shared arena. Turn rounds last at most 90 seconds. Street football requires equal teams; four or more friends include human keepers. Four Corners requires four friends.

Practice rounds earn 10–50 XP. Completed friend matches earn 100 for a win, 50 for a draw and 25 for participating in a loss. Points and per-game leaderboards persist in Cloudflare D1. Offline rounds keep device-local XP; interrupted cloud saves retry when the connection returns. Device-only offline points do not appear on the cloud leaderboard. Save a recovery key to use cloud progress on another device.

Ampe and board moves are server-authoritative. Other live arenas use a human host's existing 3D simulation, with authenticated inputs, bounded scene deltas, and durable, idempotent awards through Cloudflare Workers + Durable Objects. Their results are host-reported, not independently verified competitive results. Keep the host's tab open; reloading the host ends the round. Guest connections can rejoin the current scene. No Cloudflare credentials are shipped to the client.

See [research/multiplayer-v415.md](research/multiplayer-v415.md) for verification and limits.

## Celebration audio (4.15.1)

Goals, points and victories now use original short reward cues instead of applause/clap recordings: football fanfares, wooden notes for floor/board and precision games, percussion for rhythm games, and rising notes for search/chase games. Round victories have their own event. A new reward fades the previous one to prevent stacked celebrations. Ampe clapping and other actual rhythm/palm actions retain their physical sound. Music and background ambience are unchanged. Rebuild the six compact mono MP3 cues with `python3 scripts/build-reward-audio.py` (FFmpeg required).


## 4.16.0 — Four Corners gameplay and mobile action pad

Four Corners now has shared possession for all four players, rolling dribble touches, smooth acceleration and turns, limited sprint energy, timed tackles, a short dodge with recovery, placed shots and visible goal targeting. One opponent contests a loose ball while others defend their sides; a carrier looks for an exposed goal and carries into a shooting lane. Fast shots can deflect off bodies, rather than being caught automatically. One-touch rules, side goals, configurable lives and private human rooms remain supported.

The action buttons across all 33 games use a thumb pad with an emphasized primary action, local SVG icons, concise labels and secondary actions in More where needed. Timing and board choices stay equally prominent. Quick taps use the game's default strike; holds retain power control, shown around the pressed button. The movement joystick is unchanged. The pad respects the existing left-handed setting, safe areas, pause cancellation and multi-touch ownership.

Verification: `npm test` and `npm run check`; actual scene simulations at 30/60/120 Hz, four human seats, all-game action reachability, touch-handler integration and cancellation tests. Browser control was disabled during this release, so these checks do not constitute visual or physical-phone testing.

## 4.17.0 — Venue and player art pass

Afternoon lighting, contact shadows, worn sand/concrete/grass surfaces, painted court shoulders, street stalls, planters, tyres and segmented compound walls give venues more depth. School and veranda blocks now have repeated door/window bays; neighbourhood trees use individual leaves. Players have broader silhouettes, garment-following chest stripes, revised skin/fabric materials and varied footwear. All 33 menu previews now show their own current game scene.

Static textured architecture is batched by material and source texture, with UV repeats baked into vertices. Low graphics keeps its reduced asset downloads and avoids shadow maps/postprocessing; a single baked building-shadow layer and small shared player shadows provide grounding. Original surface detail is generated locally using cached 512px textures, without additional downloads.

Verification: 339 tests, 50 module checks, browser rendering of 33 games plus three surface variants at both high and low quality, and desktop/390px touch-viewport visual checks. Browser emulation is not a physical-phone frame-rate benchmark. Reproduce the scene sweep by temporarily copying `research/graphics-review-v417.html` to `dist/_graphics-review.html`, running the local server and clicking Render; remove that local QA page before deployment.

## 4.18.0 — Central roles, kick-offs and Ab3d3mu

Street football now has explicit centre-back and defensive-midfielder roles from three outfield players, with central cover, support runs, pressing and recovery. Three-player presets remain 2–1 / 1–2. Both small and big poles begin at the centre spot and the conceding team restarts there after a goal. The ball waits for a legal kick-off instead of starting in a defender’s possession away from centre.

Press **E** without possession to close down and challenge; steering overrides the assist. **Space** tackles with a cooldown and facing check. Big-poles **G / Save** triggers a timed keeper dive with physical reach and recovery, not a guaranteed save. Save stays on the primary mobile pad; Switch, Low shot and Chip remain in More. Human keeper seats use G too.

**Ab3d3mu** adds passing around one middle defender, physical ground/lob passes, interceptions and role swaps. Space passes or tackles; E selects a teammate; Q calls for a pass or presses; R lobs. The two-minute scoring preset awards one point per completed pass and two for an interception. Private rooms support 3–6 real players with shared scores and persistent completion points. The group camera keeps passing options in view on portrait phones. These scoring, turnover and timer conventions are digital adaptations of the core rules supplied by the user.

Verification details: `research/verification-v418.md`.

## 4.19.0 — Ab3d3mu movement and pressure

The passing group now reshapes around the ball, using changing support lanes and give-and-go runs. Carriers dribble out of pressure; receivers move to meet passes. Acceleration, braking and turning replace instant movement changes.

The middle player can use **Q / Press** for a short pursuit that cuts passing lanes and predicts ball flight; steering overrides it, and **Space / Tackle** challenges nearby. Press has a brief recovery period. Nearby pressure reduces pass precision and can produce a heavy first touch, leaving a physical loose ball to win. Defenders retain real interception and tackling distances, and cannot steal remotely. Middle-player controls now show only Tackle, Press and Sprint.

Private-room participants retain full human control: no CPU support runs or automatic CPU passing are applied to their seats. See `research/verification-v419.md`.
