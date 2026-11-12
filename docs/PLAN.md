# How the launcher works

Updated 2026-11-12. Decisions and their numbers are in [decisions.md](decisions.md). What a game must do, and how a game gets in, is in [game-contract.md](game-contract.md). Setting up or updating the Sheet is in [setup-sheet.md](setup-sheet.md).

## What it is

A simple window to the family's games, on an Android phone (Chrome) or a Windows PC (Q14):

- A child picks their profile and sees the games, then plays one inside a simple wrapper with a home button (P48, P50).
- The launcher has no stars, stickers or currency. Each game keeps its own levels, rewards and progress (P48, P51).
- Four skins change the launcher's look, all free (P49). Games keep their own look.
- This repo is the master host of every game. Games are developed elsewhere and released here (P53, P54).
- Plain HTML, CSS and JavaScript, no build step, served by GitHub Pages (P1, P2). It stays simple.

**Still to build (P55):** the wrapper (`play.html`) and the switches that hide stars and stickers. Until stage 2, the launcher still shows stars, stickers and star-locked skins, and games open on their own pages.

## Screens

1. **Who's playing?** Big cartoon-animal stickers with first names (P13, P15). Tap: wiggle, hello, then the child's home screen.
2. **Home:** the child's games as big tiles, and the skin picker (P20). From stage 2, nothing else.
3. **A game** opens in the wrapper: `play.html?game=<id>&player=<id>`, with a slim bar holding ⌂ Home and the child's face (P50). Today games open at `games/<id>/` directly.
4. **Grown-ups' corner:** press and hold the gear for a second, then answer the question (P18, P32). It holds:
   - players (add or edit)
   - Game setup, with word lists (P36)
   - family code and Check connection
   - results waiting to sync
   - sound on or off
   - the skin preview switch (P34)

## Information flow (P6)

1. **The launcher opens.** It shows players from the device's cache straight away, sends anything waiting, then refreshes from the Sheet.
2. **Everything saves on the device first,** then goes to the Sheet. Each item has a unique ID, so a retry never counts twice.
3. **A game's own progress** goes to the wrapper with `fg:state`. The wrapper keeps it per child on the device, and in the Sheet's Settings tab once script 0.4.0 is live (P51).
4. **Device storage** uses keys starting `fg.` (family code, outbox, caches, skin choice, mute, skin preview). Games use their own keys, never clear-all (contract section 6).

## Sheet tabs

| Tab | Columns | Use from stage 2 |
|---|---|---|
| Profiles | profile_id, nickname, avatar, colour, created_at, active, skin | In use |
| Skins | skin_id, name, stars_needed, active | Names and `active` in use; `stars_needed` ignored (P49) |
| GameLists | list_id, profile_id, game_id, position, title, words, updated_at | In use; per child from script 0.4.0 (P56) |
| Scores | event_id, profile_id, game_id, score, level, stars, seconds, played_at, received_at | Kept, no longer written (P48) |
| Achievements | profile_id, achievement_id, earned_at | Kept, no longer written (P48) |
| Settings (script 0.4.0) | profile_id, game_id, key, value, updated_at | Each game's saved state (P51, Q12) |

The family code is kept in the script's settings, not the Sheet.

## Calls the Apps Script answers (script 0.3.0)

| Call | Does |
|---|---|
| `ping` | Checks the family code; returns the script version |
| `profiles` | Active players, plus the Skins tab |
| `profile` | One player: recent scores, per-game bests, star total, days played, badges, word lists per game |
| `addProfile` | Adds a player |
| `updateProfile` | Changes a player's name, animal, colour or skin |
| `sync` | Takes the device outbox: results and badges, duplicates skipped |
| `saveLists` | Replaces one player's lists for one game, in order (the first is the default) |

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

Live: Kriss Kross (an artifact game; its stars switch off at stage 2). Bubble pop and four placeholders show as "Soon". How a game gets in: [game-contract.md](game-contract.md), section 7.
