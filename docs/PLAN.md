# Kids' Games: Plan

Status: the proposals log at the bottom records what Rob has adopted or declined. Anything not marked adopted is still a proposal.

Repo: `RobL89/family-games` (public).

Last updated: 2026-10-29

## What we're building

- A **launcher**: pick who's playing, see your home screen (stars, badges, recent games, skins), pick a game.
- A **series of games**: one folder each, playable with touch (phone) or mouse (PC).
- **Storage** in a Google Sheet, so profiles, scores, badges, skins and game progress follow the kids across devices.
- **Settings in the Sheet**: each game's difficulty and word lists, set for everyone or per child (P33–P37).
- Style: fun, child friendly, cartoonish, interactive, not overly complex. Sticker book look (P14), with unlockable skins (P21).

## Family (answered 2026-10-28)

- Two children, aged 6 and 4. Build for the 6-year-old first; the 4-year-old plays from pictures and colours.
- Devices: phone and PC browser. No tablet.
- Their first names are used as nicknames in the Sheet (Rob, 2026-10-28). Names stay out of this public repo.

## Folder layout (P4)

```
family-games/
├─ index.html              Launcher page (the code is in shared/launcher.js)
├─ games.json              List of games: id, title, icon, colour, folder, status ("ready" or "soon"), settings
├─ shared/
│  ├─ config.js            Apps Script web app URL; debug switch for the skin button
│  ├─ api.js               Talks to the Sheet; keeps an outbox on the device
│  ├─ launcher.js          Who's playing, home screen, celebrations, grown-ups' corner
│  ├─ game-kit.js          What every game calls: getPlayer(), record(), finish(), homeButton(),
│  │                       loadSettings(), loadProgress(), saveProgress()
│  ├─ settings.js          How game settings are described and worked out per child (P33, P37)
│  ├─ achievements.js      Badge list and the rules for earning them
│  ├─ skins.js             Skin list (fallback star targets) and switching
│  ├─ skin-effects.js      Skin scenery, pictures (wings, horn) and tap effects
│  ├─ theme.css            Sticker book theme, built from tokens skins can override
│  ├─ skins/               fairy.css, blocks.css, unicorn.css
│  ├─ avatars.js           Original cartoon animals and colours
│  ├─ icons.js             Stars, badge pictures, game pictures, buttons
│  └─ sound.js             Little sounds made in the browser and spoken words, with mute
├─ games/
│  ├─ _template/           Starter game to copy for each new game (shows settings and progress)
│  ├─ bubble-pop/          First working game
│  ├─ kriss-kross/         The family's word-grid game, with small hooks for stars and word lists
│  ├─ word-worm/           Spelling and counting worm (P32)
│  ├─ monster-cafe/        Serving sums to monsters (P32)
│  └─ rocket-lander/       Landing on a number line (P32)
│     (each game with settings has a settings.js describing them)
├─ apps-script/
│  └─ Code.gs              The Sheet's backend, pasted into Apps Script
├─ tools/
│  ├─ sheet-check.html     Grown-ups' connection and settings check
│  ├─ settings-seed.mjs    Copies every game's settings into Code.gs as the Settings tab's starting rows
│  └─ tests/               Browser tests against a stand-in Sheet, and a run of Code.gs on imitation Sheets
└─ docs/
   ├─ PLAN.md              This file
   ├─ setup-sheet.md       Step-by-step: Sheet, script, deploy, updates
   └─ mockups/             Look-and-feel mockups (P14)
```

## Information flow (P6)

1. **Launcher opens.** Shows players from the device's cache straight away, sends anything waiting in the outbox, then refreshes from the Sheet.
2. **Child taps their avatar.** Home screen: greeting and star total, game tiles with best stars, badges earned and still to earn, last five games, skins.
3. **Child taps a game.** It opens at `games/<id>/index.html?player=<profile_id>`.
4. **Round ends.** The game calls `record()` (stay, for "Play again") or `finish()` (go back). The result is saved on the device first, then sent to the Sheet by the launcher. Each result has a unique ID, so a retry never counts twice.
5. **Badges are checked** at the end of each round with the rules in `shared/achievements.js`, and again when the home screen opens. New ones are recorded in the Sheet (duplicates ignored).
6. **Back in the launcher:** confetti, the stars won, new badges sticking on, and any skin just unlocked.

## Sheet tabs (P5, P23, P24, P33–P35)

| Tab | Columns |
|---|---|
| Profiles | profile_id, nickname, avatar, colour, created_at, active, skin |
| Scores | event_id, profile_id, game_id, score, level, stars, seconds, played_at, received_at |
| Achievements | profile_id, achievement_id, earned_at |
| Skins | skin_id, name, stars_needed, active |
| Settings | game_id, setting, about, everyone, then one column per child headed with their name |
| Lists | list_id, title, items, about |
| Progress | profile_id, game_id, data (JSON), updated_at |

