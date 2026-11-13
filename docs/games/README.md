# Games: folder map and guide

| | |
|---|---|
| **Version** | 1.27 · 2026-11-13 |
| **Owner** | P-034 (Kids Games Development) |
| **Kind** | Reference: changed only by a decision in P-034 |

**Changes at v1.27:** stage 3 (D-120 to D-122): Rocket Lander is linked to P-020's wrapper through P-020's `shared/bridge.js` (`games/_common/rocket/link.js`, `round.js` 2.9), with a one-time track pick for a child with no progress (`trackpick.js`, D-121), no Home of its own inside the wrapper (D-118), and `game.json`, `icon.svg` and a README for the launcher. Its release check is `tools/tests/games/rocket-lander/check.py`, on P-020's `harness.py`; `origin/main` is merged into `claude/games` to test against the live wrapper. The doc check leaves `games.json` to P-020 and the contract pin is 0.4.2 (D-122); the close fetches main 500 deep (ER-010). New: `spike_rocket_lander_fit.py`, `make_rocket_icon.py`, `mutate_rocket_link.py`.

**Changes at v1.26:** P-020 (Family Games Launcher) now hosts every game and publishes (D-112, D-113): the folder map, the branches and the section for other projects say so. `games.json`, `games/kriss-kross/` and `games/_template/` are P-020's; P-034 develops its games on `claude/` branches and releases each finished one to P-020 by a board note, as game contract 0.4 section 7 says. The games are built to contract 0.4 (D-114). `repo_check.py` 1.2 (with `test_checks.py` 1.2 and `mutate_checks.py` 1.2) and `pins.json` 1.1 follow; `measure_rocket_state_size.py` is new.

**Changes at v1.25:** the ships cost half as much (`fleet.js` 1.3, D-109: 10 to 100 moon rocks, 425 for all twelve), counted by the new `count_rocket_ship_prices.py`.

