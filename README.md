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
