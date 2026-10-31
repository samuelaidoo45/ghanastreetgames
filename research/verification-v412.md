# Version 4.12 — Stay, Sulia, Chaskele, Tumatu, Counters Ball and Antoakyire

2026-10-31

## Stay

Eight players start at irregularly spaced positions in an open neighbourhood street court. Individual open-space destinations replace circular orbiting. One nearby runner contests a loose ball while others dodge and reposition. The thrower retrieves and catches; body separation works at compound boundaries and from exact overlaps. Stationary throwers face the selected player and do not run on the spot.

Fast ball movement uses small physics steps. A glancing impact reflects the incoming horizontal velocity around the contact normal, rather than aiming automatically at the thrower. The hit-and-catch requirement remains: only a catch before the floor transfers the role. A miss or failed catch keeps the same thrower, and other players can kick the loose ball away. These are the user's supplied neighbourhood rules.

## Sulia for Beatings

Players steer around each other before contact. Separation also applies during the tag phase. One close tagger pursues the nutmegged player; others retain space around the chase. A tag ends with a short recovery before the victim restarts, without teleporting the entire group around them. Actual low ball passage through the defender's leg plane still awards the point; kicking alone does not.

## Chaskele

A timed swing must meet the moving can at the defender's position. Throws vary in pace and release position. The can must enter the tyre's opening to count against the defender; the rim can deflect a glancing throw. The thrower runs to retrieve the struck can and returns to a usable throwing location. Tap movement shifts the defender at a bounded speed instead of teleporting. Ten throws remain the selected arcade round.

## Tumatu

The existing out-and-back one-foot route now previews the landing location and distinguishes a landing inside/outside the next square. Holding Hop changes travel distance. On returning to square 5, the player must pick up the marker before hopping over square 4. Invalid landings retry from the previous clean location; they never award progress. The fixed grid, marker position and retry rules remain an explicit preset.

## Counters Ball

The floor, bottle caps, paper ball, selectable cap count and paper goals remain. All caps now have velocity and exchange momentum on impact; unselected caps no longer act as fixed walls. Small physics steps prevent fast flicks skipping contacts. Glancing paper-post contacts rebound. The turn waits for all pieces to settle. A ball out restarts near the touchline at a free position. Goals reset the caps for kick-off and give the conceding side the next flick. CPU selection prefers an approach from behind the ball toward the opposing goal. Three goals / 24 flicks remain match conventions.

## Antoakyire

Players wait seated. Picking up the cloth precedes the chase, and the cloth travels with its carrier. A limited sprint-energy reserve adds pacing. If the runner reaches the empty place, the human becomes the next runner and can drop the cloth behind a selected seated player. Successful escape swaps the seat and runner roles. Five rounds remain an arcade convention; no new song recording is introduced.

## Research and scope

- [Graphic — Reviving Ghana's play heritage](https://www.graphic.com.gh/features/opinion/ghana-news-reviving-ghanas-play-heritage.html): describes striking a can away from a tyre target and the opponent throwing again from the recovered location.
- [Agyeman et al. — The Socio-Cultural Context of Akan Ethno-Musical Games](https://www.researchgate.net/publication/345911383_The_Socio-Cultural_Context_of_Akan_Ethno-Musical_Games_and_Their_Relevance_to_the_Lives_of_Children_in_Ashanti_Region): describes Antoakyire's seated group, cloth drop, pickup, chase and change of runner at the vacated place.
- [KNUST — Aesthetic and socio-cultural values of selected Akan games](https://ir.knust.edu.gh/server/api/core/bitstreams/1a8bd34d-8473-493c-b2be-55f902f626f2/content): records another cloth-recognition and runner variant, demonstrating why the game should not claim one national rule set.
- [Pulse Ghana — Eight memorable Ghanaian childhood games](https://www.pulse.com.gh/story/8-memorable-ghanaian-childhood-games-that-gen-z-might-not-know-about-2025040820424984719): describes bottle-top football and flicking caps at a small ball. The user specifies floor play and paper goals here.

Tumatu descriptions found online vary and one curriculum excerpt has inconsistent prose and illustration. The existing hopscotch interpretation is retained; this release does not claim to resolve every local variation. Match limits, previews, collision constants and retry rules are digital design decisions.

## Validation

- `npm run check`: 35 application modules, imports and HTML/stylesheet references pass.
- `npm test`: 209 tests pass, including all 33 game modes and prior football, goalkeeper, mobile input and camera regressions.
- 30 new checks cover boundary pile-ups, 30/120 Hz body spacing, one-challenger assignment, CPU retrieval, fast throws, impact deflection, physical tyre entries, timed bat contact, retrieval movement, the entire Tumatu route and marker pickup, cloth pickup and role exchanges, cap momentum/energy, 30/60/120 Hz flick consistency, post deflections, goals and clear restarts.
- The existing cap-contact test now verifies momentum transfer into a movable cap instead of an immovable-wall rebound.
- `git diff --check`: clean.
- Scoped deployment review: new instructions use the existing text rendering path; source links are fixed HTTPS URLs. No new authentication, uploads, remote code loading, network calls or dependencies were added. Existing hosting headers and broader security posture are unchanged.

No new binary downloads are required. Stay reuses existing street-court models and batches its static scenery. Contact solving exits early when bodies are separated. Floor physics is bounded to the selected caps (maximum 22) and the ball.

Browser access was attempted but local browser use remains disabled in Work settings. No rendered-browser, audio-listening, physical-phone or measured-device-FPS validation is claimed for this release. Automated checks establish rule transitions, collision behaviour and finite scene state; final visual feel still needs an interactive playtest.
