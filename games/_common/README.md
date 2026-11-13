# Taking in an artifact game: what to check (P80, proposed)

The route for taking one in is P69; this is what to look for in the game once it's here, and what each answer means. Learnt from Kriss Kross, Space Explorer and Number Town. The maker's page is never edited: everything below is done in the game's `adapter.js`, with the helpers in this folder.

| Check in `original.html` | If yes |
|---|---|
| **Keeps progress in its own storage?** Search for `localStorage` and list its keys. | Use `keep-progress/` (P77): `read()` and `write()` for this child's progress only. Pass the whole progress, never just an id: an id only means something on the device that made it (the Number Town lesson). Measure a fully played save; the most is 20,000 characters. |
| **Saves on losing focus, on being hidden, or as the page unloads?** Search for `blur`, `visibilitychange`, `pagehide`, `unload`. | Expected and fine: `keep-progress` ignores the game's saves while it reloads to put progress back. In tests, change progress through the game itself while it's open: a change made straight to storage is overwritten by the game's copy in memory. |
| **Reads its storage only as it opens?** (Most do.) | Putting progress back needs one reload; `keep-progress` does it, guarded so it never loops. |
| **Has its own players or "Who's playing?"** | Show it only this child's (Number Town, P70): note on the device which one is theirs, set the game's list before it starts, hide its switch button. |
| **Makes sound or speaks?** | `sound-off/` when sound is off (P67). |
| **Has its own home, back, print or full-screen buttons?** | Hide or adapt them in the adapter (Kriss Kross print, P72). The wrapper's ⌂ Home is the way out (P50). |
| **Asks for location, camera or other permissions?** | Answer for it without asking (Space Explorer's "Find me", P71). |
| **Loads from other sites** (a CDN, fonts)? | Note it in its README; its release check needs a local copy to test (for example `FG_THREE_JS`). |
| **Names of real people** in its text? | Rob checks none are family names (P68): the repo is public. |
| **Word lists or other grown-up settings?** | `"settings": ["word-lists"]` in `game.json`; the adapter hands the lists over (Kriss Kross, P66). |

**Its release check** (`tools/tests/games/<id>/check.py`, with `harness.py`): the three sizes, sound off, running on its own, and each adapter rule above. If it keeps progress, add two devices: two browser contexts with `Check(..., script='0.4.0')`, a change in the game, ⌂ Home straight after it, and the change arriving on the other device (Number Town's check is the example). Run a new check a few times: timing problems show up only now and then.
