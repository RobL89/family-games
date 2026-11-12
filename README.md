# Family games

Simple, child-friendly browser games for the family, played on a phone or computer. Each child has a profile with stars, badges, recent games and unlockable skins, stored in a Google Sheet.

- **Plan and decisions:** [docs/PLAN.md](docs/PLAN.md)
- **Setting up the Sheet:** [docs/setup-sheet.md](docs/setup-sheet.md)
- **Grown-ups' connection check:** `tools/sheet-check.html`

## How it fits together

- `index.html` + `shared/launcher.js`: the launcher (who's playing, home screen, grown-ups' corner)
- `games.json`: the list of games and "coming soon" tiles
- `games/<id>/`: one folder per game; copy `games/_template/` to start a new one; `games/bubble-pop/` is the first
- `shared/`: code every page uses: `api.js` for the Sheet, `game-kit.js` for games, `theme.css` and `skins/` for the look
- `apps-script/Code.gs`: the Sheet's backend, pasted into Apps Script by hand

No build step: plain HTML, CSS and JavaScript, served by GitHub Pages.

## For other projects

- **What's here:** a family games launcher (profiles, free skins and a simple wrapper) and every game it hosts, with a Google Sheet behind an Apps Script web app. P-020 (Family Games Launcher) owns all of it and is the only project that publishes.
- **Making a game for it:** build to [`docs/game-contract.md`](docs/game-contract.md), then release it to P-020 by board note (section 7). P-020 copies it from your commit onto `work`.
- **Branches:** `main` is the live site; `work` is P-020's; a games project's own branches are its workshop, copied from and never merged; `games-wip` is a record of three parked games.
