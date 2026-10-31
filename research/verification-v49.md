# Version 4.9 verification — keeper balance and camera readability

Date: 2026-10-31

## Changes

- Street-football keepers wait before reading an incoming kick, commit to an imperfect intercept, and move at a bounded speed. Reach is narrower; shots above hand height or outside reach continue. Soft balls can be caught and distributed; hard shots are parried into live play with a short recatch cooldown.
- Without directional input the human's assisted shot aims away from the opposing keeper. Sideways aim reaches the corners. Small-goal geometry and team formations remain intact.
- Penalty keepers choose a side and commit instead of using the precise shot coordinate. Reaction time and reads depend on difficulty; a dive has finite horizontal and vertical reach.
- The existing rigged athletes are 14% taller and 9% broader relative to version 4.8. Animation and foot planting remain intact. No new binary assets or downloads.
- Street-football framing follows player and ball, using an end-on portrait angle. Four Corners keeps all four side goals visible in landscape and follows the action in portrait. Laski, Stay and Sulia use closer action framing. Explicit overview views and manual zoom/orbit remain available.
- Penalties and One Pole no longer receive the extra static-camera portrait distance multiplier. Board and miniature object camera presets remain unchanged.

## Automated validation

- `npm run check`: 31 application modules; syntax, import paths, stylesheets and HTML references.
- `npm test`: 143 tests pass, including simulation of all 33 modes and existing formations, mobile assets, original audio and venue checks.
- Street-football corner shots score through the real match update path on Easy, Normal and Hard, on both sides of the goal. Swept keeper contact still prevents tunnelling, soft catches distribute correctly, and hard central shots leave a live rebound.
- Seeded penalty simulations (128 placed kicks per difficulty, x = ±2.25, y = 0.7, power = 0.72): Easy 88 goals / 40 saves; Normal 68 / 60; Hard 53 / 75. These are controlled regression scenarios, not population gameplay statistics.
- Real Three.js projection checks at 360×740, 390×844, 844×390, 1024×768, 1920×1080 and 3440×1440 verify player/ball framing. A player with the ball nearby occupies at least 7.5% of viewport height. Separate checks exercise World.render integration and all four Four Corners side goals in landscape.
- `git diff --check`: no whitespace errors.

## Limits

Browser control was attempted and reported disabled in Work settings. No new visual browser QA or physical-phone playtest is claimed. The user's supplied Four Corners screenshot guided apparent player size and field coverage; the reference URL could not be opened by the web fetch tool in this turn. Existing character assets were adjusted, not replaced with proprietary reference assets.
