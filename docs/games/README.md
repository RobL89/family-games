# Games: folder map and guide

| | |
|---|---|
| **Version** | 1.22 · 2026-11-10 |
| **Owner** | P-034 (Kids Games Development) |
| **Kind** | Reference: changed only by a decision in P-034 |

**Changes at v1.22:** step 2c-3a (D-089 to D-095): Rocket Lander has two tracks, each with its own map (`map.js` 2.0: the lower track holds Reception's three systems, the higher the stand-in levels until step 2c-3b), and progress format 4 on the device (`games/_common/rocket/tracks.js`). Reception's questions and their pictures are in `asks.js` and `faces.js`; challenge rounds end each system. Rob's syllabus notes, without the children's ages, are in the repo as `tools/tests/games/syllabus-notes.json` (Q-033, D-095), and the core test checks the level plan and the lower map against them. New browser test: `test_rocket_lander_reception_e2e.py`; the older browser tests play the stand-in track (`?track=year2`).

**Changes at v1.21:** the level plan is decided (D-089 to D-092: two tracks, the pass rule kept, 7 levels and a challenge a system, no sketches step); `plan_rocket_levels.py` 0.2 says so, its table unchanged.

**Changes at v1.20:** a script for the draft level plan (step 2c-2), `plan_rocket_levels.py`: it holds the plan's table, checks it against Rob's syllabus notes (given by path; the notes stay out of the repo while they carry the children's details) and works out the plan's counts; the game's files are unchanged.

**Changes at v1.19:** tests run in batches at checkpoints (D-086): `close.py` runs the fast checks only unless asked; `--full` runs everything, at a checkpoint Rob chooses (before a trial build or a publish); `--changed` picks by the map, as before.

**Changes at v1.18:** thirteen ships (step 2d-2, D-077 to D-080): the five new ones moved into `fleet.js`, `ships.js` and `sound.js` from their accepted mock-ups by `move_rocket_new_ships.py`, cheapest first in each tier, and three ship hooks read by `round.js` (where Bip sits, a ship's own ladder, the flag's side). A new test, `test_rocket_ship_hooks_e2e.py`, covers the hooks; the close runs it with the shared engine. The mock-up script `sketch_rocket_new_ships.py` (step 2d-1) gets its row here.

**Changes at v1.17:** a script for sketches of new ship ideas, `sketch_rocket_ship_ideas.py` (D-062: new ships when Rob asks); the game's files are unchanged.

**Changes at v1.16:** one rocket game with a map (step 2c-build, D-058, D-064 to D-068). Rocket Sums joined Rocket Lander: its sums and levels are in `games/rocket-lander/` (`sums.js`, `sums-levels.js`), its folder is gone (git keeps it), and the levels sit on a map of solar systems (`map.js`, stand-in levels until the level plan). The engine gains the map screens (`starmap.js`: the map, the galaxy, hyperspace) and the map's progress rules (`progress.js`, format 3 on the device). The tests follow: the sums core checks are in `test_rocket_lander_core.py`, the sums browser test is `test_rocket_lander_sums_e2e.py`, and the map screens have `test_rocket_lander_map_e2e.py`; a bench for the map, `mutate_rocket_map.py`.

**Changes at v1.15:** the rocket games are to become one game, Rocket Lander, with a map of solar systems in place of the two tiles and the planet picker (D-058 to D-060); the files change when it's built (steps 2c-4 and 2c-5), so until then the folders are as below. Two scripts for the step 2c-1 sketches: `sketch_rocket_map.py` and `count_rocket_map_rocks.py`.

**Changes at v1.14:** the close runs everything the first time in a clone; after that full pass, it runs the fast checks and only the browser tests whose files changed (D-056; `--full` runs everything). The test panels keep the progress on the device, so "home" in a preview keeps rocks and ships (ER-004).

**Changes at v1.13:** all eight ships fly (step 2a-4c, D-047, D-051): Crystal Comet, Golden Phoenix and Aurora Cruiser are on sale in the showroom and flown in play; in play the ship flown is drawn inside the ground's edge, like its effects, so nothing of it reaches the numbers (ER-003). The hangar test now also flies every ship and checks it stays off the numbers, and takes about 4 minutes.

**Changes at v1.12:** the rocket games' hangar (step 2a-4b, D-050 to D-053): the ships' table `fleet.js`, their drawings `ships.js` (moved from the mock-ups) and the showroom `hangar.js` in `games/_common/rocket/`; two new tests and a fault bench; the progress entry is at format version 2, with the ships.

**Changes at v1.11:** the hangar's mock-up script and its two drawing files are listed (step 2a-4a, D-046); the preview test's row now says it lets nothing be fetched, as D-043 made it.

**Changes at v1.10:** the rocket games end each round with Bip's moment (D-044), keep a tile's progress on the device until the shell does (D-042), and ship their font in `games/_common/fonts/`, so they fetch nothing from outside (D-043).

**Changes at v1.9:** a mock-up script for Bip's end-of-round moment is listed (step 2a-3, D-025).

**Changes at v1.8:** Rocket Sums, the maths tile (D-037, D-039), on the shared round flow `games/_common/rocket/round.js`; its two tests and bench listed.

**Changes at v1.7:** Rocket Lander's Number mode levels (D-038) and their browser test.

**Changes at v1.6:** Rocket Lander's engine moved to `games/_common/rocket/`, shared by its two tiles (D-027); a game may import from `games/_common/` and nothing else outside its folder (D-036).

**Changes at v1.5:** a sketch script for Rocket Lander's Number mode options is listed (step 2a-1).

**Changes at v1.4:** `build_preview.py --debug` adds a test panel for Rob (D-020); a line-size measuring script is listed.

**Changes at v1.3:** the preview build script and its test are in the checks table (D-018).

**Changes at v1.2:** Rocket Lander is on `claude/games`, running on its own, with its three tests and a fault bench in the checks table.

This repo is shared by two projects. **P-020 (Family Games Launcher)** owns the launcher, the shell, the Sheet's script and the game contract. **P-034 (Kids Games Development)** owns the games. Each project writes only to its own folders, so their work never collides.

## Folder map

| Path | Owner | What it holds |
|---|---|---|
| `games/<id>/` | P-034 | One folder per game: its page, manifest, tile picture, and an adapter if it has one |
| `games/_template/` | P-034 | A working mini-game built to the contract |
| `games/_common/` | P-034 | Code shared between games. `rocket/` is the rocket game's engine (the round flow in `round.js`, the map screens in `starmap.js`, the map's progress rules in `progress.js` and the tracks' in `tracks.js`, the scene, sounds, settings and level helpers, and the hangar: the ships' one table of names, tiers, prices and sounds with the rules for buying in `fleet.js`, their drawings in `ships.js`, and the showroom in `hangar.js`), used by Rocket Lander, the one rocket game since D-058. `fonts/` holds the games' font, Fredoka, with its OFL licence (D-043). A game may import from here and from nothing else outside its folder (D-036) |
| [`games.json`](../../games.json) | P-034 | The list of games: order and status, in the format the contract sets |
| `docs/games/` | P-034 | The games' docs, this guide among them |
| `tools/tests/games/` | P-034 | The games' tests and P-034's checks |
| `index.html`, `play.html`, `shared/`, `apps-script/`, the rest of `docs/` and `tools/`, `README.md`, root files | P-020 | The launcher, the shell, the Sheet's script, and the launcher's tests and docs |
| `docs/game-contract.md`, `shared/bridge.js`, and the shell and Sheet stand-ins used by tests | P-020, shared | The contract and its game-side piece. P-020 changes them; P-034 adopts a breaking change only by a decision |

`docs/games-pack/` (on `work`) is P-020's hand-over pack, not part of `docs/games/`.

## Branches

| Branch | Whose | What it is |
|---|---|---|
| `main` | Both | The live site (GitHub Pages). It changes only when Rob says "publish" in the project whose work is ready |
| `claude/games` | P-034 | Games work in progress, made from `main` |
| `work` | P-020 | Launcher work in progress, and the game contract |
| `games-wip` | Record | Three parked games from before the contract. Kept as a record, never merged or deleted |

## Checks

All of them are in [`tools/tests/games/`](../../tools/tests/games/). The checks use only Python's standard library and git; the games' tests also need Node and Python Playwright with Chromium. Run them from the repo root.

| Script | What it checks |
|---|---|
| `close.py` | Run at every working close, before committing. With no option it runs the fast checks (Node, seconds) and the repo, doc and pin checks (D-086). `--full` runs every test too (about 25 minutes), at a checkpoint Rob chooses: before a trial build or a publish, or when he asks; it records the pass. `--changed` runs the fast checks and only the browser tests whose files changed since the last full pass, by the map in the script; a change to `games/_common/`, to `close.py` or to any file the map doesn't know runs everything (D-056, D-081) |
| `test_*.py` | The checks' own tests (`test_checks.py`, and `test_close_pick.py` for the close's choice of tests), then the games' tests. For Rocket Lander: `test_rocket_lander_core.py` (its pure core and boundaries, by Node: the number levels and rules, the sums levels and sums, the two tracks' maps against the level plan and Rob's notes, Reception's questions and pictures, the map's progress rules and the tracks', format 4), `test_rocket_lander_labels.py` (RL-3), `test_rocket_lander_e2e.py` (full rounds in a headless browser, about 3 minutes), `test_rocket_lander_levels.py` (Number mode's eight levels, their targets and chips, about 2 minutes), `test_rocket_lander_sums_e2e.py` (the sums levels' rounds, lines and the preview's panel, about 2 minutes), `test_rocket_lander_map_e2e.py` (the map as home, level cards, replays, hyperspace and the galaxy with real taps, at phone and PC sizes, about 4 minutes) `test_rocket_lander_reception_e2e.py` (the tracks, Reception's faces and dice lines, a challenge round and the panel's Track box, at phone and PC sizes, about 4 minutes) and `test_rocket_lander_preview.py` (the preview bundle: same bytes on a rebuild, the font inside the page and nothing fetched, RL-3 on the bundle, the test panel); for its hangar, `test_rocket_fleet_core.py` (the ships' table and the rules for buying and picking, by Node) and `test_rocket_hangar_e2e.py` (the door, the showroom, buying and flying ships with real taps, on a number level and a sums level, and a picture check that no ship or its effects reach the numbers, with less motion too, about 7 minutes) and `test_rocket_ship_hooks_e2e.py` (the three ship hooks, D-080: where Bip leaves and boards a ship, the Christmas Tree's own ladder, the flag's side, about 3 minutes) |
| `build_preview.py` | Not a check: bundles a game folder into one page for a private preview (D-018), with a stamp naming the commit and the folder's sha256. Writes outside the repo by default. `--debug` adds the game's test panel (`preview_debug_<game>.js`: a cog on the map, opened with 1234, for Rob's testing only, never in a trial preview; D-020, D-055) |
| `measure_rocket_lander_line.py` | A measurement, not a check: how many numbers fit on the line, exactly aimable, at phone and PC sizes |
| `sketch_rocket_lander_number_mode.py`, `sketch_rocket_bip_moment.py` | Not checks: draw options for Rob to choose from, by playing a copy of the game with small drawing changes (Number mode's targets; Bip's end-of-round moment), and write one page of pictures for a private artifact. The game's own files are never changed |
| `sketch_rocket_ships.py`, with `sketch_rocket_hangar.js` | Not a check: builds one page of moving mock-ups of the hangar's ships and two hangar layouts (step 2a-4a, D-046), bundling the page with `games/_common/rocket/` (the ships now among it, in `ships.js`, D-053) as `build_preview.py` does, for a private artifact; then checks the page at phone and PC sizes and plays both hangars by mouse |
| `sketch_rocket_door.py` | Not a check: draws places for the hangar door on copies of the real start screens (step 2a-4b, D-052), for a private artifact. The game's own files are never changed. It drew the two tiles' start screens, gone since step 2c-build, so it runs only at its own commit (26b299c) |
| `sketch_rocket_map.py` | Not a check: draws crude SVG screens of the one game with a map (step 2c-1, D-058 to D-060), taking the systems' colours from `planets.js`, for a private artifact. The game's own files are never changed |
| `sketch_rocket_ship_ideas.py` | Not a check: draws new ship ideas as SVG sketches (flying, landing, and at their size in play), original art, for a private artifact (D-062), then checks the page at phone and PC sizes, light and dark: no script errors, nothing fetched, no sideways scrolling. The game's own files are never changed |
| `sketch_rocket_new_ships.py`, with `sketch_rocket_new_ships.js` and `sketch_rocket_new_ships_page.js` | Not a check: builds one page of moving mock-ups of the five new ships (step 2d-1, D-073 to D-077), splicing their code into copies of `ships.js`, `fleet.js` and `sound.js` for the page only, and checks it at phone and PC sizes. It builds against the game as it was at 2485c92; since step 2d-2 the ships are in the game itself |
| `move_rocket_new_ships.py` | A one-off, not a check: moved the five new ships into the game in step 2d-2 (D-078), with the mock-up script's own splice, so the game's code is byte for byte the code on the accepted page. Kept as the record; it refuses to run twice |
| `count_rocket_map_rocks.py` | A count, not a check: how many moon rocks a map can pay out against the ships' prices, and the room a die has on a line of 0 to 10 (Q-026, D-060) |
| `plan_rocket_levels.py`, with `syllabus-notes.json` | The level plan (step 2c-2, decided: D-089 to D-092): its table of tracks, systems and levels, checked against Rob's syllabus notes (every level placed once, in the notes' order, 7 and a challenge a system), and the counts quoted in the plan. Run with the notes' path; `test_rocket_lander_core.py` runs it on `syllabus-notes.json`, Rob's notes without the children's ages (Q-033, D-095) |
| `repo_check.py` | Nothing outside P-034's folders has changed on this branch |
| `doc_check.py` | `games.json`, the docs here, and `pins.json` are well formed |
| `pins_check.py` | Frozen files are unchanged byte for byte, and the contract and the games pack haven't changed on `work` since they were pinned |
| `mutate_checks.py` | A bench, not part of the close: plants faults in the checks and counts how many the tests catch |
| `mutate_rocket_lander.py`, `mutate_rocket_sums.py`, `mutate_rocket_hangar.py`, `mutate_rocket_map.py` | Benches, not part of the close: plant faults in the game (its number levels, its sums levels, its hangar, its map) and count how many its tests catch. Only the faults new in a step are run (D-057) |

