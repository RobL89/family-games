# Setting up the Google Sheet

About 10 minutes, once. Menu names below were checked against Google's Apps Script docs on 2026-10-28; if something on screen is worded differently, go by the meaning.

## What this sets up

```
Game in the browser ──POST──▶ Apps Script web app ──▶ Google Sheet
                              (checks family code)     Profiles, Skins, GameLists (and older tabs)
```

The Sheet will hold first names or nicknames, cartoon avatar choices, skins, word lists and game progress only. No surnames, birthdays or photos (decision P9).

## 1. The Sheet

Open the family games Sheet in Google Sheets (or create a new blank one). Check **File > Settings > Time zone** is London, so "days played" line up with your days.

## 2. Paste the script

1. In the Sheet: **Extensions > Apps Script**.
2. Delete the placeholder code in `Code.gs`.
3. Paste in everything from `apps-script/Code.gs` in this repo.
4. Save.

## 3. Set the family code

1. In the Apps Script editor, left sidebar: **Project Settings**.
2. Under **Script Properties**: **Add script property**.
3. Property: `FAMILY_CODE` · Value: a short code you choose. Don't reuse a password from anywhere else.
4. **Save script properties**.

The code lives only here and on each device where a grown-up types it in. It never goes in the repo or the chat.

## 4. Create the tabs

1. Back in the editor, pick `setup` from the function list at the top, then **Run**.
2. Google asks you to authorise the script to work with your spreadsheet. It's your own script; approve it.
3. The execution log should list the tabs it added and "FAMILY_CODE is set".

`setup` only adds missing tabs, header rows and columns. It never changes or removes data, and if the spreadsheet already has tabs it makes a backup copy first and logs the link.

## 5. Deploy as a web app

