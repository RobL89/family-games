# Game contract

**Version 0.2, 2026-11-08.** What a game must do to run in the launcher, and what the launcher does for it.

**Next review:** after the first game is integrated through the shell. Rob decides any changes then.

- **Owner:** P-020 (Family Games Launcher). Games are built to it by P-034 (Kids Games Development).
- **Changes:** Rob agrees each change. P-020 edits this file and tells P-034 with a board note.
- **Status in this file:**
  - **Decided** means Rob has adopted it. The core (sections 1 to 5) is the review's blueprint (`docs/review/REVIEW.md`, "Blueprint: the game contract") with Rob's changes of 2026-10-30. The additions GC1 to GC7 (section 6) were adopted on 2026-11-08.
  - **Open** means not decided yet (section 7).
- **Background, not rules:** the longer write-up, a draft `bridge.js`, a fake shell and an example game are in `docs/games-pack/` (`INTEGRATION.md` and `contract/`). Where they differ from this file, this file wins.

## 1. Every game runs inside the game shell (decided)

The launcher opens `play.html?game=<id>&player=<id>`. The shell holds the game in a frame:

- **The bar,** at the top: home, the child's face and name, their level (only for games with levels) and their stars. Games don't draw their own home button.
- **The game,** in a frame under the bar, using the rest of the screen.
- **The end-of-round panel,** drawn by the shell after each round. It is built from what the game declares and reports:
  - **Stars** appear only if the game gives stars.
  - **What was played** appears only if the game reports it.
  - **▶ Next** appears only when the game says there's a next one.
  - **↻ Again** appears only if the game can restart.
  - **⌂ Home** is always there.
  - On a phone the panel covers the lower part of the screen. On a wide screen it stays centred, and only as wide as its contents.
- **Free play:** a game whose manifest says `"play": "free"` gets no end-of-round panel; the shell's home button ends the visit. What free play counts towards is TBC, decided with the first free-play game.
- **Stickers, level-ups and celebrations** are the shell's. A game never shows the launcher's rewards itself.

## 2. A game's folder (decided)

| File | What it is |
|---|---|
| `games/<id>/game.json` | The manifest. The folder name is the id. |
| `games/<id>/icon.svg` | The launcher tile picture. |
| `games/<id>/game.html` | The game page, for games made in this repo. |
| `games/<id>/original.html` + `adapter.js` | For games brought in as claude.ai artifacts: the page exactly as its maker made it, never edited, and an adapter that watches it and sends the same messages as games made here (section 4). |
| `games.json` | Order and status only: `ready`, `testing` or `soon`. How `testing` games are shown is the review's G5 (proposed). A "soon" placeholder keeps its title, icon and colour here, as it has no folder. |

**The aim (from the review):** adding a game needs no launcher code edits, just a folder and a line in `games.json`.

## 3. The manifest: `game.json` (decided)

```json
{
  "title": "Kriss Kross",
  "colour": "#1AA3C2",
  "icon": "icon.svg",
  "page": "original.html",
  "adapter": "adapter.js",
  "play": "rounds",
  "levels": 0,
  "settings": ["word-lists"],
  "stars": "3 with no hints, 2 with one or two, 1 with more",
  "score": { "counts": "words", "better": "higher" },
  "subject": "words",
  "source": { "link": "TBC", "copied": "2026-10-29" }
}
```

| Field | Meaning |
|---|---|
| `title`, `colour`, `icon` | The tile |
| `page`, `adapter` | The page to open; the adapter only for artifact games |
| `play` | `rounds` or `free` |
| `levels` | How many levels; `0` if the game has none |
| `settings` | What a grown-up sets for this game in Game setup, such as `word-lists` |
| `stars` | The star rule in words, for grown-ups |
| `score` | What the score counts, and whether higher or lower is better |
| `subject` | One word (`words`, `numbers`…) for grouping games later |
| `source` | For artifact games: where the file came from and when it was copied |

## 4. What passes between the game and the shell (decided)

| The shell gives the game | The game tells the shell |
|---|---|
| The child (name, animal), their level, their settings (such as word lists), and whether sound is on | **Round over:** stars, plus, if it has them, score, seconds, what was played (`detail`) and help used (`help`) |
| | Optionally: **ready**, and **there's a next one** (for ▶ Next) |

- **Stars:** 1 to 3 a round (P17). **0 means "finished with the answer shown":** it's saved for the grown-ups and earns nothing.
- **Games made here** send and receive these as messages through `shared/bridge.js` (format in GC1).
- **Artifact games** don't change: `adapter.js` runs in the shell, watches the page and sends the same messages.
- **Standalone:** a game still runs on its own, as a plain page or an artifact. With no shell around it, it uses its defaults and saves nothing.

## 5. Rules every game keeps (decided)

