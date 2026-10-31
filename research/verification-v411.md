# Version 4.11 — live Laski rallies and fluid football positioning

2026-10-31

## Laski

Crossing a chalk sideline or end line no longer calls the keeper's serve routine. Human and CPU field players can chase balls throughout the surrounding compound (12 metres each side, 15 metres each end). Distant balls rebound at a reachable compound limit rather than restarting the rally. A CPU player retrieving behind the goal returns to the front before shooting. A valid goal still opens scorer-selected elimination and the next legitimate serve.

## Street football

Formations supply recovery positions, not fixed movement restrictions. Teammates advance with possession, create passing lanes, continue give-and-go runs and keep a covering player behind the attack. Without possession they follow opponents and recover spacing; the closest challenger leads the press, with one nearby supporting challenge when appropriate. Any nearby CPU defender can tackle, independently of the assigned presser. Predictive targets use actual movement velocities. CPU attackers on either team can dribble, pass and shoot.

Three-outfield-player Balanced and Defensive use 2–1; Attacking uses 1–2. The 1–1–1 shape is removed. Formation settings store style names, so existing Balanced settings automatically receive the new shape. The setup description explains movement and recovery.

## Validation

- `npm run check`: all 34 modules pass syntax, imports and HTML/stylesheet reference checks.
- `npm test`: 179 tests pass, including prior goalkeeper balance, all modes, mobile controls and camera regressions.
- New tests cover Laski crossings on all sides, human and CPU retrieval beyond the chalk, reachable outer limits and retrieval behind goal.
- Football tests cover attacking movement, recovery, nearby supporting challenges, persistent give-and-go runs, attackers on both teams shooting, and a defender tackling despite not being the assigned presser.
- `git diff --check`: clean.

The change adds no binary assets or downloads and preserves the existing tactical update interval. AI velocity calculation reuses existing vectors.

Browser inspection was attempted, but the tool reports local browser use is disabled in Work settings. No rendered visual inspection or physical-device playtest is claimed for this update.
