# Review: launcher, workflow and project context

Started 2026-10-29. Review and discussion only: no app code was changed.

Scope: the launcher and everything behind it, plus how a game plugs in (`games.json`, `shared/game-kit.js`, `games/_template/`) and how Kriss Kross was integrated. The games themselves are not reviewed.

Sources: the repo at commit `1beba7f`; `docs/handoff.md`, `docs/PLAN.md`; the three browser tests in `tools/tests/` (all ran, no page errors); two screenshots (phone home screen, PC grown-ups' corner); the family-games Sheet, read only through the Google Drive connector.

Stages: 1 Review · 2 Questions · 3 Recommendations. Each stage is added below when done.

---

## Stage 1: Review

### 1. Aims, and whether the build matches them

The aim: simple educational games for ages 4 to 6, with settings that scale difficulty inside a game, progress saved, room for older children later.

- **The launcher is well ahead of the games.** Profiles, stars, badges, four skins with scenery and effects, celebrations, offline sync and a grown-ups' corner are all built. One game is live (Kriss Kross); Bubble pop is built but parked as "Soon"; four tiles are placeholders.
- **The 4-year-old has nothing to play.** Kriss Kross is word-based. The plan says the younger child plays "from pictures and colours", but no live game does that yet.
- **Difficulty scaling exists only as word lists** that a grown-up types in. There is no general "level" or "difficulty" setting a game can read, so the core aim (settings that scale difficulty within a game) isn't supported by the launcher yet.
- On the phone, five of the six tiles are "Soon". For a small child, most of the screen is things they can't play.

### 2. Workflow: build, test, hand over, integrate, chat handover

- **Integrating your wife's games is hand surgery.** Kriss Kross needed three small edits inside her code (a round timer, a "solved" event, a "revealed" event) plus an 85-line block at the bottom that reaches into her page by element IDs (`play`, `setup`, `wordInput`, `buildBtn`…) and polls until the grid is built. When she sends a new version, all of that has to be redone, and any renamed ID breaks it silently.
- **Tests need the grown-ups' answer every time**, because they open the corner the real way. That makes every test run a manual step.
- **Tests don't pass or fail.** They print values and save screenshots for someone to read. Nothing stops a broken change except a person spotting it.
- **Two handoffs.** The project's `handoff.md` is stale (it still says "no repo"), so every chat has to be told to ignore it and read `docs/handoff.md` instead. The project instructions also say to read the handoff *before* adding the repo, but the real handoff is inside the repo.
- **Unpushed work is at risk.** Commits stay in the cloud workspace until pushed, and pushing to `main` changes the public site. So "nothing lives only in the chat" isn't really true between pushes; if a session ends, local commits go with it.
- **Wrap-up asks you to paste a new handoff into the project by hand**, which is how the two copies drifted apart.

### 3. The launcher screens

- **Who's playing?** Big, friendly, one tap. The two grown-up profiles sit alongside the children's; fine for testing, but they count as players for the kids too.
- **Home screen** (phone screenshot): clear and in the sticker-book style. Games are first, then stickers, last played, skins. Good: star total up top, the "7 more stars for Fairy!" line, locked items that say why when tapped. Issues: mostly "Soon" tiles; with the skin preview switched on, its "Debug skin" pill sits over the bottom row of stickers; the section is called "My stickers" in one skin and "My badges" in the others.
- **Grown-ups' corner** (PC screenshot): plain, readable and easy to use. Players, family code, sync, sound, testing. Missing: anything about progress. A grown-up can't see how a child is doing without opening the Sheet, where scores are listed by `profile_id`, not name.
- **Game setup**: solid. Lists can be added, edited, reordered, made default and deleted, with checks as you type and a clear "nothing changed" if a save fails. It only knows one kind of setting (Kriss Kross word lists).
- Wording: a code comment in `launcher.js` and the setup guide still say "answer the sum"; the corner says "Skin preview button" while the button itself says "Debug skin".

### 4. Front-end and back-end features behind the launcher

Built and working (confirmed by the tests): add and edit players (name, six animals, six colours); per-child skins unlocked by stars and checked by the script; eight badges; celebrations after a game; outbox with retry; family code; connection check; sound mute; skin preview; Game setup for word lists.

Gaps:
- No way to hide or retire a player from the corner (only by editing `active` in the Sheet).
- No per-player, per-game setting other than word lists, and nothing a game can call to read one (`game-kit.js` offers `getPlayer`, `record`, `finish`, `homeButton` only).
- No grown-ups' progress view (see area 3), even though the script's `profile` call already returns per-game plays, best scores, stars, days played and recent games.
- Word-checking rules are written three times (Game setup, Kriss Kross, Apps Script) and already disagree on the longest word (15 vs 20 letters). Harmless today because Game setup checks first.

### 5. How data is stored and moved

- **Device:** everything under `fg.*` keys in the browser's local storage: family code, cached players, cached profile per player, skins, the outbox, sound and preview switches. Storage errors are caught, so a blocked or full store doesn't crash the page.
- **Outbox → Sheet:** a game calls `record()`, which puts the result (with a unique ID) and any new badges in the outbox. The launcher sends the outbox when it opens, when the device comes online, or from "Send now". The script skips duplicate IDs, so a retry never counts twice. This is well designed.
- **Apps Script:** one POST endpoint, family code checked first, writes locked one at a time, text cleaned against Sheet formulas. Reads load whole tabs each call; at family scale that's fine for years.
- **The Sheet today** (read 2026-10-29, evening): Profiles 4 rows (two children, two grown-ups); Scores 2 rows and Achievements 6 rows, all from the two grown-up profiles; Skins 4 rows; **GameLists exists with one saved list**; an empty `Sheet1` tab is left over. Backups: two, at 08:46 and 09:25.
- **The handoff is behind the Sheet.** It says Apps Script 0.3.0 isn't deployed yet and Scores and Achievements are empty. The GameLists tab, and a list saved with a script-made ID, suggest 0.3.0 *is* live. TBC: confirm with Check connection.
- Small edges: if the Sheet accepts the outbox but the profile refresh then fails, the star total can dip until the next refresh; a badge for a player who no longer exists would sit in the outbox forever. Neither matters in practice now.

### 6. Project context: instructions, handoff, PLAN and other docs

- **Project instructions:** short and sensible. Two problems: they point at the stale project `handoff.md`, and the start-of-chat order (handoff, then repo) is backwards now the handoff is in the repo.
- **`docs/handoff.md`** (64 lines): well structured, but repeats "decisions in force" from PLAN, and is out of date on 0.3.0, the Sheet contents and backups.
- **`docs/PLAN.md`** (190 lines, about 15 KB): the biggest thing every chat loads. It mixes four jobs: how the system works, design notes (skin descriptions in prose), reference facts (limits checked on 2026-10-28) and a 39-row proposals log, much of it superseded. Folder layout repeats the README. Stale: P18 still says "a sum".
- **Open proposals:** P33, P37, P38 and P39 are marked "Proposed" but are already built. That conflicts with "close every proposal".
- **`docs/setup-sheet.md`:** clear, but grows a new "Updating to 0.x" section per version, step 4 lists only four tabs, and step 7 says "answer the sum".
- **`docs/mockups/look-and-feel.html`** (482 lines): a record of a decision already made (P14). Not loaded each chat, so low cost, but no longer needed in the tree.

### 7. Repo and code

- **Structure:** small and clear: 36 files, about 6,300 lines, no build step. Folder names match their jobs. Comments explain the why and point to proposal numbers, which suits your shared-comments approach.
- **Quality:** good overall. Defensive storage, idempotent sync, a lock on writes, formula-safe text, careful escaping of names in the page, the "reduce motion" setting respected by the skin tap effects.
- **Shouldn't be committed:** `tools/tests/__pycache__/*.pyc` (Python's compiled files). There's no `.gitignore`.
- **No children's names** anywhere in the repo (checked). Tests use stand-in names.
- **Duplication:** the stand-in Sheet is written three times in the tests (two say version 0.2.0, one 0.3.0); skins are listed in `skins.js`, `Code.gs` and the tests; small helpers (`esc`, `plural`) are copied between `launcher.js` and `game-setup.js`; word rules in three places (area 4).
- **Naming drift:** "debug" in code and the button label, "skin preview" in the corner and docs; "stickers" vs "badges".
- **`tools/sheet-check.html`** overlaps with the corner's Check connection, and its test buttons add rows to the real Sheet.
- **The grown-ups' question:** the hash in the public repo is slow to guess (PBKDF2, 150,000 rounds), which is plenty for keeping children out. Worth knowing: an address-style answer is guessable offline by someone determined, so it shouldn't double as a security answer anywhere that matters.