1. Top right: **Deploy > New deployment**.
2. Next to **Select type**, click the settings icon and choose **Web app**.
3. Execute as: **Me** (the script uses your access to the Sheet).
4. Who has access: the option that lets anyone use it **without signing in to Google** (in Google's settings file this is called `ANYONE_ANONYMOUS`; on screen it is usually just "Anyone"). The kids' phones and browsers won't be signed in, and the family code is what keeps strangers out.
5. **Deploy**, then copy the **Web app URL** (it ends in `/exec`).
6. Send that URL to Claude, or paste it into `shared/config.js` yourself. The URL isn't secret; the family code is.

## 6. Check it works

1. Open the launcher (the site's front page) and enter the family code when asked.
2. Press and hold the gear in the top corner for a second, answer the grown-ups' question, then **Check connection**. It should name the script version.

## 7. Add the players

In the grown-ups' corner, **Add a player** for each child: name, animal, colour.

## Updating the script

Each new script version is pasted and deployed the same way. The handoff and the version's line below say what it changes in the Sheet.

1. **Back up first:** in the editor pick `backup` and **Run**. It saves a dated copy of the whole spreadsheet to your Drive and logs its link. (Or use **File > Make a copy**.)
2. **Extensions > Apps Script**, select everything in `Code.gs`, paste in the new `apps-script/Code.gs` from the repo, and save.
3. Pick `setup` in the function list and **Run**. It only adds missing tabs, header rows and columns, never changes or removes data, and logs a backup link first.
4. **Deploy > Manage deployments**, select the web app, click the pencil (Edit), set **Version** to **New version**, and **Deploy**. The URL stays the same. Editing the code alone doesn't change the live web app.
5. In the grown-ups' corner, **Check connection** should name the new version.

| Version | What it adds to the Sheet |
|---|---|
| First version | Profiles, Scores and Achievements tabs |
| 0.2.0 | Skins tab (four skins) and a `skin` column at the end of Profiles |
| 0.3.0 | GameLists tab, header row only |
| 0.4.0 (live, pasted 2026-11-13) | Settings tab, header row only. `setup` made a backup and added only Settings; every other cell was compared before and after and is unchanged. The launcher had to be published first: the old launcher would lose its word lists with 0.4.0 |
| 0.7.0 (on `work`, not pasted yet) | School lists and School tests tabs, header rows only, formatted (P91, see below). No existing cell changes (dry run on a copy of the live Sheet, 2026-11-26) |
| 0.6.0 (live, pasted 2026-11-26) | Nothing added. Saved states up to 450,000 characters; over 45,000 kept in parts across Settings rows (P89, see below). Dry run on a copy of the live Sheet first (setup had nothing to do; every saved game came back as 0.5.0 gives it); live Sheet compared before and after: the same, cell by cell. Backups "family-games backup 2026-11-26 1425" and "1426" |
| 0.5.0 (live, pasted 2026-11-18) | Plays tab (header row only) and Plays summary tab (four pivot tables and a Name filter); Scores and Achievements hidden, not deleted (P88). No existing cell changes (dry run on a copy of the live Sheet, 2026-11-17 and 18; live Sheet compared before and after 2026-11-18: only Plays and Plays summary added, Scores and Achievements hidden, backup "family-games backup 2026-11-18 2139"). Tried first on a copy, where Rob checked the summary's look. Either the script or the launcher can go first: the old launcher sends no plays, and the new one keeps them on the device until 0.5.0 is in. Try it on a copy first (below) |

### Trying 0.5.0 on a copy first

The pivot tables and the Name filter only exist in Google, so they're tried on a copy before the live Sheet. A copy of a spreadsheet comes with its own copy of the script (Google's guide to bound scripts).

1. In the live Sheet: **File > Make a copy**. Keep the name it suggests ("Copy of family-games").
2. In the copy: **Extensions > Apps Script**, paste the new `Code.gs`, save, pick `setup` and **Run** (approve it again if asked). Before a version is published, its `Code.gs` is only on the `work` branch (https://github.com/RobL89/family-games/blob/work/apps-script/Code.gs); GitHub shows `main` by default. Check the `VERSION` line near the top.
3. Pick `previewPlays` and **Run**: it adds made-up plays for each player (it refuses to run unless the spreadsheet's name has "copy" or "backup" in it).
4. Open the **Plays summary** tab: three tables (games by child, by day, by device), and the Name filter top left. To pick a child, open the filter, click **Clear**, tick them and click **OK** (the names are already listed under Filter by values; clicking that heading folds them away). All three tables should change.
5. Tell Claude what you see, then bin the copy (and the backup of it that `setup` made first), or keep it to play with.

Then the live Sheet, as in "Updating the script" above: `backup`, paste, `setup`, a new deployment version, Check connection says 0.5.0. To rebuild the summary later (after changing it by hand), run `summary`.

### 0.6.0: big saves in parts (P89)

No new tabs or columns, and `setup` changes nothing. What changes is how a game's saved state is written to the Settings tab: one up to 45,000 characters stays in one `state` row exactly as before; a bigger one (Word Garden's gardens) is written as `state`, `state#2`, `state#3`... rows, each part starting with `~`, all with the same `updated_at`. If a state shrinks again, its spare part rows are emptied, not deleted. Don't edit these rows by hand: a part changed or missing means that save can't be read, and the launcher keeps its own copy on the device. Either the script or the launcher can go first: the old script refuses a state over 20,000 characters and the launcher keeps it on the device until 0.6.0 is in.

### School lists and tests (0.7.0, P91): for grown-ups

Word Garden's school spelling lists and test results can be added here or in the game's own grown-ups' corner (code 1234); either way both end up with everything, for each child.

- **A new list:** in **School lists**, add a row: **child** (pick from the list), **set_on** (the date the list was set, like 01/12/2026) and **words** (the words, with commas or spaces between). The next time that child plays Word Garden it arrives in their garden as a seed packet to plant. **status** then says where it is: waiting, in the garden, or planted (with the date).
- **A test result:** in **School tests**, add a row: **child**, **list_set_on** (the date of the list the test was on), **taken_on** (the test's date) and **missed_words** (only the words they got wrong; leave it blank if every word was right). The next time they play, the right words get a boost and the missed ones come back sooner. **result** then says, for example, "8 of 10 right".
- **Lists and tests entered in the game** appear here as new rows.
- **A mistake:** if status or result starts with "Problem" or "Not added", it says why (no date, a missed word that isn't on the list, a Reception garden). Fix the row before the child next plays; once a list is in the garden, changing its row changes nothing. To correct a test, add a new row with the same dates: the game replaces the old result.
- Don't delete rows or edit the hidden columns (the ids the script added).

## Checking a change to the Sheet

Claude exports the Sheet through the Drive connector before and after any change, keeps the copies in `/tmp` (they hold the family's names), and runs `python3 -I tools/sheet_compare.py <before.xlsx> <after.xlsx>`: it lists, tab by tab, the rows that went or came, cell by cell. A change is previewed the same way on a local copy first.

**Grown-up test rows cleared (Q13), 2026-11-13:** after Rob's backup (`family-games backup 2026-11-13 2035`, the same as the live Sheet cell by cell), Rob deleted Scores 2, Achievements 6, the grown-ups' GameLists test list, the grown-ups' wrapper-check row in Settings and the empty `Sheet1` tab. The live Sheet afterwards matched the preview cell by cell. The Scores and Achievements tabs stay, with their header rows (P48).
