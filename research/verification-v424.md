# v4.24.0 verification — 1 November 2026

## Changes
- Shared dark frames, cream option panels and gold primary actions across setup, pause, results, settings, rules, replay, friends and installation dialogs.
- Pause/results use compact single-column portrait layouts and two-column short-landscape layouts. Play Again is the first result action.
- Easy, Normal and Hard are available in every one of the 36 games. The setup explains the actual change. Difficulty persists on the device.
- Football modes use CPU movement/reaction tuning. Other games tune pursuit, aim error, timing windows or task precision. Ampe Hard predicts from previous rounds, never the current choice. Board AI chooses legal actions; Hard uses bounded two-ply planning (maximum 512 reply evaluations per move, except a minimum one per candidate), and Ludo adds capture/home/danger strategy without altering dice.
- Private friend rooms retain their existing Normal preset for fair common rules. Local board multiplayer has no CPU to tune.
- Play/restart request fullscreen synchronously before any asset-loading await. Room Start/Return/Join request it during the click too. Existing fullscreen is preserved; unsupported or denied requests retain a full-window viewport. Browser restrictions are respected.

## Automated checks
- `npm run check`: JavaScript syntax, HTML/CSS balance, local imports and asset paths.
- `npm test`: 407 passing tests. Includes all-game Easy/Hard finite simulation; actual changes to Stay catch timing, jump height/landing, Numbers timeout and Alikoto landing; legal immutable board decisions and tactical examples; fullscreen request ordering/idempotence/denial; existing football, touch, animation, points and shared-room tests.
- `git diff --check` clean.

## Browser inspection
- Actual local Street Football played then paused; Numbers timed out to an actual result.
- Pause inspected at desktop 1728×1080, phone 390×844 and landscape 844×390. Portrait pause is 366×415 and fits without scrolling. Landscape uses a compact split layout.
- Results inspected at 390×844 with actual score/XP text. First action is Play Again.
- Setup checked with Hard selected on Street Football and Numbers; saved difficulty persisted. Setup, settings, rules and friends dialog visual contrast reviewed; Rules & Story, music-credit and rules-source contrast corrected.
- Friends panel was opened through a local development DOM action for styling only because localhost is not an allowed API origin. No account or friend-room production data was created.
- IAB has no documentElement.requestFullscreen API. Full-window fallback confirmed. Supported, already-fullscreen and rejected native API paths covered by unit tests. Native fullscreen on physical Android/iOS has not been tested.
- Evidence saved beside the repository in `../dialogs-v424/`: pause-mobile.png, pause-landscape.png and result-mobile.png. CDP capture was used because the normal screenshot tool scaled the viewport override incorrectly.

## Scoped security review
Frontend-only changes; no new dependencies, permissions, external endpoints, credentials, database schema or server authorization changes. Difficulty is allowlisted and prototype values fall back to Normal. Explanations use textContent. Existing CSP and no-inline-script behavior are retained. Native fullscreen denial is caught without bypassing browser restrictions. No new high/critical findings in changed code. This is not a new whole-application security audit.