| Rule | Source |
|---|---|
| Plain HTML, CSS and JavaScript; no build step | P1 |
| Works on an Android phone (Chrome) and a Windows PC | Q14 |
| Sound off means no sounds and no speech; read aloud for pre-readers when sound is on | Q15 |
| Every launcher reward is a sticker | Q16 |
| Per-child settings live in one general Settings tab; word lists stay in GameLists | Q12 |
| Word lists are lists, not levels | Q17 (Kriss Kross) |
| Children appear by first name or nickname and a cartoon animal only | P9 |
| The repo is public: no names or family details in any file | Project rule |
| Artifact games' files are never edited | Project rule |

## 6. Additions GC1 to GC7 (decided 2026-11-08)

First drafted in `docs/games-pack/`, where a draft `bridge.js`, a fake shell and an example game passed 26 of 26 checks on 2026-11-08.

**GC1. Message format.** Messages go by `window.postMessage`, between pages on the same site only. Each one is `{ type, v: 1, … }`; the version lets the names change later.

| Direction | Message | Fields |
|---|---|---|
| Game → shell | `fg:ready` | none |
| Game → shell | `fg:round`, once per round | `stars` 0 to 3 (required); if the game has them: `score`, `seconds`, `detail` (what was played, in words), `help` (a number: hints, peeks…), `next` (true if there's a next one), `again` (false if it can't restart) |
| Shell → game | `fg:start`, after `fg:ready` and for ↻ Again and ▶ Next | `round` (`first`, `again` or `next`), `player` (`{ name, animal, colour }`), `level` (or `null`), `settings` (only what a grown-up set, already checked against the manifest), `lists` (the child's word lists, default first: `[{ title, words }]`), `sound` (true or false) |

**GC2. Manifest additions.**
- `settings` is a list. An entry is either the name of something the launcher provides (as now: `"word-lists"`), or an object describing one of the game's own settings: `{ "key": "speed", "default": null, "min": 1, "max": 5, "about": "Leave blank to follow the level" }`. Options go in `"options": [...]`. `"default": null` means "follow the level". Game setup builds its controls from these.
- `next`: what ▶ Next means in this game, in words (for example "the next word list").

```json
"settings": [
  "word-lists",
  { "key": "speak", "default": true, "about": "Say words out loud when sound is on" },
  { "key": "speed", "default": null, "min": 1, "max": 5, "about": "Leave blank to follow the level" }
],
"next": "the next word list"
```

**GC3. Levels.** The game maps each level to its own difficulty and documents the table. The launcher decides which level a child is on and moves them up. A grown-up setting overrides the level for that one thing.

**GC4. Imports.** A game imports only `shared/bridge.js` from the launcher. It carries its own sounds and speech code, so launcher changes can't break it and it still runs on its own.

**GC5. Running on its own.** A game runs standalone if it isn't in a frame, or if no `fg:start` arrives within about 1.5 seconds. That figure is a starting value, to be adjusted in the shell trial on the phone. Standalone, it plays level 1 (or `?level=` in the address), uses its defaults, saves nothing and shows its own small end card. Inside the shell it never shows its own end card.

**GC6. A Play button on the first screen.** It gives a child a clear start and a moment to hear the first prompt. It may also be what lets the phone play sound: Chrome's guidance says browser-made sound starts switched off until the page is tapped, and doesn't say whether the tap on the launcher's tile carries over. Check that on the phone. ↻ Again and ▶ Next skip the Play screen. (Source: "Autoplay policy in Chrome", developer.chrome.com/blog/autoplay, checked 2026-11-08. The same page says a frame from the same site may play sound without extra permission.)

**GC7. Hand-over checklist.** Before a game goes to `testing`:
1. It plays a round in the fake shell at 390×844, 844×390 and 1366×768, with no errors.
2. It sends exactly one `fg:round` per round.
3. Every level plays, and a grown-up setting overrides its level.
4. With sound off it makes no sound and says nothing.
5. It runs on its own.
6. An automated test plays a round through the fake shell.
7. No names or family details anywhere.
8. Its design notes are current: level table, star rule, what ▶ Next means, known issues.

## 7. Open point

**Where a game's own rewards are saved** (Word Worm's hats, Monster Café's coins and decorations, Rocket Lander's planets), now that the Progress tab from `games-wip` isn't used. Options (the games pack's GQ2):

- **a. A small state object per child per game,** saved by the shell in the Settings tab and handed back at the start, with an `fg:state` message. This is recommended: it's simple, it lets a child buy things, and it follows Q12's one general tab.
- **b. Worked out from Scores only.** Nothing can be bought, so things unlock at totals instead.
- **c. Kept on the device only.** It's lost on another device.

## Changes

| Version | Date | What |
|---|---|---|
| 0.1 | 2026-11-08 | First version: the review's blueprint with Rob's shell changes of 2026-10-30, adopted; GC1 to GC7 proposed; one open point |
| 0.2 | 2026-11-08 | GC1 to GC7 adopted, with two changes: word lists stay `"word-lists"` in `settings` (GC2), and the 1.5-second wait is a starting value (GC5). Review after the first game is integrated |
