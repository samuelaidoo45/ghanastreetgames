# Version 4.9.2 — compact mobile controls

2026-10-31

The persistent zoom/rotation/reset/fullscreen toolbar and separate camera button are replaced with one 44×44 View disclosure. Its panel is closed by default and contains all existing functions, with 44-pixel minimum control heights. It closes on Done, an outside press, Escape, a view/fullscreen selection, pause or a game transition. The panel is constrained to the viewport and can scroll on very short screens. The obsolete landscape score offset is removed to recover header space.

The interface disables text selection and iOS touch callouts; context-menu and selection-start events are suppressed on the game canvas, HUD and menu surfaces. Search and other text fields retain text editing/selection. Browser page zoom is not disabled.

Validation: all 157 existing automated tests pass; syntax/import/stylesheet/HTML checks pass for 32 modules; HTML parsing verifies unique IDs and all camera/fullscreen controls inside the initially closed disclosure. No gameplay or asset changes. Browser control is still disabled in Work settings, so no new visual-browser or physical-mobile check is claimed.
