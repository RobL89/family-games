# Family games

Simple, child-friendly browser games for the family, played on a tablet, phone or computer. Each child has a profile with recent scores and achievements, stored in a Google Sheet.

- **Plan and decisions:** [docs/PLAN.md](docs/PLAN.md)
- **Setting up the Sheet:** [docs/setup-sheet.md](docs/setup-sheet.md)
- **Grown-ups' connection check:** `tools/sheet-check.html`

## How it fits together

- `index.html`: the launcher (pick a player, see their profile, pick a game); a placeholder for now
- `games/<id>/`: one folder per game; `games/_template/` will be the starting point (not built yet)
- `shared/`: code every page uses (`config.js`, `api.js` for the Sheet; the shared theme comes with the launcher)
- `apps-script/Code.gs`: the Sheet's backend, pasted into Apps Script by hand

No build step: plain HTML, CSS and JavaScript, served by GitHub Pages.
