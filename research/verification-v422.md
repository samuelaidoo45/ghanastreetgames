# v4.22.0 — Mobile presentation and Four Corners gameplay

## Changes

- Venue-first pre-match setup: large preview, change-venue shortcut, YOU/CPU card, friend-room shortcut, collapsed instructions, CPU level and sticky Play. Two columns on landscape/desktop; full-width setting rows on portrait.
- All action controls remain visible. Round translucent secondary buttons, a distinct primary action and quiet score panel; existing move stick and multitouch input retained.
- Balanced graphics for capable phones: antialiasing, 1024 directional shadows, warm exposure, compressed color/normal/roughness maps, capped pixel density and 30 FPS rendering. Simulation remains substepped at 60 Hz. Low-end/data-saving devices retain low mode; sustained slow frames trigger fallback. Existing asset files are reused; no new asset packages or dependencies.
- Existing licensed John Bartmann “Happy African Village” starts after a trusted first interaction, before slow effects finish downloading. The removed continuous hiss bed stays excluded. The launch screen has an explicit music button and playback status.
- Four Corners: discrete rolling dribble touches, momentum between touches, heavier sprint touches, short active tackle window, control grace after receiving, open shooting lanes, advancing defensive cover and additive defensive stance. Existing side goals, touch rules, lives and human-room controls remain.

## Reference

Inspected the user-provided local project at `/Users/samuelaidoo/Documents/Codex/2026-10-16/cl/fourcorners`: dribbling, tackling, interception, rival tactics, graphics and mobile control modules. Used the supplied mobile and pre-match screenshots for visual direction. No reference artwork, custom models or raw implementation files were copied into this release. Existing licensed game assets remain.

## Verification

- 379 automated tests pass. New coverage checks rolling dribbles, release beyond control range, early tackle contact, open goal selection, distinct defensive lanes, mobile graphics selection and music starting before effect downloads complete.
- 55 modules pass syntax checks; all local HTML/CSS assets and JavaScript imports resolve. The checker now includes every root stylesheet.
- Browser checks with touch emulation: 390×844 and 320×568 portrait, plus 844×390 landscape. Venue changes update the preview; setup rows and Play remain accessible; all five Four Corners actions are visible. Played/restarted local rounds, checked character/shadow rendering and input. A temporary preview server connection failure was resolved and the game loaded successfully afterward.
- Launch button confirmed actual running music state. Browser first-interaction restrictions still apply.
- Screenshots saved outside the repo in `../polish-v422/`.
- Physical Android/iPhone hardware performance and subjective audio quality were not measured. This improves presentation and play; it does not claim visual parity with the reference.
- Scoped security review: no new permissions, backend endpoints, credential handling, external URLs, account logic or dependencies. New UI uses fixed local assets and textContent; existing auth/CSP unchanged.
