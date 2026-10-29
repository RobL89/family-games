# Setting up the Google Sheet

About 10 minutes, once. Menu names below were checked against Google's Apps Script docs on 2026-10-28; if something on screen is worded differently, go by the meaning.

## What this sets up

```
Game in the browser ──POST──▶ Apps Script web app ──▶ Google Sheet
                              (checks family code)     Profiles, Scores, Achievements, Skins,
                                                       Settings, Lists, Progress
```

The Sheet will hold first names or nicknames, cartoon avatar choices, scores, badges, skins, game settings, word lists and game progress only. No surnames, birthdays or photos (decision P9).

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
3. The execution log should list the tabs it added (Profiles, Scores, Achievements, Skins, Settings, Lists, Progress) and "FAMILY_CODE is set".

`setup` only adds missing tabs, header rows and columns. It never changes or removes data, and if the spreadsheet already has tabs it makes a backup copy first and logs the link.

## 5. Deploy as a web app

1. Top right: **Deploy > New deployment**.
2. Next to **Select type**, click the settings icon and choose **Web app**.
3. Execute as: **Me** (the script uses your access to the Sheet).
4. Who has access: the option that lets anyone use it **without signing in to Google** (in Google's settings file this is called `ANYONE_ANONYMOUS`; on screen it is usually just "Anyone"). The kids' phones and browsers won't be signed in, and the family code is what keeps strangers out.
5. **Deploy**, then copy the **Web app URL** (it ends in `/exec`).
6. Send that URL to Claude, or paste it into `shared/config.js` yourself. The URL isn't secret; the family code is.

## 6. Check it works

1. Open `tools/sheet-check.html` on the GitHub Pages site.
2. Enter the family code, **Save code**, then **Check connection**. You should see `ok: true`.
3. Optional: **Add test player** and **Send test score**. Each adds exactly one row; delete them from the Sheet afterwards if you like.

## 7. Add the players

1. Open the launcher (the site's front page) on any device and enter the family code when asked.
2. Press and hold the gear in the top corner for a second, answer the sum, then **Add a player** for each child: name, animal, colour.

## Updating to script version 0.2.0 (skins)

Version 0.2.0 adds the Skins tab, a `skin` column on Profiles, star totals and editing players. What changes in the Sheet: one new tab (Skins, with four rows: Sticker book 0, Fairy 10, Blocks 20, Unicorn 30 stars) and one new column at the end of Profiles (`skin`). No existing data is changed.

1. In the Sheet: **Extensions > Apps Script**, select everything in `Code.gs` and paste in the new `apps-script/Code.gs` from the repo. Save.
2. Pick `setup` from the function list and **Run**. The log shows the backup link first, then "Added tab Skins…" and "Added column skin to Profiles…".
3. Redeploy so the web app uses the new code (next section).
4. In the launcher's grown-ups' corner, **Check connection** should say "Apps Script version 0.2.0".

To change how many stars a skin needs, edit `stars_needed` in the Skins tab. Set `active` to FALSE to hide a skin.

## Updating to script version 0.3.0 (game settings, word lists, progress)

Version 0.3.0 includes everything in 0.2.0, so if 0.2.0 was never run, this one update does both.

**What changes in the Sheet** when `setup` runs on the Sheet as it was on 2026-10-29 (Profiles, Scores and Achievements with header rows only, plus an empty Sheet1):

1. A backup copy of the whole spreadsheet is made first, and its link is the first line of the log.
2. Profiles: one new column at the end, `skin`.
3. New tab **Skins**: four rows (Sticker book 0, Fairy 10, Blocks 20, Unicorn 30 stars).
4. New tab **Settings**: one row for each game setting (29 rows: 2 shared by all games, 10 for Word Worm, 9 for Monster Café, 8 for Rocket Lander), each with a short "about" note and the starting value in `everyone`. If any players exist by then, each gets an empty column headed with their name.
5. New tab **Lists**: one starter word list, `starter_words`.
6. New tab **Progress**: header row only. Games fill it in as the children play.

Nothing already in the Sheet is changed or removed, and Sheet1 is left alone. Running `setup` again later only adds what's missing (for example, the rows for a new game), with a fresh backup first.

**Steps**

1. In the Sheet: **Extensions > Apps Script**, select everything in `Code.gs` and paste in the new `apps-script/Code.gs` from the repo. Save.
2. Pick `setup` from the function list and **Run**. Check the log matches the list above.
3. Redeploy so the web app uses the new code (see "Changing the script later" below).
4. Open `tools/sheet-check.html`, **Check connection** (it should say version 0.3.0), then **Check game settings**.
5. Tell Claude it's done, so it can compare the Sheet before and after.

When you add a player in the launcher's grown-ups' corner, the script adds a column headed with their name to the Settings tab. Renaming a player renames their column.

## Changing game settings and word lists

Changes reach the games the next time the launcher opens or a game starts. Nothing needs redeploying.

**A new word list (Lists tab).** Add a row:

| list_id | title | items | about |
|---|---|---|---|
| `week_5` | Week 5 spellings | ship, shop, shell, fish | Notes for you; the games ignore this |

- `list_id`: letters, numbers, `-` or `_`, no spaces.
- `title`: shown in the games (Kriss Kross uses it as the puzzle title).
- `items`: the words, separated by commas, spaces or new lines.

Word lists for Kriss Kross need words that share letters, or some can't be fitted into the grid; the game says which and offers to build without them.

**Choosing each child's word list (Settings tab).** Find the row `all | word_list`. In a child's column, type the `list_id` (for example `week_5`), or type the words themselves separated by commas. Leave a child's cell empty to use the `everyone` value. Kriss Kross and Word Worm both use it.

**Difficulty and other settings (Settings tab).** Each row is one setting, and its `about` note says what it does and what it accepts. Change `everyone` for both children, or type in a child's column for just that child. For example, `word-worm | speed` with `everyone` at 2 and the younger child's column at 1.

**Which value wins.** The most specific one: this game and this child, then "all" games and this child, then this game and everyone, then "all" games and everyone, then the game's own default.

A value that doesn't make sense (a word where a number should be, or a list name that isn't in the Lists tab) is skipped and the next one down is used. **Check game settings** on `tools/sheet-check.html` lists what each game will use for each child, where each value came from, and anything that was skipped.

## Changing the script later

Editing the code doesn't change the live web app until you redeploy:
**Deploy > Manage deployments**, select the deployment, **Edit**, choose a new version, **Deploy**. The URL stays the same.

## Backups

Before any change to the Sheet's data or structure: in the editor pick `backup` and **Run**. It saves a dated copy of the whole spreadsheet to your Drive and logs its link. (Or use **File > Make a copy**.)
