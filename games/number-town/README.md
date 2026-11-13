# Number Town

An artifact game: a cosy explore-and-collect maths town. The child makes an explorer, walks the town, finds Dotlings in 3D searches and plays number games with townspeople for stars, spent in the town's shop. Where it came from (link, version, date taken) is its `source` in `games.json`.

**Files:**
- `original.html`: the page exactly as its maker made it. Never edited. Its page title ends "(Copy)", from how it was taken (P69). Its own notes for editors, with the design decisions to keep, are at the top of the file.
- `adapter.js`: connects it to the wrapper (P67).
- `game.json`, `icon.svg`, this README.

**What it needs from the launcher:**
- **Sound on or off.** With sound off, the adapter silences its beeps, whatever its own Sound setting says (`games/_common/sound-off/`, P67).
- **Saving its own progress (P77):** the child's whole explorer, `{ progress: { explorer, save }, at }`, through `fg:state`, by `games/_common/keep-progress/`. So it goes to the Sheet and follows the child to any device. A full save is a few thousand characters at most (744 for a new explorer).

**One explorer per child (P70):**
- The adapter shows the game only this child's explorer. If the game's list of explorers has to change, the page reloads once as it opens.
- A child without one makes it first, with their name filled in.
- The swap happens as the page opens, before the Sheet answers, and never hands a child another child's explorer (P82).
- "Switch explorer" is hidden. "Change my look" still edits everything.
- Other children's explorers stay saved on the device.

**Its own rules:**
- **Explorers:** it keeps its own explorers on the device (up to 8 per browser), each with its own stars, level and things. The adapter notes which is this child's on the device (`fg.numberTown.mine.<child>`) and passes that one's save on.
- **When it saves:** on events (going to bed, wins, the shop, settings) and when the page loses focus or is hidden while in the town. Each save reaches the Sheet as P78 says.
- **The first time after P77:** each child keeps the explorer of the device where they first open Number Town; their explorer on another device stays saved there, hidden.
- **Its own currency:** its stars and shop belong to the game (P51). They aren't launcher stars (P48).
- **Grown-up controls** open with the game's own PIN, which is set in the file.
- **Needs the internet** for:
  - its 3D searches, which load three.js r128 from cdnjs
  - its fonts (Google Fonts)
- **On phones:** the maker's notes list "phone fixes" as not built yet. On an upright phone it suggests turning sideways.

**Levels:** its own, from the stars earned (in its notes as CONFIG).

**Running on its own:** `original.html` opened directly is the maker's game, with no adapter.

**Release check:** `tools/tests/games/number-town/check.py`. It checks making an explorer, the letter and walking into town at the three sizes, one explorer per child, sound off, and the explorer following the child between two devices through a stand-in Sheet like script 0.4.0 (P77, P78).
