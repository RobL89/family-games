# Hamster Highway

Version 1.12 · 16 Nov 2026 · P-034 (Kids Games Development) · levels 1 to 10, the house picker, help cards, saving and the wrapper link.

Changes at v1.12 (step 8, D-167, D-168, D-170, D-171): help cards, a looping picture of each gadget and part at work with a caption of 3 to 6 words (on screen only), popping up once per child the first time a level brings it in, and any time by the "?" button and a tap on the gadget; progress format 2 keeps the cards seen. Not yet released.

Changes at v1.11 (D-165): its release check, `tools/tests/games/hamster-highway/check.py` (contract GC7.6); released to P-020 (Family Games Launcher). The game itself is unchanged.
Changes at v1.10 (D-163): a teacup takes two hamsters side by side; the second waits a moment at the top before stepping out.
Changes at v1.9 (step 4, D-157, D-160, D-161): level 9 (the shed, 20 squares) brings in the teacup lift: a string looped round two cotton reels with two teacups on it, one waiting at the bottom while the other waits at the top; a hamster steps into an empty cup, rides up inside it and steps out, the others queue. Level 10 (the treehouse, 24 squares), the finale, uses every gadget but the worn stick, the see-saw and the lift.
Changes at v1.8 (step 4, D-156, D-158): level 8 (the veg patch), the first wide level, 18 squares: the board slides sideways (swipe it, tap the big arrows, or hold a gadget at its edge; during a run it follows the hamsters). The see-saw: two hamsters on its high end tip it, it stays tipped and carries whoever is on it, so a ramp is needed to step onto its raised end.
Changes at v1.7 (step 3, D-153, D-154): levels 6 (the bath) and 7 (the loft's rafters) with the worn lolly stick, a sixth gadget: pale and a little cracked, it cracks under each hamster and snaps under the fourth, so a second stick underneath must catch the last two; nothing goes on it. GO plays the timed model.
Changes at v1.6 (step 3's spike, D-144): `core.js` 1.1 moves all five hamsters together, tick by tick (`run()`), so a moving part can matter; a teacup lift is ready in the rules, not yet in a level.
Changes at v1.5 (D-151): every stop planned (house.js's PLAN): bath, loft, roof and drainpipe, garden; a simple loft and drainpipe drawn.
Changes at v1.4 (D-150): the bedroom is upstairs right, so the house's path never doubles back.
Changes at v1.3 (step 2, D-145, D-149): levels 4 (the floater, in the living room) and 5 (the tube, in the
bedroom), each with its own backdrop; tubes on the board join up.
Changes at v1.2 (step 2, D-147): progress is saved, on its own and through P-020's wrapper; sound follows the wrapper.

A puzzle game with no timer and nothing to read. The child puts gadgets on a side-view board, presses
GO, and five round hamsters (the Nibbles) walk from the cardboard tube on the left to their seed
house on the right, one after another. A bridge crosses a gap, a ramp climbs a step, a bouncer
throws them up high, a dandelion floater lets them drift down, a tube carries them along it, and a worn lolly stick holds three hamsters, then snaps. A drop of three squares or more is a funny fall; a hamster stuck at a wall
has a nap and fades. All five home: a party, and the next level opens. Original art and sounds,
all made in code (D-010).

- **Runs on its own:** yes, as a plain page (contract 0.4.2 GC5), saving to the device.
- **Needs from the launcher:** sound on or off, and saving its progress (`fg:state`, contract
  section 4), through `games/_common/rocket/link.js` and `shared/bridge.js`. Who's playing isn't used.
- **Folder:** `games/hamster-highway/`, the game's id (D-146; it was `bridge-builder` until 15 Nov).
- **Brief:** P-034's claude/hamster-highway/brief.md; decisions D-133 to D-154.

## How it plays

- **The house:** levels sit in a cross-section of a house and garden, each in a place drawn like
  the level (D-140). Levels open one after another, along a path that never crosses itself (D-150, D-151). Every stop to level 10 is planned in `house.js`'s `PLAN`. The view scrolls sideways.
- **Placing gadgets:** anywhere they fit (D-139): a bridge where a hamster would fall through, next
  to ground; a ramp, bouncer or floater on ground or a bridge; a tube in any empty square. On the PC, drag one from the tray or
  click it and then a square; on a phone, tap then tap. A square that doesn't fit shows red.
  Clicking a placed gadget puts it back in the tray.
- **GO:** the hamsters follow the rules in `core.js` (brief 0.3, D-136). Gadgets stay where they
  are between tries.
- **Golden seeds (D-138):** one per level. Level 1's is on the way; each later level carries one spare
  gadget, and the seed needs it in just the right square: level 2's spare ramp before the seed, level 3's
  where they land, level 4's spare bridge beside the ledge so they float down past it, level 5's fourth
  tube on top of the other three; level 9's spare bridge makes the bench one longer, level 10's spare ramp reaches
  up in the treehouse. `tools/tests/games/solve_hamster_highway.py` tries every placement to show
  it (level 10, too big for that, near its answer). The house shows which seeds are found.
- **Help cards (D-167, D-168, D-170):** the first time a child opens a level that brings in a gadget or part (the
  bridge, ramp, bouncer, floater, tube, worn stick, see-saw or teacup lift), its card pops up over the dimmed board: a
  picture of it at work that loops every 5 to 6.5 seconds, a short caption (on screen only; the game says nothing
  aloud) and a green tick to close it. It pops up once per child. Any time while building, the "?" at the board's top
  right puts a "?" on each gadget in the tray and on the see-saw or lift; a tap on one shows its card.
- **Little extras (D-141):** the duck quacks, jars wobble, the hamster in the tube peeks out, a
  tapped hamster squeaks, the marshmallow squishes, and things in the house answer a tap.

## Files

| File | What |
|---|---|
| `core.js` | The rules: the board (12 to 24 wide), where gadgets fit, each hamster's trip, and all five together, tick by tick, with any teacup lift (one or two cups) or see-saw (`run()`). Pure |
| `levels.js` | The levels, as text boards with their trays. Data only |
| `art.js` | The drawings, as SVG text. Pure |
| `house.js` | The house-and-garden picker and the title card, as SVG text. Pure |
| `sound.js` | Sounds made in the browser (helpers copied from Rocket Lander's) |
| `progress.js` | What is saved: levels done, seeds found, GO presses until each level is first done, help cards seen. Pure |
| `cards.js` | The 8 help cards: their scenes, captions and CSS keyframes (classes all `hc-`), as text. Pure; imports only `art.js` |
| `game.js` | The screens, taps and animation; saving and the wrapper link |
| `index.html`, `style.css` | The page |

**Progress (D-147, D-171, P-034's data map 1.10):** format 2, `{ v: 2, done, seeds, tries, cards }`, no name or
age; format 1 (without `cards`) is still read, with no cards seen. On its own, one localStorage entry,
`family-games:hamster-highway:progress`; a broken or unknown entry starts afresh. In the wrapper it comes in with `fg:start` and goes out with `fg:state` at each GO and party,
and when a card is first seen, and nothing is kept on the device. Sound off in the wrapper mutes the game and hides its sound button.

## Checks

`tools/tests/games/test_hamster_highway_core.py` (fast: the rules, the levels, the seeds, the
boundaries, the cards' captions and CSS), `tools/tests/games/test_hamster_highway_cards_e2e.py` (in a browser: each
card once per child, help, the wrapper, phones by touch, nothing spoken) and `tools/tests/games/test_hamster_highway_e2e.py` (in a browser: the house, placing by
mouse and by drag, a full run with a party, a failed run, saving and reloading, a stand-in wrapper,
and the page at PC and phone sizes). The release check, `tools/tests/games/hamster-highway/check.py`, plays level 1
through P-020's wrapper on its `harness.py` (the three sizes, saving, a second child, sound off, a slow Sheet, two
devices, and on its own).

## Change log

| Version | Date | Changes |
|---|---|---|
| 1.12 | 2026-11-16 | Help cards and the help button; progress format 2 (D-167, D-168, D-170, D-171) |
| 1.11 | 2026-11-15 | Its release check; released to P-020 (D-165) |
| 1.10 | 2026-11-15 | Two hamsters a teacup (D-163) |
| 1.9 | 2026-11-15 | Levels 9 and 10, the teacup lift with two cups (D-157, D-161) |
| 1.8 | 2026-11-15 | Level 8, wide boards and the see-saw (D-156, D-158) |
| 1.7 | 2026-11-15 | Levels 6 and 7, the worn stick (D-153, D-154) |
| 1.6 | 2026-11-15 | The timed model (D-144) |
| 1.5 | 2026-11-15 | Every stop planned; the loft and drainpipe (D-151) |
| 1.4 | 2026-11-15 | The house's path one way (D-150) |
| 1.3 | 2026-11-15 | Levels 4 and 5, their backdrops (D-145, D-149); joined tubes |
| 1.2 | 2026-11-15 | Saving (D-147) and the wrapper link |
| 1.1 | 2026-11-15 | The id is `hamster-highway` (D-146): folder and tests renamed |
| 1.0 | 2026-11-15 | First build: levels 1 to 3, the house picker, golden seeds |
