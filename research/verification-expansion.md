# Expansion verification — 31 October 2026

The expanded checkout is `ghana-street-games-expanded`, registered to the currently connected Sites account at the user's instruction. The previous account's deployment was not updated. Project identity is tracked in `.openai/hosting.json`.

## Implemented scope

33 playable catalogue entries. Five additions: Four Corners, Penalties, One Pole, Laski, and Tyre — rubber-band target. Pampanaa/Shooting now use the supplied neighbourhood elimination rules. Street football accepts 1–7 players per side with actual 2 m × 1 m or 5 m × 2.5 m goals. Pilolo has fourteen concealed-object locations throughout an alley-and-compound neighbourhood. Buildings and walls affect navigation and line of sight. The houses have doorways and exterior hiding spots, not walkable interiors.

Venues vary between the football pitch, neighbourhood, street lane, wall yard, sand compound, schoolyard and veranda. Existing rigged people, photographic PBR materials, HDR lighting and replay recording are retained. Added a credited CC0 mouth-made pretend-play call. No proprietary Four Corners media was copied. No claim of EA Sports production quality or universal Ghanaian rule accuracy is made.

The user's local rules control the requested variants; `user-variants-2026-10-31.md` separates corroboration from digital match presets. Examples: Four Corners finite knockout rather than a rotating queue; six attempts each for One Pole and rubber-band target; five paired penalties before sudden death; four initial Laski field players.

## Automated checks

`npm run check`: 21 application modules pass syntax checks; all local HTML/CSS assets and direct application imports resolve. A final asset inspection caught JavaScript accidentally written into the stylesheet. The established stylesheet was restored, the new match controls appended, and a check now rejects this failure.

`npm test`: 76 tests pass, 0 fail. The new focused cases cover every football team size and both goal geometries; small-goal over-bar rejection; Four Corners alternate touches, central-ball contest and actual goal crossing; pole collision versus a miss; Laski exact elimination choice, no self-elimination, human winner role selection and CPU keeper replacement; Pampanaa occlusion, one-hit removal, rival-versus-rival elimination and final survivor; collision-safe neighbourhood routes; all fourteen Pilolo hiding places reachable; rubber-band contact and power-dependent flight; penalty saves, clear/wide shots, alternation and paired sudden death. Existing rule regressions and all 33 modes' numerical simulations also pass.

The Pilolo reachability test initially exposed an invalid grid endpoint beside a wall. Pathfinding now connects actual positions to accessible grid nodes; all hiding places pass. Four Corners AI now contests the central throw instead of staying too far away to participate.

## Preview limitations

The local HTTP server served the expanded build successfully. Browser-control calls returned “Local browser use is disabled in Work settings,” including a retry after the user said they would enable access. No replacement browser automation route was used. **No browser screenshot, rendered-layout, live input, frame-rate, sound audition or replay capture has been verified for this expansion.** Earlier verification reports apply to the preceding version only.

Menu images now render from their actual scenes at first load and are cached as JPEGs in IndexedDB. This avoids missing image files for new games. The new cache and first-load path have syntax/static checks, but browser execution remains unverified. Low-end-device performance, portrait touch layout and visual camera framing require browser QA.

## Runtime security review

Static client-only application; no new backend, account system, uploads, analytics or external runtime requests. Existing restrictive HTML CSP retained. Runtime source contains no hosting credential. User labels/search/rules use textContent or fixed owned markup. Settings use supported finite choices. New local cache stores only generated `data:image/jpeg` scene previews and accepts only that prefix. Media licence provenance and SHA-256 file inventory updated. The short-lived source credential is passed to the official workflow helper through hidden stdin, never saved into project files. New hosting keeps the creation default of owner-private access.
