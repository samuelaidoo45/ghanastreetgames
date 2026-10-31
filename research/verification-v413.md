# v4.13 — mobile play

Date: 2026-10-31

## Delivered

- Explicit touch movement, aim or stationary profiles and setup help for all 33 games.
- Two-thumb controls, default outer-stick sprint, optional manual sprint and left-side actions. Antoakyire retains its separate Sprint control because its chase runs along the circle without a movement stick.
- Football primary actions plus a secondary shot tray. All actions remain accessible. Touch timing actions fire on pointer contact; charge controls retain press/hold/release. Pause, orientation resize and lost capture cancel old gestures.
- Phone-safe control sizing, landscape layout, safe-area padding, compact scoreboard, collapsible View/help, larger form text, visible sticky Play button and two-column game catalogue.
- Equipment/action camera bounds fit around measured HUD and control reservations. Small floor props preserve their real scale. Neighbourhood aiming retains its centred crosshair. Manual camera zoom and overview choices remain available.
- Near-touch selection within 24 CSS pixels for small pickable pieces, with exact ray hits preferred and hidden pieces excluded.
- Static menu no longer imports the 3D engine. Its initial static JavaScript import graph falls from 53 modules / 2,763,984 uncompressed bytes to 9 modules / approximately 105 KB; the deferred engine still downloads when Play is selected. Loading feedback appears after Play. No continuous rendering in menus, paused games or hidden tabs. Low-quality GPU pixel budget and sustained-load resolution reduction; low-power WebGL preference on the default phone quality.
- 60 Hz physics substeps, once-per-render skeleton/hand animation, no hidden mobile radar draw, and shared decoded audio buffers with compressed copies freed.

## Verification

- `npm run check`: 36 application modules plus local stylesheet, HTML and static/dynamic import paths.
- `npm test`: 223 passing tests, including all existing 33 game simulations.
- New checks cover every game's action availability, joystick deadzone/sprint thresholds, two-finger ownership, lost capture and pause recovery, the actual mobile UI controller boot/control wiring, no engine in the initial static import graph, render budgets, animation/substep separation, sound-buffer reuse and touch selection.
- Three.js camera projection checks use 320×568, 390×844, 667×375, 844×390 and 768×1024. Equipment/action bounds must fall between the HUD and controls; manual zoom remains effective.
- Static security review: UI labels use DOM text nodes, no new external origins, credentials, analytics, permissions or dependencies. Existing CSP continues to permit only same-origin scripts and assets.

## Limits

Browser access remains disabled in Work settings. These are code, simulated-event and Three.js geometry checks, not browser screenshots, physical-device playtests, FPS measurements, measured load times or battery benchmarks. Real iOS/Android playtesting is still needed for CSS layout, browser toolbar/fullscreen behavior, thermal performance and subjective control feel. The 12-second asset-readiness fallback remains; the download can continue after fallback. Slower connections can still show the existing fallback characters/materials until another game is started.
