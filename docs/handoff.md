# Handoff: Kids' Games

Updated: 2026-10-28

## Goal

A series of simple, child-friendly browser games for Rob's kids, played on tablet, phone or PC. Each child has a profile showing recent scores and an achievement system. Games open from a launcher dashboard. Profiles, scores and achievements are stored in a Google Sheet. Style for the launcher and profiles: fun, child friendly, cartoonish, interactive, not overly complex.

## Where things stand

- **Repo:** `RobL89/family-games`, public, branch `main`. GitHub Pages is on: https://robl89.github.io/family-games/
- **Sheet:** a Google Sheet with the Apps Script backend (`apps-script/Code.gs`) pasted in and deployed as a web app. Its `/exec` URL is in `shared/config.js`. `setup()` has created the Profiles, Scores and Achievements tabs. The family code is set in Script Properties as `FAMILY_CODE`; it is never written in the repo or chat notes.
- **Tested live 2026-10-28** from `tools/sheet-check.html`: connection, add player and send score all work.
- **Test data in the Sheet:** one test player and one test score (`game_id` = `sheet_check`). Not yet deleted.
- **Not built yet:** the launcher (`index.html` is a placeholder), the shared theme, the game kit, achievements, and any games.
- **Launcher and profile ideas** were proposed (P13–P19 in `docs/PLAN.md`) but nothing has been decided.

## Decisions in force

- **P1** Plain HTML, CSS and JavaScript, no build step.
- **P2** Hosted on GitHub Pages; repo named `family-games`, public.
- **P3** Google Sheet reached through an Apps Script web app.
- **P4** Folder layout as in `docs/PLAN.md`.
- **P5** Three Sheet tabs: Profiles, Scores, Achievements (columns in `docs/PLAN.md`).
- **P6** Results saved on the device first (outbox), then synced; each has a unique `event_id` so retries never double-count.
- **P7** Every call carries a family code that the script checks.
- **P8** Achievement rules live in one repo file; the Sheet only records unlocks.
- **P9** Nicknames and cartoon avatars only; no real names, birthdays or photos.

## Waiting on me

- Adopt or decline P10–P12: POST-only calls, the `.nojekyll` file, and keeping the check page. All three are already in the repo.
- Pick a look-and-feel direction (P14): A sticker book, B bright playground, or C adventure map.
- Adopt or decline P13 and P15–P19: launcher flow, avatars, starter badges, stars as the headline score, grown-ups' corner, sounds and the offline icon.
- Say how many kids there are, roughly their ages, and which devices they use.
- Optional: paste the latest `apps-script/Code.gs` (it now ignores spaces around the family code) and redeploy a new version.
- Suggested: choose a longer family code, since the site is public.
- Decide whether to delete the test rows, or have Claude do it (after a backup).

## Next step

Rob answers the questions above. Then mock up the "Who's playing?" screen and a child's home screen in the chosen direction, for review before building anything.

## Files to read

- This file.
- `docs/PLAN.md` in the repo: structure, data flow, Sheet tabs, launcher ideas and the proposals log.
- `apps-script/Code.gs` and `shared/api.js`: the Sheet calls (`ping`, `profiles`, `profile`, `addProfile`, `sync`) and the device outbox that the launcher and games will use.
- `docs/setup-sheet.md`: how the Sheet was set up, including how to redeploy and back up.

## Dead ends

- Claude's workspace can't reach the Apps Script `/exec` URL (WebFetch returned an error). Test from `tools/sheet-check.html` in Rob's browser instead.
- The `gh` CLI in Claude's workspace isn't signed in, so Claude can't create repos or change Pages settings. Rob does those on github.com; Claude can still clone and push once the repo is added to the chat.
- The first version of the check page sent the code saved on the device rather than the one typed, which gave `wrong_code`. Fixed in commit `6af9ee6`.

## Next chat's opening line

```
Read handoff.md, then add RobL89/family-games to the chat, clone it, read docs/PLAN.md, and let's settle the launcher look and feel.
```
