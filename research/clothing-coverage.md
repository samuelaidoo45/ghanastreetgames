# Authored clothing coverage masks

`dist/assets/characters/athlete-body.glb` now includes `_CCZONE`, a FLOAT/SCALAR attribute containing integer bit flags on all 14517 body vertices. Transferred from the upstream CC0 `output/base_body.glb` into the lean animated body. All POSITION, NORMAL, TEXCOORD_0, JOINTS_0, WEIGHTS_0 and index buffers were verified byte-for-byte identical before transfer. No model shape, indices, rig, material or animation was changed.

Source: https://github.com/kblood/CharacterCreator/blob/master/output/clothing.json
Licence: https://github.com/kblood/CharacterCreator/blob/master/LICENSE-NOTES.md#generated-files-owner-decision-2026-10-03

Three.js GLTFLoader exposes the custom attribute as lowercase `geometry.getAttribute('_cczone')`. Apply only to the Body / base skin mesh. Official outfit mask: T-shirt hides `torso` = 8; shorts hide `shorts` = 256; shoes hide `feet` = 1. Their bitwise union is **265**.

For each indexed body triangle (a,b,c), remove it only when every vertex satisfies `(round(zone) & 265) !== 0`. Keep any triangle with an uncovered vertex to preserve collar, sleeve, shorts-hem and ankle transition edges. This removes **8500 of 26756 body triangles** for the complete outfit. Leave eyeballs, lashes, brows, teeth and tongue untouched. Clone the body's geometry before changing its index if other outfit variations share the source geometry. This mask is a static per-vertex coverage designation, so it follows skin deformation without arbitrary world-height thresholds.

Body bounds / garment fit are in neutral bind-pose metres, Y-up. The exact author-provided bitmask is preferable to guessed coordinate boxes. Only use the combined 265 mask once all three garments have loaded; keep the whole actor hidden until then. The full body asset is retained so other future outfits can use their own coverage combination.
