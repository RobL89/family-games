# Games: folder map and guide

| | |
|---|---|
| **Version** | 1.8 · 2026-11-09 |
| **Owner** | P-034 (Kids Games Development) |
| **Kind** | Reference: changed only by a decision in P-034 |

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
| `games/_common/` | P-034 | Code shared between games only. `rocket/` is the rocket games' engine (the round flow in `round.js`, the scene, sounds, settings and level helpers), shared by the two tiles, Rocket Lander and Rocket Sums (D-027, D-037). A game may import from here and from nothing else outside its folder (D-036) |
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
| `close.py` | Runs everything below, in order. Run at every working close, before committing |
| `test_*.py` | The checks' own tests (`test_checks.py`), then each game's tests: for Rocket Lander, `test_rocket_lander_core.py` (its pure core and boundaries, by Node), `test_rocket_lander_labels.py` (RL-3), `test_rocket_lander_e2e.py` (full rounds in a headless browser, about 3 minutes), `test_rocket_lander_levels.py` (Number mode's eight levels, their targets and chips, about 2 minutes) and `test_rocket_lander_preview.py` (the preview bundle: same bytes on a rebuild, nothing fetched but Google Fonts, RL-3 on the bundle); for Rocket Sums, `test_rocket_sums_core.py` (its levels, sums and lines, by Node) and `test_rocket_sums_e2e.py` (rounds, levels and its preview in a headless browser, about 2 minutes) |
| `build_preview.py` | Not a check: bundles a game folder into one page for a private preview (D-018), with a stamp naming the commit and the folder's sha256. Writes outside the repo by default. `--debug` adds the game's test panel (`preview_debug_<game>.js`: a cog on the start screen, for Rob's testing only, never in a trial preview; D-020) |
| `measure_rocket_lander_line.py` | A measurement, not a check: how many numbers fit on the line, exactly aimable, at phone and PC sizes |
| `sketch_rocket_lander_number_mode.py` | Not a check: draws options for Rob to choose from, by playing a copy of the game with small drawing changes, and writes one page of pictures for a private artifact. The game's own files are never changed |
| `repo_check.py` | Nothing outside P-034's folders has changed on this branch |
| `doc_check.py` | `games.json`, the docs here, and `pins.json` are well formed |
| `pins_check.py` | Frozen files are unchanged byte for byte, and the contract and the games pack haven't changed on `work` since they were pinned |
| `mutate_checks.py` | A bench, not part of the close: plants faults in the checks and counts how many the tests catch |
| `mutate_rocket_lander.py`, `mutate_rocket_sums.py` | Benches, not part of the close: plant faults in each game and count how many its tests catch |

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
| `games/rocket-lander/` | On `claude/games`, running on its own as a plain page (built-in settings, nothing saved), its engine in `games/_common/rocket/`; being built to the contract at stage 2 | Nobody yet |
| `games/rocket-sums/` | On `claude/games`, Rocket Lander's maths tile on the same engine, running on its own as a plain page; being built to the contract at stage 2 | Nobody yet |
| Word Worm, Monster Café | Being brought over from `games-wip`, then built to the contract | Nobody yet |
| This guide and the checks | On `claude/games` | P-034, and P-020 to see the folder map |

**Live branch:** `main`. Work in progress is on `claude/games`. Anything there may change without notice until it's published.

**What's private:** the repo and every branch are public, so nothing here holds the children's photos, voices or ages. Profiles, stars and settings live in P-020's Sheet, never in this repo.

**Changes that affect you:** P-034 tells P-020 by a board note before a shared part changes or goes, and keeps the old form until P-020 has moved.

## Change log

| Version | Date | Changes |
|---|---|---|
| 1.8 | 2026-11-09 | Rocket Sums and its tests and bench listed (D-037, D-039) |
| 1.7 | 2026-11-09 | Number mode's levels test listed (D-038) |
| 1.6 | 2026-11-09 | Rocket Lander's engine in `games/_common/rocket/` (D-027, D-036) |
| 1.5 | 2026-11-09 | Number mode sketch script listed (step 2a-1) |
| 1.4 | 2026-11-09 | Test panel for previews (D-020) and the line measuring script |
| 1.3 | 2026-11-09 | Preview build script and its test added (step 1b+) |
| 1.2 | 2026-11-09 | Rocket Lander brought over (step 1b): its tests and bench listed; the games' tests need Node and Playwright |
| 1.1 | 2026-11-09 | Names check removed from the repo check (D-017) |
| 1.0 | 2026-11-09 | First version: folder map from D-002, branches, checks, section for other projects |
