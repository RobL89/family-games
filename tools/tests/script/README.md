# Script test bed (stage 4, P75)

Runs the real `apps-script/Code.gs`, unchanged, in Node 22 against a small in-memory stand-in for the Google services it uses. Nothing here reaches Google or the real Sheet.

```
node tools/tests/script/check.js
```

The last line is `PASS n of n` or `FAIL k of n`, with a line above it for each failing check. To run the checks against another copy of the script (an older version, say): `--script <file>`.

## Files

- `google.js`: the stand-ins. Only what `Code.gs` uses: `SpreadsheetApp` (spreadsheet, tabs, ranges), `PropertiesService`, `Utilities`, `Logger`, `LockService`, `ContentService`. The file's header says how its Sheet behaves like the real one (sizes must match, text that looks like a number becomes a number, the 50,000-character cell limit).
- `bed.js`: loads `Code.gs` into a fresh script and a fresh Sheet for each check. Its made-up Sheet is shaped like script 0.3.0's, with players Sam and Alex.
- `check.js`: the checks.

## What is checked

Only what script 0.4.0 changes (P75):
- each game's saved state per child, in the Settings tab (P51)
- one set of word lists per child, and moving a child's old per-game lists when they're next saved (P56)
- skins saved without the star check (P49, P63)
- `setup` only adding tabs, header rows and columns, with a backup first
- the bed itself: the first check fails if `Code.gs` starts using a Google service or method the stand-ins don't cover

Not checked (dropped by P75): calls that 0.4.0 doesn't change, the browser tests on the real script, and a run on a real Google copy.
