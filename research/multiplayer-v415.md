# All-games human multiplayer and points — 4.15

The previous release offered four live duels and 29 independent score challenges. This release replaces that split with shared private sessions for every catalogue game.

## Gameplay and seats

`dist/multiplayer-games.js` is the shared client/server capacity registry. Four Corners needs four humans. Football requires even teams (2–12 people); four or more players include a human keeper on each team. Laski reserves the last seat for a human keeper. Other group games accept their stated minimum up to the scene's capacity. Vacant participants are hidden and excluded; AI movement, throws, shots and eliminations are disabled in live rooms.

Skill games played by one person at a time use shared live turns: Tumatu, Alikoto, Kpitinge, Numbers, Skipping, Zanzama, Tyre and Maame ne Paapa. Everyone watches the host's same arena, the current human supplies the controls, and the server advances the seat after completion or the 90-second turn limit. Counters Ball, One Pole, Rubberband and Alasa alternate actions within one shared match. Ampe, Oware, Dame and Ludo retain the authoritative rules from 4.14.

## Transport and authority

The host runs existing Three.js gameplay; guest devices interpolate actor positions and animate rigs locally. Scene transforms use stable seeded construction and delta frames at at most 10 Hz. Rigs, textures and geometry are not retransmitted. Inputs expire to neutral after 350 ms, so disconnected players do not run indefinitely. All clients must report loaded before play advances. Guests recover the latest complete scene on reconnect. The host must keep its tab open; host reload cancels the round rather than pretending to restore unrecorded physics state.

The Worker authenticates room membership, stamps each input with its real seat, rejects guest scene/result writes, bounds messages and transforms, caps message rates, and serializes room changes. Results are persisted before the D1 award flush, with an idempotent `(match, player)` key. Match points are 100 / 50 / 25 for win / draw / completed loss. **Live arena results are host-reported**; these are casual friend rooms, not a fully authoritative anti-cheat service. Public copy explicitly distinguishes that from server-checked Ampe and boards. Practice is also client-reported and separately typed in the ledger. Public leaderboard filters include every game.

## Points and offline behavior

First play automatically creates a persistent player, without requiring a visit to the Friends panel. All 33 games share the bounded 10–50 practice XP formula. Stay now has a 150-second/five-transfers completion condition so its practice points can be awarded. Completed results first enter a device-local journal. Successful cloud awards remove the local pending entry; duplicate completion callbacks do not duplicate points. Interrupted submissions retry when connectivity returns. Entirely offline rounds remain device-local and are not advertised as saved to Cloudflare or included in the cloud leaderboard. Recovery keys restore cloud progress on another device.

## Verification

- Full existing test suite plus live-room coverage: every game constructs at full and minimum human capacity; simulation stays finite; idle human opponents do not act; no duplicate points; invalid role/input/frame/score/turn writes rejected.
- Separate host and guest Three.js scenes accept the same transform snapshot; unchanged scene nodes produce no delta.
- Actual local Cloudflare Worker/D1/Durable Objects tested using two authenticated WebSocket clients: hidden Ampe choices, real alarms, board turn checks, live input/frame relay, guest reconnect, host-only scene results, human turn advancement, persistent points and repeat-award rejection.
- Visual/browser verification unavailable: computer-use reports the Mac locked and local browser use disabled. No claim of physical phone or visual browser testing.

## Release verification

The complete suite passes 313 tests; all 47 application modules pass syntax and asset/import checks. The deployed Cloudflare Worker is version `ef0f0210-c0c9-43dd-8168-7e698f7ef6a5`. The two-client production verification passed the same 17 authentication, realtime, persistence and idempotency checks as the local runtime. An initial test run exposed a stale client-snapshot race in the test itself; its wait now checks the matching round and phase before asserting hidden choices. The QA ledger/profile rows are removed by exact generated player IDs after verification.

