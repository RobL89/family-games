# Game contract

**Version 0.4.2, 2026-11-13.** What a game needs to run in the launcher, what the launcher can give it, and how a game gets in.

- **Owner:** P-020 (Family Games Launcher), the master host of every game (P53). Games are developed elsewhere, now in P-034 (Kids Games Development), and released to P-020 (section 7).
- **Changes:** Rob agrees each change. P-020 tells every games project by board note before it changes this file.
- **Next review:** after the first game is taken in through the wrapper.
- `docs/games-pack/` is background from version 0.3. Where it differs from this file, this file wins.

## 1. The wrapper (P50)

The launcher opens `play.html?game=<id>&player=<id>`. The wrapper is a slim bar at the top with **⌂ Home** and the child's animal face. The game runs in a frame under it and uses the rest of the screen.

- **The game owns everything inside its frame:** its levels, its rewards, its end of round, and its Next and Again. The wrapper draws no end-of-round panel and shows no stars or levels.
- **While the game opens, the wrapper covers it** with the child's face, until 0.3 seconds after `fg:start` reaches a page that isn't reloading, and at most 6 seconds (P83). So a game must send `fg:ready` (through `shared/bridge.js`), and an adapter that reloads the page calls `freezeStorage()` first (P82).
- **The launcher has no stars or stickers** (P48). A game may still send round results (section 5). The wrapper accepts them and ignores them while stars are switched off.

## 2. A game's folder

| Path | What |
|---|---|
| `games/<id>/game.json` | The manifest (section 3). The folder name is the id |
| `games/<id>/icon.svg` | The tile picture |
| `games/<id>/README.md` | One page: what the game is, what it needs from the launcher, its own rules, and how its levels work. A self-contained game says so in one line |
| `games/<id>/` | The game's own files. The page is the one named in `page` |
| `games/<id>/original.html` + `adapter.js` | For an artifact game: the page exactly as its maker made it, never edited. `adapter.js` only if the game uses a launcher service or must tell the wrapper something (section 4) |
| `games/_common/<name>/` | Code shared by several games, such as an engine or a font. It arrives with the first game that uses it |
| `tools/tests/games/<id>/` | The game's release check (section 7) |
| `games.json` | The launcher's list: order, status (`ready`, `testing` or `soon`), and where each game came from (`source`). P-020 keeps it |

A game imports only from its own folder, `games/_common/` and `shared/bridge.js` (GC4). So launcher changes can't break it, and it still runs on its own.

## 3. The manifest: `game.json`

```json
{
  "title": "Kriss Kross",
  "colour": "#1AA3C2",
  "icon": "icon.svg",
  "page": "original.html",
  "adapter": "adapter.js",
  "settings": ["word-lists"]
}
```

| Field | Needed? | Meaning |
|---|---|---|
| `title`, `colour`, `icon` | Yes | The tile |
| `page` | Yes | The page to open |
| `adapter` | Artifact games that need one | The adapter's file |
| `settings` | Only if the game uses a launcher service | What it needs, such as `"word-lists"` (section 4) |

Fields from version 0.3 (`play`, `levels`, `stars`, `score`, `subject`, `next`) may stay in a manifest. The launcher ignores them.

## 4. What the launcher can give a game

A game uses only what it needs. A game that needs nothing beyond the first two is **self-contained**.

| Service | Who gets it | How |
|---|---|---|
| **Who's playing** | Every game | `player` in `fg:start`: name, animal, colour |
| **Sound on or off** | Every game | `sound` in `fg:start`. Off means no sounds and no speech (Q15) |
| **Word lists** | Games with `"word-lists"` in `settings` | `lists` in `fg:start`: the child's lists, default first, as `[{ title, words }]`. One set per child, shared by every word game that asks for them (GQ3). A grown-up edits them in Game setup |
| **Saving the game's own progress** | Games that send `fg:state` | The wrapper saves the game's state per child and hands it back in `fg:start` (GC8, P51). It's kept on the device at first, and in the Sheet once script 0.4.0 is live. The game doesn't change |
| **A grown-up setting of its own** | Games that describe one in `settings` (GC2) | Not built yet. The launcher builds Game setup's control when the first game needs one |

A game's own rules for a service (for Kriss Kross, words of 2 to 15 letters) go in its README, not here.

## 5. Messages (GC1)

