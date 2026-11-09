# Games: folder map and guide

| | |
|---|---|
| **Version** | 1.1 · 2026-11-09 |
| **Owner** | P-034 (Kids Games Development) |
| **Kind** | Reference: changed only by a decision in P-034 |

**Changes at v1.1:** the repo check no longer looks for the children's names (P-034's decision D-017), so the "Private names" note is gone and the privacy line says what stays out.

This repo is shared by two projects. **P-020 (Family Games Launcher)** owns the launcher, the shell, the Sheet's script and the game contract. **P-034 (Kids Games Development)** owns the games. Each project writes only to its own folders, so their work never collides.

## Folder map

| Path | Owner | What it holds |
|---|---|---|
| `games/<id>/` | P-034 | One folder per game: its page, manifest, tile picture, and an adapter if it has one |
| `games/_template/` | P-034 | A working mini-game built to the contract |
| `games/_common/` | P-034 | Code shared between games only (made when two games need it) |
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

All of them are in [`tools/tests/games/`](../../tools/tests/games/) and use only Python's standard library and git. Run them from the repo root.

| Script | What it checks |
|---|---|
| `close.py` | Runs everything below, in order. Run at every working close, before committing |
| `test_*.py` | The checks' own tests (`test_checks.py`), then each game's tests as they are added |
| `repo_check.py` | Nothing outside P-034's folders has changed on this branch |
| `doc_check.py` | `games.json`, the docs here, and `pins.json` are well formed |
| `pins_check.py` | Frozen files are unchanged byte for byte, and the contract and the games pack haven't changed on `work` since they were pinned |
| `mutate_checks.py` | A bench, not part of the close: plants faults in the checks and counts how many the tests catch |

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
| Rocket Lander, Word Worm, Monster Café | Being brought over from `games-wip`, then built to the contract | Nobody yet |
| This guide and the checks | On `claude/games` | P-034, and P-020 to see the folder map |

**Live branch:** `main`. Work in progress is on `claude/games`. Anything there may change without notice until it's published.

**What's private:** the repo and every branch are public, so nothing here holds the children's photos, voices or ages. Profiles, stars and settings live in P-020's Sheet, never in this repo.

**Changes that affect you:** P-034 tells P-020 by a board note before a shared part changes or goes, and keeps the old form until P-020 has moved.

## Change log

| Version | Date | Changes |
|---|---|---|
| 1.1 | 2026-11-09 | Names check removed from the repo check (D-017) |
| 1.0 | 2026-11-09 | First version: folder map from D-002, branches, checks, section for other projects |
