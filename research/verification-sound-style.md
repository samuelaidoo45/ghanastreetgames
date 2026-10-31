# Sound and street-sign styling verification — v4.1.0

31 October 2026. Existing current-account Site identity and owner-private audience preserved.

## Changed behavior

- Full-screen launch menu over the live 3D street; Enter the street opens the game posters. First trusted tap/key creates/resumes Web Audio, allowing menu music before any match starts. Saved mute preference is respected.
- Licensed instrumental arrangement of “The Soul is a Pulse,” the composition credited in Four Corners' public source. The exact arrangement used in that game was not established. Upstream album/track licences are preserved; runtime credits link the artist, source and CC BY 3.0 terms.
- GESMA Ayeduase street and Kejetia market-crowd loops join the existing outdoor recording. Venue-dependent gains crossfade between menu, pitch and neighbourhood play. Market murmurs are generic social ambience, not claimed to be football cheering. CC BY 4.0 attribution, source IDs and edits are included in credits.
- Separate persisted music, ambience and effects levels; master mute; hidden-tab silence; no duplicated loops when re-entering a game. Lower neighbourhood music leaves action sounds clearer. Sound graph connects through one limiter to both playback and replay capture. Live soundtrack fades away while replay video is viewed, avoiding two simultaneous soundtracks.
- Reference-led gold lettering with red/green offset shadows, uneven poster corners, raised pill buttons, parchment dialogs and woven trim. Desktop uses three tall primary posters and three compact supporting posters; portrait retains six usable cards. A separate stylesheet scopes this visual update, preserving game mechanics.

## Checks performed

`npm run check`: 21 modules parse, both stylesheets remain CSS, and local HTML/CSS/module dependencies resolve.

`npm test`: 82 tests pass, 0 fail. Six new audio tests verify first-interaction menu playback, concurrent unlocks, nonduplicating loops across scenes, channel/mute/visibility control, shared replay graph, lower neighbourhood music, missing-audio support, venue crossfades and replay suppression. These are mocked AudioContext lifecycle tests, not audible browser tests.

HTML parsing confirms unique IDs, valid slider labels and launch controls. Every audio filename exists. All asset-manifest hashes match. FFmpeg decodes all three new recordings without errors. Music opens with measurable signal; no listening claim is made. Local HTTP preview returns 200 and was handed to the user's preview panel.

## Verification limit

The supported browser-control tool again reported local browser use disabled. No alternative browser-control path was used. Live audio audition, actual Web Audio autoplay behavior, rendered desktop/phone layout, screenshots and interactive browser QA remain unverified. Source inspection of Four Corners supplies design/audio evidence; it is not a live comparison or byte-identical reproduction. No claim of exact subjective sound matching is made.

## Security and attribution

No new remote runtime request, account permission, backend, analytics or user-data collection. Audio and styling are self-hosted; the existing CSP remains. Audio preferences are bounded to supported values and saved locally. Audio cache does not contain credentials. Source repository credential is passed through hidden stdin only. New CC BY media is explicitly distinguished from earlier CC0 assets in credits and manifest.
