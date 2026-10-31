# Four Corners GH reconstruction notes

Inspected 31 October 2026. Target: https://fourcornersgh.com/ . Tool: REA 6.8.0 from the official npm package referenced by https://github.com/morluto/rea . Executed using Node 22.23.4 through npm exec from /tmp.

## REA execution and limit

Command: `npm exec --yes --package=node@22.23.4 --package=rea-agents@6.8.0 -- rea analyze-javascript-application /tmp/ghana-rea-input --json`.

Input was the public main JavaScript bundle downloaded from the script URL in the site's HTML (`assets/main-SY6dJxOA.js`). REA produced an artifact inventory and partial evidence, then failed in its macOS process-ownership helper: Apple Swift compiler reported duplicate module `SwiftBridging`. The error and partial evidence are retained in `rea-evidence.json`. `rea doctor --json` confirmed the selected Node version is supported; its missing native analysis engines do not explain or fix this JavaScript helper error. No agent configuration or system compiler files were changed.

Deep REA module/route analysis is therefore incomplete. This project does not claim to have recovered the original source or backend. The downloadable main bundle and CSS remain in /tmp for inspection only, and are not redistributed in this project.

## Directly observed public behavior

- Browser start screen leads to Quick Match, Four Corners, Street Tour, Penalties and Practice.
- Sulia for Beatings is visible but disabled and marked coming soon.
- Player customisation, a shop, friend play and a voice toggle appear in the menu. Their server-side behavior was not investigated.
- Public HTML describes browser football, three-a-side, a four-goal mode, named Accra pitches, single and multiplayer play.
- Public script tags show a main application bundle plus Three.js and Rapier-labelled chunks. This is a dependency observation, not proof of internal architecture beyond these tags.
- Visual language: large game selection cards, Ghanaian locality, strong signboard typography, tactile playground settings.

## Translation into Ghana Street Games

The new application uses an original multi-game selection flow, self-contained browser game modules, a source-backed library, responsive touch controls, local favourites and local research notes. It does not reuse the original site's code, artwork, authorship, backend, accounts, multiplayer or voice systems. Street football is an original 2D one-on-one game, not a feature-equivalent port of the original 3D three-a-side simulation.

The research and game model deliberately distinguish playable adaptations, documented outdoor games and unverified requested names. Nine digital adaptations are currently playable. Shooting and Sulia remain explicitly unverified, so no mechanics have been invented under those names.
