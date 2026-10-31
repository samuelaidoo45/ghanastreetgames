# Four Corners GH asset audit — 31 October 2026

Reference: https://fourcornersgh.com/ . Analysis uses the public production bundle already downloaded on this date. No live browser observation was available; browser control was disabled. No Four Corners application bundle or custom model data has been copied into runtime.

## What is reusable

The reference bundle explicitly names a `gfootball` asset family: grass.jpg, concrete.jpg, netting.png, goal.gltf.json, moves.gltf.json and moves-library.json. The independently published upstream Google Research Football repository contains the original Gameplay Football data used by this family. The engine subtree’s `LICENSE` is **Unlicense**, permitting copying, modification and redistribution. Its README identifies the original GameplayFootball repository, authored by Bastiaan Konings Schuiling. The Google repository root uses Apache 2.0 for its surrounding code; both notices are retained as evidence. No C++ runtime is integrated.

Primary sources:
- https://github.com/google-research/football/tree/master/third_party/gfootball_engine
- https://raw.githubusercontent.com/google-research/football/master/third_party/gfootball_engine/LICENSE
- https://raw.githubusercontent.com/google-research/football/master/third_party/gfootball_engine/README.md
- https://github.com/BazkieBumpercar/GameplayFootball

Independent conversions are in `research/asset-sources/reference/converted/`:

| File | Upstream original under `third_party/gfootball_engine/data/media/` | Conversion |
| --- | --- | --- |
| grass.jpg | textures/pitch/seamlessgrass08.bmp | JPEG encoding, same image |
| concrete.jpg | textures/concrete/concrete.wall01a.bmp | JPEG encoding, same image |
| concrete-normal.png | textures/concrete/concrete.wall01_normal.bmp | Lossless PNG |
| netting.png | textures/stadium/goalnetting.bmp | Lossless RGBA PNG, original transparency retained |
| goal.json | objects/stadiums/goals.ase | One goal extracted; duplicate reverse net surfaces omitted; coordinates centred and converted from Z-up to Y-up; mesh normals independently computed |
| ball.json | objects/balls/generic.ase | Radius normalized from 0.11 m to 1; Z-up to Y-up; smooth radial normals independently computed; original UVs retained |
| ball.png | objects/balls/ball.bmp | Lossless PNG, original image |

These are independently obtained originals, not the reference author's converted/customized JSON files. The upstream original ball texture is white with lime bands and “PROPERLY DECENT” lettering. It is not the traditional pentagon football; do not describe it as Four Corners’ exact ball skin. The parent may retain its own authored football skin if this original texture does not suit the game.

## Geometry integration

`goal.json` is 41.7 KB with five mesh parts: frame, net-left, net-right, net-top and net-back. Every part exposes flat arrays `positions`, `normals`, `uv`, `indices` and a bounding box. Canonical up is +Y, width is X, the opening faces +Z, and the net extends behind into -Z. The opening is 7.32 m × 2.44 m; frame outside dimensions are 7.52 × 2.54 m; net depth is 2.5503 m. Scale X by requested opening width / 7.32 and Y by requested opening height / 2.44. Scale Z separately to desired net depth. The source has two goals; only its negative-X goal is included.

Use `RepeatWrapping` for netting.png because its original UVs span multiple repeats. It is 32×32 RGBA: 961 pixels transparent and 63 opaque. Use transparent/alphaTest rendering and DoubleSide for nets. The goal frame has 28 triangles; net parts total 1,024 triangles. Reproducible converter: `convert-goal.py`.

`ball.json` is 8.6 KB, with 111 vertices including UV seams and 200 triangles. Canonical radius 1; scale uniformly to desired ball radius (the original is 0.11 m). Reproducible converter: `convert-ball.py`.

## Character and animation findings

The reference’s default player URL is `models/player.gltf.json`; it also exposes many body variants under `models/<name>.gltf.json`, custom/title/celebration moves JSON and a baked crowd. Its body code mentions MakeHuman, but that does not establish a licence for the reference author’s custom exports or animations. The existing project already uses independently licensed MakeHuman-derived output.

Upstream Gameplay Football also includes segmented ASE player geometry and a custom hierarchy in `objects/players/player.object`, with CSV/quaternion `.anim` movement files. A sample fullbody mesh, hierarchy, idle/sprint/shot/save files are retained in research for compatibility analysis. They are not a drop-in replacement for the project’s current skinned GLB rig. The source animations encode named joint tracks, frame numbers and x/y/z/w quaternions, plus root position and ball-contact metadata; they require axis conversion, bind-pose mapping and retargeting before usable animation. No untested retargeting was silently integrated.

## Other third-party models in the reference

Its credits name these sources as CC BY 4.0:
- Generic passenger car pack — Comrade1280: https://sketchfab.com/3d-models/generic-passenger-car-pack-20f9af9b8a404d5cb022ac6fe87f21f5
- Low Poly Cars Pack — matisosanimation: https://sketchfab.com/3d-models/low-poly-cars-pack-1d942e1a2f564690a5d703fdc08657b3
- Low-poly Goat — Zafflex: https://sketchfab.com/3d-models/low-poly-goat-e08bb2e734004870b1ed4c21f111a854
- Soccer Jersey Patterns 3D — Wearable3D: https://sketchfab.com/3d-models/soccer-jersey-patterns-3d-26776f9a01eb4ac0a8a73acaeca45fcf
- Football Jersey Style Design — Wearable3D: https://sketchfab.com/3d-models/football-jersey-style-design-d00dffa54c5b49b2941e0a34995f914e
- Soccer Shoe Collection 2 — FredPW: https://sketchfab.com/3d-models/soccer-shoe-collection-2-302a3faa8e5a4fd8a6e782e567ae08ab

Search-indexed primary Sketchfab pages independently confirm CC Attribution on the jersey and shoe collections. Direct page fetches returned403 and no authorized model download was completed. Consequently these assets were not silently ripped from Sketchfab’s viewer. They remain potential future imports from their licensed upstream originals.

The soundtrack and GESMA environmental audio already integrated in v4.1 come from the same credited upstream sources; their separate CC BY evidence remains in `menu-audio-research.md`.

## What is not licensed for wholesale cloning

The public application bundle starts with the author’s 2026 copyright notice and **All rights reserved**, and points to LICENSE / third-party-licenses.txt. Attempts to fetch those two notices from the public origin returned403. The third-party credits do not grant a licence to the entire application, custom player exports, authored scenes, maps, UI artwork, scene thumbnails, conversion code, backend, multiplayer or game-specific animations. A claim that the whole app is open source would be unsupported. If the user provides rights/permission for those original assets, that is a separate authorization question; the upstream materials above are independently reusable now.

## Validation

Both geometry conversions contain finite arrays, valid index bounds and corresponding normals/UV lengths. All images converted with FFmpeg from the official upstream BMPs. Original source files, upstream tree inventory, both licence notices, converter scripts and an SHA-256 inventory are retained beside this report. Browser-rendered mesh orientation and appearance require parent integration QA; no screenshot or exact visual identity claim is made here.
