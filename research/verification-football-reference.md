# Football reconstruction verification — 2026-10-31

Version 4.2.0 independently reconstructs Four Corners, Penalties and Street Football behaviour from public reference inspection. It does not include the proprietary reference application bundle or custom models. See reference-football-spec.md and reference-assets.md for findings, differences and primary sources.

## Implemented

- Independently converted upstream Gameplay Football goal, net, ball, grass and concrete assets, with the original Unlicense and recorded source inventory. Existing independently licensed human rigs remain in use.
- Four Corners: four literal corner goals by default, selectable 1/3/5 lives, normal dribbling or alternating touches, optional four-side goal layout, physical frame rebounds, life HUD and finite knockout results.
- Penalties: timing or free aim, a run-up that releases the ball at foot contact, separate striker/keeper cameras, screen-relative dives, visible attempt history, early-clinch and paired sudden-death rules.
- Street Football: retained team-size and goal-size choices; contact-timed human kicks, low shots, chips, post/crossbar collisions, selectable surface physics and three ball-aware camera views.
- Existing menu music and gameplay ambience remain available through the audio controls.

## Completed verification

- `npm run check`: 23 application modules passed syntax checks; HTML assets, stylesheets and module imports verified.
- `npm test`: 95 tests passed, zero failed. Includes the existing catalogue/mode checks and new goal/ball geometry validation, camera framing, surface presets, continuous post/crossbar collisions, Four Corners life/control settings, run-up sequencing, timing locks, shootout clinching and defending-camera dive direction.
- Local HTTP preview returned 200 and was opened through the desktop preview handoff.
- Runtime asset manifest includes byte sizes and SHA-256 hashes for the new files. Reuse licence and transformation details are included in assets/CREDITS.txt and assets/football/LICENSE.txt.

## Verification limits and scope

Local browser control reported disabled; no fresh interactive or visual browser playtest was possible. Automated physics and model checks do not establish visual quality, device performance or production audio playback. No claim of EA-level production quality or exact reference parity is made. The proprietary networking, authored venues and custom animation catalogue are not copied. Human player motion uses our existing rig with original additive kick/keeper poses, rather than retargeted Gameplay Football animation files.
