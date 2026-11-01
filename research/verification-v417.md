# Graphics verification — 4.17.0

Reference inspected in the browser: https://fourcornersgh.com/ . The comparison informed warm directional lighting, material separation, lived-in venue edges and more readable players. No reference code, models, textures or audio were imported.

## Changes
- Original cached court art: faded paint, scuffs, gravel, chalk-style neighbourhood lettering and grass striping; non-football ground omits football lettering.
- Building bays replace oversized blank compound shells, while collision footprints remain unchanged.
- Stalls, produce crates, planters, low walls, tyre stacks, barrels and stools remain outside the football playing rectangle.
- Individual leaf geometry replaces the neighbourhood's old clustered solid foliage.
- Slightly broader/taller rig presentation, shader-based garment accents, skin/fabric response and varied footwear. Existing gender morphs, animation and keeper/Ampe hand logic remain active.
- Shared contact shadows plus a disposable 1024px baked building-shadow layer for low quality; high quality retains dynamic shadows and ambient occlusion.
- Texture-aware static batching bakes per-mesh UV transforms before combining geometry. Material and geometry cleanup is covered by tests.
- All 33 previews refreshed to 640×400 JPEG; complete preview directory approximately 1.5 MB, lazy-loaded by the existing menu.

## Checks
- `npm test`: 338/338 pass.
- `npm run check`: 50 application modules; stylesheet, imports and HTML assets pass.
- `git diff --check`: clean.
- Actual WebGL browser sweep: all 33 games plus dirt, concrete and grass Four Corners variants, high and low graphics: 36/36 each, no shader/console errors.
- High sweep retained 30 GPU geometries after all scenes cleared; low retained 28 (shared character/football templates). Local venue art disposed; shared art reused.
- Compared identical 960×600 scene renders before/after texture batching: Four Corners 457→350 draws; Pampanaa 558→299; Ampe 250→180. These are draw-call measurements, not FPS claims. Character and active game geometry still dominate busy group games.
- Live game visually checked at 1440×900 and 390×844 with touch emulation; checked Ampe and Four Corners, surface changes and the low-power rendering path.
- Localhost cloud profile requests can fall back to offline play; no changes made to authentication, points, private rooms or Cloudflare.

## Limits
Visual quality is not an objectively measured equivalence to Four Corners. This is an independent art upgrade using existing licensed rig/PBR assets and original scene work. No physical Android/iPhone GPU or battery benchmark was available; existing adaptive resolution and low-quality defaults remain in place.

## Deployment review
Only static game artwork/rendering and preview mapping changed. No new remote dependencies, credentials, user-data uploads or permissions. The temporary browser QA page is retained under research (outside Vercel's dist output), not deployed. Existing nosniff and referrer headers remain intact.
