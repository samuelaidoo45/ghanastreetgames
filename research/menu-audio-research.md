# Menu and gameplay audio — reference research

Checked 31 October 2026. Browser control was disabled. Findings below come from Four Corners’ previously downloaded public production bundle (`/private/tmp/ghana-rea-input/main.js`, obtained 31 October), not a listening session. No claim of auditioning or matching its exact mix is made.

## Reference behavior

- The public bundle loads `./sounds/menu-music.mp3`, sets `loop=true`, and preloads it. The menu music target gain is 0.2, with a 0.5 s fade-in and 1.2 s fade-out. User pointer, touch, click or keyboard interaction creates/resumes audio; music has a distinct setting from effects.
- Gameplay uses layered, venue-dependent environmental beds, with intermittent events. Observed identifiers include traffic-road, kids-football, neighbourhood-afternoon-koforidua, gh-crowd, gh-market, gh-horns, scooter-pass, okadas and brass-band-kpando. This establishes that its atmosphere is more than one generic nature loop.
- The in-game credits in the public bundle name **“The Soul is a Pulse” by Michał Jałochowski**, CC BY 3.0, with an Internet Archive album link. It credits GESMA under CC BY 4.0 for Ghanaian environmental sounds. These upstream licences are independently confirmed below. The bundle does not reveal which of the album’s three vocal arrangements is used as menu-music.mp3; do not claim a byte-identical soundtrack.
- The exact original source bundle and its proprietary implementation are not redistributed.

Reference: https://fourcornersgh.com/

## Music delivered

`dist/assets/audio/menu-music.mp3`: **2. The Soul is a Pulse / Non Vocal Version**, Michał Jałochowski. 247.0 seconds, 44.1 kHz stereo, 5,981,349 bytes. This is the instrumental arrangement of the same credited composition. The upstream album describes genres including afrobeat, chillout, energetic, happy and rnb. Instrumental avoids competing lyrics during play. Original upstream MP3 is unchanged apart from local filename.

Source: https://archive.org/details/jamendo-613486
Original composer release: https://www.jamendo.com/album/613486
Licence: https://creativecommons.org/licenses/by/3.0/
Download: https://archive.org/download/jamendo-613486/02-2275566-Micha_%20Ja_ochowski-2.%20The%20Soul%20is%20a%20Pulse%20_%20Non%20Vocal%20Version.mp3

Internet Archive metadata reports `licenseurl=http://creativecommons.org/licenses/by/3.0/`. Its archived Jamendo `License.txt` independently lists tracks 01, 02 and 03 as CC BY 3.0. The archived `Readme.txt` identifies legal free Jamendo distribution. Metadata and both texts are retained in `research/asset-sources/music/`. The web reader could not load Jamendo directly; the album and track licence evidence came from the upstream archive. Download was obtained from the storage host returned by Archive’s metadata API after its ordinary redirect temporarily failed.

Suggested runtime credit: “The Soul is a Pulse / Non Vocal Version — Michał Jałochowski. CC BY 3.0. Source: Internet Archive / Jamendo album 613486. Filename changed; recording otherwise unchanged.” Include linked source and licence. Do not label this CC0 or original commissioned music.

## Ghana environmental recordings

Dataset: **GESMA: A Dataset of Ghanaian Environmental Soundscapes for Machine Learning Applications**, DOI 10.5281/zenodo.18315044, version 1, published 25 January 2026.
Source: https://zenodo.org/records/18315044
Licence: https://creativecommons.org/licenses/by/4.0/

The primary record/API confirms `cc-by-4.0`. Authors: Rose-Mary Owusuaa Mensah Gyening, Juliet Arthur, Prince Dawson Tetteh, Kelvin Ackah, Felix Adu Mensah Amofah, Jerry John Kponyo, Emmanuel Ahene, Betty Agyei Kponyo and Justice Owusu Agyemang. The dataset describes recordings from Ghana and states that intelligible speech and poor-signal clips were excluded. That is the publisher’s screening statement; these specific excerpts have not been auditioned here.

Only the central directory, metadata workbook and selected WAV ranges were fetched from `Urban_life_and_Public_spaces_1.zip`; the 4.2 GB archive was not downloaded wholesale. Selection metadata and original clips are kept under `research/asset-sources/gesma/`.

### Delivered ambience loops

- `dist/assets/audio/street-ambience.ogg`: source class **Roadside/Street → Ambient street sounds**, community **Ayeduase**, Ashanti Region. Original IDs `NSE-PDJRZ-20250923133157-AB5`, `NSE-PDJRZ-20250923133157-BA9`, `NSE-PDJRZ-20250923133157-474` (10 s each).
- `dist/assets/audio/crowd-ambience.ogg`: source class **Local Markets and Streets → Crowd murmurs**, community **Kejetia**, Ashanti Region. Original IDs `NSE-JAIMQ-20251022154959-A3A`, `NSE-JAIMQ-20251022154959-38B`, `NSE-JAIMQ-20251022154959-995` (approximately 10 s each). This is market crowd atmosphere, not a recorded football crowd or children's chorus. Use quietly in appropriate social venues; do not label it football cheering.

Edits: three samples joined with one-second linear crossfades; trimmed to 28 s; last and first seconds blended into a continuous 27 s loop; resampled to 24 kHz for processing, 100 Hz high-pass and 6 kHz low-pass; loudness normalized to −23 LUFS / −4 dBTP target; stereo Ogg/Opus at 64 kb/s. Opus uses a 48 kHz decode clock. A repeatable FFmpeg command/script was used; these are derivative field-recording edits, not generated foley.

Suggested attribution for both loops: “Ghana street and crowd ambience: GESMA v1, Rose-Mary Owusuaa Mensah Gyening et al. (2026), DOI 10.5281/zenodo.18315044, CC BY 4.0. Selected Ayeduase street and Kejetia crowd clips; trimmed, crossfaded, filtered, loudness-normalized and compressed.” Include linked source, licence and the full author list above or an accessible complete attribution page.

Verification: source and output audio decode with FFmpeg/ffprobe. Live browser playback and listening have not been performed because browser control is disabled. No claim of exact sound identity or subjective mix quality is made.
