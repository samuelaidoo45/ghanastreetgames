# User-specified Ghana street-game variants

Research checked 31 October 2026. The user's own descriptions are the controlling source for the local versions requested. Published accounts establish context and alternative rules, not grounds for replacing those descriptions. A match length, number of turns, target distance, AI response time or tie-break selected by the developer is a digital preset and must be labelled accordingly.

## Four Corners / Four Poles

The Ghana football game is distinct from the blindfolded classroom corner-calling game that shares the name. A firsthand photograph and its description by Amuzujoe (27 September 2018, own work) document four players defending four small perpendicular goals. A thrown ball starts play after its first bounce; the same player cannot kick it twice in succession. Conceding removes that defender, and a waiting player replaces them. The original image is CC BY-SA 4.0; it has not been downloaded or included in runtime assets.

Source: https://commons.wikimedia.org/wiki/File:A_game_of_%27four_corners%27_played_in_Ghana.jpg

The 2023 study by Patrick Owusu, Akosua Obuo Addo and Constantinos Xenofontos, *Alikoto: Mathematics instruction and cultural games in Ghana*, Appendix A, also distinguishes the corner-calling and ball versions and describes the same first-bounce, alternate-touch and conceding-player replacement rules. This is research drawing on the authors' childhood play, community transmission, observation and literature. It supports the four-player preset; it does not establish a universal national rulebook.

Source: https://www.tandfonline.com/doi/abs/10.1080/2331186X.2023.2207045

A University of Ghana dissertation search excerpt describes another version: four teams of three or four compete, with roughly 1.5×1×1 m goals, and the conceding team rotates out. Full PDF retrieval timed out; treat this as corroboration of variation rather than the primary implementation authority.

Source: https://ugspace.ug.edu.gh/bitstreams/039ed3b8-bc29-4356-aab2-a3e6ec87a98e/download

The user subsequently confirmed four players and four corner goals. Implementation recommendation: four actual defended corner goals, throw-and-bounce restart, only one consecutive touch per player, clear elimination/replacement. A finite last-player-standing round differs from documented rotating queues: explicitly call it a knockout preset if chosen. Do not implement ordinary three-a-side under this label.

## Penalties

The user requested a separate penalty game without specifying local shootout length. IFAB is a primary rules authority for the conventional penalty procedure: stationary ball, forward kick, goalkeeper on the line before contact, and no second touch by the taker until another player touches. A conventional shootout alternates five attempts per side, can end early when a side cannot catch up, and proceeds to equal-attempt sudden death when tied. A two-person street preset can alternate the player's striker/keeper roles using that scoring structure; this is not a claim that every Ghana neighborhood uses it. Street goal size and distance are developer-selected rather than full-size IFAB dimensions.

Sources: https://www.theifab.com/laws/latest/the-penalty-kick/ ; https://www.theifab.com/laws/latest/determining-the-outcome-of-a-match/

Implementation recommendation: aim and shot strength affect the real trajectory, keeper movement/dive has a timed reachable volume, and goals require ball crossing between posts below bar. Give the player both shooting and saving turns rather than a static repeated shot target.

## One Pole

User's rule: two players stand at opposite ends and try to strike the other player's pole; the higher score wins. Online searches did not locate a sufficiently specific Ghana firsthand account to add verified detail. Preserve a single upright target at each end, not a normal goal mouth. Implement actual ball-pole collision and defense/return opportunities. Duration/attempt count and any equal-score tie break are explicit digital match settings, not ethnographic facts. Do not substitute unrelated Poleball or badminton rules.

## Laski

User's rule: one keeper and multiple outfield players; keeper throws the ball into play; the scorer chooses another outfield player to eliminate. Continue until one outfield player remains. That winner chooses to be keeper or an outfield player in the next round. Online searches for the exact name did not find a credible independent game description. The user's local account is therefore the source, without marking the game itself fictitious.