### 8. Long-term progress: profile, stars, stickers, skins

Your worry is justified. What the Sheet already shows: each grown-up earned **3 of the 8 stickers from their first single game**.

- **Stickers (8):** "First game", "Three stars" and "Try every game" all come in the first round while only one game is live. "Try every game" is then spent for good: when new games go live, it won't ask the child to try them. "Beat your best" and "10 games" come in the first longer session. That leaves "3 days in a row", "50 games" and "100 games".
- **Skins:** all three bonus skins need 30 stars in total. With up to 3 stars a puzzle, that's about 10 good rounds: one or two sessions with the Next list button.
- **Game tiles** show best stars (out of 3) per game, which tops out after one good round.
- **The star total keeps growing, but nothing happens after 30.** "You have every skin!" is the end of the road.
- **"Beat your best"** compares raw `score`, which means different things per game (in Kriss Kross it's the number of words in the puzzle), so it rewards a bigger list rather than better play.
- **The profile has no sense of "getting better".** Levels exist as a column in Scores (Kriss Kross stores the list number there) but nothing shows or rewards them.

In short: the reward system is front-loaded and has a fixed end. Anything added should keep going (milestones that repeat or scale) and should be tied to the games getting harder, not just to playing more.

---

## Stage 2: Questions and answers (2026-10-29)

| # | Question | Rob's answer |
|---|---|---|
| Q1 | Is Apps Script 0.3.0 live? | Yes, it's live. (The handoff is behind on this.) |
| Q2 | How do your wife's games reach a chat? | As an artifact link, shared editable. |
| Q3 | How should her games plug in? | Keep her files untouched (not the recommended snippet). |
| Q4 | How should chat work be saved to GitHub? | Push to a work branch after each stage; publish to the live site only on Rob's say. |
| Q5 | What should keep the kids working towards something? | All four: levels in each game, an endless sticker album, more skins at higher targets, grown-up goals. |
| Q6 | Who decides difficulty? | A grown-up sets a starting level per child per game; it moves up by itself after good rounds, and can be pulled back. |
| Q7 | Where should progress be shown? | Both: simple for the child, detail in the grown-ups' corner. |
| Q8 | Home-screen tidy-ups (hide Soon tiles, hide grown-up profiles, Bubble pop live)? | None of these. Keep the screens as they are. |

---

## Stage 3: Recommendations (2026-10-29)

Every item is **Proposed** until Rob adopts or declines it. Adopted ones get the next P-number in `docs/decisions.md` (or PLAN's log if R16 is declined).

Sizes: **small** = part of one chat; **medium** = about one chat; **large** = several chats.

### Suggested order (highest value first)

1. R1 One handoff, in the repo · 2. R2 Work branch · 3. R9 Levels per game · 4. R5 Tests that pass or fail · 5. R12 Progress page in the corner · 6. R6 Wrapper for your wife's games · 7. R13 Endless sticker album · 8. R16 Slim PLAN.md · then the rest.

### 1. Workflow (including your wife's games)

- **R1. One handoff, in the repo** (small) · Proposed. Replace the project's `handoff.md` with one line pointing to `docs/handoff.md`. Change "Start of every chat" to: add the repo, clone it, read `docs/handoff.md`. Change "wrap up" to: commit `docs/handoff.md` and push it to the work branch (R2); no pasting into the project. *Why:* ends the drift that made every chat start with a correction. Draft text is under R18.
- **R2. Push to a `work` branch after each stage** (small) · Proposed (Rob chose this in Q4). The live site keeps building from `main`; "publish" means Claude merges `work` into `main` when Rob says so. *Why:* nothing is lost if a session ends, and the site still only changes on your say. Note: the repo is public, so the branch is visible too; the "no children's names" rule applies to it.
- **R5. Tests that pass or fail, without your answer** (medium) · Proposed. One shared stand-in Sheet (matching script 0.3.0) instead of three copies; the tests swap in a test-only question hash, so `GROWNUP_ANSWER` is no longer needed; every check passes or fails, ending with one line such as "PASS 24 of 24"; one command runs them all; screenshots only when asked. *Why:* no manual step, and a chat can confirm nothing broke by reading one line instead of screenshots and printouts, which also saves usage.
- **R6. Wrapper for your wife's games, her file untouched** (medium, once; small per game after) · Proposed (follows Q3). Each of her games gets a folder with her artifact saved **exactly as shared** (`original.html`), a small page that shows it full-screen, and one `adapter.js` that watches her game for "round finished" and saves stars. Integration becomes: paste her artifact link (with edit access Claude can fetch the full page) → saved unchanged → adapter written or checked → tests. An update is "replace `original.html`, run the tests". *Why:* her updates drop straight in, and all launcher code lives in one file of ours. *Trade-off:* the adapter has to read what her page shows (for Kriss Kross: when it's solved and how many hints were used), so a big redesign on her side means updating the adapter, though never her file. Whether Kriss Kross can be moved to this without any edits is TBC until tried.
- **R7. Repo tidy** (small) · Proposed. Add a `.gitignore` for Python's `__pycache__` and remove the two committed `.pyc` files; retire `tools/sheet-check.html` (the corner's Check connection does the same job, and its test buttons write to the real Sheet); delete `docs/mockups/` (the decision is made and git keeps the history).

### 2. Front-end and back-end features

- **R8. Small fixes** (small) · Proposed. One name per thing: "Skin preview" everywhere (not "Debug skin"); "badges" for the eight awards and "stickers" for the album (R13), or the other way round, but the same in every skin; move the preview pill so it doesn't cover stickers on phones; fix the "sum" wording in the setup guide and a code comment.
- **R10. A per-child, per-game settings store** (medium; part of R9) · Proposed. Script 0.4.0 with one new tab (for example `Levels`: profile_id, game_id, start_level, updated_at), and `getLevel()` in `game-kit.js` so any game can read it. Word lists stay as they are. *Why:* the general "how hard is this game for this child" setting the aims call for; one control in Game setup works for every game. Follows the Sheet rule: backup, say what changes, compare before and after.
- **R11. Hide or retire a player from the corner** (small) · Proposed, low priority. Sets `active` to FALSE instead of editing the Sheet by hand. Fine to skip while you're keeping all four profiles.

### 3. Project context and instructions

