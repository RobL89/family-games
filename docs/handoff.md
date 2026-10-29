# Handoff: Kids' Games

Updated: 2026-10-29

## Goal

A series of simple, child-friendly browser games for Rob's two children (aged 6 and 4), played on a phone or PC. Each child has a profile with stars, badges, recent games and unlockable skins, stored in a Google Sheet. Games open from a launcher. The style is a fun, cartoonish sticker book. Build for the 6-year-old first; the 4-year-old plays from pictures and colours.

## Where things stand

- **Repo:** `RobL89/family-games`, public, branch `main`. Live on GitHub Pages: https://robl89.github.io/family-games/
- **Launcher (built):** Who's playing? → the child's home screen (star total, game tiles with best stars, badges, last five games, skins) → a game. After a game: confetti, stars won, new badges, newly unlocked skins.
- **Grown-ups' corner:** press and hold the gear, then answer the question "Address of first house" (only a hash of the answer is in the code). Holds players (Edit, **Game setup**), family code, sync, sound and the skin preview switch.
- **Games:** Kriss Kross is the only live game (made by Rob's wife; unchanged apart from a hook that saves stars, loads the player's word lists and adds a **Next list** button). Bubble pop is built but shown as a "Soon" tile, alongside Memory match, Count it, Shape sort and Spot it.
- **Game setup:** per player. For Kriss Kross, ordered word lists: the first is the default; Next loads the following one. Saved in the Sheet's GameLists tab.
- **Skins:** Sticker book (default), then Fairy at 10 stars, Blocks at 20, Unicorn at 30. The skin preview button is off unless switched on in the corner.
- **Sheet** (`family-games` in Rob's Drive; Claude can read it through the Google Drive connector), checked 2026-10-29: Profiles has four players (the two children and two grown-ups); Skins tab present; Scores and Achievements empty. Backup "family-games backup 2026-10-29 0846" was made by setup.
- **Apps Script:** 0.2.0 is live. 0.3.0 (GameLists tab, `saveLists`) is in the repo; until it's deployed, Game setup can't save lists.
- **Tests:** `tools/tests/` runs the launcher in a headless browser against a stand-in Sheet; set `GROWNUP_ANSWER` when running.

## Decisions in force

All proposals up to P39 are in `docs/PLAN.md`; P33, P37, P38 and P39 are still proposed. The key ones:

- P1 to P3: plain HTML, CSS and JavaScript with no build step, on GitHub Pages, with a Google Sheet behind an Apps Script web app.
- P6, P7, P10: results are saved on the device first and synced later. Every call is a POST carrying the family code, which lives only in Script Properties (`FAMILY_CODE`) and on each device, never in the repo.
- P9: first names or nicknames only. The children's first names are used in the Sheet but kept out of the public repo.
- P14: sticker-book look. P21 to P24, P31, P34: bonus skins unlocked by stars, with a skin preview switch in the corner.
- P17: 1 to 3 stars is the headline score in every game, and stars are the points that unlock skins.
- P30: Kriss Kross gives 3 stars with no hints, 2 with one or two hints, 1 with more. Showing the solution saves nothing.
- P32, P35, P36: the question gate, Kriss Kross as the only live game, and Game setup word lists.
- A game joins the launcher through `games.json` (status `ready` or `soon`; `settings` names its Game setup kind) and calls `record()` or `finish()` from `shared/game-kit.js`. Start new games from `games/_template/`.

## Waiting on Rob

1. Update the Apps Script to 0.3.0 (`docs/setup-sheet.md`), then ask Claude to compare the Sheet before and after.
2. Add word lists in Game setup and try Kriss Kross with Next.
3. Adopt or decline P33, P37, P38 and P39.
4. Optional: a name for the Blocks skin.

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
