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
