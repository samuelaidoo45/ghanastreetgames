# Version 4.10 — Sulia, Laski and football arm movement

2026-10-31

## Gameplay

Both modes use rolling, alternating dribble touches ahead of the carrier's feet. The nearest eligible opponent challenges, while other players reposition around the contest instead of running straight through it. Body separation resolves exact overlaps as well as ordinary crowding. Idle humans slightly nearer a loose ball do not prevent CPU opponents from collecting it.

Laski attackers carry the ball toward goal, move around nearby pressure and shoot into the side away from the keeper. Human shots without directional input receive the same placement assistance. CPU challenges can win possession, with a recovery interval to avoid immediate repeated possession exchanges. Keeper throws, rebounds, scorer-selected elimination and winner role changes remain intact.

Sulia carriers approach a rival and attempt a real low ball through the legs. Shielding and manual challenges remain available. Players spread out after the brief chase/tag phase before the victim restarts. Outfield players use their normal locomotion pose rather than a permanent goalkeeper stance.

## Animation

Keeper arm reaches now use the shipped skeleton's measured upper-arm and forearm lengths. Hands move forward in readiness, together around a held ball, and toward the save during a dive. Targets and pose weights blend over time, with bent elbows and bounded reach. Running resumes when the keeper pose ends. Sideways keeper movement uses the shipped strafe animations; stationary holds stop the running animation. Ball release and parry poses have visible durations rather than being immediately overwritten.

No new model, texture or sound downloads. This is an animation and gameplay update to the existing licensed characters.

## Validation

- `npm run check`: 34 modules, syntax/import and HTML/stylesheet references.
- `npm test`: 168 tests pass, including all 33 game modes and prior keeper-balance, mobile controls and camera checks.
- New checks cover rolling possession at 30/60/120 Hz, sharp turns, overlap recovery, off-ball spacing, CPU loose-ball collection, Laski attacking shots and assisted scoring, and Sulia dribble-to-nutmeg attempts.
- Animation tests reconstruct the actual shipped GLB bone hierarchy and animation tracks without textures/WebGL. They verify bent elbows, forward ready hands, both hands reaching toward the dive, transition back to running, and lateral shuffle selection.
- `git diff --check`: clean.

Browser access was attempted but remains disabled in Work settings. No new visual-browser or physical-device playtest is claimed. Automated skeleton checks establish reach and animation behaviour, not final rendered visual quality.
