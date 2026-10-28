# Kids' Games: Plan

Status: the proposals log at the bottom records what Rob has adopted or declined. Anything not marked adopted is still a proposal.

Repo: `RobL89/family-games` (public).

Last updated: 2026-10-28

## What we're building

- A **launcher**: pick your profile, see your profile (recent scores, achievements), pick a game.
- A **series of games**: one folder each, playable with touch (tablet/phone) or mouse (PC).
- **Storage** in a Google Sheet, so profiles, scores and achievements follow the kids across devices.
- Style: fun, child friendly, cartoonish, interactive, not overly complex.

## Folder layout (P4)

```
family-games/
├─ index.html              Launcher: profile picker → profile screen → game grid
├─ games.json              List of games: id, title, icon, folder
├─ shared/
│  ├─ config.js            Apps Script web app URL (TBC until deployed)
│  ├─ api.js               Talks to the Sheet; keeps an outbox on the device
│  ├─ game-kit.js          What every game calls: getPlayer(), finish(result)
│  ├─ achievements.js      Achievement list and the rules for earning them
│  ├─ theme.css            Shared cartoon look, big touch targets
│  └─ assets/              Avatars, icons, sounds
├─ games/
│  ├─ _template/           Starter game to copy for each new game
│  └─ <game-id>/           index.html, game.js, game.css
├─ apps-script/
│  └─ Code.gs              The Sheet's backend, pasted into Apps Script
└─ docs/
   ├─ PLAN.md              This file
   └─ setup-sheet.md       Step-by-step: create the Sheet, deploy the script
```

## Information flow (proposed, P6)

1. **Launcher opens.** Shows profiles from the device's cache straight away, then refreshes them from the Sheet.
2. **Child taps their avatar.** Profile screen loads: recent scores, badges earned and still to earn, and the game grid.
3. **Child taps a game.** It opens at `games/<id>/?player=<profile_id>`.
4. **Game ends.** The game calls `finish({ score, level, stars, seconds })`. The result is saved on the device first (the outbox), then sent to the Sheet in the background. If the device is offline, it is sent next time the launcher opens. Each result carries a unique ID so a retry never counts twice.
5. **Achievements are checked** after each result, using the rules in `shared/achievements.js` and the player's stats from the Sheet. New ones are recorded in the Sheet (duplicates ignored) and celebrated on screen.
6. **Profile screen** gets everything for one child in a single call.

## Sheet tabs (proposed, P5)

| Tab | Columns |
|---|---|
| Profiles | profile_id, nickname, avatar, colour, created_at, active |
| Scores | event_id, profile_id, game_id, score, level, stars, seconds, played_at |
| Achievements | profile_id, achievement_id, earned_at |

No other personal data. The family code (below) is kept in the script's settings, not the Sheet.

## Calls the Apps Script answers (proposed)

| Call | Does |
|---|---|
| `profiles` | List active profiles |
| `profile` | One profile: recent scores, per-game bests, play count, achievements |
| `result` | Add a score (ignored if its event_id is already there) |
| `achievement` | Record an achievement (ignored if already earned) |
| `addProfile` | Add a child, from a grown-ups' corner in the launcher |

## Safety and privacy (proposed, P7 and P9)

- On a personal GitHub account, the game site is reachable by anyone with its link: private publishing needs GitHub Enterprise Cloud. On GitHub Free the repo itself must also be public.
- So the Apps Script link will be visible in the site's code. To stop strangers writing to the Sheet, each call must carry a **family code**. A grown-up enters it once per device; it is stored in that device's browser and in the script's settings, never in the repo. It's a light lock, not a password.
- The Sheet holds nicknames, a chosen cartoon avatar, scores and badges. No real full names, birthdays, photos or schools.
- Writes are locked one at a time in the script, so two kids finishing at once don't clash.

## Limits checked 2026-10-28

- **GitHub Pages:** free on public repos; public or private repos with Pro and above. Published site up to 1 GB; soft bandwidth limit 100 GB a month. Source: docs.github.com, "GitHub Pages limits".
- **Apps Script (gmail.com account):** 6 minutes per run; 30 simultaneous runs per user; 50,000 settings reads/writes a day. Google says quotas can change without notice. Source: developers.google.com/apps-script/guides/services/quotas.
- **Google Sheets:** up to 20 million cells per spreadsheet (raised September 2026). Source: Google Workspace Updates blog.

Family use is far inside all of these.

## Open questions (TBC)

- How many children, and roughly what ages (sets reading level and difficulty).
- Which devices (tablet models, phone, PC browser).
- Exact name of the Apps Script "who has access" setting: confirm on screen at deploy time.

## Proposals log

| # | Proposal | Status |
|---|---|---|
| P1 | Plain HTML, CSS and JavaScript, no build step | Adopted 2026-10-28 |
| P2 | Host on GitHub Pages | Adopted 2026-10-28 |
| P3 | Google Sheet reached through an Apps Script web app | Adopted 2026-10-28 |
| P4 | Folder layout above | Adopted 2026-10-28 |
| P5 | Three Sheet tabs: Profiles, Scores, Achievements | Adopted 2026-10-28 |
| P6 | Save on the device first, sync in the background | Adopted 2026-10-28 |
| P7 | Family code checked by the script | Adopted 2026-10-28 |
| P8 | Achievement rules in one repo file; the Sheet records unlocks | Adopted 2026-10-28 |
| P9 | Nicknames and cartoon avatars only, no real personal data | Adopted 2026-10-28 |
| P10 | Every call to the script is a POST, so the family code never sits in a link | Proposed |
| P11 | `.nojekyll` file so Pages serves folders starting with `_` (like `games/_template`) | Proposed |
| P12 | A grown-ups' check page at `tools/sheet-check.html` to test the connection | Proposed |