```
python3 -B tools/tests/games/close.py
```

**Pins.** [`pins.json`](../../tools/tests/games/pins.json) holds the frozen files and what we rely on from P-020. A pin changes only by a decision in P-034.

## For other projects

**What's here:** the games and the list of games. The games are built to the game contract (v0.3, on `work`: [docs/game-contract.md](https://github.com/RobL89/family-games/blob/work/docs/game-contract.md)).

**What's ready:**

| Part | State | Used by |
|---|---|---|
| `games/kriss-kross/` | Live on `main`. Kept unchanged until it joins the shell through an adapter | The launcher (P-020), the children |
| `games.json` | Live on `main`. P-034 keeps it from now on | The launcher (P-020) |
| `games/bubble-pop/` | Built; a "Soon" tile | Nobody yet |
| `games/_template/` | P-020's earlier template; to be redone to the contract | Nobody yet |
| `games/rocket-lander/` | On `claude/games`, one game with a map of solar systems (D-058) on two tracks (D-089: Reception then Year 1, Year 2 then Year 3; the track kept with the progress): number levels, sums levels, Reception's picture questions and challenge rounds, the map as home, running on its own as a plain page (built-in settings), its engine in `games/_common/rocket/`; being built to the contract at stage 2. How the shell takes a game with its own map is settled at stage 3 (Q-027) | Nobody yet |
| `games/rocket-sums/` | Retired at step 2c-build: its sums and levels are Rocket Lander's now (D-058); git keeps its history | Nobody |
| Word Worm, Monster Café | Being brought over from `games-wip`, then built to the contract | Nobody yet |
| This guide and the checks | On `claude/games` | P-034, and P-020 to see the folder map |

