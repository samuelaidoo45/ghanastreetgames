# Rules and physical-play fidelity: boards, compound and rhythm games

Research checked 31 October 2026. This document distinguishes source evidence from proposed game design. Local variants should be selectable or declared, not flattened into one supposedly national rulebook. No code was edited during this research.

## Highest-value corrections

1. Chempε currently has the wrong role/call relationship: the food-holder protects their food by calling “No Chem pe”; another participant claims equal sharing if they forget.
2. Pempenaa is elimination through song-ending selection of individual extended legs. It is not a timing game with one circling glowing ball.
3. Mbobagor involves each participant handling a stone in a synchronized circle. Piles accumulate when a player falls behind. One globally orbiting token loses the core coordination mechanic.
4. Practical Numbers has a sourced prime-number premise, but should be quick turn-taking responses; the current walking quiz is an adaptation.
5. Dame needs an explicit rules variant and corrected capture-sequence handling. Sources disagree on one-piece loss; do not present that convention as universal.
6. Tyre rolling should show a runner pushing with a stick, with rolling inertia and balance. A disembodied torus driven like a person does not reproduce the activity.

## Oware

**Verified core.** The Oware Society describes Abapa as a competition/adult variant: 12 houses, four seeds per house, anticlockwise sowing, skip the origin on subsequent laps, capture opposing terminal houses containing two or three, feed an empty opponent where possible, and cancel a capture that would empty the whole opposing side. A player reaching 25 captured seeds wins. Mutually recognized cycling can end play. [Oware Society: Abapa](https://oware.org/abapa.asp).

**Current implementation.** The essential rules are well represented. Automatic threefold termination is a declared digital convention rather than the Society's mutual end-game agreement. The initial position is not entered into `seen`, so repetition counting starts after the first move.

**Recommended implementation.** Keep the rules engine. Animate seeds traveling one house at a time; show a temporary landing preview and feeding explanation. Add a modest CPU opponent and difficulty levels so the board is enjoyable alone. Use carved concave wooden pits or a dirt-hole board, irregular seeds, a hand reaching into the chosen house, and hard seed-on-wood sounds. These are presentation/design recommendations, not additional traditional rules.

**Caveat.** Oware includes named variants: the Society distinguishes children's Nam-nam from Abapa. Label this mode “Oware — Abapa” rather than implying every child's Oware used exactly this ruleset. [Oware Society: variants](https://www.oware.org/rules.asp).

## Ghana Dame / Damii

**Verified common core.** Ghanaian implementations support 10×10, 20 pieces, flying kings, mandatory captures, men capturing backwards, and free choice between available capture lines. Dammee specifies bottom-right dark orientation and leaves jumped pieces on the board until the complete capture sequence finishes. It ends games through capture of all pieces or blocking, with repetition/agreed draws. [Dammee's complete rules](https://dammee.com/learn/rules).

**Important conflict.** DraughtsGame instead explicitly implements loss at one remaining piece, promotion only when a complete move ends on the last rank, and a 25 king-only non-capture move draw. [DraughtsGame convention](https://draughtsgame.com/en/rules/ghanaian-draughts). ArtSoftGH documents Kwakwa when a king fails to capture or finish a capture chain, but does not settle these end-game discrepancies. [Developer's Dame listing](https://play.google.com/store/apps/details?hl=en_IN&id=com.artsoftgh.dame).

**Current mismatches.** `initialDame` uses odd-parity squares, making bottom-right light. `moveDame` removes each jumped piece immediately and promotes a man mid-chain; this can open an illegal new ray and turn a man into a flying king before the move finishes. The 80 non-capture half-move draw is an original house rule.

**Recommended implementation.** Declare one convention in setup. For a researched Ghana variant, track `capturedThisTurn`, retain those blockers until turn completion, prohibit recapture, and crown only after the chain ends. Mirror tile parity consistently with piece placement and tests. If retaining the one-piece-loss rule, cite DraughtsGame rather than Dammee. Add CPU play, last-move highlights, piece-slide animation and a visible capture tray. Preventing illegal moves is a reasonable digital substitute for Kwakwa; explain that choice rather than implementing surprise penalties.

## Ludo

**Verified core.** Four pawns, six to enter, an extra throw on six, capture by landing, exact home entry, and all four home to win are documented in the manufacturer's instructions. [Funskool instructions](https://funskoolindia.com/wp-content/uploads/2024/09/Ludo_Instructions.pdf).

**Ghana-specific evidence.** ArtSoftGH's Ghana Ludo explicitly includes opponent blockades that cannot be crossed, friendly landing on own blocks, plus optional named kicks. It advertises 2–4 participants. The listing does not define the geometry of each kick sufficiently to reconstruct those moves faithfully. [Ghana Ludo developer listing](https://play.google.com/store/apps/details?id=com.artsoftgh.ghanaludo).

**Current mismatch.** It is a two-player conventional rules variant without blockades. That is playable but should not be described as the definitive Ghana ruleset.

**Recommended implementation.** Retain an explicit classic preset; optionally introduce a separately labelled blockade preset with tests for passing and landing. Add CPU turns, physical dice tumble with a predetermined fair result, and pawn movement along every intervening square. Do not invent optional kick mechanics from their names alone.

## Counters ball / bottle-top football

**Verified core.** A Ghanaian research article describes two players, a drawn football rectangle, bottle-top player pieces and a small berry/pebble ball moved by striking with the counters. The side scoring most in an agreed duration wins. [Owusu & Obuo Addo, cultural games study](https://www.tandfonline.com/doi/full/10.1080/2331186X.2023.2207045).

**Current mismatch.** Three tops per side, 24 shots and first-to-three are declared digital choices. It already has appropriate cap/ball physical interaction.

**Recommended implementation.** Add finger-drag aim and shot strength; show the aiming hand and release. Make caps visibly crimped metal with coloured centres and scratched edges, and the ball a tiny pebble/deodorant ball. Use friction and restitution, collision sounds, a worn slate/dusty smooth concrete pitch and two small improvised goals. Make turn/match duration conventions explicit.

## Tyre rolling

**Evidence.** GhanaRemembers describes children pushing old tyres or rims with a stick while racing; its account supports the activity, not a universal formal course/scoring system. [GhanaRemembers](https://ghanaremembers.com/stories/history/from-ampe-to-pilolo-the-games-that-brought-our-ghanaian-childhood-to-life.html).

**Current mismatch.** The player is hidden and the tyre is directly teleported with character movement; rotation is unrelated to distance traveled.

**Recommended implementation.** Show a running child beside/behind a correctly oriented tyre and a stick making timed contact. Couple rotation to travelled distance divided by radius. Give the tyre speed, drag, heading inertia and a recoverable lean angle; time pushes to retain balance. Keep gates/time trials labelled as the arcade course. Avoid hard life loss for every contact; a tip-over, pickup and restart is a more physical and understandable penalty.

## Maame ne Paapa

**Evidence.** Pulse's first-person recollection describes imitating daily parental care with dolls, with no formal rules. [Childhood recollection](https://www.pulse.com.gh/story/old-times-nostalgia-these-are-the-10-childhood-games-in-ghana-we-cant-forget-2024072400121170806).

**Current mismatch.** A 180-second fail state contradicts the setup's gentle, no-losing-score description. It is a three-object delivery puzzle without dolls or household interaction.

**Recommended implementation.** Remove the fail timer. Provide a small free-play compound with a doll, bowl, cloth, stool, toy cooking pot and pretend food; choose a household role, carry and place items, serve a shared meal. Show optional tasks rather than a compulsory race. Keep the game's caring/social function; do not impose fixed gender roles or adult relationship drama.

## Practical Numbers

**Evidence.** The same Pulse recollection says players rapidly name a prime on their turn or leave the game. The source does not establish a universal no-repeat rule, numeric range or exact response time. [Pulse account](https://www.pulse.com.gh/story/old-times-nostalgia-these-are-the-10-childhood-games-in-ghana-we-cant-forget-2024072400121170806).

**Current mismatch.** The prime-number premise is sourced, but running to one of four stones for five untimed questions replaces the reported quick-response social challenge.

**Recommended implementation.** Put participants in a conversational circle. Show a short response window and three/four number choices when it is the human's turn, with CPU participants answering between turns. Escalate pace and eliminate incorrect/late responders. State the chosen range and any no-repeat convention. An optional educational explanation can follow mistakes without interrupting the turn rhythm.

## Skipping

**Evidence.** Ghanaian reporting describes single/group rope jumping with spoken or sung learning activities synchronized to the rhythm. [Graphic: games in education](https://www.graphic.com.gh/features/opinion/ghana-news-role-of-games-in-education.html).

**Current mismatch.** Rope-turners only clap, the rope can visibly penetrate the ground, and success is sampled once at cycle wrap rather than at the physical foot crossing.

**Recommended implementation.** Attach rope ends to animated hands; keep the low sweep just above the surface. Test the rope's segment against the jumper's feet at the crossing time; use swept collision to avoid frame-rate dependence. Give a preparatory knee bend, takeoff, landing and rope contact response. Speed up after clean streaks; include a practice mode and an optional counting call. Ten jumps/three misses remain an arcade scoring convention.

## Alasa

**Verified core.** The research account uses African star apple seeds, an agreed allotment per player, a cleared surface and small hole; players flick seeds from measured starting positions. [Cultural games study](https://www.tandfonline.com/doi/full/10.1080/2331186X.2023.2207045). Change for Ghana independently recalls flicking the eaten fruit's seeds into a hole. [Community recollection](https://www.changeforghana.org/post/7-memorable-ghanaian-games).

**Current mismatch.** A floating round sphere starts many character-sized “steps” from the hole; the piece lacks a seed's shape, contact and scale. Six throws and distance points are arbitrary.

**Recommended implementation.** Use an elongated glossy dark-brown seed on the ground, a fingertip contact cue and drag/release strength. Frame a close ground-level playing area at plausible hand-scale distances. Offer five seeds each, alternating turns; count seeds sunk rather than inventing multiple near-miss scores unless labelled practice scoring.

## Chempε

**Verified core.** The food-holder must call “No Chem pe” before fellow participants claim equal sharing. Forgetting risks splitting the meal among the pact's participants. [Change for Ghana](https://www.changeforghana.org/post/7-memorable-ghanaian-games).

**Current mismatch.** Calling Chempε, accepting an offer and sharing is rewarded in every round, which changes the roles and remembered exemption phrase.

**Recommended implementation.** Alternate food-holder and claimant roles. A short visual food reveal starts the response window: the holder calls the exemption or the other player claims a share. Animate dividing a fruit or food portion among present participants. State that this is an opt-in memory/reflex adaptation. Avoid coercive deprivation; the traditional joke can remain competitive through points and visible portions.

## Kyekyekule

**Verified core.** A leader demonstrates bodily actions with singing, and the children imitate. Research specifically identifies it as a body-part-pointing game rather than an arbitrary button quiz. [Dzorwulu Special School study](https://oapub.org/edu/index.php/ejse/article/download/1416/4042).

**Current mismatch.** Three randomly selected poses with generic beeps omit call-and-response continuity. Head/hips/knees gesture meshes must visibly touch the named body part.

**Recommended implementation.** Animate a leader, a group response, and a legible four/five-step sequence involving head, shoulders/hips, knees and ankles. Add synchronized hand contacts and weight shifts, short anticipation beats and gradually faster response windows. An original percussive counting track is better than mislabelling invented lyrics as an authentic recording. Do not download and redistribute a copyrighted modern performance without checking its media licence.

## Pempenaa

**Verified core.** Fieldwork describes a seated line with both legs extended. The leader counts/sings across the legs; the leg selected when the phrase ends is folded/withdrawn. A participant whose two legs are withdrawn first ranks first; play continues through the group. [Akan ethno-musical field research](https://ojs.wiserpub.com/index.php/SER/article/download/444/2452/47034); [KNUST thesis, section 4.1.9](https://ir.knust.edu.gh/server/api/core/bitstreams/1a8bd34d-8473-493c-b2be-55f902f626f2/content).

**Current mismatch.** Six standing/crouching avatars in a circle, a glowing orbital marker and timing points do not implement individual leg elimination.

**Recommended implementation.** Seat a row of characters with 12 visible extended legs. Animate a leader pointing across currently active legs, stop at a phrase endpoint, and prompt the selected player to fold that specific leg. Track two legs per participant and exit order. If the human selects phrase length or timing, label it an arcade choice; the traditional count should not falsely become a skill-based hit window.

## Mbobagor

**Verified core.** UEW's Central Region account describes five or more participants squatting in a circle, each with a hand-sized stone. They pass anticlockwise in rhythm; accumulating a pile causes elimination. The account identifies a Sansakroma song accompaniment. [UEW thesis, Appendix F, printed p.179](https://ir.uew.edu.gh/bitstream/handle/123456789/2159/Folk%20games%20and%20life%20skills%20development%20among%20children%20in%20public%20schools%20in%20the%20Central%20Region%20of%20Ghana.pdf?isAllowed=y&sequence=1).

**Current mismatch.** One marker completing a circle every 12 seconds means the player waits while almost nothing happens. Other participants neither receive nor pass independent stones, and the three-strike counter does not create a pile.

**Recommended implementation.** Place one stone at each participant. On each beat all participants transfer one stone to their neighbour; allow the human a short action window. A missed transfer leaves their stone while the incoming one arrives, making an actual pile. Animate hand-to-ground pickup and lateral placement; increase tempo gradually. Three piled stones can be a clearly declared digital elimination threshold. Keep direction and incoming/outgoing hand poses consistent.

## Acceptance checks for the rebuild

- A player can identify every game by bodies, equipment and actions before reading its title.
- Props remain at plausible scale and make contact with hands, feet and ground.
- Physical outcomes follow object motion, not unrelated timer states.
- Research uncertainty and scoring conventions appear briefly in setup/rules, not as repeated in-game warnings.
- Board modes are enjoyable by one player through CPU opponents, without removing pass-and-play.
- Musical games use shared rhythm, multiple participants and visible turn state.
- Restart resets simulation, animation and audio state; pauses stop clocks and loops.
- New rule changes receive tests for legal edge cases rather than cosmetic snapshot assertions.
