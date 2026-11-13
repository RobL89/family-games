# How the launcher works

Updated 2026-11-13 (stage 5: script 0.4.0 live; the cover, P83). Decisions and their numbers are in [decisions.md](decisions.md). What a game must do, and how a game gets in, is in [game-contract.md](game-contract.md). Setting up or updating the Sheet is in [setup-sheet.md](setup-sheet.md).

## What it is

A simple window to the family's games, on an Android phone (Chrome) or a Windows PC (Q14):

- A child picks their profile and sees the games, then plays one inside a simple wrapper with a home button (P48, P50).
- The launcher has no stars, stickers or currency. Each game keeps its own levels, rewards and progress (P48, P51).
- Four skins change the launcher's look, all free (P49). Games keep their own look.
- This repo is the master host of every game. Games are developed elsewhere and released here (P53, P54).
- Plain HTML, CSS and JavaScript, no build step, served by GitHub Pages (P1, P2). It stays simple.

**Switches (P48, P49, P52):** the `features` block in `shared/config.js` turns the old stars, stickers, "Last played", tile stars, celebration, skin locks and the grown-ups' skin preview ("Debug skin") button off and on (P73). All are off. Off means hidden and not run: no results are queued or sent to the Scores tab. Turning one back on restores the old behaviour (the old tests in `tools/tests/` check that).

## Screens

1. **Who's playing?** Big cartoon-animal stickers with first names (P13, P15). Tap: wiggle, hello, then the child's home screen.
2. **Home:** the child's games as big tiles, nothing else. Tapping the child's face (it has a small paint badge) opens the skin picker; it stays open to try skins and closes with the tick, a tap outside or Esc (P62).
3. **A game** opens in the wrapper: `play.html?game=<id>&player=<id>`, with a slim bar holding ⌂ Home, the child's face and name (P50). `shared/wrapper.js` runs it; the game talks to it through `shared/bridge.js` (contract section 5). An artifact game's page is never edited: the wrapper adds its `adapter.js` to the page, and the adapter talks to the wrapper for it (P67). While the game opens, the child's face covers it until it has been told who's playing, so the previous child's view never shows (P83).
4. **Grown-ups' corner:** press and hold the gear for a second, then answer the question (P18, P32). It holds:
   - players (add or edit)
   - Game setup, with word lists (P36)
   - family code and Check connection
   - results waiting to sync
   - sound on or off
   - Testing: "Games being tested" (shows `testing` tiles on this device only)

## Information flow (P6)

1. **The launcher opens.** It shows players from the device's cache straight away, sends anything waiting, then refreshes from the Sheet.
2. **Everything saves on the device first,** then goes to the Sheet. Each item has a unique ID, so a retry never counts twice.
3. **A game's own progress** goes to the wrapper with `fg:state`. The wrapper keeps it per child on the device (`fg.state.<child>.<game>`, with when it was made) and sends it to the Sheet's Settings tab (P51): within 30 seconds of a change, at once on ⌂ Home or when the page is hidden (P78). The newest save wins. As a game opens, the child's profile is re-read so progress from another device is there. There's no Save button (P79). An artifact game that saves in its own storage passes its progress on through `games/_common/keep-progress/` (P77). With script 0.3.0, progress just stays on the device.
4. **Word lists** reach a game in `fg:start`: one set per child for every word game (P56). With script 0.3.0, which keeps them per game, it's this game's lists or else the first set the child has (P61).
5. **Device storage** uses keys starting `fg.` (family code, outbox, caches, skin choice, mute, skin preview, Testing switch, game states). Games use their own keys, never clear-all (contract section 6).

## Sheet tabs

