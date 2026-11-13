# Decisions

Every decision for the launcher, numbered for good: a P-number is never reused or renumbered, and code comments cite them. Rob decides; anything not marked adopted or declined is a proposal. How the launcher works today is in [PLAN.md](PLAN.md); what a game must do is in [game-contract.md](game-contract.md).

## Decisions log

| # | Decision | Status |
|---|---|---|
| P1 | Plain HTML, CSS and JavaScript, no build step | Adopted 2026-10-28 |
| P2 | Host on GitHub Pages | Adopted 2026-10-28 |
| P3 | Google Sheet reached through an Apps Script web app | Adopted 2026-10-28 |
| P4 | Folder layout above | Adopted 2026-10-28 |
| P5 | Sheet tabs: Profiles, Scores, Achievements | Adopted 2026-10-28 |
| P6 | Save on the device first, sync in the background | Adopted 2026-10-28 |
| P7 | Family code checked by the script | Adopted 2026-10-28 |
| P8 | Achievement rules in one repo file; the Sheet records unlocks | Adopted 2026-10-28; switched off 2026-11-12 (P48) |
| P9 | First names or nicknames and cartoon avatars only; no surnames or other personal data | Adopted 2026-10-28 (first names allowed by Rob) |
| P10 | Every call to the script is a POST, so the family code never sits in a link | Adopted 2026-10-28 |
| P11 | `.nojekyll` file so Pages serves folders starting with `_` (like `games/_template`) | Adopted 2026-10-28 |
| P12 | A grown-ups' check page at `tools/sheet-check.html` | Adopted 2026-10-28; page removed 2026-11-12, as the corner's Check connection does the same (P52) |
| P13 | Launcher flow | Adopted 2026-10-28; celebration and stars switched off 2026-11-12 (P48) |
| P14 | Look and feel: A sticker book (B and C declined); the mockup page was removed 2026-11-12 (git keeps it) | Adopted 2026-10-28 |
| P15 | Original cartoon-animal avatars plus colour | Adopted 2026-10-28 |
| P16 | Starter badge set, locked ones shown greyed with "?" | Adopted 2026-10-28; switched off 2026-11-12 (P48) |
| P17 | Stars as the headline score, and as the points for skins | Adopted 2026-10-28; switched off 2026-11-12 (P48, P49) |
| P18 | Grown-ups' corner behind press-and-hold and a sum | Adopted 2026-10-28 |
| P19 | Sounds with mute; "will sync" cloud icon | Adopted 2026-10-28 |
| P20 | Phone layout: games above badges | Adopted 2026-10-28 |
| P21 | Bonus theme skins unlocked with stars: Fairy, Unicorn, Blocks; launcher only | Adopted 2026-10-28 (Rob's idea); skins free from 2026-11-12 (P49) |
| P22 | Each skin is one CSS file that swaps colours, background and frames | Adopted 2026-10-28 |
| P23 | Skins tab in the Sheet holds skin names and star targets (start: 10, 20, 30) | Adopted 2026-10-28 (Rob's request); targets ignored from 2026-11-12 (P49) |
| P24 | Chosen skin saved in a `skin` column on Profiles; kept on the device if the Sheet can't save it | Adopted 2026-10-29 |
| P25 | Bubble pop as the first working game | Superseded 2026-10-29 by P35 |
| P26 | Placeholder "Soon" tiles: Memory match, Count it, Shape sort, Spot it | Adopted 2026-10-29 |
| P27 | Grown-ups' sum is a times-table question (3–9 × 3–9) | Superseded 2026-10-29 by P32 |
| P28 | Debug skin button, switched by `debug` in `shared/config.js` | Superseded 2026-10-29 by P34 |
| P29 | `setup()` makes a backup copy before it changes an existing Sheet | Adopted 2026-10-29 |
| P30 | Kriss Kross stars: no hints 3, one or two hints 2, more 1; showing the solution saves nothing | Adopted 2026-10-29; switched off 2026-11-12 (P48) |
| P31 | Richer skins: scenery, pictures and tap effects for Fairy, Unicorn and Blocks | Adopted 2026-10-28 (Rob's request) |
| P32 | Grown-ups' corner asks "Address of first house" instead of a sum | Adopted 2026-10-29 (Rob's request) |
| P33 | Keep only a one-way hash of that answer in the public repo | Adopted 2026-11-12 (built 2026-10-29; closed in phase A) |
| P34 | Skin preview switch lives in the grown-ups' corner, remembered per device | Adopted 2026-10-29 (Rob's request); switched off 2026-11-13 (P73) |
| P35 | Kriss Kross is the only live game; Bubble pop becomes a "Soon" tile | Adopted 2026-10-29 (Rob's request) |
| P36 | Game setup per player per game; Kriss Kross word lists with a default and Next | Adopted 2026-10-29 (Rob's request) |
| P37 | Lists stored in a GameLists tab, one row per list, script 0.3.0 | Adopted 2026-11-12 (built 2026-10-29; closed in phase A); lists become per child in script 0.4.0 (P56) |
| P38 | Kriss Kross opens on the default list every visit (it doesn't remember the last list); Next also appears after "Show solution" | Adopted 2026-11-12 (built 2026-10-29; closed in phase A) |
| P39 | List changes save to the Sheet straight away; if a save fails, nothing changes | Adopted 2026-11-12 (built 2026-10-29; closed in phase A) |
| P40 to P47 | Used on the `games-wip` branch for the parked games, now P-034's; not reused here | (see `games-wip`) |
| P48 | No launcher stars or stickers, and no currency carried between games. A child picks their profile, then sees the games. Stars, stickers, "Last played", tile stars and the celebration are switched off and hidden, not deleted. Results are no longer sent to the Scores tab, and there is no grown-ups' progress page (B2) | Adopted 2026-11-12 (Rob's direction) |
| P49 | Every skin is free to use; the Skins tab's star targets are ignored | Adopted 2026-11-12 (Rob's direction) |
| P50 | The wrapper (game shell) stays simple: a slim bar with the home button and the child's animal face, the game underneath; no end-of-round panel, level chip or stars (B3) | Adopted 2026-11-12 (Rob's direction) |
| P51 | A game keeps its own progress and rewards per child. It hands them to the shell, which keeps them on the device at first and saves them to the Sheet once script 0.4.0 is live, with no change to the games (B1) | Adopted 2026-11-12 |
| P52 | Hide, don't delete: unused features are switched off in one place and hidden. Stale files (the old repo handoff, old mockups, `.pyc` files, the second connection-check page) may still be removed, as long as the app looks correct and tidy (B5) | Adopted 2026-11-12 |
| P53 | The launcher project (P-020) and this repo are the master host of every game. P-034 develops games and hands each finished one to P-020, which adds it to the launcher. Folders, branches and the release route: `docs/game-contract.md` 0.4, sections 2 and 7 (agreed 2026-11-12) | Adopted 2026-11-12 (Rob's direction) |
| P54 | Artifact games come in through P-020: the launcher keeps a copy that is what the children play. When the maker updates hers, Rob tells P-020, which retakes the copy (B4) | Adopted 2026-11-12 (Rob's direction) |
| P55 | The launcher's stages, in order: 1 housekeeping (phase A); 2 the simple wrapper, with stars and stickers switched off and skins free; 3 Kriss Kross through the wrapper; 4 a test bed, cut down to what the script change needs; 5 script 0.4.0, then clear the grown-up test rows (Q13). Dropped: launcher levels, the sticker book, progress reports and the goal bar (review S1 to S4, S6, U1, U7) | Adopted 2026-11-12 |
| P56 | One set of word lists per child, shared by every word game that asks for them (GQ3); GameLists moves from per child per game to per child in script 0.4.0 | Adopted 2026-11-12 |
| P57 | Rob tries launcher changes in a private preview before he says publish: a claude.ai artifact built from `work` by `tools/preview/build_preview.py`, with a stand-in Sheet in the browser (made-up players; the real Sheet is never touched). Sound after a tap, the bar on a real phone and the real Sheet are checked on the live site after publishing. Checked 2026-11-12 on Rob's PC: in an artifact, game frames, same-site messages, `?game=` in a frame's address, module scripts and device storage all work | Adopted 2026-11-12 |
| P58 | Wrapper check (`games/wrapper-check/`) stays as a launcher tool listed as `testing`: it shows what the wrapper sends and saves, and appears only where the Testing switch is on | Adopted 2026-11-12 |
| P59 | Kriss Kross opens on its own page (`"opens": "own-page"` in `games.json`) until stage 3 moves it into the wrapper; the launcher's hook at the bottom of its file no longer mentions stars | Adopted 2026-11-12 |
| P60 | The wrapper's bar shows the child's name beside their face (as in the mockup), with ⌂ Home | Adopted 2026-11-12 |
| P61 | Until script 0.4.0, a word game with no lists of its own gets the child's lists from another game (one set per child, as P56) | Adopted 2026-11-12 |
| P62 | The skin picker opens from the child's face on their home screen; the home screen shows only the games | Adopted 2026-11-12 (Rob's request) |
| P63 | Skins on the live site: left as they are until script 0.4.0. Script 0.3.0 still refuses a skin without the stars, so until then a child's skin choice is kept on that device only; the Sheet's Skins tab is not changed | Adopted 2026-11-12 |
| P64 | The review folder `docs/review/` is retired now that the wrapper is built: its outcomes are in this log, and git keeps it (last at `48c01aa`). The games pack's mentions of it are left as they are (P-034 pins the pack) | Adopted 2026-11-12 |
| P65 | The four "Soon" placeholder tiles and Bubble pop are hidden when the first released game goes live (set their status so they don't show; nothing deleted, P52) | Adopted 2026-11-12; brought forward the same day: hidden (status `hidden`) when the three artifact games go live (Rob's answer) |
| P66 | Kriss Kross: each child starts with their default list from the Sheet, and can also make their own lists with Edit words. The last five a child builds are saved per child as the game's own state (`fg:state`): on the device now, in the Sheet from script 0.4.0. A "Your lists" card on the word screen shows the grown-ups' lists and the child's own | Adopted 2026-11-12 (Rob's answer) |
| P67 | An artifact game's adapter is added to the maker's page by the wrapper (`game.json` `"adapter"`), once the page's HTML has been read and again after a reload, so the page is never edited. With sound off in the grown-ups' corner, the adapter silences the game's sounds and speech (`games/_common/sound-off/`, GC7) | Adopted 2026-11-12 (Rob's answer on sound off) |
| P68 | Kriss Kross, Space Explorer and Number Town (artifact games) join the launcher as `testing`, then `ready` when Rob says publish. Rob checked that none of Number Town's townspeople's names are family names | Adopted 2026-11-12 |
| P69 | How an artifact game is taken: in the browser pane, Duplicate the maker's artifact into Rob's account, Export the copy as HTML ("Standalone web page"), and copy that file in unchanged as `original.html`. The maker's version is read from the viewer when the link is opened. The export's page title ends "(Copy)"; nothing else is known to differ | Adopted 2026-11-12 (Rob chose the route) |
| P70 | Number Town: one explorer per child (on each device). The adapter shows the game only that child's explorer, keeps which one is theirs as the game's state (`fg:state`), and hides the game's "Who's playing?" and "Switch explorer". A child without one makes it first, with their name filled in; "Change my look" still edits everything | Adopted 2026-11-12 (Rob's direction) |
| P71 | Space Explorer: "Find me" sets the place to London, England, and never asks for the device's location; the child can still pick another town | Adopted 2026-11-12 (Rob's direction) |
| P72 | Kriss Kross's adapter adds a Print button on its print screen, which prints just the game, not the whole wrapper (claude.ai blocks printing, so it's checked on the live site) | Adopted 2026-11-12 |
| P73 | The grown-ups' "Debug skin" button (bottom right) and its tick-box in the corner are switched off for every device by `features.skinPreview`, whatever a device saved: skins are free and the picker already lets a child try them (P49, P62). Hidden, not deleted (P52) | Adopted 2026-11-13 (Rob's request after his live check of stage 3) |
| P74 | When a child picks their picture, the launcher re-reads their profile and word lists from the Sheet, so lists set up on another device are there for their first game | Adopted 2026-11-13 (Rob's answer) |
| P75 | Stage 4 (P55) cut further and done at the start of the stage 5 chat: the real `Code.gs` runs in Node, unchanged, against a small in-memory stand-in for the Google services it uses, with pass-or-fail checks of only what script 0.4.0 changes (game state, one set of lists per child and moving the old lists, skins without the star check, `setup` only adding). Dropped: checks of unchanged calls, moving the browser tests onto the real script, and a test on a real Google copy. The dry run on a local copy of the live Sheet happens in stage 5, before the change | Adopted 2026-11-13 (Rob's answer) |
| P76 | Number Town's progress kept on each device only (`games.json` `"state": "device"`) | Declined 2026-11-13: Rob chose P77 |
| P77 | Number Town's explorer follows the child: its whole save (look, stars, dotlings, things, house) is the game's progress for that child, through the Sheet. Done by a shared helper, `games/_common/keep-progress/`, which any artifact game that saves in its own storage can use: the adapter says how to read and write the child's progress; the helper passes changes on, puts newer progress back (reloading the game once, with the game's own saves ignored until then), and never overwrites progress this device hasn't passed on unless another device saved later. The first time after the change, each child keeps the explorer of the device where they first open Number Town; others stay saved on their device, hidden | Adopted 2026-11-13 (Rob's direction: "option B now") |
| P78 | When a game's progress goes to the Sheet: kept on the device at once; sent within 30 seconds of a change, never more often; at once on ⌂ Home and when the page is hidden (screen off, another app, tab closed); offline, it waits for the launcher's next refresh. Each save carries when it was made and the newest wins, on the device and in the Sheet (a time in the future counts as now). As a game opens, the child's profile is re-read (waiting at most 3 seconds) so progress from another device is there | Adopted 2026-11-13 |
| P79 | No Save button on the wrapper: saving needs nothing from the child, a button would suggest nothing is saved without it, and the bar stays as P50. In-game saves (Number Town's bed) reach the Sheet like any other | Adopted 2026-11-13 (Rob's answer) |
| P80 | A one-page checklist for taking in an artifact game, `games/_common/README.md`: what to look for in the maker's page (its own storage, when it saves, its own players, sound, buttons, permissions, other sites, names, settings) and what each answer means, plus the release checks to add. Written from this chat's lessons | Proposed 2026-11-13 (Rob asked for lessons learnt to be recorded) |

## From the review (Rob's answers, 2026-10-30)

The review (`docs/review/REVIEW.md`, retired by P64; in git history up to `48c01aa`) asked Q4 to Q19. Still in force: Q4 push to `work`, publish = merge into `main` · Q9 one handoff, a project doc · Q10 every game runs in the wrapper · Q11 no kid mode for Kriss Kross · Q12 one general Settings tab, word lists in GameLists · Q13 clear the grown-up test rows after script 0.4.0 · Q14 Android phone (Chrome) and Windows PC · Q15 read aloud, behind the sound switch · Q17 Kriss Kross lists stay lists · Q18 an optional tips sheet for artifact-game makers. Replaced by P48: Q5 to Q7 (levels, sticker book, goals) and Q16 (everything a sticker).

## Open questions

- The Blocks skin's final name (TBC).