The family code is kept in the script's settings, not the Sheet. Change a skin's star target by editing `stars_needed` in the Skins tab; the launcher reads it fresh.

## Calls the Apps Script answers (script 0.3.0)

| Call | Does |
|---|---|
| `ping` | Checks the family code; returns the script version |
| `profiles` | Active players, plus the Skins tab |
| `profile` | One player: recent scores, per-game bests, play count, star total, days played, badges, saved progress |
| `addProfile` | Adds a player (grown-ups' corner) and their column in Settings (P36) |
| `updateProfile` | Changes a player's name, animal, colour or skin; a skin only if they have the stars. A new name renames their Settings column |
| `settings` | The Settings and Lists tabs, with warnings about anything that doesn't fit |
| `sync` | Takes the device outbox: results, badges and progress; duplicates skipped, older progress never replaces newer |

## Game settings, word lists and progress (P33–P37, built 2026-10-29)

- **Settings tab:** one row per setting. `everyone` is the family value; a child's column overrides it for that child; blank means "use the next one down". Order: this game + this child > "all" games + this child > this game + everyone > "all" + everyone > the game's default (P33).
- **Shared settings** use game `all`: `word_list` (Kriss Kross and Word Worm) and `speak` (P33).
- **Lists tab:** named word lists. A `word_list` cell holds a `list_id` or the words themselves (P34).
- **Progress tab:** one small JSON object per child per game (coins, unlocks), saved on the device first and synced with the outbox; the newest copy wins (P35).
- **New players:** adding a player adds an empty Settings column with their name; renaming renames it (P36).
- **One source of truth:** each game describes its settings (name, kind, default, limits, help text) in `games/<id>/settings.js`. `tools/settings-seed.mjs` copies them into `Code.gs`, and `setup` adds only the rows the tab lacks, after a backup (P37).
- **Bad values** are skipped and the next level down is used; `tools/sheet-check.html` > **Check game settings** shows each game's values per child, where they came from, and anything skipped.
- **Timing:** the launcher refreshes settings in the background; a game waits up to 2.5 seconds for fresh settings at the start, then uses what's on the device.
- **Kriss Kross** (P38): opened from the launcher, it starts with the child's `word_list` and its title. It leaves the box alone once someone types in it, and works exactly as before when opened on its own.

## Safety and privacy (P7, P9, P10)

- On a personal GitHub account, the game site is reachable by anyone with its link: private publishing needs GitHub Enterprise Cloud. On GitHub Free the repo itself must also be public.
- So the Apps Script link is visible in the site's code. To stop strangers writing to the Sheet, each call carries a **family code**, sent in the body of a POST (never in a link). A grown-up enters it once per device; it is stored in that device's browser and in the script's settings, never in the repo. It's a light lock, not a password.
- The Sheet holds first names or nicknames, a cartoon animal, a colour, scores, badges and the chosen skin. No surnames, birthdays, photos or schools.
- Writes are locked one at a time in the script, so two kids finishing at once don't clash.

## Limits checked 2026-10-28

- **GitHub Pages:** free on public repos; public or private repos with Pro and above. Published site up to 1 GB; soft bandwidth limit 100 GB a month. Source: docs.github.com, "GitHub Pages limits".
- **Apps Script (gmail.com account):** 6 minutes per run; 30 simultaneous runs per user; 50,000 settings reads/writes a day. Google says quotas can change without notice. Source: developers.google.com/apps-script/guides/services/quotas.
- **Google Sheets:** up to 20 million cells per spreadsheet (raised September 2026). Source: Google Workspace Updates blog.

Checked 2026-10-29:

- **Spoken words:** the browser's speech synthesis is Baseline "widely available" (since 2021-03-05): Chrome, Edge, Firefox and Safari, on phones too. Which voices exist differs by device, so every game also works silently. Source: web-platform-dx.github.io/web-features-explorer, "Speech synthesis".
- **Characters in a cell:** Google's "Files you can store in Google Drive" page gives 20 million cells or 100 MB per spreadsheet, and says cells over 50,000 characters are removed when converting from Excel; it doesn't give a general per-cell limit (TBC). The script keeps well under that: progress up to 20,000 characters per child per game, and it reads up to 5,000 characters from a settings or list cell.

Family use is far inside all of these.

## Launcher and home screen (P13–P20, built 2026-10-28)

- **P13 Flow:** "Who's playing?" with big avatar stickers (tap: wiggle and hello) → the child's home screen → a game. Coming back from a game: confetti, stars won, new badges sticking on. Every game within two taps.
- **P14 Look and feel: A, sticker book.** Kraft paper, chunky outlines, tilted stickers. B and C declined. Mockup of all three: `docs/mockups/look-and-feel.html`.
- **P15 Avatars:** six original cartoon animals (fox, frog, owl, bear, bunny, penguin) plus six colours.
- **P16 Badges:** first game; three stars on any game; try every game; 3 days in a row; beat your best; 10, 50 and 100 games. Locked ones are grey with a "?"; tapping any badge says its name.
- **P17 Scores:** 1–3 stars is the headline in every game; stars are also the points that unlock skins.
- **P18 Grown-ups' corner:** press and hold the gear for a second, then answer a times-table sum (P27). Holds: add or edit players, family code and connection check, results waiting to sync, sound on/off.
- **P19 Small touches:** sounds with a mute switch; a cloud icon on the home screen while results are waiting to sync.
- **P20 Phone layout:** on a phone held upright, games sit above the badges.

## Bonus theme skins (P21–P24)

Skins change the launcher and home screens only, never the games (Rob, 2026-10-28). Unlocked by a child's star total. Starting targets, editable in the Skins tab:

| Skin | Stars needed |
|---|---|
| Sticker book | 0 (default) |
| Fairy | 10 |
| Blocks | 20 |
| Unicorn | 30 |

- **Fairy:** an enchanted garden at dusk: moon, stars, hanging vines, toadstools and flowers, drifting fireflies. Avatars grow fluttering wings; tiles are frosted glass with flowers pinned on. Taps throw sparkles and a trail of fairy dust follows the finger or mouse.
- **Unicorn:** rainbow cloudland: a rainbow that draws itself in, drifting clouds, rising hearts and an original unicorn peeking in from the corner. Avatars get a rainbow ring and a golden horn; tiles have shimmering rainbow edges. Taps make a rainbow ripple and a burst of hearts.
- **Blocks:** an original pixel world at sunset: pixel sun, stars, stepped hills, floating cubes and a passing comet. Everything is a bevelled block; taps pop out pixels. Asked for as "Minecraft" and to look more like it; declined, as Minecraft's look belongs to Mojang. Name TBC.
- Colours, fonts and frames are one CSS file per skin in `shared/skins/` (P22); scenery, pictures and tap effects are in `shared/skin-effects.js` (P31).
- A child's chosen skin is saved in the Profiles `skin` column; if the Sheet can't save it yet, it's kept on that device (P24).
- **Debug skin button** (bottom right) switches skins for grown-ups without unlocking or saving anything. Turn it off with `debug: false` in `shared/config.js` (P28).

## Games

| Game | Status |
|---|---|
| Bubble pop | Ready (P25): 20 bubbles; 3 stars for 17+, 2 for 11+, otherwise 1 |
| Kriss Kross (the family's word-grid game) | Ready: solving a puzzle saves stars (P30); "Show solution" saves nothing. Opens with the child's word list (P38) |
| Word Worm | Ready (P32): eat letters in order to spell; letters and counting modes; hats unlock at 10, 25, 50, 100 words. Stars: 0–1 mistakes 3, 2–4 2, else 1 (P40) |
| Monster Café | Ready (P32): serve sums (add, take, bonds, double, half, times, share) by tapping food or a number pad; coins buy 9 café decorations. Stars: right first time 85%+ 3, 60%+ 2, else 1 (P41) |
| Rocket Lander | Ready (P32): land on the target on a number line (whole numbers, fractions, decimals, negatives); six planets, moon rocks. Stars: right 85%+ 3, 60%+ 2, else 1 (P42) |
| Memory match, Count it, Shape sort, Spot it | Placeholder "Soon" tiles (P26); names are placeholders |

## Open questions (TBC)

- Blocks skin: final name (the 6-year-old could pick).

## Proposals log

| # | Proposal | Status |
|---|---|---|
| P1 | Plain HTML, CSS and JavaScript, no build step | Adopted 2026-10-28 |
| P2 | Host on GitHub Pages | Adopted 2026-10-28 |
| P3 | Google Sheet reached through an Apps Script web app | Adopted 2026-10-28 |
| P4 | Folder layout above | Adopted 2026-10-28 |
| P5 | Sheet tabs: Profiles, Scores, Achievements | Adopted 2026-10-28 |
| P6 | Save on the device first, sync in the background | Adopted 2026-10-28 |
| P7 | Family code checked by the script | Adopted 2026-10-28 |
| P8 | Achievement rules in one repo file; the Sheet records unlocks | Adopted 2026-10-28 |
| P9 | First names or nicknames and cartoon avatars only; no surnames or other personal data | Adopted 2026-10-28 (first names allowed by Rob) |
| P10 | Every call to the script is a POST, so the family code never sits in a link | Adopted 2026-10-28 |
| P11 | `.nojekyll` file so Pages serves folders starting with `_` (like `games/_template`) | Adopted 2026-10-28 |
| P12 | A grown-ups' check page at `tools/sheet-check.html` | Adopted 2026-10-28 |
| P13 | Launcher flow | Adopted 2026-10-28 |
| P14 | Look and feel: A sticker book (B and C declined) | Adopted 2026-10-28 |
| P15 | Original cartoon-animal avatars plus colour | Adopted 2026-10-28 |
| P16 | Starter badge set, locked ones shown greyed with "?" | Adopted 2026-10-28 |
| P17 | Stars as the headline score, and as the points for skins | Adopted 2026-10-28 |
| P18 | Grown-ups' corner behind press-and-hold and a sum | Adopted 2026-10-28 |
| P19 | Sounds with mute; "will sync" cloud icon | Adopted 2026-10-28 |
| P20 | Phone layout: games above badges | Adopted 2026-10-28 |
| P21 | Bonus theme skins unlocked with stars: Fairy, Unicorn, Blocks; launcher only | Adopted 2026-10-28 (Rob's idea) |
| P22 | Each skin is one CSS file that swaps colours, background and frames | Adopted 2026-10-28 |
| P23 | Skins tab in the Sheet holds skin names and star targets (start: 10, 20, 30) | Adopted 2026-10-28 (Rob's request) |
| P24 | Chosen skin saved in a `skin` column on Profiles; kept on the device if the Sheet can't save it | Adopted 2026-10-29 |
| P25 | Bubble pop as the first working game | Adopted 2026-10-29 |
| P26 | Placeholder "Soon" tiles: Memory match, Count it, Shape sort, Spot it | Adopted 2026-10-29 |
| P27 | Grown-ups' sum is a times-table question (3–9 × 3–9) | Adopted 2026-10-29 |
| P28 | Debug skin button, switched by `debug` in `shared/config.js` | Adopted 2026-10-28 (Rob's request) |
| P29 | `setup()` makes a backup copy before it changes an existing Sheet | Adopted 2026-10-29 |
| P30 | Kriss Kross stars: no hints 3, one or two hints 2, more 1; showing the solution saves nothing | Adopted 2026-10-29 |
| P31 | Richer skins: scenery, pictures and tap effects for Fairy, Unicorn and Blocks | Adopted 2026-10-28 (Rob's request) |
| P32 | Build Word Worm, Monster Café and Rocket Lander: colourful, animated, with sounds | Adopted 2026-10-29 (Rob's request) |
| P33 | Settings tab: a row per setting, an `everyone` column and a column per child; the most specific value wins | Proposed |
| P34 | Lists tab for named word lists; a `word_list` cell can hold a list name or the words themselves | Proposed |
| P35 | Progress tab: one JSON row per child per game, saved on the device first; the newest copy wins | Proposed |
| P36 | Adding a player adds their Settings column; renaming a player renames it | Proposed |
| P37 | Each game describes its settings in `settings.js`; `tools/settings-seed.mjs` copies them into Code.gs; `setup` only adds missing rows, after a backup | Proposed |
| P38 | Kriss Kross opens with the child's word list from the Sheet | Adopted 2026-10-29 (Rob's request); details in P33–P34 |
| P39 | Starter word list: cat, hat, ship, fish, frog, dog, sun, duck, bed, pig, hen, bus (chosen because Kriss Kross can always cross them) | Proposed |
| P40 | Word Worm stars: 0–1 mistakes 3, 2–4 2, 5+ 1 | Proposed |
| P41 | Monster Café stars: right first time 85%+ 3, 60%+ 2, else 1; coins 3 first time, 1 after a retry | Proposed |
| P42 | Rocket Lander stars: right 85%+ 3, 60%+ 2, else 1; a round with 2+ stars unlocks the next planet | Proposed |
| P43 | Spoken prompts with the device's voice, on by default (`speak`); sound off also stops speech | Proposed |
| P44 | Rewards kept in Progress: Word Worm hats, Monster Café decorations, Rocket Lander planets and moon rocks | Proposed |
| P45 | Word Worm: an unsteered worm swerves round wrong letters; a short pause after a hiccup so one bump counts once | Proposed |
| P46 | Monster Café: times tables that don't fit under `max_number` are skipped (with the defaults the 10 times table never comes up); `bond_to` is capped at `max_number`; answers are never 0 | Proposed |
| P47 | Remove the four "Soon" placeholder tiles now there are five real games | Proposed |
