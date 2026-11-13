# Number Crossing

An artifact game: the child answers sums to help their character cross, one jump for each right answer. One wrong answer and they fall in. Three themes: a gingerbread man crossing a river on logs (watch out for the fox), a dinosaur crossing lava on rocks, and a unicorn leaping across the sky on stars and clouds. Where it came from (link, version, date taken) is its `source` in `games.json`.

**Files:**
- `original.html`: the page exactly as its maker made it. Never edited. Its page title ends "(Copy)", from how it was taken (P69).
- `adapter.js`: connects it to the wrapper (P67).
- `game.json`, `icon.svg`, this README.

**What it needs from the launcher:** **who's playing** and **sound on or off**. With sound off, the adapter silences its sounds (`games/_common/sound-off/`, P67).

**What else the adapter does:** each child has their own setup, and it follows them between devices (P84). The game keeps one setup on the device (its own key `gingerbread-river-v1`); the adapter swaps in this child's as the page opens (reloading once if it had to change) and passes it on with `games/_common/keep-progress/` (P77). A child new to a device starts from the game's defaults.

**Its own rules:**
- The setup screen: theme, which sums (add, subtract, multiply, divide), the biggest total, how many questions (3 to 50), and how to answer (type the number, or pick one of two logs).
- After the first sum, each sum carries on from the last answer ("+ 3"), so the running total never goes above the biggest total.
- Its own **Sound** button, and **Full screen**, which fills the screen and hides the wrapper's bar until **Exit full screen** or **Quit game**.
- Needs the internet only for its fonts (Google Fonts); without them it uses other fonts.

**Levels and rounds:** no levels. A round is one crossing; it shows its own end with **Play again** and **Change settings**. It keeps no scores.

**Running on its own:** `original.html` opened directly is the maker's page, with no adapter.

**Release check:** `tools/tests/games/number-crossing/check.py`.
