# Prototype code

The three games as built on 2026-10-29, copied unchanged from the `games-wip` branch (commit `7ef1ff0`), with only what they need from that branch's launcher. Two things differ from the branch:

- `shared/config.js`: the family's Apps Script link is replaced by a placeholder, so nothing here can reach the real Sheet.
- `index.html`: a plain list of the three games instead of the launcher.

**Run the games**

```
python3 -m http.server 8000
```

Open http://localhost:8000/ and pick a game. "Done" comes back to the list.

**Run their tests** (Python Playwright; each takes 2 to 10 minutes):

```
python3 -m http.server 8131 &
python3 tools/tests/e2e_word-worm.py /tmp/ww 8131
python3 tools/tests/e2e_rocket-lander.py /tmp/rl 8131
PORT=8131 python3 tools/tests/e2e_monster-cafe.py /tmp/mc
```

They play rounds against a stand-in for the Sheet (`tools/tests/standin.py`) and save screenshots in the folder given. All three passed on 2026-11-08.

**What's what**

| Path | What it is |
|---|---|
| `games/<id>/` | Each game. Its `settings.js` lists its settings in the old format. |
| `shared/game-kit.js` | The old launcher's game kit: player, settings, progress, saving rounds |
| `shared/settings.js` | How the old design worked out settings per child |
| `shared/sound.js` | The sound effects and speech. Copy this into each game on the new contract |
| `shared/api.js`, `config.js`, `achievements.js` | Needed by the game kit; not part of the new contract |
| `shared/icons.js` | The launcher's tile pictures, including `g-worm`, `g-cafe` and `g-rocket` |
| `tools/tests/` | The stand-in Sheet and each game's test |

On the new contract, games import none of `shared/` except `bridge.js`. See `../INTEGRATION.md`, section 10.
