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
