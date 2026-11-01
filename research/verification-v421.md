# v4.21.0 — Always-visible mobile actions

Removed the More action tray across all games. All actions, including manual Sprint with automatic sprint enabled, are direct buttons. Football prioritizes Shoot, Pass/Press and Save, followed by Low shot, Chip, Switch and Sprint. Existing quick-tap, hold/release, multitouch, disabled states and accessible labels remain intact. The joystick is unchanged.

Portrait uses up to three columns with 52–62px buttons, landscape up to four with 56px buttons; board-game choices use larger targets. Existing camera inset measurement reserves the actual action dock height.

Validation:
- 372 tests pass, including all game action inventories and real UI pointer wiring. The integration test activates Chip directly without opening a tray.
- 53 modules pass syntax/import/asset checks.
- Browser checks: seven football actions fit 390×844 and 320×568 portrait and 844×390 landscape. Landscape minimum target is 56px, with no joystick/button overlap; narrow portrait targets are 52px. Direct Chip input starts play.
- All six Oware choices are visible at 390×844 with 70px targets.
- No API, persistence, authorization, dependencies or security-policy changes.
