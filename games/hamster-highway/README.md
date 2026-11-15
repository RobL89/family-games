# Hamster Highway

Version 1.2 · 15 Nov 2026 · P-034 (Kids Games Development) · levels 1 to 3, the house picker, saving and the wrapper link.

Changes at v1.2 (step 2, D-147): progress is saved, on its own and through P-020's wrapper; sound follows the wrapper.

A puzzle game with no timer and nothing to read. The child puts gadgets on a side-view board, presses
GO, and five round hamsters (the Nibbles) walk from the cardboard tube on the left to their seed
house on the right, one after another. A bridge crosses a gap, a ramp climbs a step, a bouncer
throws them up high. A drop of three squares or more is a funny fall; a hamster stuck at a wall
has a nap and fades. All five home: a party, and the next level opens. Original art and sounds,
all made in code (D-010).

- **Runs on its own:** yes, as a plain page (contract 0.4.2 GC5), saving to the device.
- **Needs from the launcher:** sound on or off, and saving its progress (`fg:state`, contract
  section 4), through `games/_common/rocket/link.js` and `shared/bridge.js`. Who's playing isn't used.
- **Folder:** `games/hamster-highway/`, the game's id (D-146; it was `bridge-builder` until 15 Nov).
- **Brief:** P-034's claude/hamster-highway/brief.md; decisions D-133 to D-147.

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
| `progress.js` | What is saved: levels done, seeds found, GO presses until each level is first done. Pure |
| `game.js` | The screens, taps and animation; saving and the wrapper link |
| `index.html`, `style.css` | The page |

**Progress (D-147, P-034's data map 1.9):** format 1, `{ v: 1, done, seeds, tries }`, no name or age. On its
own, one localStorage entry, `family-games:hamster-highway:progress`; a broken or unknown entry starts
afresh. In the wrapper it comes in with `fg:start` and goes out with `fg:state` at each GO and party,
and nothing is kept on the device. Sound off in the wrapper mutes the game and hides its sound button.

## Checks

`tools/tests/games/test_hamster_highway_core.py` (fast: the rules, the levels, the seeds, the
boundaries) and `tools/tests/games/test_hamster_highway_e2e.py` (in a browser: the house, placing by
mouse and by drag, a full run with a party, a failed run, saving and reloading, a stand-in wrapper,
and the page at PC and phone sizes).

## Change log

| Version | Date | Changes |
|---|---|---|
| 1.2 | 2026-11-15 | Saving (D-147) and the wrapper link |
| 1.1 | 2026-11-15 | The id is `hamster-highway` (D-146): folder and tests renamed |
| 1.0 | 2026-11-15 | First build: levels 1 to 3, the house picker, golden seeds |