| Tab | Columns | Use from stage 2 |
|---|---|---|
| Profiles | profile_id, nickname, avatar, colour, created_at, active, skin | In use |
| Skins | skin_id, name, stars_needed, active | Names and `active` in use; `stars_needed` ignored (P49) |
| GameLists | list_id, profile_id, game_id, position, title, words, updated_at | In use. From 0.4.0 one set per child, `game_id` blank; a child's old per-game rows are read until their lists are next saved, which moves them (P56) |
| Scores | event_id, profile_id, game_id, score, level, stars, seconds, played_at, received_at | Kept, no longer written (P48) |
| Achievements | profile_id, achievement_id, earned_at | Kept, no longer written (P48) |
| Settings (script 0.4.0) | profile_id, game_id, key, value, updated_at | Each game's saved state, key `state`, value JSON, `updated_at` when the game made it (P51, P78, Q12) |

The family code is kept in the script's settings, not the Sheet.

## Calls the Apps Script answers (script 0.4.0)

0.4.0 is live (pasted 2026-11-13), tested first in `tools/tests/script/` (P75). The launcher also works with 0.3.0.

| Call | Does |
|---|---|
| `ping` | Checks the family code; returns the script version |
| `profiles` | Active players, plus the Skins tab |
| `profile` | One player: recent scores, per-game bests, star total, days played, badges, `word_lists` (one set), `states` (each game's `{ state, at }`) |
| `addProfile` | Adds a player |
| `updateProfile` | Changes a player's name, animal, colour or skin; any active skin, no star check (P63) |
| `sync` | Takes the device outbox: results and badges, duplicates skipped |
| `saveLists` | Replaces one player's word lists, in order (the first is the default); a `game_id` from an older launcher is ignored |
| `saveState` | Keeps one game's state for one player, with when it was made; an older save than the Sheet's is ignored (P78) |

## Safety and privacy (P7, P9, P10)

- **The site and repo are public.** GitHub Pages on a free personal account publishes publicly (checked 2026-10-28), so the Apps Script link is visible in the site's code.
- **Every call is a POST carrying the family code** (never in a link). A grown-up enters it once per device. It's a light lock, not a password.
- **The Sheet holds only:** first names or nicknames, a cartoon animal, a colour, the chosen skin, word lists and game progress. No surnames, birthdays, photos or schools.
- **The repo holds no names or family details.**
- **Writes are locked one at a time** in the script, so two children finishing at once don't clash.
- **The grown-ups' question:** only a one-way hash of the answer is in `shared/config.js` (P33).

## Skins (P21, P22, P31, P49)

Sticker book (the default), Fairy, Blocks and Unicorn.
- Each skin is one CSS file in `shared/skins/` for colours, fonts and frames. Its scenery and tap effects are in `shared/skin-effects.js`, and each file's header says what the skin looks like.
- A child's skin is saved in the Profiles `skin` column, or kept on the device if the Sheet can't save it yet (P24).
- Skins change the launcher only, never the games.

## Games

Live (stage 3, published 2026-11-13, P68): three artifact games, each with its own one-page README in `games/<id>/`:
- **Kriss Kross:** word lists from Game setup, plus the child's own lists (P66).
- **Space Explorer:** a guide to space.
- **Number Town:** a maths town. Each child's explorer follows them between devices (P77).

Testing: Wrapper check, a launcher tool for trying the wrapper. Bubble pop and the four placeholders are hidden (status `hidden`, P65).

**Artifact games** come in by the route in P69. Each has the maker's page as `original.html`, never edited, and an `adapter.js`. Shared helpers for adapters are in `games/_common/`: sound off (`sound-off/`) and progress kept in the game's own storage (`keep-progress/`, P77). Their release checks are in `tools/tests/games/<id>/`. How any game gets in: [game-contract.md](game-contract.md), section 7.

## Trying changes before publishing (P57)

Claude builds a private preview from `work` with `tools/preview/build_preview.py` and publishes it as a claude.ai artifact, always at the same link. It runs the real launcher files against a stand-in Sheet with made-up players, kept in the browser; the real Sheet is never touched. Rob tries it on the phone and PC, then says publish. Two things can only be checked on the live site after publishing: sound after a tile tap (GC6) and the real Sheet. Rob checked both on the live site on 2026-11-12 after stage 2: the new look showed, Wrapper check beeped after a tile tap and Play, and the corner's Check connection said Connected.
