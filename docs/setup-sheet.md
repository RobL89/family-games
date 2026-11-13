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
| 0.3.0 (live) | GameLists tab, header row only |
| 0.4.0 (ready, not pasted yet) | Settings tab, header row only. Nothing else changes when `setup` runs (dry run on a copy, 2026-11-13). Publish the launcher **before** pasting it: the launcher works with 0.3.0 and 0.4.0, but the old launcher would lose its word lists with 0.4.0 |
