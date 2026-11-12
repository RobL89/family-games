# Kriss Kross

An artifact game: a word grid. The child fits every word from a list into a crossing grid, on screen or on a printed sheet. Where it came from (link, version, date taken) is its `source` in `games.json`.

**Files:**
- `original.html`: the page exactly as its maker made it. Never edited. Its page title ends "(Copy)", from how it was taken (P69).
- `adapter.js`: connects it to the wrapper (P67).
- `game.json`, `icon.svg`, this README.

**What it needs from the launcher:**
- **Word lists** (`"word-lists"`): the child's lists from Game setup, default first (P36, P56).
- **Saving its own progress:** the child's own lists, through `fg:state`.

**What the adapter does:**
1. Builds the child's default list as soon as the game opens (P38).
2. Shows **Next list** when a puzzle is solved or its solution is shown, until the last list.
3. Shows a **Your lists** card on the word screen:
   - the grown-ups' lists
   - the lists the child made: the last five, saved per child (P66)
4. Saves a list as the child's own when they type their own words and press Build. A grown-ups' list built again by hand isn't saved twice.
5. Adds a **Print** button on the print screen that prints just the game (proposed). The browser's own print command would print the whole wrapper.
6. Reports a solved puzzle with `fg:round`, stars as P30. The wrapper ignores it while stars are off (P48).

**Its own rules:**
- 2 to 30 words, each 2 to 15 letters.
- A word that can't cross the others is shown on the word screen, with Try again or Build without it.
- "Start with a few letters already placed" is the game's own option.
- The game makes no sounds.
- It remembers the last words typed on the device (its own key `kk.words`), shared by everyone on that device.
- Its "Download print sheet" button only works on claude.ai, so it stays hidden here.

**Levels:** none. Each list is a round.

**Running on its own:** `original.html` opened directly is the maker's game with no lists and no adapter.

**Release check:** `tools/tests/games/kriss-kross/check.py`.
