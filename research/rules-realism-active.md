# Active-game research and realism corrections

Checked 31 October 2026. This review distinguishes documented play from proposed digital design. A convincing simulation needs the correct object, social arrangement and consequence, not just improved polygons. No single national ruleset was established for these games. Historical corporal forfeits remain context in research; the playable adaptation can use role changes or points.

## Most important corrections

1. **Stay:** the current instruction to run/dodge after the call conflicts with the scholarly accounts. Select and explain a feet-planted return variant.
2. **Alikoto:** replace the generic wooden top with an improvised pen-cover/battery-cap spinner, and distinguish a successful flip/landing from merely stopping an upright top.
3. **Tumatu:** walking onto a tile before pressing Jump defeats hopscotch. Include a thrown marker, single-leg hopping and an out-and-back route.
4. **Pilolo:** hidden objects and a race against other players are central to the documented experience. Five exposed pickups with no rivals feel like a collection task.
5. **Pampanaa:** make hiding and visibility matter. The evidence describes teams searching for one another, not stationary targets.
6. **Kpitinge:** determine success from contact location and orientation, not a boolean assigned before the object flies.

## Street football / Four Corners

**Evidence and uncertainty.** The reference is a digital football product, not an authority for one Ghana-wide street ruleset. The earlier project inspection recorded three-a-side and four-goal modes. The present browser should be inspected directly by the main agent; the web text fetch was unavailable in this review. The academic survey separately describes improvised Four Poles: four goals, one touch before another player touches, and rotation after conceding. Do not collapse that into ordinary three-a-side. [Owusu & Obuo Addo, 2023](https://doi.org/10.1080/2331186X.2023.2207045), [reference](https://fourcornersgh.com/).

**Current mismatch.** `Football` uses instant possession snapping, straight chase behaviour and mostly static support positions. This is an original 90-second arcade format, not a researched match length.

**Implementation recommendation.** Prioritise acceleration/deceleration, a visible first touch, a pass target, charging a shot, recoverable tackles, support runs, defensive spacing and a goalkeeper or clearly stated keeperless format. Score only when the whole ball crosses the goal plane inside the frame. Make a quick rematch easy. Add Four Poles only as a separately explained rules variant.

## Ampe

**Verified core.** Players face each other, clap, jump and put one foot forward. Before starting, they agree who scores for matching or different feet. A primary study of Ghanaian early-years play explicitly records this agreement; circle/leader variants are also reported. Gender descriptions in individual studies describe their samples, not an instruction to exclude players. [Cambridge doctoral research, introductory footnotes](https://api.repository.cam.ac.uk/server/api/core/bitstreams/ef713598-6c0b-4ad0-bbee-d23806917ccd/content), [Anthony Addo first-person interview, Accra](https://africanchildrensfolklore.wordpress.com/2015/05/31/interview-anthony/).

**Current mismatch.** A random foot choice plus two seconds of animation is recognisable but visually ambiguous: two characters facing one another need unambiguous left/right anatomy, and the feet should land simultaneously.

**Implementation recommendation.** Add a short shared clap-clap/jump cadence, let the user commit their foot before the landing beat, show both feet clearly, and offer the agreed matching/opposite rule before play. Keep the first-to-five score explicitly as this edition's format. Do not give the computer access to the player's pending choice.

## Pilolo

**Verified core and variants.** A primary field study records both finding a hidden object and returning to an agreed point, and a single-object version whose finder becomes the next hider. Cambridge research reports a highest-number-of-sticks variant. These are alternatives; the shortest-stick elimination reported elsewhere is not universal. [Agyeman et al., sections 3.17–3.18](https://ojs.wiserpub.com/index.php/SER/article/download/444/2452/47034), [Cambridge research](https://api.repository.cam.ac.uk/server/api/core/bitstreams/ef713598-6c0b-4ad0-bbee-d23806917ccd/content).

**Current mismatch.** Five bright, exposed sticks in fixed positions, no other seekers and repeated individual deliveries are a generic fetch quest.

**Implementation recommendation.** Select “find one and race home.” Hide sticks behind actual occluding props, start three or four seekers together after the call, allow each to carry one, and place a visible finish line. Randomise hiding spots from valid reachable positions. A short countdown and rival footsteps create tension without inventing extra traditional rules.

## Chaskele

**Verified core.** Community recollection describes a flattened can, wooden stick and a rimless tyre lying flat; the tyre opening is the target. A defender knocks incoming throws away. Accounts allow different group sizes and a bucket instead of a tyre. [Change for Ghana, first-person recollection](https://www.changeforghana.org/post/7-memorable-ghanaian-games).

**Current mismatch.** `Chaskele` renders a smooth spherical ball, tests a broad player-to-ball radius rather than bat contact, and counts defence without testing the tyre opening.

**Implementation recommendation.** Model a dented metal can with an asymmetric tumble and sharp contact sound. Give the bat a swept collision volume during the swing; outside that volume, no hit. A valid opposing score requires the can to descend into the tyre hole. Alternate throwing and defending after a short set; varied throw arcs and a readable wind-up are design additions.

## Stay / Stay for you

**Verified core and conflict.** The academic survey describes juggling totals, a retriever, a call to stay and ball returns while stationary; its account mentions foot and head returns. A University of Ghana thesis describes players staying where they are and a throw intended to touch their hands, transferring the throwing role. Neither account establishes “freeze briefly, then freely dodge.” The exact phrase “Stay for you” was not established as a canonical title. [Owusu & Obuo Addo, 2023](https://doi.org/10.1080/2331186X.2023.2207045), [University of Ghana thesis, section 2.1.1, p.16; full title/author not verified](https://ugspace.ug.edu.gh/server/api/core/bitstreams/039ed3b8-bc29-4356-aab2-a3e6ec87a98e/content).

**Current mismatch.** `Stay.update` permits movement during the throw and tells the player “Now DODGE.” That is an arcade invention.

**Implementation recommendation.** Declare a feet-planted return variant. Let players move until the call, then lock root translation. Read the ball's height/trajectory and time a kick or header; a miss or illegal step changes the retriever. Include an optional short juggling selection round. The input should control the return animation and contact window, not reverse the freeze rule.

## Alikoto / Alokoto

**Verified core and variants.** The described object combines a pen cover with the cap of a D-size battery. One documented version spins it and uses a palm-side strike to flip it onto its broad head. Another recollection emphasises whether it lands flat. This supports an improvised metal/plastic spinner, not a generic conical wooden top. [Graphic's illustrated account](https://www.graphic.com.gh/entertainment/showbiz-news/here-are-some-classic-local-games-from-back-in-the-day.html), [Change for Ghana](https://www.changeforghana.org/post/7-memorable-ghanaian-games).

**Current mismatch.** The model is a coloured cone; tapping Land sets the object to an upright or fallen angle, with success determined before physical contact.

**Implementation recommendation.** Build a short plastic pen cap with a wide, weathered metal base. Use a close tabletop/sand camera, spin-up motion, a deliberate palm flick, angular momentum, and a final stable-contact test. Name the chosen success condition in setup. Compare attempts against a visible opponent; use points rather than hand strikes.

## Tumatu / Tuumatu / Tumantu

**Verified core and variants.** An academic account describes ground lines, a small sand-filled bag thrown into a space, hopping to the end and returning while avoiding that space, and not touching boundary lines. It also records a different bag-attached-to-leg version. Claimed or blocked spaces are reported, but the specific pattern varies. [Owusu & Obuo Addo, 2023, Appendix A](https://doi.org/10.1080/2331186X.2023.2207045).

**Current mismatch.** The avatar walks freely; a jump only checks where the body happens to be when it lands. The course is one-way, and the blocked square is fixed.

**Implementation recommendation.** Draw chalk on dirt rather than raised platforms. Add a marker toss, then constrain progress to one-leg hops; validate the landing footprint against the next permitted cell and its boundary. Reach the end, turn and return. Preserve an easy retry at the start of the turn. A projected foot-placement cue may assist input, but should not replace landing accuracy.

## Antoakyire

**Verified core.** Primary fieldwork describes participants sitting, kneeling or squatting in a circle, with a runner secretly dropping an object behind someone. An alert recipient picks it up and pursues the runner toward the vacated place. Looking backward is forbidden in that documented variant. [Agyeman et al., section 3.2](https://ojs.wiserpub.com/index.php/SER/article/download/444/2452/47034). A first-person account from a player also describes a knotted cloth and the exchange of places. [Gina Adu Sika, 2015](https://ginaadusika.wordpress.com/2015/09/29/ghanaian-folk-game-antoakyire/).

**Current mismatch.** The current mode always drops at the player's feet after the same lap and automatically supplies a large alert. There is no actual cloth pick-up or sitting action.

**Implementation recommendation.** Animate carrying and lowering the cloth, vary the drop lap, give a small nearby cloth/footstep cue, require pick-up, then race to the empty seat. Add a runner turn in which the player chooses whom to drop behind. A score-based five-round format is a digital convention. Avoid making a fixed repeated button sequence the entire game.

## Pampanaa / Panpanaa and “Shooting”

**Verified core.** Alex Blege's first-person Teshie Zongo account describes at least four children split into two groups. Both groups hide; after the starting call they search for one another. Spotting an opponent is signalled by pretend shooting with fingers or toy props. His account does not establish a strict round duration, health bar or respawn system. [Blege, 2015](https://www.modernghana.com/news/634237/stroke-of-my-pen-playing-panpanaa-with-our-president.html).

**Current mismatch.** Five stationary rivals in an open arena, with automatic “spotted” penalties at close distance, miss the reciprocal hiding/searching experience. The alias “Shooting” remains unverified.

**Implementation recommendation.** Provide a short hiding phase, two small teams, cover that genuinely blocks visibility, rivals that patrol and search last-seen positions, and a deliberate spotting/call action. Use one clear line-of-sight check for both sides; distance alone should not see through walls. A best-of-three tag round is an openly declared game-design choice. Keep pretend props and social play rather than importing military combat.

## Sulia for Beatings

**Evidence status.** Repeated searches for the exact phrase and Sulia combined with Ghana/football/children/rules still did not locate a reliable account. The reference's earlier inspected “coming soon” label establishes the title, not its mechanics. No identity with keep-away, Zanzama, Alikoto or another game is demonstrated. [Reference](https://fourcornersgh.com/).

**Current mismatch.** The current experimental label is honest, but the keep-away mode cannot become “authentic Sulia” through more realistic graphics.

**Implementation recommendation.** Retain a plainly named experimental practice mode and its disclosure. Do not market its six-pass rules as reconstructed tradition. Genuine reconstruction requires an identifiable participant's account or other community evidence; generic internet descriptions of football are not enough.

## Sansankroma

**Verified variant.** A primary Ashanti field study describes children circling a central hawk, then scattering toward marked refuges on a signal. The hawk cannot operate inside those refuges. Other accounts use the same song/name with stone passing; preserve the variant distinction. [Agyeman et al., section 3.18](https://ojs.wiserpub.com/index.php/SER/article/download/444/2452/47034).

**Current mismatch.** The current version starts with an immediate chase of a lone player and requires eight numbered checkpoints. Those are digital additions.

**Implementation recommendation.** Show several chickens, begin with a brief circle phase, then signal a simultaneous escape. Make the hawk choose and switch targets plausibly. Keep refuge geometry consistent with collision checks. An eight-refuge score may remain as an “arcade course,” but an escape-round format is closer to the described activity.

## Kpitinge

**Verified core.** An illustrated Ghanaian account describes planting a pointed object in a sand heap from different positions. A separately reported version uses a weighted, non-working pen case and broom tip. A school bulletin independently documents children playing the named game, but does not define its mechanics. [Graphic](https://www.graphic.com.gh/entertainment/showbiz-news/here-are-some-classic-local-games-from-back-in-the-day.html), [GhanaWeb report syndicated with attribution](https://www.ghheadlines.com/agency/ghana-web-/20191120/132669923/from-chaskele-to-fifa-games-that-indomie-kids-may-never-experience), [Tema International School bulletin, 22 November 2019](https://www.tis.edu.gh/wp-content/uploads/2019/11/TIS-Bulletin-221119-R_compressed.pdf).

**Current mismatch.** The code precomputes success from release angle and aim, then snaps the peg upright when it touches ground anywhere.

**Implementation recommendation.** Render the small weighted object at plausible scale, give the hand a release arc, and test its tip against the sand surface. Require the tip to land inside the mound with a suitable downward orientation; misses should visibly bounce or lie flat. Difficulty should vary distance and landing angle rather than an invisible success flag.

## Zanzama

**Verified core.** In a first-person recollection, participants must remember to say the name before sitting; forgetting attracts a historical physical forfeit. This is an ongoing social memory pact, not a standard sport with numbered seats. [Change for Ghana](https://www.changeforghana.org/post/7-memorable-ghanaian-games).

**Current mismatch.** The avatar bends forward but does not sit; the same immediate Say/Sit pair repeated at a highlighted stool is too obvious to test recall.

**Implementation recommendation.** Use credible seat-contact animation. Interleave a brief movement or conversation distraction before a seat becomes available, then test whether the player remembers the declaration. Five encounters and points are declared adaptation choices. Do not add a mandatory historical punishment animation for authenticity.

## Police and thieves

**Evidence limit.** Graphic lists the game among remembered Ghanaian childhood activities but supplies no local jail/rescue/tag rulebook. The current three-friend rescue mechanics therefore remain a project-created adaptation, not verified Ghanaian rules. [Graphic](https://www.graphic.com.gh/entertainment/showbiz-news/here-are-some-classic-local-games-from-back-in-the-day.html).

**Current mismatch.** A single pursuer walks through the environment while rescued friends simply follow. Obstacle navigation and consistent tagging are weak.

**Implementation recommendation.** Explicitly call it a chase-and-rescue interpretation. Use a visible refuge and holding area, navigable routes around obstacles, escape/capture states, rival search behaviour, and a brief non-violent tag animation. Leave exact team sizes, release conventions and scoring configurable until local testimony establishes a variant.

## Research limitations

Some publisher/PDF direct fetches were blocked; the indexed scholarly passages were accessible and matched the citations in the existing research. Sources disagree on several variants. This document does not reproduce lyrics or suggest that one song recording is cleared for reuse. Realistic chanting should use a licensed recording or a newly commissioned performance, with language and timing checked by a speaker. “EA Sports standard” is not a rules claim or a quality level established by these sources.