Implementation recommendation: a shared single goal with a working keeper, aerial keeper delivery, contested loose ball, individual scorers, an explicit elimination-choice phase after a goal, remaining-player count, and a keeper/player choice that actually changes the next round's controls. Do not automatically eliminate the scorer or randomly remove somebody when the human scored. Do not turn it into team football. Exact player count, keeper selection after the winner elects to stay outfield, and out-of-bounds restart details are declared presets.

## Pampanaa / Pampanana / Shooting

User's version: neighborhood hide-and-pretend-shoot play, head/hand gesture or stick used as pretend gun, mouth-made firing call, eliminated players leave play, last remaining player wins. Implement that free-for-all version. The user's literal wording says “head”; a stick pose can implement the unambiguous part while avoiding a false claim that hand was what they wrote.

Alex Blege's firsthand Teshie Zongo childhood account (4 August 2015) independently supports hiding/searching, fingers shaped into a pretend gun and wooden/rubber props. His version has two teams and play ending when interrupted. Therefore the new free-for-all elimination condition comes from the user, not from Blege. The neighborhood implementation should have navigable alleys, walls, compounds and real occlusion rather than crates on a football pitch.

Sources: https://www.modernghana.com/news/634237/stroke-of-my-pen-playing-panpanaa-with-our-president.html

Implementation recommendation: rivals hide, search, peek and react to sight or sound; walls block sight and hits; eliminate a rival only after valid aim and mouth-call, without firearm projectiles. Rivals may also eliminate one another. One elimination removes the human from that round; no three lives, generic five-tag target or expiry timer. Give enough positional feedback to understand where a call came from without revealing every hidden opponent through walls.

## Tyre — rubber-band wall target

User's version: a small stick fixed/placed at a wall, targeted and struck by a rubber band. This differs from rolling a wheel with a guiding stick. Preserve both as separate entries if retaining the older rolling game, clearly naming this one “Tyre — rubber-band target.” Searches found Ghana rubber-tie throwing accounts where bands overlap on the floor, but not the requested wall-stick variant; those rules must not be substituted.

Implementation recommendation: wall, small stick target, visible band stretch, aim and release, physical loop flight/drop and stick contact/knock response. Target-hit scoring must depend on the stick, not hitting anywhere on the wall. Attempts, distance progression and any duel format are explicit presets.

## Mouth-made sound asset

Downloaded `dist/assets/audio/pampanaa-mouth.mp3`: 1.24-second mono excerpt from the final mouth “pew” sequence of OBXJohn's **Laser Gun Pew Pew**, 29 October 2016. The publisher categorizes it as speech, describes a child making the sounds, and releases it under CC0. It is not a gunshot recording, traditional Ghana call, Ghanaian voice or location recording. The introductory English phrase is omitted. Excerpt begins at 1.82 seconds; 10 ms fade-in and 40 ms fade-out; 96 kb/s MP3. Source high-quality public preview was used, not the login-only original WAV.

Primary page and licence: https://freesound.org/people/OBXJohn/sounds/365635/ ; https://creativecommons.org/publicdomain/zero/1.0/
Preview URL: https://cdn.freesound.org/previews/365/365635_3719168-hq.mp3

Credit text for assets/CREDITS.txt: “Pampanaa pretend-play mouth call: OBXJohn, Laser Gun Pew Pew (Freesound 365635), CC0; trimmed mouth-sound excerpt, converted to mono MP3. Generic licensed voice effect, not a Ghana field recording.” The parent agent should integrate this credit/manifest entry and audition the excerpt before release.

## Street football — selectable poles and players

The user subsequently requested ordinary street football with selectable small or big poles and selectable player counts. Treat these as separate gameplay choices before starting a match. Adjust actual goal collision dimensions and active team rosters, with sensible keeper behavior and field spacing at each size. The choice must change the playable match, not just a label. No exact local dimensions, allowed player-count range or special big-pole rule was supplied; these remain transparent digital presets.
