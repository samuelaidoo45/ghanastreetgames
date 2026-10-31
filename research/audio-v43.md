# New menu and handclap assets — 31 October 2026

User request: change the clapping and the menu/launch sounds to nice sounds that are free to use. This pass supplies a different instrumental track and a short, softer recorded clap. Neither file is taken from Four Corners GH.

## Delivered files

| Runtime path | Duration | Size | Source |
| --- | --- | --- | --- |
| `assets/audio/v43/menu-loop.mp3` | 66.782608 s | 1,069,748 bytes | John Bartmann, *Happy African Village* |
| `assets/audio/v43/soft-clap.mp3` | 0.144331 s | 2,611 bytes | hypernovajm, *Soft clap 7.wav* |

The instrumental uses acoustic guitar and percussion according to its composer, giving the menu a lighter rhythmic bed. It is not a Ghanaian field recording or a claim of traditional Ghanaian music. The clap is a recorded soft three-person clap from a percussion session, rather than the existing sharp single clap.

## Licence evidence

### John Bartmann — Happy African Village

- Composer release: https://johnbartmann.bandcamp.com/track/happy-african-village
- Original album distribution: https://freemusicarchive.org/music/John_Bartmann/Public_Domain_Soundtrack_Music_Album_One/happy-african-village
- File obtained directly from FMA: https://files.freemusicarchive.org/storage-freemusicarchive-org/music/ccCommunity/John_Bartmann/Public_Domain_Soundtrack_Music_Album_One/John_Bartmann_-_02_-_Happy_African_Village.mp3
- CC0 terms: https://creativecommons.org/publicdomain/zero/1.0/
- Both the composer release description and current FMA track listing explicitly identify this work as CC0/public domain. The composer's release page was fetched and its declaration verified on 31 October 2026.
- **Metadata discrepancy:** the original FMA MP3 retains an older ID3 comment saying CC BY-NC-ND 4.0. This is inconsistent with the composer's explicit public-domain release description and the current FMA track licence. Reuse is based on the author's CC0 release, not the old embedded tag. The edited output has fresh accurate title/artist metadata; source hash below preserves identification. Retain the composer credit voluntarily.

### hypernovajm — Soft clap 7.wav

- Creator's page: https://freesound.org/people/hypernovajm/sounds/384151/
- Public HQ preview obtained from the creator's page: https://cdn.freesound.org/previews/384/384151_615735-hq.mp3
- Creator's page explicitly identifies Creative Commons 0.
- CC0 terms: https://creativecommons.org/publicdomain/zero/1.0/

## Transformations and checks

Music: excerpt starting at 8.347826 s, 66.782609 s of music (approximately 32 bars at 115 BPM). An additional 80 ms of source was used as a wrap crossfade into the first 80 ms while preserving loop duration. High-pass at 35 Hz, low-pass at 14 kHz, loudness normalization toward -16 LUFS / -2 dBTP; stereo 44.1 kHz MP3 at 128 kb/s. Final measured loudness: -16.13 LUFS, true peak -2.14 dBTP, loudness range 2.30 LU. No vocals or borrowed proprietary Four Corners media were added.

Clap: mono 44.1 kHz MP3, high-pass 110 Hz, low-pass 7 kHz, +13 dB gain, 34 ms tail fade, 96 kb/s. Final measured peak -7.9 dBFS and mean -30.4 dBFS. The very short transient is intentionally quieter than the previous sharp clap.

Both outputs decode successfully with FFmpeg and contain audio. No live browser listening/playback test was performed; auditory preference remains subjective. Do not describe the audio as personally auditioned. Current channel controls can be retained. Suggested effects gains: clap 0.40, point 0.28. Menu scene mix can remain at 0.58; user music volume remains adjustable. Existing gameplay ambience should remain underneath.

## Integration

Set `FILES.music` to `v43/menu-loop.mp3` and both `FILES.clap` and `FILES.point` to `v43/soft-clap.mp3`. Update the settings music credit from the old track to *Happy African Village — John Bartmann*. Replace the active menu-music credit in the runtime CREDITS file while retaining old attribution if the old asset remains shipped. Parent owns these integration changes and asset manifest refresh.

Suggested runtime credit:

MENU / LAUNCH MUSIC — CC0: Happy African Village, John Bartmann. Composer release: https://johnbartmann.bandcamp.com/track/happy-african-village ; original distribution: https://freemusicarchive.org/music/John_Bartmann/Public_Domain_Soundtrack_Music_Album_One/happy-african-village . Edited into a 66.78-second, normalized, wrap-crossfaded menu loop. No endorsement implied.

SOFT HANDCLAP — CC0: Soft clap 7.wav, hypernovajm, https://freesound.org/people/hypernovajm/sounds/384151/ . HQ preview filtered, gain-adjusted and faded for the game. https://creativecommons.org/publicdomain/zero/1.0/ .

## SHA-256

- Output `menu-loop.mp3`: `140fd6cc5d1a65e22c76c383adc8c301e0811871bea76935f68b5437cc26eef1`
- Output `soft-clap.mp3`: `193ea36f2bbd3f5a6a8c5fea34a98384f5e86ca2a113f8d1eac23eb53898a45d`
- Original FMA MP3: `7c99f8e18b4e161dc08f445ae58bbb53826d26a52014756917eae389c44aa90e`
- Original Freesound HQ preview: `5dcc2b9ee2cd8a267d3f5621433896f2b3e1ab3e1c4a15232fe4b1d4bf0527d8`

A shorter CC0 alternative, *Tropical Loop* by wipics, was researched but not shipped: https://opengameart.org/content/tropical-loop . The selected track has a more developed acoustic arrangement.
