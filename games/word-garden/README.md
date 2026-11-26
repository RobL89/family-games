# Word Garden

An artifact game: a spelling and phonics garden from Reception to Year 6. Every word, sound or tricky word is a plant that grows a stage a day when it's right. Reception follows the ELS phonics order with recorded sounds; Year 1 up grows school spelling lists or ready-made word packets, with practice tests, school test results and a treehouse of word games. Where it came from (link, version, date taken) is its `source` in `games.json`.

**Files:**
- `original.html`: the page exactly as its maker made it. Never edited. Its own notes for editors, with the rules not to change, are at the top of the file.
- `sounds/`: its 47 recorded phonics sounds, byte for byte from her export (P90). Her notes say they're from a school's phonics videos and Oxford Owl, for family use; they're here at her wish.
- `adapter.js`: connects it to the wrapper (P67).
- `game.json`, `icon.svg`, this README.

**What it needs from the launcher:**
- **Sound on or off.** With sound off, the adapter silences its recorded sounds, speech and garden noises (`games/_common/sound-off/`, P67).
- **Saving its own progress (P77, P89):** the child's whole garden, `{ explorer, save }`, by `games/_common/keep-progress/`, so it follows the child to any device. It's big: a new garden holds every earlier year's words, already grown (Reception 363 characters, Year 1 33,920, Year 2 89,814, Year 6 228,274, measured 2026-11-25). It goes compressed (a Year 2 garden as 26,224) and needs script 0.6.0, which keeps it in parts; with an older script it stays on the device.

**One explorer per child (P90):**
- The adapter shows the game only this child's explorer, then goes straight into their garden. If the game's list of explorers has to change, the page reloads once as it opens.
- A child without one goes straight to "A new garden", with their name filled in; they pick their flower and year there.
- The swap happens as the page opens, before the Sheet answers, and never hands a child another child's garden (P82).
- "Switch explorer" is hidden. Other children's gardens stay saved on the device.

**Its own rules:**
- **Grown-ups' corner** opens with the game's own code (in the file). It holds the school lists, school test results, word packets, a word report and the year group (moved up each September).
- **School lists and tests (P91):** each list and each school test result is kept in full in the child's save. A grown-up can add them in the game's grown-ups' corner or in the Sheet's School lists and School tests tabs (script 0.7.0; how: `docs/setup-sheet.md`). The launcher hands the child's rows to the game (`game.json` asks for `"school-lists"`); the adapter puts in the ones the garden lacks through the game's own way in, `window.WordGarden`, and reports back what the garden holds, for the tabs' status and result columns and new rows. A test is matched to the list set on that day and never recorded twice. A child without a garden yet, or with a Reception garden, gets none: the row says why.
- **Word-packet changes** a grown-up makes are kept on the device, for every explorer on that browser; they don't follow a child.
- **Phones:** upright, it asks to turn sideways and offers "Keep going this way".
- **Needs the internet** only for its fonts (Google Fonts, with fallbacks).

**Running on its own:** `original.html` opened directly is the maker's game, with no adapter.

**Release check:** `tools/tests/games/word-garden/check.py`. It checks making a garden at the three sizes, the upright-phone message, its sounds being there, one explorer per child (also switching with a slow Sheet while the game saves), the garden following the child between two devices compressed through a stand-in Sheet like script 0.6.0, staying on the device with an older script, sound off, school lists and tests coming from the Sheet and going back (with the rows it can't take), and running on its own.
