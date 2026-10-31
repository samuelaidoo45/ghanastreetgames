# Street variants 4.3 — 31 October 2026

User corrections implemented: four side-centred goals; blocks/net/sticks/footwear choices; richer One Pole, Laski, Pampanaa and Pilolo venues; Sulia nutmeg scoring; floor-based Counters with paper posts and bottle caps; replacement free-to-use menu music and claps.

## Behaviour and assets

- Four Corners always uses the four side midpoints, including when an older saved preference requested vertices.
- Marker choices change rendered models, physical post height/radius, crossbar presence and score height. Blocks/footwear use a declared 0.65 m maximum goal height, sticks up to 1.35 m, nets the selected full frame. One Pole keeps a single physical target at either end.
- One Pole has a visible run-up with contact-time ball release, lateral starting positions, a gently moving sight, three views and flight tracking. Laski has its own wide street court, surface response, physical frame rebounds and keeper-dive poses.
- Sulia is a separate free-for-all implementation. A low ball must cross the defender's leg plane within the gap to award a point. The group reaction is depicted as a brief non-graphic chase/tag, then the nutmegged player restarts. First to five or most points after two minutes.
- Counters is moved to the ground with original crimped/ribbed Coke, Pepsi and water-bottle cap models, paper goals and a crumpled-paper ball. Match presets remain three caps each and first to three goals / 24 flicks. The floor has no physical enclosing table rails.
- Detailed original street geometry reuses existing licensed PBR materials; see venue-design-v43.md for scene counts and collision scope.
- Menu/launch music is now John Bartmann's Happy African Village (CC0 release), with a CC0 softer recorded clap by hypernovajm. Old runtime menu/clap files were removed. Provenance, processing, measurements and the source music's old contradictory metadata tag are documented in audio-v43.md.

## Checks

- npm run check: 27 application modules, stylesheet/HTML assets and imports passed.
- npm test: 100 passed, zero failed. Covers all game simulations, new marker physics, side layout migration, genuine/false nutmegs, One Pole contact timing, Laski post rebounds, Counters ground/models/scoring, and existing audio state/mute/replay behaviour.
- All 14 Pilolo hiding locations remain reachable around the unchanged building/wall solids; venue geometry positions are finite.
- Local HTTP preview returned 200 and was opened in the desktop preview.

## Limits

Browser inspection again reported disabled in Work settings. Fresh visual/interactive QA, live audio audition and device performance remain unverified. Headless geometry and physics tests do not establish photorealism. Houses remain closed facades; this pass does not create playable interiors. Decorative details use the existing wall/house collision footprints; not every small prop is independently collidable. Cultural rules are based on the user's supplied neighbourhood variants and declared match presets, not a claim of nationwide uniformity.
