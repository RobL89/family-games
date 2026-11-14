# Fairy village

An artifact game: a fairy puzzle adventure. The child makes a fairy who lives in a toadstool in an empty village, then visits nine fairy worlds. Each world's flower has five petals, one per puzzle (counting, measuring, shapes, phonics, music, early science, early coding). Five petals bring that world's fairy home to a new house in the village, and her petal pot buys goes of her mini-game. Three levels: Little Sprite (about 5), Clever Pixie (about 7), Nimble Nymph (about 9). Where it came from (link, version, date taken) is its `source` in `games.json`.

**Files:**
- The maker's game, exactly as she made it, never edited: `original.html` (her `index.html`), `core.js`, `style.css`, `fairies/` (one file per fairy) and `games/` (one file per mini-game). Taken as a ZIP (P87); the page title ends "(Copy)", from how it was taken (P69).
- `adapter.js`: connects it to the wrapper (P67).
- `game.json`, `icon.svg`, this README.

**What it needs from the launcher:** **who's playing** and **sound on or off**. With sound off, the adapter silences its sounds and Read to me (`games/_common/sound-off/`, P67). Its music and heartbeat puzzles then still light up, so they can be played by watching.

**What else the adapter does (P87):** one explorer per child, following them between devices. The game keeps every explorer in one save on the device (its own key `fairy-village-v1`) and opens on its own "Who's playing?". The adapter puts only this child's explorer in that save as the page opens (reloading once if it had to change), skips "Who's playing?" (into their village, or "Make your fairy" with their name filled in), and hides the explorer menu's "Who's playing?" and "Remove this explorer". The whole explorer is the child's progress, passed on with `games/_common/keep-progress/` (P77).

**Its own rules:**
- No hints. A wrong answer earns no petal; most puzzles have three rounds.
- Read to me starts on for Little Sprite; the village bar switches it and the game's own Sounds.
- Its own **Full screen** button, which it leaves again itself.
- Needs the internet only for its fonts (Google Fonts); without them it uses other fonts.

**Levels and rounds:** its own: petals, fairies home, petal pots and best scores per mini-game, all in the child's explorer.

**Running on its own:** `original.html` opened directly is the maker's game, with no adapter.

**Release check:** `tools/tests/games/fairy-village/check.py`.
