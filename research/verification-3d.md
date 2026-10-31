# 3D rebuild verification — 31 October 2026

## Automated

- 45 tests pass: all 28 Three.js game scenes construct, expose controls, and run up to 200 seconds of simulated updates without invalid positions or repeated completion events.
- Regression coverage confirms that football passes do not count as goals, while experimental keep-away passes do; Antoakyire can complete five cloth-drop chases.
- Oware feeding, capture, no-capture grand slam, full-lap sowing and complete-game seed conservation pass.
- Ghana Dame starts with 20 pieces per side on 10×10; compulsory backward capture, flying kings and chained jumps pass.
- Ludo six-to-enter, additional turn on six, capture and exact-home movement pass.
- Syntax checks pass for all application modules. Installed dependency audit reported zero vulnerabilities.

## Browser QA

- Opened every one of the 28 games using its actual menu tile, launched the scene and activated a control. Verified game-specific HUD text and no browser errors.
- Football: checked native held movement, pass action, pause and game switching.
- Oware: moved a house through the UI; the board changed and handed play to Player 2.
- Rules selector renders the new rules, declared variants and source links.
- Desktop 1280×800 and portrait 390×844 were visually inspected; the portrait camera was corrected to include both football goals. The full pitch is easier to read in landscape.
- Low-poly buildings, original characters, shadows, 3D boards and live scene thumbnails render through WebGL, not prerendered video or 2D screenshots. Thumbnail images are generated locally from the actual game scenes at startup.
- These checks are a functional smoke test and rules verification, not exhaustive balance testing or certification on every device.

## Security and assets

Reviewed with the OWASP Security Check skill. The app has no application backend, uploads, analytics, account data or network writes. Search text is used only for local filtering; strings are rendered with textContent. Settings are validated before use. Research links use noopener. No credentials are included in dist. A content security policy restricts scripts, fonts and connections to the same origin; inline styles are used for controls and shirt colours. Platform HTTP headers and access enforcement remain the responsibility of Sites. The existing owner-private audience is preserved.

Three.js and the two font families are locally vendored with licences. No Four Corners assets or implementation code are redistributed.
