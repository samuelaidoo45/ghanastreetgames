# Ab3d3mu movement and pressure — 4.19.0

## Changes

- Replaced fixed home-position oscillation with passing-lane support targets, a shape that shifts with ball position, runs after passing and moving receptions.
- Carriers dribble away from a defender. Acceleration, braking and smooth turns retain readable running animations.
- Middle-player Press predicts ball flight or approaches the carrier's passing shoulder. A 2.6-second pursuit includes a short acceleration burst and a recovery interval; manual steering cancels assistance.
- Close pressure changes actual pass direction/speed and can produce a heavy receiving touch. These remain physical loose balls: points require an interception or tackle, rather than a scripted pressure win.
- Middle-player controls show Tackle, Press and Sprint (phone auto-sprint uses the joystick edge). Passing controls return after winning possession.
- Private-room players use the same contact/pressure rules, while support movement and passing AI remain disabled for every human seat.

## Verification

- 366 tests pass, including 10 new regression tests for shape movement, support runs, pressure/contact errors, clean receptions, press interception targets, cooldown/manual override, useful role controls, friend-room input ownership and a full 30-Hz round.
- Five deterministic pressing scenarios: four wins within 15 seconds; successful times ranged from approximately 1.0 to 11.2 seconds. One scenario escaped that test window. This is scenario coverage, not a measured human-player win rate.
- All 51 application modules pass syntax and asset/import checks.
- Desktop browser: passing, moving support players, changing shape and middle-player action changes verified.
- 390×844 touch viewport: visible Tackle/Press controls, all-player framing and a human press awarding two interception points verified. Browser emulation is not a physical-phone performance benchmark.
- Existing authenticated seat ownership, host-only results, bounded inputs and score protections remain unchanged. No new network endpoint, credential or permission is introduced; the backend game registry is unchanged.