**Changes at v1.24:** step 2c-3c: Year 1's Ice, Jungle and Ringed fill the lower track and Year 3's the higher (`map.js` 2.2; the editions are unchanged, as only systems that were coming soon filled, so a kept map with Candy passed opens Ice). Their questions and pictures are in `asks.js` and `faces.js` 1.2 (a number to find, counts in steps or in tenths, groups of, sharing, halves, hundreds tens and ones, which fraction is bigger), their sums in `sums.js` 1.4 (sums to 20 crossing 10 or not, missing answers and sums written answer first, HTO sums, estimates, TO × O, TO ÷ O, fraction sums). Lines counted in parts can be written as counted (`numbers.js` 1.2, `scene.js` 1.6: tenths stay tenths) and can write only the marks they're given (`round.js` 2.8). Year 3's 3-digit and tenths levels land on stretches of 7 marks, which an upright phone writes in full (D-103); numbers to 100 play in halves of 51 to 100, then 0 to 100 (D-104). New browser test: `test_rocket_lander_year1_year3_e2e.py` (the close runs it with Rocket Lander's files, `close.py` 1.10); a bench for the step, `mutate_rocket_years.py`.

**Changes at v1.23:** step 2c-3b (D-100): Year 2's three systems replace the stand-in levels on the higher track (`map.js` 2.1, a new edition, so a map kept on the stand-ins starts afresh there and a format 3 entry plays the lower track, its rocks and ships kept). Year 2's questions and pictures are in `asks.js` and `faces.js` 1.1, its sums in forms in `sums.js` 1.3 (TO + O to missing numbers, tables to × 12, dividing); fraction lines are drawn one number over the other (`scene.js` 1.5). New browser test: `test_rocket_lander_year2_e2e.py`. The older browser tests that were written for the stand-in levels keep playing them: `stand_in.py` serves `fixture_map_stand_in.js` (`map.js` 2.0, byte for byte, checked by its sha256) in place of `map.js`; the preview tests, whose bundles carry the game's own map, play real levels.

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

This repo is **P-020 (Family Games Launcher)**'s, the host of every game: it owns the launcher, the wrapper, the Sheet's script, the game contract, the list of games, and `work` and `main`, and only P-020 publishes (P53). **P-034 (Kids Games Development)** develops games here on its own `claude/` branches, in the folders below marked P-034, and releases each finished game to P-020 by a board note naming the commit; P-020 copies its folders onto `work` byte for byte (game contract 0.4, section 7; D-113). So the two projects' work never collides.

## Folder map

| Path | Owner | What it holds |
|---|---|---|
| `games/<id>/` | P-034 on `claude/` branches; P-020's copy on `work` and `main` | One folder per game P-034 develops (Rocket Lander; Word Worm and Monster Café to come; Bubble pop later): its page, manifest, tile picture and one-page README (contract 0.4, section 2) |
| `games/kriss-kross/`, `games/_template/` | P-020 | Rob's wife's game, kept as she made it, and P-020's earlier template (P54, D-115) |
| `games/_common/` | P-034 on `claude/` branches; P-020's copy once released | Code shared between games. `rocket/` is the rocket game's engine (the round flow in `round.js`, the map screens in `starmap.js`, the map's progress rules in `progress.js` and the tracks' in `tracks.js`, the scene, sounds, settings and level helpers, and the hangar: the ships' one table of names, tiers, prices and sounds with the rules for buying in `fleet.js`, their drawings in `ships.js`, and the showroom in `hangar.js`), used by Rocket Lander, the one rocket game since D-058. `fonts/` holds the games' font, Fredoka, with its OFL licence (D-043). A game may import from here, from `shared/bridge.js` and from nothing else outside its folder (D-036, contract 0.4 GC4) |
| [`games.json`](../../games.json) | P-020 | The launcher's list of games: order, status and where each came from (contract 0.4, section 2). P-034 asks for a change in its release note |
| `docs/games/` | P-034 | The games' docs, this guide among them |
| `tools/tests/games/` | P-034 on `claude/` branches | The games' tests and P-034's checks. A game's release check goes in `tools/tests/games/<id>/`, the folder P-020 copies with the game |
| `index.html`, `play.html`, `shared/`, `apps-script/`, the rest of `docs/` and `tools/`, `README.md`, root files | P-020 | The launcher, the shell, the Sheet's script, and the launcher's tests and docs |
| `docs/game-contract.md`, `shared/bridge.js`, and the shell and Sheet stand-ins used by tests | P-020, shared | The contract and its game-side piece. P-020 changes them; P-034 adopts a breaking change only by a decision |

`docs/games-pack/` (on `work`) is P-020's hand-over pack, not part of `docs/games/`.

## Branches

| Branch | Whose | What it is |
|---|---|---|
| `main` | P-020 | The live site (GitHub Pages). Only P-020 changes it, by merging `work` when Rob says "publish" |
| `claude/games` | P-034 | Games work in progress, made from `main`; P-034's workshop. Releases are copied from its commits |
| `work` | P-020 | Launcher work in progress, the game contract, and the released games once copied |
| `games-wip` | Record | Three parked games from before the contract. Kept as a record, never merged or deleted |

## Checks

All of them are in [`tools/tests/games/`](../../tools/tests/games/). The checks use only Python's standard library and git; the games' tests also need Node and Python Playwright with Chromium. Run them from the repo root.

| Script | What it checks |
|---|---|
| `close.py` | Run at every working close, before committing. With no option it runs the fast checks (Node, seconds) and the repo, doc and pin checks (D-086). `--full` runs every test too (about 25 minutes), at a checkpoint Rob chooses: before a trial build or a release to P-020, or when he asks; it records the pass. `--changed` runs the fast checks and only the browser tests whose files changed since the last full pass, by the map in the script; a change to `games/_common/`, to `close.py` or to any file the map doesn't know runs everything (D-056, D-081) |
| `test_*.py` | The checks' own tests (`test_checks.py`, and `test_close_pick.py` for the close's choice of tests), then the games' tests. For Rocket Lander: `test_rocket_lander_core.py` (its pure core and boundaries, by Node: the number levels and rules, the sums levels and sums, the two tracks' maps against the level plan and Rob's notes, the questions, pictures and sums of all four years, the map's progress rules and the tracks', format 4), `test_rocket_lander_labels.py` (RL-3), `test_rocket_lander_e2e.py` (full rounds in a headless browser, about 3 minutes), `test_rocket_lander_levels.py` (Number mode's eight levels, their targets and chips, about 2 minutes), `test_rocket_lander_sums_e2e.py` (the sums levels' rounds, lines and the preview's panel, about 2 minutes), `test_rocket_lander_map_e2e.py` (the map as home, level cards, replays, hyperspace and the galaxy with real taps, at phone and PC sizes, about 4 minutes) `test_rocket_lander_reception_e2e.py` (the tracks, Reception's faces and dice lines, a challenge round and the panel's Track box, at phone and PC sizes, about 4 minutes), `test_rocket_lander_year2_e2e.py` (Year 2's 21 levels right and wrong, their lines, the timed level, the halves, two challenge rounds and progress from the stand-ins, at phone and PC sizes, about 4 minutes), `test_rocket_lander_year1_year3_e2e.py` (Year 1's and Year 3's levels right and wrong, their lines and labels, the halves, the timed level, two challenge rounds and a kept map opening Ice, at phone and PC sizes, about 12 minutes; `--only phone` or `--only pc` runs one size) and `test_rocket_lander_preview.py` (the preview bundle: same bytes on a rebuild, the font inside the page and nothing fetched, RL-3 on the bundle, the test panel); for its hangar, `test_rocket_fleet_core.py` (the ships' table and the rules for buying and picking, by Node) and `test_rocket_hangar_e2e.py` (the door, the showroom, buying and flying ships with real taps, on a number level and a sums level, and a picture check that no ship or its effects reach the numbers, with less motion too, about 7 minutes) and `test_rocket_ship_hooks_e2e.py` (the three ship hooks, D-080: where Bip leaves and boards a ship, the Christmas Tree's own ladder, the flag's side, about 3 minutes) |
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
| `count_rocket_ship_prices.py` | A count, not a check: the ship prices in `fleet.js` against a school year's moon rocks, at a few scalings (D-109) |
| `measure_rocket_state_size.py` | A measurement, not a check: the largest progress Rocket Lander can save, as JSON, against contract 0.4's 20,000-character cap on `fg:state` (3,383 characters, 16.9%, on 12 Nov) |
| `stand_in.py`, with `fixture_map_stand_in.js` | Not a check: the stand-in map (`map.js` 2.0, byte for byte, its sha256 checked before use) served in place of `map.js` to the older browser tests written for the stand-in levels (`test_rocket_lander_e2e.py`, `_levels.py`, `_sums_e2e.py`, `_map_e2e.py`, `test_rocket_hangar_e2e.py`), so their checks stay as they were (step 2c-3b) |
| `plan_rocket_levels.py`, with `syllabus-notes.json` | The level plan (step 2c-2, decided: D-089 to D-092): its table of tracks, systems and levels, checked against Rob's syllabus notes (every level placed once, in the notes' order, 7 and a challenge a system), and the counts quoted in the plan. Run with the notes' path; `test_rocket_lander_core.py` runs it on `syllabus-notes.json`, Rob's notes without the children's ages (Q-033, D-095) |
| `rocket-lander/check.py`, with P-020's `harness.py` | Rocket Lander's release check (contract 0.4.2, GC7), through P-020's wrapper (`play.html`) on a stand-in Sheet with made-up players: the three sizes under the bar, the one-time track pick, its own end of round, progress out with `fg:state` and back with `fg:start` (nothing kept on the device), a second child, sound off, a slow Sheet, two devices, and running on its own. About 3 minutes; serve the repo root on 127.0.0.1:8123 first. Until `games.json` lists the game, its browser is served a copy with a `testing` entry |
| `spike_rocket_lander_fit.py` | A measurement, not a check: Rocket Lander under the wrapper's bar at the three sizes against on its own (Q-039: every number still written; a sideways phone's fall 93 px, not 147) |
| `make_rocket_icon.py` | Not a check: writes `games/rocket-lander/icon.svg`, a one-colour 48 × 48 rocket drawn from the game's own (`scene.js`) |
| `repo_check.py` | Nothing outside P-034's folders has changed on this branch (`games.json`, `games/kriss-kross/` and `games/_template/` are P-020's, D-113) |
| `doc_check.py` | The docs here and `pins.json` are well formed (`games.json` is P-020's to check, D-122) |
| `pins_check.py` | Frozen files are unchanged byte for byte, and the contract and the games pack haven't changed on `work` since they were pinned |
| `mutate_checks.py` | A bench, not part of the close: plants faults in the checks and counts how many the tests catch |
| `mutate_rocket_lander.py`, `mutate_rocket_sums.py`, `mutate_rocket_hangar.py`, `mutate_rocket_map.py`, `mutate_rocket_years.py` | Benches, not part of the close: plant faults in the game (its number levels, its sums levels, its hangar, its map, Year 1's and Year 3's levels) and count how many its tests catch. Only the faults new in a step are run (D-057) |
| `mutate_rocket_link.py` | A bench, not part of the close: plants faults in Rocket Lander's link to the wrapper and counts how many its release check catches, each on a copy of the site served on port 8123 |

```
python3 -B tools/tests/games/close.py
```

**Pins.** [`pins.json`](../../tools/tests/games/pins.json) holds the frozen files and what we rely on from P-020. A pin changes only by a decision in P-034.

## For other projects

**What's here:** P-034's workshop for the games it develops. They are built to the game contract (v0.4.2, on `work`: [docs/game-contract.md](https://github.com/RobL89/family-games/blob/work/docs/game-contract.md); D-114, D-122) and released to P-020 by a board note naming the commit (section 7).

**What's ready:**

| Part | State | Used by |
|---|---|---|
| `games/kriss-kross/`, `games.json`, `games/_template/` | P-020's (D-113, D-115); not changed on `claude/` branches | The launcher (P-020), the children |
| `games/bubble-pop/` | Built; a "Soon" tile in P-020's list; P-034's to develop later (D-005) | Nobody yet |
| `games/rocket-lander/` | On `claude/games`, one game with a map of solar systems (D-058) on two tracks (D-089: Reception then Year 1, Year 2 then Year 3; the track kept with the progress): number levels, sums levels, the questions and sums of Reception and Years 1 to 3 (48 levels a track) and challenge rounds, the map as home, running on its own as a plain page (built-in settings), its engine in `games/_common/rocket/`; in the grown-ups' trial (stage 2). Linked to P-020's wrapper at stage 3 through `shared/bridge.js` (it runs its own levels, takes the child's progress in `fg:start` and hands it back with `fg:state`; a one-time track pick per child, D-121), with its release check in `tools/tests/games/rocket-lander/`; released to P-020 by note | P-020 once released (`testing`, then `ready` on Rob's word) |
| `games/rocket-sums/` | Retired at step 2c-build: its sums and levels are Rocket Lander's now (D-058); git keeps its history | Nobody |
| Word Worm, Monster Café | Being brought over from `games-wip`, then built to the contract | Nobody yet |
| This guide and the checks | On `claude/games` | P-034, and P-020 to see the folder map |

**Live branch:** `main`, P-020's. Work in progress is on `claude/games`; anything there may change without notice until it's released to P-020 and published.

**What's private:** the repo and every branch are public, so nothing here holds the children's photos, voices or ages. Profiles, stars and settings live in P-020's Sheet, never in this repo.

**On the device:** played on its own, Rocket Lander keeps its progress in the browser's localStorage, under one entry, `family-games:rocket-lander:progress`, holding `{ "v": 4, ... }` since step 2c-3a: the track played, the rocket's place on that track's map, how far it is open, each level's best stars and moon rocks found, the other track's map as left, the moon rocks, landings, and the ships owned and flown (D-042, D-053, D-058, D-089). A format 3 entry is still read: since step 2c-3b, with no stand-in track left, its rocks, landings and ships are kept and it plays the lower track from the start; a map kept on the stand-ins (edition `stand-in`) starts Year 2 afresh. Formats 1 and 2 (the two tiles' planets) are no longer read, so test progress started afresh; one child per device until the wrapper keeps it. Nothing else in `games/` uses device storage. Inside P-020's wrapper (stage 3) the game hands its progress over with `fg:state` and the wrapper keeps it per child, so the game keeps none on the device (D-042, contract 0.4 section 4).

**Changes that affect you:** P-034 tells P-020 by a board note before a shared part changes or goes, and keeps the old form until P-020 has moved.

## Change log

| Version | Date | Changes |
|---|---|---|
| 1.27 | 2026-11-13 | Stage 3: Rocket Lander linked to the wrapper (`link.js`, `trackpick.js`, `round.js` 2.9), its release check, `game.json`, `icon.svg`, README; main merged in (D-120); doc check, pins and close after it (D-122, ER-010); new scripts |
| 1.26 | 2026-11-12 | P-020 hosts every game (D-112, D-113): folder map, branches, section for other projects; contract 0.4 (D-114); `repo_check.py` 1.2, `pins.json` 1.1, `measure_rocket_state_size.py` |
| 1.25 | 2026-11-11 | Ship prices halved (`fleet.js` 1.3, D-109), `count_rocket_ship_prices.py`; the checkpoint's full pass recorded (849c0b5) |
| 1.24 | 2026-11-11 | Step 2c-3c: Year 1 and Year 3 (`map.js` 2.2, `asks.js`, `faces.js`, `sums.js`, `numbers.js`, `scene.js`, `round.js`), D-103 and D-104, `test_rocket_lander_year1_year3_e2e.py`, `mutate_rocket_years.py`, `close.py` 1.10 |
| 1.23 | 2026-11-11 | Step 2c-3b: Year 2 on the higher track (`map.js` 2.1, `asks.js`, `faces.js`, `sums.js`), fraction lines (`scene.js`), `test_rocket_lander_year2_e2e.py`, `stand_in.py` and its fixture for the older tests |
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
