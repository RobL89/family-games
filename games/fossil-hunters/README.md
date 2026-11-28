# Fossil Hunters

An artifact game for about 6 to 8: dig up bones at real fossil sites (Isle of Wight, Surrey, Lyme Regis, Morrison, Kem Kem, Hell Creek, Gobi), rebuild each skeleton from its jigsaw-cut bones, work out the animal from clues, see it come to life and collect it in a Field Guide. One level. Where it came from (link, version, date taken) is its `source` in `games.json`.

**Files:**
- The maker's game, exactly as she made it, never edited: `original.html` (her `index.html`), `lib/three.min.js` (for her 3D museum, hidden for now), `pics/bones/`, `pics/cut3/` and `pics/life/`. Taken as a ZIP (P87); the page title ends "(Copy)", from how it was taken (P69). Her own notes for editing it are at the top of `original.html`.
- `adapter.js`: connects it to the wrapper (P67).
- `game.json`, `icon.svg`, this README.

**What it needs from the launcher:** **who's playing** and **sound on or off**. With sound off, the adapter silences its dig sounds and Read to me (`games/_common/sound-off/`, P67).

**What else the adapter does (P93):** one explorer per child, following them between devices. The game keeps a list of explorers (`fossilHunters.players.v1`) and each explorer's save (`fossilHunters.player.<id>`) on the device, and opens on "Who's digging?". The adapter makes the list hold only this child's explorer as the page opens (reloading once if it had to change it), skips "Who's digging?" (into their map, or "New explorer" with their name filled in), and hides "Switch explorer" and "Remove an explorer". The explorer and its save are the child's progress, passed on with `games/_common/keep-progress/` (P77). Which explorer is the child's is noted on the device (`fg.fossilHunters.mine.<child>`).

**Its own rules:**
- No game over; a wrong pick says which clue rules it out.
- Its own Sound button and Read to me buttons.
- For grown-ups testing, its dig-finished card names the animal and has a "Testing: give me every bone" button, as its maker made it.
- Needs the internet only for its fonts (Google Fonts); without them it uses other fonts. three.js comes with it; it would load it from cdnjs only if its own copy failed.

**Levels and rounds:** its own: skeletons, finds, digs and the last site, all in the child's explorer save.

**Running on its own:** `original.html` opened directly is the maker's game, with no adapter.

**Release check:** `tools/tests/games/fossil-hunters/check.py`.
