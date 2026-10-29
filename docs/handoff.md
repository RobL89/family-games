# Handoff: Kids' Games

Updated: 2026-10-29

## Goal

A series of simple, child-friendly browser games for Rob's two children (aged 6 and 4), played on a phone or PC. Each child has a profile with stars, badges, recent games and unlockable skins, stored in a Google Sheet. Games open from a launcher. The style is a fun, cartoonish sticker book. Build for the 6-year-old first; the 4-year-old plays from pictures and colours.

## Where things stand

- **Repo:** `RobL89/family-games`, public, branch `main`, everything pushed. Live on GitHub Pages: https://robl89.github.io/family-games/
- **Launcher (built):** Who's playing? → the child's home screen (star total, game tiles with best stars, badges, last five games, skins) → a game. After a game: confetti, stars won, new badges, newly unlocked skins. Grown-ups' corner: press and hold the gear, then answer a times-table sum.
- **Games:** Bubble pop (ready), Kriss Kross (ready; made by Rob's wife, unchanged apart from a hook that saves stars), and four "Soon" placeholder tiles: Memory match, Count it, Shape sort, Spot it.
- **Skins:** Sticker book (default), then Fairy at 10 stars, Blocks at 20, Unicorn at 30. Each skin has its own scenery and tap effects. Skins change the launcher only, never the games. A "Debug skin" button (bottom right) switches skins for testing; it is still on.
- **Sheet:** the `family-games` spreadsheet in Rob's Google Drive (Claude can read it through the Google Drive connector). Last checked 2026-10-28: header rows only, no players, no scores. The earlier test rows are gone.
- **Apps Script:** the live web app is still version 0.1.0 as far as Claude knows. Version 0.2.0 (Skins tab, `skin` column, star totals, editing players) is in the repo but not yet pasted in and deployed. The launcher works with 0.1.0, but skin choices then stay on each device and players can't be edited.
- **Not checked live:** Claude couldn't open the live site from its workspace. Everything was tested in a headless browser against a stand-in Sheet (`tools/tests/`).

## Decisions in force

All proposals P1 to P31 in `docs/PLAN.md` are adopted; nothing is pending. The key ones:

- P1 to P3: plain HTML, CSS and JavaScript with no build step, on GitHub Pages, with a Google Sheet behind an Apps Script web app.
- P6, P7, P10: results are saved on the device first and synced later. Every call is a POST carrying the family code, which lives only in Script Properties (`FAMILY_CODE`) and on each device, never in the repo.
- P9: first names or nicknames only. The children's first names are used in the Sheet but kept out of the public repo.
- P14: sticker-book look. P21 to P24 and P31: bonus skins unlocked by stars, with targets editable in the Sheet's Skins tab.
- P17: 1 to 3 stars is the headline score in every game, and stars are the points that unlock skins.
- P30: Kriss Kross gives 3 stars with no hints, 2 with one or two hints, 1 with more. Showing the solution saves nothing.
- A game joins the launcher through `games.json` (status `ready` or `soon`) and calls `record()` or `finish()` from `shared/game-kit.js`. Start new games from `games/_template/`.

## Waiting on Rob

1. Check the live site on a phone and a PC. The first visit on each device asks for the family code.
2. Update the Apps Script to 0.2.0 using `docs/setup-sheet.md`: paste in `Code.gs`, run `setup` (it backs up first), then redeploy. Afterwards, ask Claude to compare the Sheet before and after.
3. Add both children as players through the gear in the launcher.
4. Say when to switch off the debug skin button (`debug: false` in `shared/config.js`).
5. Optional: a name for the Blocks skin (the 6-year-old could pick one).

## Exact next step

Brainstorm new game ideas suited to a 6-year-old (and playable by a 4-year-old), then pick which ones replace the four "Soon" tiles. Each game gets a clear rule for earning 1, 2 or 3 stars. Mark every idea as proposed until Rob agrees.

## Files to read

- This file, then `docs/PLAN.md`: decisions, the proposals log, Sheet tabs, how skins and games fit in.
- `games.json` and `games/_template/`: how a game is listed and built.
- `shared/game-kit.js`: what a game calls to save stars.
- `games/bubble-pop/`: a complete small game to copy from.
- `docs/setup-sheet.md`: Sheet setup and the 0.2.0 update.

## Dead ends

- Claude's workspace can't reach the Apps Script `/exec` URL or the live GitHub Pages site (not on the web allowlist). Rob tests live; Claude tests locally with `tools/tests/`.
- The `gh` CLI isn't signed in, so Claude can't change repo or Pages settings. It can clone and push once the repo is added to the chat.
- A "Minecraft" skin was declined because Minecraft's look belongs to Mojang. The Blocks skin is an original pixel world instead.
- A stop hook nags about unpushed commits. Push only when Rob says so, because pushing changes the public site.

## Next chat's opening line

```
Read handoff.md, then add RobL89/family-games to the chat, clone it, read docs/PLAN.md, and let's brainstorm new game ideas for the 6-year-old.
```
