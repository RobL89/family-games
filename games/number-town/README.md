# Number Town

An artifact game: a cosy explore-and-collect maths town. The child makes an explorer, walks the town, finds Dotlings in 3D searches and plays number games with townspeople for stars, spent in the town's shop. Where it came from (link, version, date taken) is its `source` in `games.json`.

**Files:**
- `original.html`: the page exactly as its maker made it. Never edited. Its page title ends "(Copy)", from how it was taken (P69). Its own notes for editors, with the design decisions to keep, are at the top of the file.
- `adapter.js`: connects it to the wrapper (P67).
- `game.json`, `icon.svg`, this README.

**What it needs from the launcher:** only **sound on or off**. With sound off, the adapter silences its beeps, whatever its own Sound setting says (`games/_common/sound-off/`, P67).

**Its own rules:**
- **Explorers:** it keeps its own explorers on the device, up to 8 per browser, each with its own stars, level and things.
  - Its own "Who's playing?" shows when there are two or more.
  - Proposed: leave it so for now, so each child picks their explorer in the game.
  - Its saves stay on the device and don't go through the wrapper or the Sheet.
- **Its own currency:** its stars and shop belong to the game (P51). They aren't launcher stars (P48).
- **Grown-up controls** open with the game's own PIN, which is set in the file.
- **Needs the internet** for:
  - its 3D searches, which load three.js r128 from cdnjs
  - its fonts (Google Fonts)
- **On phones:** the maker's notes list "phone fixes" as not built yet. On an upright phone it suggests turning sideways.

**Levels:** its own, from the stars earned (in its notes as CONFIG).

**Running on its own:** `original.html` opened directly is the maker's game, with no adapter.

**Release check:** `tools/tests/games/number-town/check.py`. It checks making an explorer, the letter and walking into town at the three sizes, plus sound off.
