# Space Explorer

An artifact game: an interactive guide to space, like a science museum. It has a zoomable space map with fact cards, the life of a star, the Earth, Moon and Sun in 3D, and the Solar System in 3D at today's real positions. Where it came from (link, version, date taken) is its `source` in `games.json`.

**Files:**
- `original.html`: the page exactly as its maker made it. Never edited. Its page title ends "(Copy)", from how it was taken (P69). Its own notes for editors are at the top of the file.
- `adapter.js`: connects it to the wrapper (P67).
- `game.json`, `icon.svg`, this README.

**What it needs from the launcher:** only **sound on or off**. With sound off, the adapter silences "Read to me" (`games/_common/sound-off/`, P67).

**What else the adapter does:** "Find me" sets the place to London, England, by pressing the game's own London button, and never asks the device for its location (P71).

**Its own rules:**
- Four views, each with its own link: `#space`, `#life-of-a-star`, `#earth-moon-sun` and `#explore-space`.
- **"My place"** is kept on the device (its own key `spaceExplorer.place`). The default is London; the child can pick another town or type numbers.
- **Needs the internet** for:
  - its 3D library (three.js r128, from cdnjs)
  - its fonts (Google Fonts)

  The file can't be changed to use local copies.
- The ISS position uses orbit data from 8 November 2026, which drifts after a few weeks (the maker's note).

**Levels and rounds:** none. It's a place to explore, and it saves nothing through the wrapper.

**Running on its own:** `original.html` opened directly is the maker's page, with no adapter.

**Release check:** `tools/tests/games/space-explorer/check.py`. It visits every view at the three sizes, and its 3D views need `FG_THREE_JS` (see `tools/tests/games/harness.py`).
