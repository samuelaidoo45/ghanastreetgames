# 4.16.0 verification — 1 November 2026

Scope: Four Corners possession, opponent decisions, movement, shooting, tackling and dodge; action buttons for all 33 games. The movement joystick and its handlers are unchanged.

- `npm test`: 335 passing tests, including all-game scene simulation and mobile action reachability.
- `npm run check`: 49 application modules, stylesheet references, HTML assets and imports pass.
- New Four Corners checks: every seat collects and dribbles; swept body contacts; placed goals at 30/60/120 Hz; tackle facing/range/recovery; dodge energy/recovery; one active challenger; opponents carry before shooting; possession does not trigger a dead-ball restart; one-touch restrictions; four human seats share the physics without bot inputs.
- New action-pad checks: all choices remain reachable, at most three direct actions plus More in movement games, equal choice prominence, quick-tap vs held power, decorative SVGs contain no injected player text, movement-stick styling untouched.
- Existing integration test executes the real UI controller with pointer events: two simultaneous fingers, pause cancellation, no double activation. It uses a small DOM substitute, not browser layout.
- Ten idle-player Four Corners simulations completed in 71–109 simulated seconds, with 10–11 goals each. This is a deadlock check, not a claim about human play quality or device frame rate.
- Security review: icons are selected from a local SVG path allowlist; labels remain textContent. Existing room input validation and host authorization remain in place. No new dependencies, credentials, remote scripts or backend schema changes.

Limit: local browser control was disabled in Work settings, so no visual browser inspection or physical-phone testing was possible for this release. No claim of measured mobile FPS or human usability testing is made.
