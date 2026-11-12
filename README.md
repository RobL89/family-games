# Family games

Simple, child-friendly browser games for the family, played on a phone or a computer. A child picks their profile and plays the games, each inside a simple wrapper. Profiles and skins are kept in a Google Sheet.

- **How it works:** [docs/PLAN.md](docs/PLAN.md) · **Decisions:** [docs/decisions.md](docs/decisions.md)
- **Making or adding a game:** [docs/game-contract.md](docs/game-contract.md)
- **Setting up or updating the Sheet:** [docs/setup-sheet.md](docs/setup-sheet.md)

## Folders

| Path | What |
|---|---|
| `index.html`, `shared/` | The launcher: who's playing, home, grown-ups' corner, skins, talking to the Sheet |
| `play.html`, `shared/bridge.js` | The wrapper every game runs in, and what a game includes to talk to it (stage 2) |
| `games.json` | The list of games: order, status and where each came from |
| `games/<id>/` | One folder per game: `game.json`, `icon.svg`, a one-page `README.md` and its files |
| `games/_common/` | Code several games share |
| `apps-script/Code.gs` | The Sheet's backend, pasted into Apps Script by hand |
| `tools/tests/` | Browser tests against a stand-in Sheet; each game's release check in `tools/tests/games/<id>/` |
| `docs/` | How it works, decisions, the game contract, Sheet setup; `games-pack/` and `review/` are background |

No build step: plain HTML, CSS and JavaScript, served by GitHub Pages.

## Tests

Needs Python Playwright. From the repo root, serve the site with `python3 -m http.server 8123 --bind 127.0.0.1`, then run a test, for example `GROWNUP_ANSWER='<the answer>' python3 tools/tests/e2e_launcher.py <folder for screenshots>`. No real Sheet is touched.

## For other projects

- **What's here:** a family games launcher (profiles, free skins and a simple wrapper) and every game it hosts, with a Google Sheet behind an Apps Script web app. P-020 (Family Games Launcher) owns all of it and is the only project that publishes.
- **Making a game for it:** build to [`docs/game-contract.md`](docs/game-contract.md), then release it to P-020 by board note (section 7). P-020 copies it from your commit onto `work`.
- **Branches:** `main` is the live site; `work` is P-020's; a games project's own branches are its workshop, copied from and never merged; `games-wip` is a record of three parked games.