- **R16. Slim `PLAN.md`** (small) · Proposed. Split it: `docs/PLAN.md` keeps only how it works (data flow, Sheet tabs, script calls, how a game plugs in), aiming for under 90 lines; the proposals log moves to `docs/decisions.md`, read only when a decision is in question; skin descriptions move into comments in the skin CSS files; the limits section goes (the rule already says check limits when they're used); the folder layout stays in the README only. *Why:* PLAN is the biggest file every chat loads, and most of it isn't needed for most chats.
- **R17. Tidy the other docs** (small) · Proposed. Close P33 and P37 to P39, which are built but still "Proposed"; update the handoff to match the Sheet (script 0.3.0 live, two backups); turn the per-version sections of `setup-sheet.md` into one "update the script" recipe plus a one-line version history; keep `docs/handoff.md` to state, waiting-on, next step and opening line, with decisions linked rather than repeated.
- **R18. Project instruction changes** (small) · Proposed. Draft:
  - *Start of every chat:* 1. Add `RobL89/family-games` to the chat and clone it. 2. Read `docs/handoff.md`; it says which other files to read.
  - *Rules (add):* Push to the `work` branch after each stage; merge to `main` only when I say publish. Keep the children's names out of the repo. My wife's game files are never edited; they plug in through an adapter.
  - *Wrap up:* 1. Commit anything uncommitted. 2. Rewrite `docs/handoff.md` for a stranger (same headings as now), commit and push to `work`.

### 4. Making games easier to build and integrate

- **R14. A fuller template and one "adding a game" page** (small) · Proposed. The template shows a real round loop: read the level, play, `record()` with stars and level, "Play again", sound, back home, and the comment style you both use. Add `games/_template/README.md` (one page) with the two paths: our own game, and your wife's game via R6. *Why:* each new game starts from a working pattern instead of the bare 1/2/3-star buttons.
- **R15. One source for shared rules** (small) · Proposed. Word rules in one file used by Game setup and the Kriss Kross adapter (and the same limits in the script); skins listed once for the app. *Why:* avoids the 15 vs 20 letter mismatch happening again.
- Room for older children: covered by R9 and R10 (a game can have more levels, and each child starts where they belong). Showing different games to different children can wait until there's a harder game to hide.

### 5. Recording and reporting progress (Q5 to Q7: all four ideas, both views)

Kept simple by building on what's already saved: the only new data is each child's starting level (R10). Current levels, the album and skins are all worked out from the Scores tab, so the outbox and sync don't change.

- **R9. Levels in each game** (medium to large; with R10) · Proposed. A game declares how many levels it has in `games.json`. A grown-up sets each child's starting level in Game setup; after three 3-star rounds in a row at a level, the child moves up, with a "Level up!" celebration; a grown-up can set it back at any time. The tile shows the level. *Why:* this is both the difficulty scaling the aims ask for and a goal that keeps going. For Kriss Kross, its word lists could act as its levels (TBC with you).
- **R12. Progress page in the grown-ups' corner** (medium) · Proposed. Per child: star total, days played this week, and per game: plays, best stars, current level, last played, plus the last ten rounds. No script change: the `profile` call already returns all of this except levels.
- **R13. Endless sticker album** (medium, mostly drawing) · Proposed. A new sticker every 10 stars, from a set of original drawings in pages of 12; when the set runs out it starts again with gold edges, so it never ends. Earned stickers come from the star total, so nothing new is stored. The home screen shows "3 more stars for your next sticker!" next to the skins line.
- **R3. Fix two of the eight badges** (small) · Proposed. "Try every game" only counts once at least three games are live (right now only the grown-up profiles have it, so no child loses anything); "Beat your best" compares stars or level instead of raw score, which in Kriss Kross is just the number of words.
- **R19. More skins at higher targets** (medium per skin) · Proposed. Each new skin is a design job (one CSS file plus scenery and effects), so add them one at a time after R9 and R13, at targets such as 60 and 100 stars, set in the Skins tab. Naming Blocks is still open.
- **R20. Grown-up goals** (medium) · Proposed, last. A small weekly goal per child (for example "5 rounds") set in the corner, earning a special sticker. Needs a little storage and a weekly reset, so it's worth doing only if levels and the album aren't enough.

---

**Status:** all three stages done (2026-10-29). Next: Rob adopts or declines R1 to R20; nothing in the app has changed.

---

## Addendum: UI comments (2026-10-29, asked for after Stage 3)

Based on the code and two screenshots (phone home, PC grown-ups' corner). Who's playing, Game setup, the celebration and the skins weren't viewed as screenshots this time. All **Proposed**. Kept within Q8: the Soon tiles and the grown-up profiles stay as they are.

### Child screens

- **R21. Read things aloud** (small) · Proposed. Speech bubbles ("Not yet: 3 days in a row", "Needs 10 stars", "Coming soon!") are text only, so the 4-year-old can't read them. The browser's built-in speech could say them aloud, behind the existing sound switch. Which voices the family's phone and PC offer is TBC.
- **R22. Put the next goal at the top** (small) · Proposed. "7 more stars for Fairy!" sits at the very bottom of the phone screen, below the stickers and last played. A small progress bar beside the star total would show the goal without scrolling.
- **R23. Empty stars on unplayed games** (small) · Proposed. A game not yet played shows three empty stars, which reads like "scored nothing". Show no stars until the first round.
- **R24. Simplify "Last played"** (small) · Proposed. It shows game icons with stars, which repeats the tiles for a child. Either drop it from the child's screen (the corner progress page, R12, covers history), or keep it and swap it for the album progress (R13).
- **R25. Locked badges** (small) · Proposed. The eight grey dashed circles with "?" look alike. A faint outline of each picture is already there; making it a little stronger, plus R21, would let a child see what they're aiming for.

### Grown-ups' corner

- **R26. Reorder the corner by how often it's used** (small) · Proposed. Today it's one long list: players, family code, sync, sound, testing, more. Suggested order: players (Edit, Game setup) and progress (R12) first; sound next; then a folded "This device" section with family code, check connection and send now; then Testing. The family code is set once per device, so it doesn't need to be the second thing on the page.
- **R27. Remove the empty gap under the heading** (small) · Proposed. The status line is always there, even when empty, which leaves a blank band under "Grown-ups' corner". Show it only when there's a message.
- **R28. Copy word lists to another child** (small) · Proposed. Siblings will often share spelling lists. A "Copy to…" button on a list saves typing it twice.
- **R29. Shorter list rows in Game setup** (small) · Proposed. Each list shows every word plus five buttons (Edit, Up, Down, Make default, Delete). Show the first few words with "+12 more", and fold Up, Down and Make default into a single "Move" button. This matters most on a phone, where the buttons wrap.

Suggested order within this addendum: R22, R21, R26, R28, then the rest.

---
---

# Pass 2: a deeper review (2026-10-29, late evening)

Rob asked for more detail, more ideas he hadn't thought of, and a fresh look at arrangement, wrappers and structure. The focus is the **framework for adding games later** (no new games now) and a **clean foundation at the start**, within the aims and priorities at the top of this chat. Pass 2 stands on its own; where it differs from pass 1, pass 2 wins. Pass 1's R-numbers are mapped to pass 2 at the end of Stage 3.

What I looked at beyond pass 1: the rest of `shared/` (theme, three skins, skin effects, icons, avatars, sound); all three tests in full; the Sheet check page; how Bubble pop wires in; the parts of Kriss Kross an outside wrapper would need (element IDs, its own storage, claude.ai-only features), without reviewing it as a game; 17 more screens from the test runs (phone and PC, all four skins, the celebration, the corner and Game setup on a phone, Kriss Kross with a list); and the project set-up against Rob's **project-template 0.1.0**. That check is provisional: its kick-off answers are pre-filled and need Rob's confirmation (Q19), so no set-up record was saved.

Rob went to bed during this pass, so Stage 2's questions are written down for the morning and Stage 3 assumes the recommended answers, saying where an answer would change it.

## Pass 2 · Stage 1: Review

### The verdict in five lines

1. The foundations under the launcher are good and worth keeping: offline-first outbox, retry-safe sync, one locked endpoint, skins built on design tokens, no build step, readable comments with decision numbers.
2. The weak seam is **between the launcher and the games**. Nothing defines what a game must do to join; each one is wired in by hand; Kriss Kross needed edits inside your wife's file; a game's settings need a new editor, a new Sheet tab and a script redeploy.
3. Progress is counted from **how much** a child plays, not **how they're growing**, so it runs out quickly (area 8) and can't show a grown-up what a child is learning (area 1).
4. The project's start reading is within your own template's budget today (about 21 kB of 30 kB) but set to grow, and it's split across two handoffs.
5. **Now is the cheapest moment to fix the seam.** The Sheet holds only grown-up test rows, one game is live and one kind of setting exists. Every change to the shape of the data gets dearer once the children's history is in it.

### What adding a game costs today

| Step | Where | Comment |
|---|---|---|
| The game's files | `games/<id>/` | Expected |
| List it | `games.json` | Expected |
| Its tile picture | `shared/icons.js` | Shared code edited for every new game |
| Wire it in | inside the game: import `../../shared/game-kit.js`, call `record()` or `finish()`, add `homeButton()` | Ties the game to this folder layout, so it no longer runs on its own (for example as an artifact) |
| Make room for the home button | per game | Kriss Kross needed padding added to its own toolbars |
| An end-of-round screen | each game builds its own | Bubble pop has its own stars and buttons; Kriss Kross shows one small green line |
| Grown-up settings | a new editor in `game-setup.js`, and maybe a new Sheet tab, script version and manual redeploy | Word lists needed all four |
| Tests | another copy of the stand-in Sheet | The three copies already disagree |
| Docs | PLAN's games table, handoff, proposals log | |
| **Your wife's game, in addition** | edits inside her file (three here, plus an 85-line block) | Redone by hand at each new version |

The target to aim for: **drop a folder in, add one line to `games.json`, run the tests.** No shared code edited, no Sheet change, no script redeploy.

Adding a skin is similar: its CSS file, `skin-effects.js` (scene, tap burst, emblem), `skins.js`, a swatch rule in `theme.css`, the font link in `index.html` if it has a new font, `Code.gs` (for new Sheets), the live Skins tab (by hand) and the tests: up to eight places.

### 1. Aims, and whether the build serves them

- **Progress saved:** yes, robustly, including offline.
- **Difficulty that scales within a game:** nothing general yet. The Scores `level` column is filled differently by each game (Kriss Kross: the list's position; Bubble pop: always 1), so it can't drive anything.
- **Educational evidence (new):** the data can't answer the question a parent asks most: "is she getting better at this?"
  - Kriss Kross folds hints into stars, so the hint count is lost.
  - The list played is saved only as its position, which changes meaning as soon as lists are reordered.
  - Rounds where the solution was shown leave no trace at all: the kit can't save a round with 0 stars.
- **Older children later:** nothing blocks it, but nothing prepares it: no level range per game, no way to show a game to one child but not the other. Ages rightly stay out of the data (P9).
- **Balance:** the launcher side is about 2,800 lines of JavaScript and CSS plus a 524-line script, against one live game. That's not waste (it's the frame every game will use), but it confirms that the framework, not more launcher features, is the next best investment.

### 2. Workflow

**Building and testing**
- The three tests re-create the Apps Script in Python, three times, and the copies disagree: two answer as script 0.2.0 and one as 0.3.0; one counts a resent round twice; one accepts a skin change without checking stars. So they can pass while the real script would fail.
- They print values and save screenshots rather than pass or fail, and two need your grown-ups' answer typed in each run.
- **The costliest mistakes here are back-end ones,** because the script is pasted and redeployed by hand. Node 22 was available in this workspace, so the real `Code.gs` could run against a small in-memory stand-in for Google's Sheet services, and the browser tests could talk to that. Every script change would then be tested before you paste it.
- The pure rules (badges, day streaks, skin unlocks, merging the outbox into stats) have no quick checks of their own. They're the easiest code to test and where edge cases hide (around midnight, a duplicate round, a skin target edited in the Sheet).

**Your wife's games**
- Her file in the repo is now a fork: hers plus our edits. Her next version means redoing them.
- **Checked for a wrapper:** her page has stable element IDs for everything the hook does today (`grid` gets the class `solved`; `hintBtn`, `solBtn`, `resetBtn`, `newBtn`, `buildBtn`, `play`, `setup`, `notice`, `wordInput`, `puzzleTitle`). A wrapper page holding her game in a frame on the same site could count hints from the Hint button, notice "Show solution", see the solved grid and load a word list, all from outside. So the three edits in her file shouldn't be needed. TBC until built and tried on the children's phones.
- Things the integration doesn't check today, found in her file:
  - It uses a **claude.ai-only feature** (`window.claude.use('downloads')`). It's guarded, so on the family site the Download button just never appears and printing falls back to the browser. Other games may lean on such features more.
  - It keeps its own data in the browser (`kk.words`, `kk.title`, `kk.start`) beside the launcher's `fg.*` keys on the same site. No clash now, but **a game that clears the browser's storage would also wipe unsynced stars and the family code** on that device.
  - The hook types the child's list into her word box, so her game then remembers it as its own last words. Harmless, but it shows how far the hook reaches in.
  - Her toolbar keeps grown-up tools within a child's reach: Print sheet, Edit words, New layout and Show solution.
- The file starts with claude.ai's published-page wrapper, so it was copied from the published artifact. Fine; worth recording the artifact link and date with the game, so "which version is this?" has an answer.

**Chats and handover**
- Two handoffs (the project's is stale), and the wrap-up asks you to paste a new one, although this kind of chat can write project docs itself with the Projects tool.
- Your template's TP-001 keeps the handoff as a **project doc**. Moving it into the public repo also put family details in public: the children's ages, who makes which games, the grown-ups' question. No names, but more than needs to be public.
- P33 and P37 to P39 were built while still "Proposed", so the log lags the code.

**Publishing**
- The site shows no version, so after a publish you can't tell whether a phone is running the new code or a cached copy.

### 3. The screens (20 seen this pass)

**Who's playing?**
- Works for non-readers: big animal faces (about 38% of a phone's width), names on tape, a wiggle, a hello and a sound on tap.
- The gear sits at half strength in the top corner of every screen. Children will find it; the hold and the question stop them. Fine.

**Home, phone**
- Order: header, games, then one panel with stickers, last played and skins (P20). About one and a half phone screens tall.
- The star pill is a number with no goal. The next goal ("10 more stars for Fairy!") is at the very bottom.
- Tiles are big and clear. A game never played shows three empty stars, which reads as "scored nothing". Tiles have nowhere to show a level.
- "Last played" (five small icons) repeats what the tiles already say.
- With the skin preview switched on, its pill covers the bottom-right sticker or skin (seen in three phone screens).

**Home, PC (new)**
- Two columns: stickers, last played and skins on the **left**, games on the **right**. Reading left to right, a child meets the rewards before the games; on phones you chose games first (P20). Games on the left would match.

**Skins**
- Polished and clearly different from each other: wings and a horn on the avatars, scenery, tap effects. Every animation stops when a device asks for reduced motion (a rule in `theme.css` covers them all, more than pass 1 said).
- All four skins' fonts load on every visit, although only one shows at a time.

**Celebration**
- Strong: big stars, stickers peeling on, an unlocked skin to "tap to try on", one big "Yay!" button. The sentences need reading; nothing reads them out.

**In a game (new)**
- The stars a child earns in Kriss Kross appear as one small green line under the grid ("★ saved for …"). The big celebration only comes after going home. Every game has to invent its own end-of-round moment.
- The jump from sticker book to her neon "lab" style is fine (games keep their own look, by decision), and the home button was restyled to suit her game: a nice touch.

**Grown-ups' corner**
- Plain, readable, 44-pixel buttons.
- Arranged in setup order (players, family code, sync, sound, testing, more), not in order of use. Nothing about progress.
- The empty status line leaves a gap under the heading. "More" links to a second connection checker that duplicates this one.

**Game setup (phone)**
- Checks words as you type: very good.
- Each list shows all its words and five buttons, which wrap to two rows. No way to copy a list to the other child.

### 4. Features, front end and back end

- **What a game can ask the launcher for** (`game-kit.js`): who's playing, its own id, save a round, go home, a home button. Missing for a framework: the child's level and settings, a shared end-of-round panel, a way to say what was played and how much help was used, and a practice mode that saves nothing.
- **Untouched games can't follow the corner's sound switch.** Games that import `sound.js` can; your wife's can't. A wrapper can't reliably mute them either; worth knowing, not fixing.
- **The script's version** comes back with every player list, but the launcher ignores it. It's only checked on "Check connection", and only against 0.2.0, so a script that's behind shows up as a failure rather than a clear message.
- **Rewards** are coded: eight badges, three skins. "Try every game" is spent on the first round (pass 1). "Beat your best" assumes a higher score is better, which a future timed game would get backwards.
- **Phones:** there's no web app manifest, so "Add to Home Screen" makes a plain bookmark that opens with the browser's address bar. With one, the site opens full-screen with its own icon, leaving fewer ways for a child to wander into the browser. Details differ between iPhone and Android (TBC on your phones).
- **Not missing (deliberately):** offline caching of the pages themselves. Results already survive being offline; caching whole pages adds a real risk of phones running stale code.

### 5. Data

- **Scores can't describe learning** (area 1): there's no column for what was played (a list title) or help used, and `score` means something different in each game, with nothing saying what it counts or whether higher is better.
- **Settings are stored per feature.** GameLists is one row per list, readable in the Sheet. The next kind of setting (a level) would need another tab, another script version and another redeploy, unless one general settings tab takes all future settings.
- **Reads:** every `profile` call reads the whole Scores, Achievements and GameLists tabs. Fine for years at family scale: my estimate is a few thousand rows a year.
- **Kriss Kross fetches the profile again on opening** and waits up to 3 seconds, although the launcher had just refreshed it. A wrapper could hand the game what it needs straight away.
- **Device storage is shared across the whole site address.** Everything on `robl89.github.io`, including any other GitHub Pages project of yours, can read and clear the same browser storage, family code included. Low risk; worth knowing before hosting anyone else's code there.
- **Test rows:** all current Scores and Achievements rows come from the two grown-up profiles, and the one saved list sits under a grown-up profile. The children's history hasn't started (TBC: a device could still hold unsynced rounds).
- **Mistakes:** if the 4-year-old plays as her brother, today's fix is deleting the rows in the Sheet by hand (badges earned stay unless deleted too). That's fine for a family app; it's just not written down anywhere.
- **Tidy-ups:** an empty `Sheet1` tab; each `setup` run adds a whole backup copy to Drive with no plan for clearing old ones.

### 6. Project context

**Start size**, measured: the project instructions (1.3 kB), the repo handoff (5.1 kB) and PLAN.md (14.6 kB) come to about **21 kB, or roughly 5,000 tokens**, plus the stale project handoff. That's inside the 30 kB start budget in your project-template 0.1.0. So it isn't bloated yet; the risk is growth. PLAN.md is 70% of it, gains a log row with every decision, and the handoff repeats its decisions.

**Against project-template 0.1.0** (provisional; answers pre-filled, see Q19):

| Item | State here | Comment |
|---|---|---|
| TP-001 Handoff read first | In place, but points at a stale copy | The template keeps it as a project doc; this project moved it into the repo |
| TP-002 Rob decides | In place | Open proposals P33, P37 to P39 to close |
| TP-003 Sources or TBC | To adopt the fuller line | Adds: source or compute each number in code, label judgement, log a question |
| TP-004 Nothing lives only in the chat | In place | But see the note below |
| TP-008 Repo added before cloning | In place | |
| TP-009 Back up and preview before live writes | To adopt the fuller line | Adds: preview the change on a copy, re-read the live Sheet first |
| TP-012 Facts about now checked and dated | To adopt the fuller line | Adds: keep the source and date checked (PLAN already does this) |
| TP-007 Pause protocol | Already in the instructions | The template has it off until a chat hits a limit; keeping it costs one line |

A note for your template project (P-004), not this one: TP-004's repo line says "commit". In a cloud chat, a commit that isn't pushed still lives only in that chat's workspace, which is the very loss its "Why" describes (L42). The repo line could say "commit and push".

**The docs themselves**
- PLAN.md mixes four jobs: how the system works, design notes (skins in prose), reference facts (dated limits) and a 39-row log, much of it superseded.
- `setup-sheet.md` grows a section per script version, and still says "answer the sum".
- README calls Bubble pop "the first" game.
- Comments in the code cite P-numbers. That's good for tracing decisions, as long as P-numbers are never reused or renumbered when the log is trimmed.
- This REVIEW.md will itself be bloat once decided. Its outcomes belong in the decisions log, and the file can then go (git keeps it).

### 7. Repo and code

- **Size by area:** launcher JavaScript 2,019 lines; launcher CSS 765; script 524; tests 412; docs 360; Kriss Kross 1,194; Bubble pop 178.
- **`launcher.js` does eight jobs in 742 lines:** screens, celebration, routing, sync refresh, the question gate, the corner, the player form and the skin preview. The next features (progress page, levels, sticker book) would take it past 1,000. Split by screen, a chat fixing Game setup reads 250 lines, not 1,000, which matters for usage as much as tidiness.
- **CSS:** `theme.css` holds the children's theme and the corner's plain style together, and the corner part shows patches over time (`.corner .plist li` defined twice; a separate `.corner { overflow-y }` rule).
- **Hidden coupling:** game icons in `shared/icons.js`; skin previews in `theme.css`; all skin fonts in `index.html`.
- **Copies of the same rules:** word rules in three places (already 15 vs 20 letters); skins in `skins.js`, `Code.gs` and the tests; small helpers in two files; the stand-in Sheet three times.
- **The Kriss Kross hook** checks every tenth of a second, for up to four seconds, whether her grid was built, and makes its own network call with a 3-second timeout. Both work; both go away with a wrapper that knows the moment a puzzle is built.
- **Still good:** escaping, formula-safe text, a lock on writes, retry-safe sync, storage errors caught.

### 8. Long-term progress (your worry, in more depth)

**When it runs out** (my estimate, assuming 2.5 to 3 stars a round and 3 to 5 rounds a day):
- All three bonus skins need 30 stars: 10 to 12 good rounds, so in the first few days.
- "50 games" comes in 10 to 17 days, and "100 games" in 20 to 34 days.
- The sum: within about a month, everything is earned, and the star total becomes a number that no longer means anything.

**Why it runs out**
- Every reward counts **volume** (rounds, stars, days), none counts **growth** (harder levels, fewer hints, a new list mastered).
- All rewards are **global**. Nothing belongs to a particular game, so a new game adds nothing new to collect, and "Try every game" is spent before the second game exists.
- The only thing to "spend" stars on is skins, and there are three.
- The tile stars top out at 3 after one good round.

**What tends to keep 4 to 6-year-olds coming back** (my judgement, not research): collecting and completing (a sticker book, literally this app's look), seeing a bar fill towards the next thing, a little surprise, dressing up their own character, and being able to say "I'm on level 3 now". What tends to backfire: comparisons with a sibling (the younger one always loses), streaks that punish a missed day, and anything that takes stars away.

**The opportunity:** the app already looks like a sticker book, but only eight stickers exist. Making the whole progress system one sticker book, with a page for each game, filled by levels and milestones, is endless by design: each new game brings its own page.

### What I'd do differently, with fresh eyes

1. **One way in for every game.** A single game-shell page holds any game in a frame, provides the home button, the child, their level and settings, saves rounds and shows one end-of-round panel. Our games send two simple messages; your wife's games are connected by a small adapter, with her files left exactly as she made them.
2. **A manifest per game** (title, icon, levels, settings, how stars are earned, what the score means, and where it came from), so the game's folder carries everything about it.
3. **A script built so new games never need a redeploy:** one general settings tab, plus columns for what was played and help used. Then 0.4.0 is the last planned change to the shape of the data.
4. **Tests that run the real script,** quick unit checks for the reward rules, and pass or fail at the end.
5. **Progress as one sticker book,** with pages per game, linked to levels.
6. **One handoff, as a project doc,** with the repo's docs only about how the code works.
7. **Smaller files,** so each chat reads only what its task needs.
8. **Start clean:** finish the foundation, then clear the test rows, then let the children start.

---

## Pass 2 · Stage 2: Questions for the morning

Written down rather than asked, because Rob was asleep. Stage 3 assumes each recommended answer and says where another answer would change it. Answer with the letters, for example "Q9 a, Q10 a, Q11 c…". **Q9, Q10, Q12, Q13 and Q14 matter most.**

| # | Question | Options (recommended first) |
|---|---|---|
| Q9 | Where should the one handoff live? | **a. A project doc that Claude rewrites at wrap-up with the Projects tool, so no pasting (recommended: matches your template's TP-001, stays private, readable before cloning)** · b. `docs/handoff.md` in the repo · c. Both, with the project one only pointing to the repo |
| Q10 | Should games run inside one shared wrapper page (the "game shell")? | **a. Yes, every game (recommended: one way in, her files untouched, one end-of-round panel)** · b. Only your wife's games; ours keep importing the kit · c. No; keep direct game pages and hand-made hooks |
| Q11 | When a child plays Kriss Kross from the launcher, hide her grown-up buttons from the wrapper (her file unchanged)? | **a. Hide Print sheet and Edit words (recommended)** · b. Also hide Show solution · c. Leave everything as she made it |
| Q12 | How should new per-child settings (like a starting level) be stored? | **a. One new general Settings tab for everything new; word lists stay in GameLists (recommended: readable lists, nothing to move)** · b. Move word lists into the new tab too · c. A new tab per feature, as now |
| Q13 | Clear the grown-up test rows before the children start? | **a. Yes, once the data change (D1) is done, after a backup (recommended)** · b. Keep them · c. Clear them now |
| Q14 | Which devices do the children use? (Needed to try the wrapper, "Add to Home Screen" and read-aloud voices.) | a. iPhone or iPad (Safari) · b. Android phone (Chrome) · c. Both, or something else (please say) · and which PC browser? |
| Q15 | Read things aloud for the 4-year-old (sticker names, "needs 10 stars", celebrations)? | **a. Yes, behind the existing sound switch (recommended)** · b. No |
| Q16 | One word for the rewards? | **a. Everything is a sticker, in one sticker book (recommended: matches the look, one word for children)** · b. "Badges" for the eight awards, "stickers" for the rest |
| Q17 | Should Kriss Kross word lists act as its levels? | **a. No: lists stay lists set by a grown-up (school spellings change weekly, not by difficulty); levels are for games with built-in difficulty (recommended)** · b. Yes: three 3-star rounds on a list makes the next list the default |
| Q18 | Offer your wife a one-page, optional "making games launcher-friendly" tips sheet? | **a. Yes, purely optional; her files are still never edited (recommended)** · b. No |
| Q19 | Confirm the project-template answers I pre-filled: code yes, repo yes, live data yes (the Sheet), documents no, issued files no, sources yes (platform limits), agents no, siblings no, board no, stages no, others' sign-off no. | **a. All correct, and save the set-up record to the project (recommended)** · b. Correct, but don't save a record · c. Some are wrong (please say which) |

---

## Pass 2 · Stage 3: Recommendations

Every item is **Proposed** until Rob adopts or declines it. Where an item depends on a Stage 2 answer, it says so; it's written for the recommended answer.

Sizes: **small** = part of one chat · **medium** = about one chat · **large** = several chats.

Groups: **W** workflow and handover · **G** game framework · **D** data and back end · **S** stars, stickers and reports (progress) · **U** screens · **C** context and instructions · **T** tests and tidy. (No P or R codes, so these never get mixed up with decisions P1 to P39 or pass 1's R-items.)

### The plan, in order of value

| Phase | What it gets you | Items | Size |
|---|---|---|---|
| A. Housekeeping | One handoff, sharper instructions, nothing lost between chats, a lean start | C1, C4, W1, T1, C2, C3 | One chat |
| B. Test bed | Every later change, especially to the script, tested before you paste it | T2, T4 | One chat |
| C. Game contract and shell | The "drop a folder in" target; tried on your phones before anything is built on it | G2 trial, then G1, G2, G4, G5, G6, G7, T3 | Two or three chats |
| D. Kriss Kross the new way | Proof of the wife-game path: her latest file untouched, with an adapter | G3, G8, W2 | One chat |
| E. Data 0.4.0, then start clean | The last planned change to the data's shape, made before the children's history exists | D1, D2, then D3 | One chat, plus your paste and redeploy |
| F. Progress | Difficulty and long-term goals in one: levels, the progress page, the sticker book | S1, S2, U1, U7, S4, S3 | Two or three chats |
| G. As wanted | The remaining screen items, more skins, goals, extras | U items, G9, S5, S6, S7 | Per item |

Why this order: tests before touching the script; the shell before moving Kriss Kross onto it; the data change before the children's history starts; progress after levels exist. If the children are keen to start sooner, phase E can move ahead of C and D: nothing in it depends on the shell.

### Blueprint: the game contract (for G1 to G4)

**A manifest in each game's folder** (`games/<id>/game.json`; the folder name is the id). Example for Kriss Kross:

```json
{
  "title": "Kriss Kross",
  "colour": "#1AA3C2",
  "icon": "icon.svg",
  "page": "original.html",
  "adapter": "adapter.js",
  "levels": 0,
  "settings": ["word-lists"],
  "stars": "3 with no hints, 2 with one or two, 1 with more",
  "score": { "counts": "words", "better": "higher" },
  "subject": "words",
  "source": { "link": "TBC", "copied": "2026-10-29" }
}
```

`games.json` then keeps only order and status (`ready`, `testing` or `soon`); "Soon" placeholders keep their title, icon and colour there, as they have no folder.

**The game shell** (`play.html?game=<id>&player=<id>`) holds the game in a frame under a slim sticker-book bar: home, the child's face, their level, stars this visit.

| The shell gives the game | The game tells the shell |
|---|---|
| The child (name, animal), their level, their settings (such as word lists), whether sound is on | "Round over": stars, plus, if it has them, score, seconds, what was played (`detail`) and help used (`help`) |
| The home button, saving, level-ups, the end-of-round panel, celebrations | Optionally: "ready", and "there's a next one" (for Next) |

- **Our own games** send and receive two small messages (a short `bridge.js` in the template). A game still runs on its own, as an artifact or a plain page: with no shell around it, it uses defaults and saves nothing.
- **Your wife's games** are joined by an `adapter.js` that runs in the shell and watches her page, sending the same messages. Her file is never edited. For Kriss Kross: type the child's list into her word box and press Build; count Hint presses until solved; notice Show solution; see the solved grid; optionally hide two grown-up buttons with a style rule added at run time (Q11).
- **Stars 0** means "finished with the answer shown": saved for the grown-ups, earning nothing.
- **The end-of-round panel** slides up over the lower part of the screen, so the finished puzzle stays visible: big stars, any new sticker, and picture buttons **▶ Next** (when there is one), **↻ Again**, **⌂ Home**. With read-aloud on (U2), it says "Three stars!".
- **Risk to try first:** a framed game on the children's actual phones (touch, scrolling, sound, full height), and how much height the bar costs on a phone held upright. Hence "G2 trial" in phase C.

**Folder sketch** (changes only):

```
play.html                  the game shell
games.json                 order and status only
games/<id>/game.json       the manifest
games/<id>/icon.svg        the tile picture
games/<id>/game.html       our games; or original.html + adapter.js for your wife's
games/_template/           a working mini-game, its manifest and a one-page README
shared/launcher/           who.js, home.js, party.js, corner.js, setup.js, progress.js (launcher.js split)
shared/shell.js, bridge.js the shell, and what our games include
shared/corner.css          the corner's plain style, out of theme.css
tools/tests/               unit/, fake-sheet.js (runs the real Code.gs), browser smoke tests
docs/                      PLAN.md (how it works), decisions.md, setup-sheet.md
```

### Blueprint: data 0.4.0 (for D1)

| Change | Detail | Why |
|---|---|---|
| New tab **Settings** | profile_id, game_id, key, value, updated_at. First keys: `start_level`, `auto_level` (and later `hidden`, to show a game to one child only) | Every future per-child setting without another tab or redeploy |
| Scores: two columns added at the end | `detail` (what was played, such as a list's title) and `help` (hints or help used) | Learning reports; survives reordering lists |
| Rounds with 0 stars | Saved when the answer was shown; never count towards stars or stickers | Grown-ups can see "showed the answer 4 times on Week 3" |
| `profile` returns, per game | The current level (worked out from Scores and the start level) and the settings | One place decides a level |
| New call `saveSetting` | One key at a time | Game setup's level control |
| Unchanged | Profiles, Achievements, Skins, GameLists | Nothing to move |

How it goes live: tested against the real script first (T2); backup; previewed on a copy of the Sheet (a copy should carry its script with it; TBC on first use), per your template's TP-009; then you paste, run `setup` and redeploy; then a before-and-after comparison.

### Blueprint: levels, the progress page and the sticker book (for S1 to S3)

**Levels (S1).** A game says how many levels it has. A grown-up sets each child's starting level in Game setup. After three 3-star rounds in a row at a level, the child moves up, with a "Level up!" celebration. A grown-up can set it back or turn moving up off at any time. Nothing ever moves a child **down** by itself (my judgement: being "sent back" feels like a punishment at 4); instead, the progress page suggests it after repeated 1-star rounds.

**Progress page (S2),** in the corner, per child:
- **This week:** days played, rounds, minutes (from the existing `seconds`).
- **Each game:** level, rounds, average stars, last played.
- **Last ten rounds,** in plain words: "Week 3 spellings · ★★★ · no hints · 2 min".
- **A gentle flag** when the last three rounds at a level were 1 star.

**Sticker book (S3)**, one book with three kinds of page:
- **Special:** today's eight awards, with two fixed (S4).
- **Star stickers:** one for every 10 stars, from a set of original drawings in the house style. When the set runs out, it starts again with gold edges, so it never ends.
- **One page per game,** made from its manifest: first round, first 3 stars, each level reached, 10, 25 and 50 rounds. A new game brings its own page.

Nothing new is stored: it's all worked out from Scores and Achievements, as skins are today. On the home screen, the panel shows the three newest stickers and a "My sticker book" button; "Last played" goes, because the progress page does that job better.

### W · Workflow and handover

- **W1. Push to a `work` branch after every stage; "publish" = merge into `main`** (small) · Proposed (you chose this, Q4). The live site only changes when you say so, and nothing is lost if a chat ends. The branch is public too, so the no-names rule applies to it.
- **W2. Write down the wife-game pipeline** (small, once G2 and G3 exist) · Proposed.
  1. Paste her artifact link.
  2. Claude reads the whole page and saves it as `original.html`, unchanged, recording the link and date. (With edit access the Artifact tool should return the full file; TBC on first use.)
  3. A game check runs: it loads in the shell without errors; it lists any claude.ai-only features, storage keys (flagging any clear-all) and outside files; it fits a phone.
  4. The adapter is written or checked, and its test plays a scripted round.
  5. The game goes live as `testing`; you play it on your phone.
  6. You say ready, and it's published.

  Updates repeat steps 2 to 5, with a short note of what changed in her version, so you know what to try. *Why:* her new versions drop in, and anything that would break the launcher is caught before the children see it.
- **W3. App version and a publish checklist** (small) · Proposed. Show a version (the publish date) in the corner. Checklist: tests pass → version bumped → handoff updated → merge → check the version on a phone. *Why:* answers "is this phone on the new code?".
- **W4. Build only adopted proposals** (small, a habit) · Proposed. If something has to be built to decide, log it as "built, awaiting decision". *Why:* keeps the log true (P33, P37 to P39 drifted).
- **W5. An optional tips sheet for your wife** (small) · Proposed, depends on Q18. One page: keep button IDs stable between versions; show "solved" on the page; don't clear the browser's storage; keep claude.ai-only features to extras. Nothing she must do; it just makes her games easier to plug in.

### G · Game framework: building and integrating

- **G2. The game shell** (medium to large, trial first) · Proposed, depends on Q10. As in the blueprint. *Why:* one way in for every game, her files untouched, one consistent end-of-round moment, and no per-game home-button hacks.
- **G1. A manifest per game** (small) · Proposed. As in the blueprint. *Why:* everything about a game lives in its folder; `score.better` keeps "Beat your best" right for timed games; `subject` leaves room to group many games later.
- **G4. One end-of-round panel in the shell** (medium) · Proposed. Big stars, any new sticker, picture buttons ▶ ↻ ⌂. Kriss Kross's Next list button moves here. *Why:* the child sees the reward at the moment they earn it, in every game, without reading.
- **G3. Kriss Kross through an adapter, her latest file untouched** (medium) · Proposed, depends on G2. Fetch her current version from her artifact and drop the three edits and the 85-line block. *Why:* proves the wife-game path on the game that needs it most. Feasibility is TBC until built (Stage 1, area 2).
- **G5. A `testing` status** (small) · Proposed. The tile shows only when the corner's Testing switch is on (on that device), marked "Testing". *Why:* you can try a new game on the live site, on the real phones, before the children see it.
- **G6. A game brings its own tile picture** (small) · Proposed. `icon.svg` in the game's folder; `shared/icons.js` keeps only the launcher's own pictures and the placeholders. *Why:* adding a game never edits shared code.
- **G7. A template that's a working mini-game** (small) · Proposed. A standalone `game.html` with a manifest that reads its level, plays a round, reports stars and `detail`, and shows the comment style you both use; plus a one-page README covering both paths (ours, and your wife's via the adapter). *Why:* each new game starts from a working pattern.
- **G8. Kid mode for Kriss Kross** (small) · Proposed, depends on Q11. The adapter hides Print sheet and Edit words when a child plays from the launcher. Her file stays unchanged, and the buttons are all still there when she or you open the game directly.
- **G9. A skin as a folder** (medium) · Proposed, before any new skin. Put `skins/<id>/` with its CSS, scene, tap burst, emblem and font together, and list skins once. *Why:* a new skin then touches one folder and the Skins tab, not eight places.

### D · Data and back end

- **D1. Script 0.4.0** (medium) · Proposed, depends on Q12. As in the blueprint. *Why:* the last planned change to the data's shape, covering levels, per-child settings, per-child game visibility later, and learning reports, before the children's history exists.
- **D2. The launcher checks the script version** (small) · Proposed. One "needs script 0.4.0" setting; the version that already comes back with the player list is compared on every refresh, and the corner says plainly when the script is behind. *Why:* a missed redeploy becomes a clear message instead of a mystery failure.
- **D3. Start clean** (small) · Proposed, depends on Q13. After D1 and before the children start: back up; clear the grown-up test rows from Scores and Achievements, and the test list from GameLists; remove the empty `Sheet1`; compare before and after. Also say how to tidy old backups in Drive. *Why:* the children's history starts from nothing, and the reports show only real play.
- **D4. Write down how to fix a round saved under the wrong child** (small) · Proposed. Two lines in `setup-sheet.md`: delete the row in Scores, and the badge row too if one was earned. *Why:* it will happen; no feature needed.

### S · Stars, stickers and reports (your choices from Q5 to Q7)

- **S1. Levels** (medium, with D1) · Proposed, depends on Q17 for Kriss Kross. As in the blueprint; tiles show the level. *Why:* this is both the difficulty scaling in your aims and a goal that keeps going.
- **S2. The grown-ups' progress page** (medium) · Proposed. As in the blueprint. *Why:* you see learning, not just activity, without opening the Sheet.
- **S3. The sticker book** (medium to large, mostly drawing) · Proposed, depends on Q16. As in the blueprint. *Why:* endless by design, on-theme, and every new game adds a page automatically.
- **S4. Fix two awards** (small) · Proposed. "Try every game" waits until at least three games are live; "Beat your best" uses the manifest's direction, or stars and level. Only grown-up profiles hold "Try every game" today, so no child loses anything.
- **S5. More skins, one at a time, after G9** (medium each) · Proposed. Add them at higher star targets set in the Skins tab. Naming Blocks is still open.
- **S6. Grown-up goals** (medium) · Proposed, last. A weekly goal per child earns a special sticker. Only if levels and the sticker book aren't enough.
- **S7. Later ideas, only if wanted** · Proposed, not planned:
  - **Avatar dress-up:** hats and glasses as star-sticker prizes. Wings and a horn already show the idea works.
  - **A weekly progress email** from the Sheet to you. Apps Script can send mail; permissions and limits to be checked when used.
  - **A gentle "time for a break"** after a set number of minutes a day, worked out from `seconds`.

### U · Screens

- **U1. A next-goal bar beside the star total** (small) · Proposed. It shows how many stars to the next sticker or skin. *Why:* the goal is where the child looks, not at the bottom of the page.
- **U2. Read things aloud** (small) · Proposed, depends on Q15 and Q14. The browser's built-in speech, behind the sound switch: names on tap, "needs 10 stars", celebrations, end of round. *Why:* the 4-year-old can't read the speech bubbles.
- **U3. Games on the left on a PC** (small) · Proposed. *Why:* matches phones (games first, P20).
- **U4. Rearrange the corner by use** (small) · Proposed. In order: players (Edit, Game setup, **Progress**); sound; a folded "This device" section (family code, check connection, send now, app version); Testing. Drop the empty status gap and the "More" link to the old checker.
- **U5. Copy a word list to the other child** (small) · Proposed. *Why:* siblings will often share lists.
- **U6. Shorter list rows in Game setup** (small) · Proposed. Show the first few words with "+12 more", and fold Up, Down and Make default into one "Move".
- **U7. Tiles: no stars before the first round; show the level** (small, with S1) · Proposed.
- **U8. "Add to Home Screen" support** (small) · Proposed, depends on Q14. A web app manifest and icon, so the site opens full-screen like an app. Check on your phones.
- **U9. Load only the active skin's font** (small) · Proposed. *Why:* a quicker start on phones.
- **U10. The skin preview pill stops covering things** (small) · Proposed. Rename it "Skin preview" and move it to a corner that has no content.
- **U11. Hide a player from the corner** (small) · Proposed, low. Sets `active` to FALSE; fine to skip while you keep all four profiles.
- **U12. "Go home?" with ✓ and ✗ pictures, when a round is in progress** (small) · Proposed, low. *Why:* a stray tap on Home shouldn't lose a half-done puzzle.

### C · Context and instructions

- **C1. One handoff, as a project doc that Claude writes** (small) · Proposed, depends on Q9. Wrap-up rewrites it with the Projects tool, so there's no pasting. Delete `docs/handoff.md` from the repo, and move family details (ages, who makes which games) out of public docs into the project doc. *Why:* one source, private, readable before cloning, and as your template has it.
- **C4. Instructions update** (small) · Proposed. The draft is below: it adopts the fuller template lines (TP-003, TP-009, TP-012), push to `work`, her files untouched, names out of the repo, tests before commits, and the wrap-up via the Projects tool.
- **C2. Slim PLAN.md** (small) · Proposed. `docs/PLAN.md` becomes "how it works": data flow, Sheet tabs, script calls and the game contract, in under 100 lines. The proposals log moves to `docs/decisions.md`, read only when a decision is in question. Skin descriptions move into comments in the skin files, and the dated limits go (they're checked when used). *Why:* PLAN is 70% of every chat's start reading.
- **C3. Tidy the rest** (small) · Proposed.
  - Close P33 and P37 to P39.
  - Make `setup-sheet.md` one "update the script" recipe with a one-line version history, and fix "answer the sum".
  - Put the test command in the README.
  - Keep P-numbers stable: never reuse or renumber.
- **C5. Retire this review once decided** (small) · Proposed. Move the outcomes into `docs/decisions.md`, then delete `docs/review/` (git keeps it). *Why:* it shouldn't become reading for future chats.
- **C6. A note for your template project (P-004)** (small) · Proposed. TP-004's repo line could say "commit and push", because an unpushed commit still lives only in the chat's workspace.

### T · Tests and tidy

- **T2. A real test bed** (medium) · Proposed.
  - The real `Code.gs` runs in Node against an in-memory Sheet (one shared stand-in instead of three Python copies).
  - Quick unit checks cover the reward and level rules.
  - Browser smoke tests: one per screen, plus one per game through the shell.
  - A test-only question hash, so your answer is never needed.
  - Pass or fail at the end, such as "PASS 31 of 31"; screenshots only when asked.

  *Why:* script mistakes are caught before you paste, and a chat checks its work by reading one line.
- **T1. Repo tidy** (small) · Proposed. A `.gitignore` for `__pycache__`, and remove the two `.pyc` files; retire `tools/sheet-check.html` (the corner covers it, and it writes test rows); delete `docs/mockups/`.
- **T3. Split `launcher.js` by screen, and the corner's CSS into its own file** (medium) · Proposed, before the progress page and sticker book. *Why:* smaller files mean less reading per task, and new screens have an obvious home.
- **T4. One source for shared rules** (small) · Proposed. Word rules, the skins list and the small helpers written once. *Why:* the 15 vs 20-letter mismatch can't recur.
- **T5. One name per thing** (small) · Proposed, with Q16. "Skin preview", not "debug", and "sticker" everywhere (or the Q16 choice).

### Deliberately not recommended

Keeping the app simple, as your first priority asks:
- **No build tools or frameworks.** Plain files stay.
- **No offline page caching (service worker).** Results are already offline-safe; cached pages risk stale code on phones.
- **No accounts or extra security.** The family code and the question are enough for a family app.
- **No sibling leaderboards or comparisons, streaks that punish missed days, or losing stars.**
- **No game version or device ID on every round.** The manifest's "copied" date is enough.

### Draft project instructions (for C4; paste only once adopted)

```
## Kids' Games

Simple, educational browser games for my two children, played on a phone or a computer. Code: the public GitHub repo RobL89/family-games. Data: the family-games Google Sheet.

### Rules

- I decide. Label your suggestions as proposed until I agree, and close every proposal as adopted or declined.
- Never invent facts, figures or sources. Source each fact, compute each number in code, or label it as your judgement; write TBC for anything unknown and log a question in the handoff.
- Check anything about now (GitHub Pages or Google limits, settings, prices) when it's used, never from memory, and keep its source and the date checked.
- Before any change to the Google Sheet's data or structure: back it up, preview the change on a copy, re-read the live Sheet first, and compare before and after.
- Nothing lives only in the chat: commit code and files to the repo and push them to the work branch. Merge into main (the live site) only when I say publish.
- The repo is public: keep the children's names and other family details out of it.
- My wife's game files are never edited; they join the launcher through an adapter.
- Run the tests before committing code changes.
- If usage is about to run out mid-task, stop at a safe point: save and push what's done, note in the handoff where you stopped, stop any background work, and give me the phrase to resume with.

### Start of every chat

1. Read handoff.md before answering: it says where things stand, what's next and which files to read.
2. Before working on the repo, add it to the chat, then clone it.

### When I say "wrap up"

1. List any file made in this chat that isn't committed and pushed yet, then commit it and push it to the work branch.
2. Rewrite handoff.md for a stranger and save it to the project with the Projects tool: goal, where things stand, decisions in force, what's waiting on me, the exact next step, files to read, dead ends, and the next chat's opening line in a code block.
```

### Pass 1 items, mapped

Pass 1's R-items are replaced by these; decide on the pass 2 items.

| Pass 1 | Pass 2 | Change |
|---|---|---|
| R1 One handoff in the repo | C1 | Now a project doc (Q9), for privacy and your template |
| R2 Work branch | W1 | Same |
| R3 Fix two badges | S4 | Same, using the manifest |
| R5 Tests | T2 | Now runs the real script |
| R6 Wrapper for her games | G2, G3, G8 | Now a shell for every game |
| R7 Repo tidy | T1 | Same |
| R8 Small fixes | T5, U10, C3 | Split up |
| R9 Levels | S1 | Detailed |
| R10 Settings store | D1 | Now general, with learning columns |
| R11 Retire a player | U11 | Same |
| R12 Progress page | S2 | Detailed |
| R13 Sticker album | S3 | Now the whole sticker book, with pages per game |
| R14 Template | G7 | Now a working mini-game |
| R15 One source for rules | T4 | Same |
| R16 Slim PLAN | C2 | Same |
| R17 Tidy docs | C3 | Same |
| R18 Instructions | C4 | New draft |
| R19 More skins | S5, G9 | Skin folders first |
| R20 Grown-up goals | S6 | Same |
| R21 Read aloud | U2 | Same |
| R22 Goal at the top | U1 | Same |
| R23 Empty stars | U7 | With levels |
| R24 Last played | S3 | Replaced by newest stickers |
| R25 Locked badges | S3 | Part of the sticker book |
| R26, R27 Corner order and gap | U4 | Same |
| R28 Copy lists | U5 | Same |
| R29 Shorter list rows | U6 | Same |

---

**Status:** pass 2 complete (2026-10-29, late). Waiting on Rob: Q9 to Q19, then adopt or decline items by code, for example "adopt phase A and B". Nothing in the app has changed, and nothing has been pushed.

---

## Pass 2 · Rob's answers (2026-10-30, morning)

| # | Answer | What it changes in Stage 3 |
|---|---|---|
| Q9 | Project doc, written by Claude at wrap-up | C1 as written |
| Q10 | Yes, every game; Rob wants to see how the shell looks on a phone and a PC first | G2 waits for Rob to approve the mockups (below) |
| Q11 | Wants to see an example first | G8 waits for Rob to approve the before-and-after example (below) |
| Q12 | One general Settings tab; word lists stay in GameLists | D1 as written |
| Q13 | Clear the test rows after the data change | D3 as written |
| Q14 | Android phone (Chrome) and Windows PC | The shell trial (phase C), "Add to Home Screen" (U8) and read-aloud voices (U2) are tried on these two. No iPhone checks needed |
| Q15 | Yes, read aloud, behind the sound switch | U2 as written |
| Q16 | Everything is a sticker | S3 and T5: "badges" becomes "stickers" everywhere |
| Q17 | No: Kriss Kross lists stay lists | Kriss Kross has `levels: 0`; S1 applies to games with built-in difficulty |
| Q18 | Yes, an optional tips sheet | W5 as written |
| Q19 | Template answers correct; save the record | Set-up record saved to the project as `claude/setup-record.md` |

### Mockups for Q10 and Q11 (2026-10-30)

In `docs/review/mockups/`. The shell is `docs/review/shell-mockup.html`; it's review material only, not part of the app.

- **`shell-phone-and-pc.jpg`:** Kriss Kross, **unchanged**, inside the shell on an Android-size phone (390×844) and a Windows PC (1366×768). Real rendering of her page in a frame, with the current hook's additions removed to show it as she made it.
  - **Bar (about 55 px on a phone, 6% of the height):** home, the child's face and name, star total. Games with levels would add a "Level 2" chip.
  - **End-of-round panel:** big stars, what was played, any new sticker, and three picture buttons: ↻ Again, ▶ Next, ⌂ Home.
  - **Phone:** the panel covers the lower part of the screen.
  - **PC:** a low strip along the bottom, so the finished puzzle stays in view.
- **`kriss-kross-kid-mode.jpg`:** her toolbar on a phone three ways:
  1. As she made it.
  2. Recommended: hide Print sheet and Edit words.
  3. Also hide Show solution.

  The buttons are hidden by a style rule added from outside; her file is unchanged.
- **Waiting on Rob:** approve or change the shell's look (G2, G4) and choose 1, 2 or 3 for kid mode (G8).

### Rob's decisions on the mockups (2026-10-30)

- **Shell look (G2, G4): approved, with two changes.**
  1. **Wide screens:** the end-of-round panel stays centred and only as wide as its contents; it doesn't stretch across a large screen. Done in the mockup.
  2. **Not every game works the same way.** Some will have levels or lists, some are free play. So the panel is built from what each game declares and reports:
     - **The manifest declares how a game is played** (`"play": "rounds"` or `"play": "free"`) and what it can offer (levels, lists, a next one).
     - **Rounds:** the panel shows only what applies. Stars appear only if the game gives stars; "what was played" only if it reports it; ▶ Next only when the game says there is a next one; ↻ Again only if it can restart. ⌂ Home is always there.
     - **Free play:** no end-of-round panel; the shell's home button ends the visit.
     - **TBC, decided with the first free-play game:** what free play counts towards (for example minutes played, or a sticker for something made).
- **Kid mode for Kriss Kross (G8): declined.** The child sees her toolbar as she made it.
