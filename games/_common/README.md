# Taking in or updating an artifact game (P80)

A short routine, learnt from Kriss Kross, Space Explorer and Number Town and the live bugs that followed (P81 to P83). The route for getting the page is P69; the maker's page is never edited, so everything here goes in the game's `adapter.js`, with the helpers in this folder.

## 1. Scan (a minute)

`python3 -I tools/scan_artifact.py games/<id>/original.html` lists its storage keys, when it saves, its own players, sound, permissions, buttons and other sites, with line numbers. Each finding names a row below. Then read its text for real names: Rob checks none are family names (P68).

## 2. Adapter: what each finding means

| Finding | In the adapter |
|---|---|
| **Storage** (keeps progress) | `keep-progress/` (P77): `read()` and `write()` this child's progress only. Pass the whole progress, never just an id (an id means something only on the device that made it). A fully played save must be under 20,000 characters: measure one. |
| **Saves on leaving** (blur, hiding, unload) | Expected. Before any reload the adapter makes, call `freezeStorage()`, or the game's copy in memory undoes the change (P82). |
| **Own players** ("Who's playing?") | Show only this child's (P70, P82): note on the device which is theirs; swap to it **as the page opens**, not after `fg:start`, which waits up to 3 s for the Sheet; never adopt one another child has; hide its switch button. |
| **Sound** or speech | `sound-off/` when sound is off (P67). |
| **Permissions** (location, camera) | Answer for it without asking (Space Explorer's "Find me", P71). |
| **Own buttons** (print, full screen, leaving) | Adapt or hide them; ⌂ Home is the way out (P50). Print: P72. |
| **Other sites** | Fonts need nothing. Anything else (three.js) goes in its README, and its check needs a local copy (`FG_THREE_JS`). |
| Word lists or grown-up settings | `"settings": ["word-lists"]` in `game.json` (P66). |

What the child sees before `fg:start` (the last child's view) needs nothing: the wrapper covers it (P83).

## 3. Prove it, then hand over

- **Its release check** (`tools/tests/games/<id>/check.py`, with `harness.py`; Number Town's is the fullest example): the three sizes, sound off, running on its own, and each adapter rule used.
- **Test with the Sheet as slow as the live one:** `c.hold = True`, open the game, then `c.release()`. Instant answers hid all three live bugs.
- **If it keeps progress or has players:** switch children on one device (2b in Number Town's check), and two devices with `Check(..., script='0.4.0')`, a change, ⌂ Home straight after, and the change arriving on the other device.
- **A new test must fail on the old code** before it's trusted: run it against `git show HEAD:<file>`.
- Run one check per command and tell Rob first: they take minutes.
- **Add the ids, classes and keys the adapter uses to `docs/maker-notes.md`,** so the maker's Claude keeps them.
- **Saves already made at the artifact link** (the children played there first): copy them in.
  1. Open the artifact in Chrome; right-click the game, Inspect, Console.
  2. Check you're in the game's frame: `location.host + ' / ' + Object.keys(localStorage).length`.
  3. `copy(JSON.stringify(Object.fromEntries(Object.keys(localStorage).filter(k => k.startsWith('<prefix>')).map(k => [k, localStorage.getItem(k)]))))`, with the game's key prefix from the scan, and paste it in the chat.
  4. Write those keys into the launcher's storage in Rob's Chrome, plus anything the adapter notes (Number Town: `fg.numberTown.mine.<child>`), then open the child's game once so it reaches the Sheet.

## "Update <game>"

Keep the old page, save the new one as `original.html`, then:
`python3 -I tools/scan_artifact.py <old page> games/<id>/original.html games/<id>/adapter.js`.
It says if storage keys changed (saved progress may not be read) or the adapter's ids and classes went (fix the adapter first), and exits 1 if so. Scan the new page alone for anything new, run its release check, and list it as `testing`.
