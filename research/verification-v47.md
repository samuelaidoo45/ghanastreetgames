# v4.7 performance, mobile controls and goalkeepers

The launch/menu no longer waits for athletes, surfaces, HDR, sound or 33 client-rendered thumbnails. Existing static preview files load lazily. First interaction starts optional audio; entering the menu warms the 3D assets. First play awaits that single shared loading task, with a 15-second fallback to built-in models if downloads have not settled. Slow downloads can finish in the background. No startup preview generation or font-readiness barrier.

Low quality uses the new mobile character/surface variants (4.99 MB vs 15.71 MB for both full sets), colour-only environment materials, no HDR or AO, no shadows, pixel ratio capped at 1 and 30 fps render pacing. Coarse-pointer and four-or-fewer-core devices default to low quality. Sustained slow high-quality frames switch to low quality. The unused default compound and its animated spectators are no longer constructed. Menus and hidden tabs do not render. Replay capture is opt-in. Source geometry, skinning and animation accessors remain unchanged in the mobile GLBs.

Camera controls: orbit buttons, zoom slider, reset and existing preset cycle. Movement respects the actual rotated follow camera. Gameplay has a fullscreen button; unsupported browsers fall back to full-window layout. Dynamic viewport sizes, safe-area spacing, landscape button sizing and lost-pointer-capture resets support phones. Native fullscreen and multitouch still need physical-device confirmation; browser automation is disabled in this workspace.

Big-goal street football adds a dedicated keeper to each side, in addition to the selected outfield count. Keepers track the ball, intercept its swept flight path within reach, hold a saved ball and distribute to a teammate. Small goals have no keeper. UI makes outfield count and added keepers explicit.

Validation: Node gameplay, audio and asset integrity tests; static syntax/import/HTML checks; exact-commit Vercel status and production file hashes checked at deployment. No measured browser load-time or device FPS claim.

Release checks: all 125 Node tests passed; static UI targets exist; syntax/import/assets and whitespace checks passed. Browser access was attempted and remained disabled.
