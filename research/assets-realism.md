# Realistic asset acquisition and integration notes

Checked 31 October 2026. Primary licence pages were inspected before acquisition. All media below is CC0. Local paths are relative to `dist/assets`. Runtime files are locally vendored; the game does not depend on third-party asset requests. The readable credit record is `dist/assets/CREDITS.txt`.

## Rigged character set

| Runtime file | Bytes | Triangles |
|---|---:|---:|
| characters/athlete-body.glb | 3441640 | 36,924 |
| characters/athlete-shirt.glb | 126,772 | 1,528 |
| characters/athlete-shorts.glb | 107,308 | 862 |
| characters/athlete-shoes.glb | 410,576 | 3,320 |
| characters/athlete-hair.glb | 975,844 | 1,050 |
| characters/athlete-afro.glb | 1,718,940 | 2,192 |

Source: [CharacterCreator generated output](https://github.com/kblood/CharacterCreator/tree/master/output), made from MakeHuman system assets. The [generated-file licence](https://github.com/kblood/CharacterCreator/blob/master/LICENSE-NOTES.md#generated-files-owner-decision-2026-10-03) explicitly releases body, clothing, hair and animation output under CC0. Its generator/runtime code is GPL and has not been copied.

The lean derivatives remove 92 customization morph targets per mesh and repack the referenced buffer views. They preserve the neutral rest shape, skin weights, joint order, normals, UVs, textures and animation tracks. Upstream originals are archived under `research/asset-sources/characters`, outside deployment output. GLB lengths, buffer ranges and accessor references were validated after repacking. No code from the generator is needed at runtime.

Measured base rest-pose height: 1.659431 m; Y-up, soles at zero, face toward +Z. All pieces have identity Armature root and identical 53-joint skeleton ordering. Use SkeletonUtils.clone for each character. Bind each garment and hair SkinnedMesh to the cloned body skeleton with matching bind matrices, then discard its redundant armature. Load and assemble shirt, shorts and shoes before making the character visible.

Useful named joints: `Root`, `pelvis`, `spine_01`, `spine_02`, `spine_03`, `clavicle_l/r`, `upperarm_l/r`, `lowerarm_l/r`, `hand_l/r`, `neck_01`, `head`, `thigh_l/r`, `calf_l/r`, `foot_l/r`, `ball_l/r`, plus finger joints.

Materials: `Skin`, `Eyebrow`, `Eyelash`, `Eye`, `Iris`, `Cornea`, `Teeth`, `Tongue`, `Cloth_tshirt`, `Cloth_shorts`, `Cloth_shoes`, `Hair_short04`, `Hair_afro01`. Skin texture is grey-normalized for tinting. Use per-character cloned materials for skin and kit tint, while sharing geometry and texture maps. Body/garment intersections need a covered-skin mask or careful mesh filtering in the game implementation.

Embedded clips: `idle`, `idle_breathe`, `idle_fidget`, `idle_look`, `walk`, `walk_back`, `run`, `strafe_left`, `strafe_right`, `jump`, `fall`, `land`. Each has 22 quaternion channels and one Root translation channel. Locomotion is in place: run Z is exactly zero, X sways only ±0.0096 m; walk Z zero, X ±0.0200 m; strafe X ±0.0141 m, Z zero. Root Y supplies foot-placement bobbing. Jump and land include vertical movement and less than 0.079 m of local Z offset; avoid double-applying a full physics jump displacement.

## Photographic PBR materials

Each prefix has `_color.jpg`, `_normal.jpg` (OpenGL) and `_roughness.jpg`, all 1024×1024. The complete set is approximately 6 MB. Use SRGB only for color maps; normal/roughness are non-color. Repeat to physical dimensions and use anisotropic filtering.

| Prefix | Physical tile width | Primary source / creator |
|---|---:|---|
| textures/dry_ground_01 | 4 m | [Rob Tuytel / Poly Haven](https://polyhaven.com/a/dry_ground_01) |
| textures/plastered_wall_02 | 2.23 m | [Charlotte Baglioni / Poly Haven](https://polyhaven.com/a/plastered_wall_02) |
| textures/corrugated_iron_02 | 2.7 m | [Jenelle van Heerden and Sergej Majboroda / Poly Haven](https://polyhaven.com/a/corrugated_iron_02) |
| textures/wood_planks | 1.5 m | [Amal Kumar / Poly Haven](https://polyhaven.com/a/wood_planks) |

[Poly Haven's asset licence is CC0](https://polyhaven.com/license). These surfaces are generic reusable materials; they are not presented as location scans of Ghana.

`lighting/daylight.hdr` is the 1K, 1,435,119-byte [Kloofendal 48d Partly Cloudy Pure Sky](https://polyhaven.com/a/kloofendal_48d_partly_cloudy_puresky) by Greg Zaal and Jarod Guest, CC0. Use RGBELoader, equirectangular mapping and PMREM for natural PBR lighting. The original capture is not Ghana; only its sky lighting is reused.

## Recorded and foley audio

- `audio/football-kick.mp3`: real 0.738-second soccer-ball impact, [bittermelonheart](https://freesound.org/people/bittermelonheart/sounds/555042/), CC0.
- `audio/footstep-dirt-{1,2,3}.mp3`: three different 0.45-second excerpts from [BenDrain's gravel footsteps](https://freesound.org/people/BenDrain/sounds/488075/), CC0, mono 96 kb/s with short fades.
- `audio/handclap.mp3`: [bastianpusch HandClap10](https://freesound.org/people/bastianpusch/sounds/493712/), 0.488 seconds, CC0. This is a synchronized group handclap, not a Ghanaian song.
- `audio/whistle.mp3`: [Rosa-Orenes256 referee whistle](https://freesound.org/people/Rosa-Orenes256/sounds/538422/), 0.535 seconds, CC0.
- `audio/applause.mp3`: [Dorian CLAIR / LaSonotheque](https://lasonotheque.org/applaudissements-1-s2363.html), 7.25 seconds, CC0; a small-audience recorded applause.
- `audio/outdoor-ambience.ogg`: [Kresiek The Furry / OpenGameArt](https://opengameart.org/content/amb-outside-1), 29.87 seconds, CC0, generic outdoor ambience. No Ghana-specific recording claim.
- Four short surface footsteps and three physical impacts are from [Kenney Impact Sounds](https://kenney.nl/assets/impact-sounds), CC0. Publisher download returned 403; the original samples were retrieved through [the CC0 mirror](https://github.com/GeorgeQLe/assets-sfx-combat). Exact names are in CREDITS.txt.

Freesound HQ preview MP3s were used where original WAV downloads require login. Audio file headers and durations were checked with ffprobe. Playback gain, distance attenuation and randomized pitch/clip choice are integration tasks. Do not label generic recordings as authentic Ghana field recordings. No traditional chants or spoken Ghanaian calls have been fabricated or sourced here.

## Media and scope

A WebM replay captured from the actual Three.js renderer is preferable to stock-video gameplay: it can show the user's own match and keep the video geographically and mechanically consistent. No proprietary Four Corners media, commercial music, celebrity likenesses or licensed-brand uniforms were acquired. Visual gameplay and balance remain implementation and browser-QA responsibilities.


## Ground refinement: compact red earth

Added Poly Haven **Red Dirt Mud 01**, Rob Tuytel, CC0: https://polyhaven.com/a/red_dirt_mud_01 ; licence https://polyhaven.com/license . Visually compared the primary previews against Park Dirt and Brown Mud Dry. The red earth has fine gravel and compact patches, without the large drought cracks of Dry Ground 01. Park Dirt contains conspicuous leaf litter; Brown Mud Dry is more cloddy. Original Dry Ground maps are retained for comparison.

New 1024-square files:
- `assets/textures/red_dirt_mud_01_color.jpg` (935891 bytes), sRGB.
- `assets/textures/red_dirt_mud_01_normal.jpg` (1136486 bytes), OpenGL normal, linear.
- `assets/textures/red_dirt_mud_01_roughness.jpg` (671715 bytes), linear.

The source tile is **1.5 m wide**. Match UV scale to that physical width: a 180 m plane needs about 120 repeats per side. Using nine repeats would enlarge the gravel into implausibly large rocks. A restrained normal scale around 0.25–0.35 and high dry roughness are suggested art-direction starting values, not source metadata. The texture is generic earth, not a Ghanaian site scan.


## Clothing clipping: exact authored coverage

The lean animated body now includes the original generated `_CCZONE` body coverage mask, transferred from the position/index-identical nonanimated base body. See `clothing-coverage.md` for the exact outfit mask and triangle filtering rule. This allows precise garment-covered skin removal instead of coordinate-based cuts.
