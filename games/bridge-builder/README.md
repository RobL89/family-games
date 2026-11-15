# Hamster Highway

Version 1.0 · 15 Nov 2026 · P-034 (Kids Games Development) · first build: levels 1 to 3 and the house picker.

A puzzle game with no timer and nothing to read. The child puts gadgets on a side-view board, presses
GO, and five round hamsters (the Nibbles) walk from the cardboard tube on the left to their seed
house on the right, one after another. A bridge crosses a gap, a ramp climbs a step, a bouncer
throws them up high. A drop of three squares or more is a funny fall; a hamster stuck at a wall
has a nap and fades. All five home: a party, and the next level opens. Original art and sounds,
all made in code (D-010).

- **Runs on its own:** yes, as a plain page (contract 0.4.2 GC5). It is not linked to P-020's
  wrapper yet; that comes before its release.
- **Needs from the launcher:** nothing yet.
- **Folder:** `games/bridge-builder/` for now; the title is Hamster Highway (the id is open, Q-049).
- **Brief:** P-034's claude/bridge-builder/brief.md (0.3); decisions D-133 to D-141.

## How it plays

- **The house:** levels sit in a cross-section of a house and garden, each in a place drawn like
  the level (D-140). Levels open one after another. The view scrolls sideways.
- **Placing gadgets:** anywhere they fit (D-139): a bridge where a hamster would fall through, next
  to ground; a ramp, bouncer or floater on ground or a bridge. On the PC, drag one from the tray or
  click it and then a square; on a phone, tap then tap. A square that doesn't fit shows red.
  Clicking a placed gadget puts it back in the tray.
- **GO:** the hamsters follow the rules in `core.js` (brief 0.3, D-136). Gadgets stay where they
  are between tries.
- **Golden seeds (D-138):** one per level. Level 1's is on the way; levels 2 and 3 hide theirs where
  the spare ramp has to go in just the right square. The house shows which seeds are found.
- **Little extras (D-141):** the duck quacks, jars wobble, the hamster in the tube peeks out, a
  tapped hamster squeaks, the marshmallow squishes, and things in the house answer a tap.

## Files

| File | What |
|---|---|
| `core.js` | The rules: the board, where gadgets fit, and each hamster's trip. Pure |
| `levels.js` | The levels, as text boards with their trays. Data only |
| `art.js` | The drawings, as SVG text. Pure |
| `house.js` | The house-and-garden picker and the title card, as SVG text. Pure |
| `sound.js` | Sounds made in the browser (helpers copied from Rocket Lander's) |
| `game.js` | The screens, taps and animation |
| `index.html`, `style.css` | The page |

Progress (levels done, seeds found) is kept only while the page is open: the data map has no row
for it yet (Q-051).

## Checks

`tools/tests/games/test_bridge_builder_core.py` (fast: the rules, the levels, the seeds, the
boundaries) and `tools/tests/games/test_bridge_builder_e2e.py` (in a browser: the house, placing by
mouse and by drag, a full run with a party, a failed run, and the page at PC and phone sizes).

## Change log

| Version | Date | Changes |
|---|---|---|
| 1.0 | 2026-11-15 | First build: levels 1 to 3, the house picker, golden seeds |
