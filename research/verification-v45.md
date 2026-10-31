# Scale, venues, sound and Stay — v4.5, 31 October 2026

## Implemented

- Counters: floor-focused close camera, distinct landscape framing, concrete texture, no obstructing full-body models in close view. Camera control switches to an overview with the people visible. Existing 1–11 cap selection, paper goals and floor physics remain.
- Alikoto: base approximately 3 cm wide, stem approximately 5 cm tall; detailed pen clip/rim, thin chalk mark and close camera. The overview restores the player for context. Strike and Power labels fit the controls. Flip physics and final landing height use the new physical scale.
- Venue setup now passes settings into the environment builder. Dirt uses a school frontage and sand shoulders; concrete uses a coastal court with painted shops/palms; grass uses a park, railings, trees and pavilion. Every football variant gets all three environments; One Pole and Laski retain their own gameplay geometry and venue kind. Surface physics remain consistent with the choice.
- Audio retains the original African instrumental unchanged, with existing street/crowd backgrounds and licensed effects. Only the separate continuous outdoor bed is excluded from preload/playback. Context-sensitive effect routing and surface-specific footsteps remain.
- Menu uses the supplied two-column landscape-card layout, with compact cream badges, gold headings, rounded category tabs and consistent image framing. Phones under 520px use one column.
- Character shading preserves the source's eye/cornea gloss instead of forcing every material matte; skin/clothing/hair get appropriate separate roughness. Subtle body variation, smooth gestures and crouch foot placement improve the existing licensed rig. Additive gestures restore the animation base each frame to prevent pose accumulation.
- Stay follows the rules supplied in this conversation: eight players, one thrower; a body hit followed by a catch before grounding transfers the role to the hit player. A miss or failed catch leaves the same thrower chasing the loose ball. Other players can kick it away. The human can be thrower or runner; bots play both roles. This replaces the old freeze/header preset with continuous play. Labels and markers identify the human, thrower and selected target.

## Verification

114 Node tests pass, including scene/physics simulation for all 33 modes, all football venue choices, reachable Alikoto landings and physical scale, miniature close/overview visibility, Stay hit-and-catch transfer, failed catch, loose-ball clearance, retrieval and boundary-corner recovery. Audio tests cover profile routing, material footsteps, exclusion of the continuous outdoor noise bed while original backgrounds remain, crossfades, duplicate-loop prevention, sliders, mute, hidden tabs and replay silence.

The African menu audio file is byte-identical to the previous published version. The asset manifest includes byte counts and SHA-256 hashes. Syntax/import/stylesheet/HTML checks and git diff whitespace checks pass.

Local HTTP preview responds200. Browser control continued reporting disabled even after the user said they would enable it; no new rendered screenshot, interactive browser test or listening test is claimed. Changes are grounded in the supplied screenshots, source inspection, scene geometry and simulation checks. Vercel is the publication target for this update, using the existing GitHub integration. Deployment is verified after push against the exact commit and served file hashes.
