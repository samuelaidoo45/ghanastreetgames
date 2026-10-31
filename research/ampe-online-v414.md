# Ampe and private rooms — v4.14

## Ampe evidence and implementation

The Ghana Ministry of Education PEH teacher manual describes predominantly girls playing face-to-face, agreeing whether matching or opposite feet score, clapping, jumping together, extending one foot, and landing together. Source: https://curriculumresources.edu.gh/wp-content/uploads/2026/06/PEH-CORE-Teacher-manual.pdf . The browser version retains the existing first-to-five house rule and uses two visible claps before each shared jump. It is an adaptation, not a claim that every neighbourhood uses identical scoring.

Women players use the actual `gender_female` morph from the existing CC0 generated MakeHuman/CharacterCreator output, applied consistently to body, clothing and hair. The 557,112-byte shape file reuses existing textures, rigs and animations. `scripts/build-female-shape.py` handles quantized and sparse glTF accessors and reproduces the binary and manifest. No third-party generator code is copied. Sources and licensing: https://github.com/kblood/CharacterCreator/tree/master/output and https://github.com/kblood/CharacterCreator/blob/master/LICENSE-NOTES.md#generated-files-owner-decision-2026-10-03 .

Hand movement uses the actual arm bones, a two-bone reach, upright fingers and inward-facing palms. Two clap closures, jump, foot extension and landing have rig tests. Browser rendering remains unverified because local browser control is disabled.

## Online scope

- All 33 games can earn personal practice XP after a completed round for a signed-in guest player.
- Private friend rooms: live server-authoritative Ampe, Oware, Dame and Ludo, two players per duel.
- Other games: private score challenges, up to eight friends playing separate rounds with the same standard settings. These are explicitly labelled; no shared football simulation is claimed.
- D1 persists public nicknames, hashed random player keys, round records and an idempotent award ledger.
- Durable Objects persist room state, enforce membership/host/turn/revision checks and broadcast WebSocket state. Room lifetime is one hour. Reconnecting restores the current room. Leaving a live duel cancels it without a win award.
- Ampe choices remain secret until both players lock. Ludo dice are generated on the server. Board moves use the same tested rules as local games.
- Leaderboards include only server-validated friend matches. Win 100 points, draw 50 each, completed loss 25. Personal practice/challenge XP is 10–50 per completed round and is excluded from rankings.
- Practice/challenge results are client-reported and bounded. This is not tournament-grade anti-cheat; private opponents can collude. There is no public matchmaking.
- Recovery keys are 256-bit random secrets; SHA-256 digests are stored server-side. Keys stay on the player device and can be explicitly downloaded/restored. No passwords or emails are collected. A player who loses both browser data and their key cannot recover that identity.
- Authentication uses Authorization headers. WebSockets use one-use tickets with a 30-second expiry. Origins are restricted to the production frontend. Request bodies, message sizes, per-IP requests, per-player requests and per-connection message rates are limited. SQL is bound/parameterized; names are displayed through textContent. No Cloudflare account credentials are shipped.
- Results enter the durable room state before awards; retries use a unique (match, player) key. Pending awards retry through alarms. D1 transactions prevent duplicate solo awards.

## Operations

Account: 039c5077db7abd6f879e6f863c5e087e
D1: ghana-street-games / 02e10c0c-e646-41cc-977f-155d0fcc6958
Worker: ghana-street-games-api
API: https://ghana-street-games-api.christianoronald567-039.workers.dev
Production frontend: https://ghanastreetgames.vercel.app/

The unrelated worldfolk-prod database was not changed.

Local setup:

```sh
npx wrangler d1 migrations apply ghana-street-games --local --config cloudflare/wrangler.jsonc
npx wrangler dev --local --port 8787 --config cloudflare/wrangler.jsonc --var ALLOWED_ORIGINS:http://localhost:4173
node scripts/test-cloudflare.mjs
```

Deploy:

```sh
npx wrangler d1 migrations apply ghana-street-games --remote --config cloudflare/wrangler.jsonc
npx wrangler deploy --config cloudflare/wrangler.jsonc
```

For local frontend testing, point online-config.json at localhost and add that local HTTP/WebSocket endpoint to the development CSP; do not commit localhost origins to production. The migration is additive to the dedicated database. Hourly cleanup removes expired rate-limit rows and abandoned runs. Completed profiles/results remain persisted.

## Verification

- 237 automated tests pass, including all 33 existing modes, real-rig Ampe motion, female morph integrity and online move adapters.
- 42 application modules pass syntax/import/asset checks.
- The deployed Worker passes a two-player integration run: authentication, origin restrictions, room membership, host-only start, five complete Ampe rounds via Durable Object alarms, hidden foot choices, mid-game reconnect, server awards, duplicate rejection, practice persistence, leaderboard separation, board turn enforcement and a completed two-player Counters score challenge.
- Temporary QA player results are removed from the dedicated production database after verification.
- No rendered browser or real-phone test is claimed; browser access remains disabled in this environment.
