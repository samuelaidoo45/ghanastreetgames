# Version 4.9.1 — camera and input follow-up

2026-10-31

Completed the pending touch-control and movement-direction changes already present in the workspace, and fixed additional issues found during review:

- A charged action belongs to one pointer or one keyboard gesture. Additional fingers cannot release it. Lost capture, cancellation, focus loss, pause and replacing action buttons cancel pending charges.
- Space/Enter on a focused charge button do not also reach global shortcuts or trigger a native duplicate click. Global shortcuts ignore focused controls, require a matching key press, and cannot fire from a release after pause.
- Joystick and canvas dragging retain their owning pointer; competing fingers cannot steal gestures.
- Movement uses the actual camera direction in overview and rotated views, including straight-down views.
- Sulia's explicit overview is no longer overwritten by automatic action framing.
- Pampanaa's collision-adjusted camera is no longer pulled backwards again by the portrait distance multiplier.

Validation: `npm run check` passes for 32 application modules. All 157 tests pass, including actual game key-handler execution, pointer/keyboard events, cancellation and multi-touch ownership, movement projections, overview selection, neighbourhood camera distance, keeper scoring simulations and all 33 modes. `git diff --check` is clean. No additional model, texture or sound downloads were introduced.

Browser access was attempted again but remains disabled in Work settings. These are automated event, simulation and projection checks; no physical-device or visual-browser verification is claimed.