Sent with `window.postMessage`, between pages on the same site only. Each one is `{ type, v: 1, … }`. Games made here use `shared/bridge.js`; an artifact game's adapter sends the same messages for it.

| Direction | Message | Fields |
|---|---|---|
| Game → wrapper | `fg:ready` | none |
| Wrapper → game | `fg:start`, after `fg:ready` | `player`, `sound`, `lists`, `settings`, `state` (or `null`), `level` (always `null` now: games run their own levels) |
| Game → wrapper | `fg:state`, whenever its saved state changes | `state`: one small object, under 20,000 characters as JSON |
| Game → wrapper | `fg:round` (optional) | As in version 0.3. Ignored while stars are switched off |

## 6. Rules every game keeps

| Rule | Source |
|---|---|
| Plain HTML, CSS and JavaScript; no build step | P1 |
| Works on an Android phone (Chrome), upright and sideways, and on a Windows PC, with the wrapper's bar at the top | Q14 |
| **GC3. Levels:** the game runs its own levels and keeps them in its own state | P50 |
| **GC5. Running on its own:** with no frame, or no `fg:start` within about 5 seconds (P81), the game plays with its defaults and saves to the device only | |
| **GC6. A Play button on the first screen,** so a child starts on purpose and the phone allows sound (TBC on the phone; Chrome's autoplay guidance, checked 2026-11-08) | |
| Children appear by first name or nickname and a cartoon animal only | P9 |
| The repo is public: no names or family details in any file | Project rule |
| An artifact game's files are never edited | Project rule |

## 7. Adding or updating a game (P53, P54)

**From a games project such as P-034:**
1. The game passes the checklist below on the games project's own branch.
2. The games project sends P-020 a board note. It names the game, the commit, the folders to copy (`games/<id>/`, any `games/_common/` parts, `tools/tests/games/<id>/`) and what changed.
3. P-020 copies those folders from that commit onto `work`. It's a copy, never a merge, so the released files match the commit byte for byte. P-020 records the commit as the game's `source` in `games.json`.
4. P-020 runs the release check and the launcher's tests, and lists the game as `testing`. A `testing` game shows only on devices where Testing is switched on.
5. Rob plays it on the phone and PC. When he says "publish", P-020 sets it to `ready` and merges `work` into `main`.

An update follows the same steps, and the new folders replace the old ones.

**An artifact game:** Rob gives P-020 the link. P-020 saves the page unchanged as `original.html`, writes `game.json`, the README and, only if needed, `adapter.js`, and records the link, the date and, if readable, the artifact's version as `source` (TBC on first use). Then steps 4 and 5 above. When the maker updates her game, Rob gives P-020 the link again and the copy is retaken. What the maker's Claude should keep the same: `docs/maker-notes.md`.

**GC7. Checklist before a game is released:**
1. It plays in the fake wrapper at 390×844, 844×390 and 1366×768 with no errors, and nothing hides under the bar.
2. It shows its own end of round.
3. With sound off it makes no sound and says nothing.
4. It runs on its own.
5. If it saves progress, the state goes out in `fg:state` and comes back in `fg:start`.
6. Its release check plays a round through the fake wrapper automatically.
7. Its README is current and fits on one page.
8. No names or family details anywhere.

## Changes

| Version | Date | What |
|---|---|---|
| 0.1 | 2026-11-08 | The review's blueprint with Rob's shell changes of 2026-10-30 |
| 0.2 | 2026-11-08 | GC1 to GC7 adopted |
| 0.3 | 2026-11-08 | GC8: a game's own rewards saved as a state object per child per game |
| 0.4.2 | 2026-11-13 | Section 1: the wrapper covers a game while it opens, until it has had `fg:start` (P83). No game changes |
| 0.4.1 | 2026-11-13 | GC5: a framed game waits about 5 seconds for `fg:start`, not 1.5, because the wrapper may first wait up to 3 seconds for the Sheet (P81) |
| 0.4 | 2026-11-12 | Rob's new direction (P48 to P54). The wrapper is a bar with Home and the child's face, with no panel, stars or levels. Games run their own levels (GC3) and show their own end of round. Services listed (section 4), with one set of word lists per child. Imports may include `games/_common/` (GC4). Each game has a one-page README. The release route to P-020 (section 7). GC7 updated |
