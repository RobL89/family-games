# The private preview (P57)

Rob tries launcher changes here before he says "publish". The preview is a private claude.ai artifact made from the launcher's own files on `work`. The only change: a claude.ai page can't call other sites, so the Apps Script is swapped for a stand-in Sheet (`preview-sheet.js`) that keeps made-up players (Sam and Alex) in the browser. The real Sheet is never touched.

**Build it** (from the repo root, after pushing to `work`):

```
python3 -B tools/preview/build_preview.py --number <n>
```

It writes the build outside the repo (`../family-games-preview/`) with `files.json`, the list Claude publishes with `publish_files` to the same artifact each time, in `replace` mode so old files go. The stamp under the home screen shows the preview number, the commit and a hash of the files. Its **Reset** link starts the stand-in's data again.

**What it shows:** everything in the launcher and the wrapper, with each device keeping its own stand-in data. Any family code works. The grown-ups' question is the real one.

**What it can't show** (check on the live site after publishing):
- sound after a tile tap on the phone (GC6): claude.ai frames the page, so its sound rules may differ
- the bar's exact height on the phone, under claude.ai's own bar
- the real Sheet, and the script's answers
