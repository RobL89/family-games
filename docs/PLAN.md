# Kids' Games: Plan

Status: the proposals log at the bottom records what Rob has adopted or declined. Anything not marked adopted is still a proposal.

Repo: `RobL89/family-games` (public).

Last updated: 2026-10-28

## What we're building

- A **launcher**: pick who's playing, see your home screen (stars, badges, recent games, skins), pick a game.
- A **series of games**: one folder each, playable with touch (phone) or mouse (PC).
- **Storage** in a Google Sheet, so profiles, scores, badges and skins follow the kids across devices.
- Style: fun, child friendly, cartoonish, interactive, not overly complex. Sticker book look (P14), with unlockable skins (P21).

## Family (answered 2026-10-28)

- Two children, aged 6 and 4. Build for the 6-year-old first; the 4-year-old plays from pictures and colours.
- Devices: phone and PC browser. No tablet.
- Their first names are used as nicknames in the Sheet (Rob, 2026-10-28). Names stay out of this public repo.

## Folder layout (P4)

```
family-games/
├─ index.html              Launcher page (the code is in shared/launcher.js)
├─ games.json              List of games: id, title, icon, colour, folder, status ("ready" or "soon")
├─ shared/
│  ├─ config.js            Apps Script web app URL; debug switch for the skin button
│  ├─ api.js               Talks to the Sheet; keeps an outbox on the device
│  ├─ launcher.js          Who's playing, home screen, celebrations, grown-ups' corner
│  ├─ game-kit.js          What every game calls: getPlayer(), record(), finish(), homeButton()
│  ├─ achievements.js      Badge list and the rules for earning them
│  ├─ skins.js             Skin list (fallback star targets) and switching
│  ├─ skin-effects.js      Skin scenery, pictures (wings, horn) and tap effects
│  ├─ theme.css            Sticker book theme, built from tokens skins can override
│  ├─ skins/               fairy.css, blocks.css, unicorn.css
│  ├─ avatars.js           Original cartoon animals and colours
│  ├─ icons.js             Stars, badge pictures, game pictures, buttons
│  └─ sound.js             Little sounds made in the browser, with mute
├─ games/
│  ├─ _template/           Starter game to copy for each new game
│  ├─ bubble-pop/          First working game
│  └─ kriss-kross/         The family's word-grid game, with a small hook to save stars
├─ apps-script/
│  └─ Code.gs              The Sheet's backend, pasted into Apps Script
├─ tools/
│  └─ sheet-check.html     Grown-ups' connection check
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

## Sheet tabs (P5, P23, P24)

| Tab | Columns |
|---|---|
| Profiles | profile_id, nickname, avatar, colour, created_at, active, skin |
| Scores | event_id, profile_id, game_id, score, level, stars, seconds, played_at, received_at |
| Achievements | profile_id, achievement_id, earned_at |
| Skins | skin_id, name, stars_needed, active |

The family code is kept in the script's settings, not the Sheet. Change a skin's star target by editing `stars_needed` in the Skins tab; the launcher reads it fresh.

## Calls the Apps Script answers (script 0.2.0)

| Call | Does |
|---|---|
| `ping` | Checks the family code; returns the script version |
| `profiles` | Active players, plus the Skins tab |
| `profile` | One player: recent scores, per-game bests, play count, star total, days played, badges |
| `addProfile` | Adds a player (grown-ups' corner) |
| `updateProfile` | Changes a player's name, animal, colour or skin; a skin only if they have the stars |
| `sync` | Takes the device outbox: results and badges, duplicates skipped |

## Safety and privacy (P7, P9, P10)

- On a personal GitHub account, the game site is reachable by anyone with its link: private publishing needs GitHub Enterprise Cloud. On GitHub Free the repo itself must also be public.
- So the Apps Script link is visible in the site's code. To stop strangers writing to the Sheet, each call carries a **family code**, sent in the body of a POST (never in a link). A grown-up enters it once per device; it is stored in that device's browser and in the script's settings, never in the repo. It's a light lock, not a password.
- The Sheet holds first names or nicknames, a cartoon animal, a colour, scores, badges and the chosen skin. No surnames, birthdays, photos or schools.
- Writes are locked one at a time in the script, so two kids finishing at once don't clash.

## Limits checked 2026-10-28

- **GitHub Pages:** free on public repos; public or private repos with Pro and above. Published site up to 1 GB; soft bandwidth limit 100 GB a month. Source: docs.github.com, "GitHub Pages limits".
- **Apps Script (gmail.com account):** 6 minutes per run; 30 simultaneous runs per user; 50,000 settings reads/writes a day. Google says quotas can change without notice. Source: developers.google.com/apps-script/guides/services/quotas.
- **Google Sheets:** up to 20 million cells per spreadsheet (raised September 2026). Source: Google Workspace Updates blog.

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
| Kriss Kross (the family's word-grid game) | Ready: solving a puzzle saves stars (P30); "Show solution" saves nothing |
| Memory match, Count it, Shape sort, Spot it | Placeholder "Soon" tiles (P26); names are placeholders |

## Open questions (TBC)

- Blocks skin: final name (the 6-year-old could pick).
- Kriss Kross stars rule (P30): is "no hints = 3, one or two = 2, more = 1" right?

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
| P24 | Chosen skin saved in a `skin` column on Profiles; kept on the device if the Sheet can't save it | Proposed |
| P25 | Bubble pop as the first working game | Proposed |
| P26 | Placeholder "Soon" tiles: Memory match, Count it, Shape sort, Spot it | Proposed |
| P27 | Grown-ups' sum is a times-table question (3–9 × 3–9) | Proposed |
| P28 | Debug skin button, switched by `debug` in `shared/config.js` | Adopted 2026-10-28 (Rob's request) |
| P29 | `setup()` makes a backup copy before it changes an existing Sheet | Proposed |
| P30 | Kriss Kross stars: no hints 3, one or two hints 2, more 1; showing the solution saves nothing | Proposed |
| P31 | Richer skins: scenery, pictures and tap effects for Fairy, Unicorn and Blocks | Adopted 2026-10-28 (Rob's request) |
