# Setting up the Google Sheet

About 10 minutes, once. Menu names below were checked against Google's Apps Script docs on 2026-10-28; if something on screen is worded differently, go by the meaning.

## What this sets up

```
Game in the browser ──POST──▶ Apps Script web app ──▶ Google Sheet
                              (checks family code)     Profiles · Scores · Achievements
```

The Sheet will hold nicknames, cartoon avatar choices, scores and badges only. No real names, birthdays or photos (decision P9).

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
3. The execution log should list: three tabs added (Profiles, Scores, Achievements), header rows added, and "FAMILY_CODE is set".

`setup` only adds missing tabs and headers. It never changes a tab that already has data.

## 5. Deploy as a web app

1. Top right: **Deploy > New deployment**.
2. Next to **Select type**, click the settings icon and choose **Web app**.
3. Execute as: **Me** (the script uses your access to the Sheet).
4. Who has access: the option that lets anyone use it **without signing in to Google** (in Google's settings file this is called `ANYONE_ANONYMOUS`; on screen it is usually just "Anyone"). The kids' tablets won't be signed in, and the family code is what keeps strangers out.
5. **Deploy**, then copy the **Web app URL** (it ends in `/exec`).
6. Send that URL to Claude, or paste it into `shared/config.js` yourself. The URL isn't secret; the family code is.

## 6. Check it works

1. Open `tools/sheet-check.html` on the GitHub Pages site.
2. Enter the family code, **Save code**, then **Check connection**. You should see `ok: true`.
3. Optional: **Add test player** and **Send test score**. Each adds exactly one row; delete them from the Sheet afterwards if you like.

## Changing the script later

Editing the code doesn't change the live web app until you redeploy:
**Deploy > Manage deployments**, select the deployment, **Edit**, choose a new version, **Deploy**. The URL stays the same.

## Backups

Before any change to the Sheet's data or structure: in the editor pick `backup` and **Run**. It saves a dated copy of the whole spreadsheet to your Drive and logs its link. (Or use **File > Make a copy**.)
