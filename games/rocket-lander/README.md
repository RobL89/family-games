# Rocket Lander

**Version 1.1** · 2026-11-15 · from P-034 (Kids Games Development), released to P-020 (Family Games Launcher) by board note.

**What's new in 1.1** (trial feedback item 1: "the dots are too small and there can be too many"): fewer things to count and bigger pictures. How many dots? asks 1 to 6, in rows of 3, on a line from 0 to 6; More or fewer shows 6 dots at most; the sharing levels, Half of a number and Fractions of numbers go up to 6, 10 or 12; Groups of shows a box for each group with its size in it; Doubles and halves to 20 uses the numbers alone; every counting picture is drawn bigger, and the rocket starts below the question's box however tall it is.

A number-line game: steer a falling rocket onto the number asked for. One game with a map of six solar systems, eight levels each (seven and a challenge round), on two tracks: "Reception, then Year 1" and "Year 2, then Year 3", 48 levels a track. Moon rocks from perfect landings buy ships in the hangar. All art and sounds are drawn in code; the font, Fredoka, ships in `games/_common/fonts/` with its licence.

**Files:** `index.html` and its modules here (the levels, questions and sums); the engine in `games/_common/rocket/` (round flow, map, scene, ships, hangar, sounds, and `link.js`, the link to the wrapper); the font in `games/_common/fonts/`; `game.json`, `icon.svg`, this README.

**What it needs from the launcher:**
- **Who's playing:** the child's first name, shown once on the track pick.
- **Sound on or off:** with sound off it makes no sound and says nothing.
- **Saving its own progress** through `fg:state` (contract section 4): the track, each track's map (place, levels open, best stars, rocks found), the moon rocks, landings and ships. The largest full save is 3,383 characters, 16.9% of the 20,000 limit.

It imports only `shared/bridge.js` from outside its folders (GC4). No word lists or other settings.

**Its own rules:**
- **The track:** the first time a child opens it in the launcher, a grown-up picks the track once. It's kept in that child's progress. Changing it later isn't built yet.
- **The map is home:** Play by the rocket, or tap any open level. Five of eight right (2 stars) opens the next level, and seven of eight earns 3 stars.
- **Its own end of round** (stars, rocks found, Map and Play again), and no Home of its own inside the wrapper: the bar's ⌂ Home is the way out.
- **Its own currency:** moon rocks and ships belong to the game.

**Running on its own:** opened directly, it plays with no pick (the track from `?track=`, this device, or the lower track), has its own Home button and keeps its progress on the device.

**Release check:** `tools/tests/games/rocket-lander/check.py`, with `harness.py`. It covers the three sizes under the bar, the track pick, the round's end card, progress out and back, a second child, sound off, a slow Sheet, two devices, and running on its own.

## Change log

| Version | Date | Changes |
|---|---|---|
| 1.0 | 2026-11-13 | First release to the launcher (stage 3, D-120, D-121) |
| 1.1 | 2026-11-15 | Fewer, bigger counting pictures, and the rocket's start below the question's box (feedback item 1, D-123 to D-127) |
