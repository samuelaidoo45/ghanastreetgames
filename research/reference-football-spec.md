# Four Corners football reference — implementation notes

Inspected 31 October 2026. Primary evidence is the public production JavaScript/CSS fetched from https://fourcornersgh.com/ into `/private/tmp/ghana-rea-input/`. This is source inspection; browser access is disabled, so live rendered framing, control feel and exact animation timing have not been observed in this pass. Minified identifiers are evidence locators only. No reference source is copied into the runtime by this research.

## Street Football / Quick Match

Verified reference behavior:

- Quick Match defaults to three players a side, two halves of two minutes, a selectable venue, and normal/fair difficulty. The match format selector also includes a first-to-five option. The setup stores team size separately. The user's requested selectable player counts and small/big poles should remain.
- The base playing rectangle is 20 by 30 units with the long axis along Z. Camera settings include TV, close, behind, high and dynamic views; behind views sit roughly 6–7 units high and 8–10 back, whereas dynamic views move much closer to the controlled athlete. FOV and framing differ for portrait and landscape. Framing anticipates ball/play and keeps the ball on screen. The current app's fixed follow offset follows the controlled player but does not frame the ball, goal or receiving teammate.
- Venue data materially changes play: hard courts have quick high bounces; bare ground decelerates more; tarmac has dusty shoulders; cracked ground can deflect/pop the ball; wet zones reduce bounce and slow movement. It is not one generic pitch with different scenery.
- Goals vary by venue: framed goals, bare rusty frames, and low pole/marker goals. Some use slippers, sticks, tyres or blocks. The base field has physical boards/walls and post restitution; goals and nets are separate collision surfaces. The current app draws frames/nets but only checks whether the ball passed the goal plane, so ball/post impacts are missing.
- Movement has acceleration, turn-dependent momentum, close-control/jog/sprint states and stamina. Dribbling is tied to foot reach/touches and action timing, not merely a fixed ball offset. Passing has direction, power and ground/driven/lofted choices. Controls expose shoot/tackle, chip/slide, low shot, pass/press, long knock and skill actions. Reference includes situational animation clips and pending-kick timing.
- Ordinary small-pole street play can be without a goalkeeper; keeper use depends on mode/house rule and goal type. Do not assume every street setting requires one. Penalties always has a keeper.

Current-source gaps (`dist/football.js`): one continuous timed period; immediate kick from carrier; one pass type; fixed offset dribble; simple body separation; no post collision; same field material response. These should be described as existing limitations rather than a cloned engine.

Independent implementation priorities: (1) a ball/controlled-player/attacking-goal framing camera with portrait bounds; (2) swept ball collisions against posts/crossbar and physical net response; (3) short contact-timed kick wind-up with visible planted/striking foot; (4) a true low rolling shot versus lifted strike; (5) selectable hard court/dirt/tarmac coefficients; (6) first-to-five or two-half match options. Build original behavior; do not transplant minified code.

## Four Corners

Verified source defaults and variants:

- Four individual players/defenders. Default configuration has three lives, normal ball control and a last-player-standing game. This differs substantially from the current app's one-life/one-touch-only preset.
- Two goal layouts are explicitly offered. The reference's `authentic` layout puts inward-facing goal mouths at the four side midpoints. Its `literal` layout rotates the layout diagonally to the four corners. Goals have approximately 2.5-unit full width and a height cap of 1 unit, with shallow depth. The source geometry can use framed or improvised markers according to venue.
- The alternate touch-control mode has kick/hold-for-power, chip, knock and tackle controls. Normal control adds close control, possession, press, shooting/tackling, chips/slides and skills. Consequently the reference does not universally enforce the no-consecutive-touch rule that our app currently applies.
- Conceding reduces a seat's life count; eliminated players receive ranked results. Separate continuing/queue modes introduce replacement players. Last-player-standing and replacement queues must not be conflated.
- The source has dedicated four-goal overview, behind, high and dynamic cameras that frame the active arena rather than reuse ordinary match framing.

User constraint: the user explicitly selected four players and four corner goals. Preserve that configuration; if adding side-midpoint placement, label it as an optional layout, not a silent correction. Normal and one-touch control, and one/three lives, can be explicit local presets. The current one-touch rule came from prior research, not from a user instruction requiring it to be the only mode.

Independent implementation priorities: selectable lives; visible per-defender life pips and score/rank; corner goal frames/markers with actual collision; defenders guard their mouth and contest likely interceptions instead of all chasing the ball; assisted goal selection should remain optional so the player can aim freely. Preserve the existing literal corner-goal configuration until the user selects another layout.

Evidence locators in the public bundle: default configuration factory `QBe`; goal construction `Mj` and layout angle `VFe`; touch-control key-guide builders `qAt`/`KAt`; seat state/life objects and knockout logic. These names are only for traceability in the inspected minified build.

## Penalties

Verified reference behavior:

- The shootout state machine includes introduction, aiming, power selection, keeper choice, run-up, flight, result and completion. Its aiming arrow sweeps until the player locks a direction; the next action determines power. Low power produces a low trajectory, excessive power can go above the bar. It is not simply immediate target-position-to-ball velocity.
- The goalkeeper chooses left, stay or right. CPU difficulty changes reaction/read tendencies, including learning a taker's repeated side preference. The human's dive choice is presented as three buttons.
- A visible run-up aligns the athlete to the stationary ball. Ball velocity starts at the scheduled striking-foot contact, after the keeper's pre-shot cue. Dedicated long-run-up and stutter-run-up animation identifiers occur in the public source. Current app launches immediately from a stationary actor.
- Five attempts each, with early clinch if the trailing side cannot catch up, followed by equal-attempt sudden death. Current implementation always completes five each before deciding and has no explicit attempt-history row.
- Reference includes a behind-taker penalty camera and introduction closeups. The penalty camera height is about 3.4, back-distance about 5.5, and it adjusts portrait FOV. Current static camera is roughly similar in height but sits farther back and does not switch for keeper turns.
- Physics determines a save/miss/goal; there is no evidence that a random preselected result simply overrides ball flight.

Independent implementation priorities: a run-up phase with clear last-foot contact; real sideways keeper dive body motion rather than the current cheer pose plus lean; a shot history indicator; early-clinch logic; a visible moving aim/power challenge as an optional timing control mode; keeper-facing camera on defending turns while keeping left/right labels screen-relative; post/bar deflections. Existing free target aiming may remain as an accessibility/control option.

Evidence locators: shootout initializer `jve`, completion test `Eve`, update `CZe`, trajectory-target mapping `my`, launch scheduling `oW`, and UI `#shootout`/dive group. No source code is reproduced here.

## Scope and truthfulness

These are observable mechanisms and independently implementable specs, not a claim of a byte-identical clone. The reference also includes network play, accounts/progression, many venue variations and a substantial animation catalogue; those are outside a small three-mode asset integration. A licence for third-party art/music does not automatically license the complete reference engine, authored environments or its branding. The asset audit should separately establish rights before any files are integrated.