**Live branch:** `main`. Work in progress is on `claude/games`. Anything there may change without notice until it's published.

**What's private:** the repo and every branch are public, so nothing here holds the children's photos, voices or ages. Profiles, stars and settings live in P-020's Sheet, never in this repo.

**On the device:** played on its own, Rocket Lander keeps its progress in the browser's localStorage, under one entry, `family-games:rocket-lander:progress`, holding `{ "v": 4, ... }` since step 2c-3a: the track played, the rocket's place on that track's map, how far it is open, each level's best stars and moon rocks found, the other track's map as left, the moon rocks, landings, and the ships owned and flown (D-042, D-053, D-058, D-089). A format 3 entry is still read, on the stand-in track. Formats 1 and 2 (the two tiles' planets) are no longer read, so test progress started afresh; one child per device until the shell keeps it. Nothing else in `games/` uses device storage. Inside the shell (stage 3) the shell keeps it instead.

**Changes that affect you:** P-034 tells P-020 by a board note before a shared part changes or goes, and keeps the old form until P-020 has moved.

## Change log

| Version | Date | Changes |
|---|---|---|
| 1.22 | 2026-11-10 | Step 2c-3a: tracks and format 4 (`tracks.js`), Reception's questions (`asks.js`, `faces.js`), Rob's notes in the repo (`syllabus-notes.json`), `test_rocket_lander_reception_e2e.py` |
| 1.21 | 2026-11-10 | The level plan decided (D-089 to D-092); its script's row updated |
| 1.20 | 2026-11-10 | The draft level plan's script, `plan_rocket_levels.py` (step 2c-2) |
| 1.19 | 2026-11-10 | Tests in batches at checkpoints: the close is fast by default, `--full` at a checkpoint (D-086) |
| 1.18 | 2026-11-10 | Thirteen ships and the three ship hooks (step 2d-2, D-077 to D-080); `test_rocket_ship_hooks_e2e.py`; `move_rocket_new_ships.py`; the new ships' mock-up script listed |
| 1.17 | 2026-11-10 | The new ship ideas sketch script (D-062) |
| 1.16 | 2026-11-09 | One rocket game with a map (step 2c-build): Rocket Sums joined Rocket Lander; `starmap.js`, `progress.js`, `map.js`; progress format 3; the tests and the close's map follow; `mutate_rocket_map.py` |
| 1.15 | 2026-11-09 | One game with a map is planned (D-058); the map sketch and rock-count scripts |
| 1.14 | 2026-11-09 | The close's choice of tests after a full pass (D-056); the test panels keep progress on the device (ER-004) |
| 1.13 | 2026-11-09 | All eight ships fly (step 2a-4c); the ship flown is kept off the numbers (ER-003); the hangar test's picture check |
| 1.12 | 2026-11-09 | The hangar: `fleet.js`, `ships.js`, `hangar.js`, two tests, the door mock-up script; progress format 2 (D-050 to D-053) |
| 1.11 | 2026-11-09 | Hangar mock-up script listed (step 2a-4a); preview test row says nothing is fetched |
| 1.10 | 2026-11-09 | Bip's moment, progress kept on the device, the font shipped (D-042 to D-044) |
| 1.9 | 2026-11-09 | Bip's moment mock-up script listed (step 2a-3) |
| 1.8 | 2026-11-09 | Rocket Sums and its tests and bench listed (D-037, D-039) |
| 1.7 | 2026-11-09 | Number mode's levels test listed (D-038) |
| 1.6 | 2026-11-09 | Rocket Lander's engine in `games/_common/rocket/` (D-027, D-036) |
| 1.5 | 2026-11-09 | Number mode sketch script listed (step 2a-1) |
| 1.4 | 2026-11-09 | Test panel for previews (D-020) and the line measuring script |
| 1.3 | 2026-11-09 | Preview build script and its test added (step 1b+) |
| 1.2 | 2026-11-09 | Rocket Lander brought over (step 1b): its tests and bench listed; the games' tests need Node and Playwright |
| 1.1 | 2026-11-09 | Names check removed from the repo check (D-017) |
| 1.0 | 2026-11-09 | First version: folder map from D-002, branches, checks, section for other projects |
