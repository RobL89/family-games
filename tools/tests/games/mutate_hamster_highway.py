"""Bench, not part of the close: plants faults in Hamster Highway's first build and counts how many the
tests catch (project rules: test the tests). Version 1.20 (27 Nov, step 18b (ii)).
Changes at v1.20 (step 18b (ii), D-240, D-241, D-243): nine faults named "18b": four by the core test (level 30's
drawbridge one square short; one straw fewer; eight lanterns on the string; the poppers moving with reduced motion), one
by the solver (level 30's home on the coconut shy, the sketch page's fault 4) and four by the main browser test (no
lantern gate at the fair; the gate on every button; the lanterns never lit; no poppers at level 30).
Changes at v1.19 (step 18a (ii), D-233 to D-236): thirteen faults named "18a": five by the core test (level 29 without the
balcony's end, so no hook; five straws; no zip-line card; the zip card's peg in before its hook; the fast wheel never
paused while building), one by the solver (level 29's home on the coconut shy, a short cut under the floor, the sketch
page's fault 4), six by the main browser test (the board's mode never set; the fair at full strength while building; the
line never sags; no kicks; no sparkles; the usual party at the fair) and one by the cards' (the zip card's caption gone
from the screen). "fix: the carrying poses never drawn" follows game.js 1.18's pose test (startsWith('zip')); five older faults' text
follows the new lines (cards.js's CARDS ends with 'zip'; art.js's backHeight names fairA): "catapult: no card", "signpost: no
card" and the frame's, picnic's and playground's "backdrop drawn 420 tall".
Also at v1.19: the copy for a fault under the main or the cards' browser test now holds P-020's shared/ too, as the spike's
did: without it the game's page can't load (link.js imports shared/bridge.js), so every such fault "failed" on loading,
not on the check it aims at, and was counted caught (ER-017, found 27 Nov by a spot check). Browser faults counted
before 1.19 are unproven until run again.
Changes at v1.18 (step 17c (ii), D-226 to D-230): thirteen faults named "17c": nine by the core test (level 22 without its
channel; 22 naming 2 roads; level 24's top bar with v0.1's first gap; level 25 without the thermos; level 26's button on
the cake stand; level 28's home a row higher, and with three straws; the picnic and the playground at full strength) and
four by the solver (levels 22 and 24 as above; level 26 without the hamper's end, a 2-ramp road under the floor, the
sketch page's fault 2; level 27 without the roof over home, first aimed at the core test, which missed it: no road or
wrong road changes, only a short cut opens, which the search under the floor finds, as the sketch page's fault 4 did). The faded playground at full strength is caught by the core test's copied-unchanged
check. Nine older faults' text follows levels.js 1.12 (level 22's branch; 24's start and roads; 25's spare, lid and pond;
26's button; 27's spare); "17b solver: level 26 without the hamper's handle" goes (the handle is gone; m above takes its place).
Changes at v1.17 (step 17b (ii), D-211, D-212, D-214 to D-216): ten faults named "17b": five by the core test (level
25's last gap filled; level 28's trap not named; Pudding third on level 28; the frame at full strength; Pudding's counter
face a Nibble's size), two by the browser test (the counter lit by count on Pudding's levels; Pudding's face never
drawn) and three by the solver, a new kind of test here (`SOLVE + ' L13b'`: the solver on those levels): level 26
without the hamper's handle (a 3-gadget road, under the floor), level 28's sticks not named a trap, a worn stick that
holds Pudding (the trap no longer one). Four older faults' text follows levels.js 1.11 and art.js 1.12 (level 27's and
25's spares, level 26's one button, the pond's backdrop on the frame); "level 25's pond a square wider" becomes "its lid a
square shorter" (the new pond is not crossed on foot).
Changes at v1.16 (step 17, D-194): eleven faults in Pudding, levels 27 and 28 and the playground's backdrop, named
"pudding:" or "playground:": nine by the core test (bounces like a Nibble; a worn stick holds it; it needs a friend on a
see-saw; any place in the line; one dandelion; the card's Pudding leaves the floor; level 27 without its spare; Pudding
first on level 27; the backdrop 420 tall) and two by the browser test (not drawn as Pudding; the marshmallow doesn't squish).
Five older faults' text follows core.js 1.10, cards.js 1.5 and art.js 1.11 (the third-hamster snap, the two cards left out,
the frame's and picnic's backdrops 420 tall).
Changes at v1.15 (step 16, D-194): eleven faults in the button, levels 25 and 26 and the picnic's backdrop, named
"button:" or "picnic:": ten by the core test (never pressed; not pressed on landing; the lid never holds; pressed again
each time; a gadget on a lid; the card's lid dropping after the gap; level 25 without its spare; its pond a square wider;
level 26's hamper button gone; the backdrop 420 tall) and one by the browser test (the lid never swings down). Four
older faults' text follows core.js 1.9, cards.js 1.4 and art.js 1.10 (a gadget in a see-saw's space, the catapult's and
signpost's cards left out, the frame's backdrop 420 tall).
Changes at v1.14 (step 15, D-208): thirteen faults in the signpost's card, levels 23 and 24 and the frame's backdrop,
their names starting "signpost:" or "frame:", all by the core test (no card; its caption; the hamster never facing left;
not drawn mirrored; the signpost dropping in after the turn; a keyframe off the walk; level 23 without its spare, its bar
a square shorter; level 24's start on the ground, one road; the backdrop drawn 420 tall, the pond's drawn there, a stop off the
park). One older fault's text follows cards.js 1.3 (the catapult's card left out of the longer list).
(Level 24's shelf taken away was tried and dropped: its start tube sits a row above the ground walk with or without the
block under it, so the rules don't change; the block only holds the tube up in the picture.)
Changes at v1.13 (step 14b, D-206): two faults in the spoon's throw: the throw never started (the browser test) and the
spoon's arm not split from its reel (the core test).
Changes at v1.12 (step 14, D-194, D-202 to D-204): two older faults' text follows core.js 1.8 and game.js 1.13 (the slide's
ticks, the carrying pose's test of the bonk pose); nineteen faults in the catapult and the park, their names starting
"catapult:" or "park:": fifteen by the core test (the throw's length, arc and way; anything in the way; the bonk step;
the seed on the arc; its ticks; the gadget list; its card; level 21's spare and pond; level 22's branch; two park stops
overlapping; the ride's stop on the treehouse's; the ride's stop always open) and four by the browser tests (Play opening
the park before the ride, Next crossing into the park, the house button after a park level going to the garden, the
card in the corner of a tall window).
Changes at v1.11 (D-197, D-200): three more spike faults: the hamster counter shown while building, over the board
during a run, and the gadget slots kept during a run.
Changes at v1.10 (step 13: D-185, D-190, D-196): thirty-one faults in the spike's new code, their names starting
"spike:": twenty-four by the core test (heights, the signpost, dizzy, the nap, facing left, a bouncer, tubes, ramps
and the lift both ways, falling into a signpost, the see-saw, every zip-line rule, the slide, a bounce into a high
end) and seven by the spike's browser test (the window, mirroring, taking a zip-line back, the glows, the party saved,
and two in the preview's tap counter). (The test board's tries saved was tried and dropped: progress.js's tried()
ignores an id that isn't a level, so it changes nothing.) The spike's browser test builds the preview, so its copy gets a git of its own and
P-020's shared/ folder (the preview bundles shared/bridge.js);
--control runs the copy with no fault, which must pass. Seven older faults' text follows core.js 1.7 and game.js
1.10 (HOLDS with the left ramp, a ramp climbing the way it faces, fits()'s empty square, a placed gadget picked up,
the step marked facing left, the carrying pose's test of the zip pose).
Changes at v1.9 (step 10b, D-177, D-178, D-179): ten faults in the three feedback items, their names starting "fix:":
nine by the core test (sticks stack only top first again, a bridge fits above a stick, no ramp on the see-saw's
card, its ramp dropping in before the tip, its third hamster climbing before the ramp lands, no hamster ever
carrying the dandelion, one carrying it on the floater's own square, one still carrying it after landing, the
carrying poses drawn without it) and one by the browser test (the carrying poses never drawn). Four older faults'
text follows core.js 1.6 (its fit rule's new line; its steps now marked as carried or not): a bridge fits where they
stand, the seed missed on foot, the second in a cup stepping out at once, a rider setting off before the cup does.
Changes at v1.8 (step 10, D-166, D-169, D-170): three more twin faults, by the core test: level 6's twin with one stick,
level 10's twin with no step in the treehouse (so it needs no more ramps than level 10), and the shed's second stop
missing from the plan. Two older faults' text follows the code again (ER-012): 'any format is read' (progress.js 1.1
reads formats 1 and 2 through READS, so its old text was not found from step 8 on) and 'level 10 has two tubes'
(level 10's twin has the same tube count, so its tray is named whole).
Changes at v1.7 (step 9, D-166, D-169, D-170): six faults in the twins, their names starting "twin:": five caught or
not by the core test (opens() forgets old progress, level 1's twin without its spare bridge, its high ledge with no
gap, a twin's stop on its first level's, a twin bringing in a card) and one by the cards' browser test (the game
opening levels by the old rule, so a child with old progress finds level 2 locked behind level 1's twin).
Changes at v1.6 (step 8, D-167 to D-171): thirteen faults in the help cards, their names starting "card:": eight caught
or not by the core test (seen() marks nothing, format 1 no longer read, cards read from format 1, any card kept, a
caption of 7 words, a class with no keyframes, a card for a gadget the game doesn't have, a moving group with a
transform attribute) and five by the cards' browser test (the card every time, a tap anywhere closes it, help shows
the lift for the see-saw, the card seen not saved, the cards' CSS never added). --only TEXT runs the faults whose
name holds TEXT.
Changes at v1.5 (D-163): two faults' text follows core.js 1.4's (the seat on a rider's steps); the shared-cup fault becomes 'any number in a cup' (core.js 1.4's seats); two more: three
in a cup, and the second in a cup stepping out at once.
Changes at v1.4 (step 4, D-157): the shared-cup fault follows core.js 1.3's text (each cup has its own rider); six
faults in the two-cup lift and levels 9 and 10: the second cup a third of a loop on, only the first cup kept, three
cups allowed, a rider's cup not named, level 9 without its spare bridge, level 10 without its third tube; and one in
the screens: the cups stand still during a run (by the browser test). (A rider's wait timed by cup 0's clock was
tried and dropped: the two cups always stop at the same ticks, at opposite ends, so it changes nothing.)
Changes at v1.3 (step 4, D-156, D-158): seven faults in wider boards and the see-saw (core.js 1.2): a board 25 wide
accepted, one hamster tips it, it never carries anyone, it tips at once, a lone hamster waits for ever (stopped by
the run's end instead), a hamster steps up onto its raised end from outside, and something fits in its space.
Changes at v1.2 (step 3): the seed-on-foot fault follows core.js 1.1's new text; five faults in the timed model (core.js 1.1): the cup shared, stepped onto too
late, left before it moves, all five out at once, and the seed taken by every hamster; three in the worn stick:
a gadget fits on it, it snaps under the third, and it stays when snapped. (Cracking twice under one hamster
was tried and dropped: no rule yet lets a hamster stand on one stick twice, so it changes nothing.) Built like mutate_rocket_map.py 1.0.
Changes at v1.1 (step 2): nine more faults, in the saved progress (progress.js), level 4's tray, and saving and
the wrapper link (game.js). Version 1.0.1 (15 Nov): renamed with the game, D-146.

Each fault is one exact text change in a copy of the repo's games/ and tools/tests/games/ folders (a
temporary folder); the repo itself is never changed. A fault whose text isn't found exactly once is an
error, not a catch. Thirty-nine faults caught or not by the core test (seconds each), in the rules (core.js), the
progress (progress.js) and the levels; six in the screens (game.js), by the browser test (about two minutes each).
Usage, from the repo root:
    python3 -B tools/tests/games/mutate_hamster_highway.py [--fast]
--fast skips the faults that need a browser test; --only TEXT runs only the faults whose name holds TEXT.
"""
import os, shutil, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
G = 'games/hamster-highway/'
CORE, E2E = 'test_hamster_highway_core.py', 'test_hamster_highway_e2e.py'
CARDS_E2E = 'test_hamster_highway_cards_e2e.py'
SPIKE_E2E = 'test_hamster_highway_spike_e2e.py'
SOLVE = 'solve_hamster_highway.py'   # with level ids after it: the solver on those levels (a design tool, not in the close)
FAULTS = [
    ('a drop of 3 is safe', G + 'core.js', 'export const BIG_FALL = 3;', 'export const BIG_FALL = 4;', CORE),
    ('a bouncer throws 2 up', G + 'core.js', 'export const BOUNCE = 3;', 'export const BOUNCE = 2;', CORE),
    ('a bridge holds nobody', G + 'core.js', "const HOLDS = new Set(['#', 'bridge', 'ramp', 'tube', 'stick', 'rampL']);", "const HOLDS = new Set(['#', 'ramp', 'tube', 'stick', 'rampL']);", CORE),
    ('a bridge fits where they stand', G + 'core.js', 'const open = !HOLDS.has(below) ||', 'const open = HOLDS.has(below) ||', CORE),
    ('a ramp fits in mid-air', G + 'core.js', '  return FLOOR.has(below);\n}', '  return below !== null;\n}', CORE),
    ('a wall does not stop them', G + 'core.js', "if (next === null || next === '#') return done('stuck');", "if (next === null) return done('stuck');", CORE),
    ('a ramp does not lift', G + 'core.js', '      c += d;\n      r -= 1;\n', '      c += d;\n', CORE),
    ('the seed is missed on foot', G + 'core.js', "    yield mark(touch(st, c, r));\n  }\n  return done('stuck');", "    yield mark(st);\n  }\n  return done('stuck');", CORE),
    ('an empty tray entry is allowed', G + 'core.js', 'n < 1) throw', 'n < 0) throw', CORE),
    ('a placed gadget stays in the tray', G + 'core.js', 'n[kind] = (n[kind] || 0) - 1;', 'n[kind] = (n[kind] || 0) - 0;', CORE),
    ('any number fit in a cup', G + 'core.js', 'return aboard(s.part, k).length < SEATS && !!cs', 'return !!cs', CORE),
    ('three fit in a cup', G + 'core.js', 'export const SEATS = 2;', 'export const SEATS = 3;', CORE),
    ('the second in a cup steps out at once', G + 'core.js', "      if (stop.seat) yield mark({ c, r, act: 'wait', dur: SHARE_WAIT, seat: stop.seat });", '', CORE),
    ('a hamster steps onto a cup about to move', G + 'core.js', 'cs.leaves - t >= TICKS.walk', 'cs.leaves - t >= 0', CORE),
    ('a rider sets off before the cup does', G + 'core.js', "      if (leaves > ctx.now()) yield mark({ c, r, act: 'wait', dur: leaves - ctx.now(), seat: stop.seat });\n", '', CORE),
    ('all five come out at once', G + 'core.js', 'next: i * RELEASE,', 'next: 0,', CORE),
    ('the seed is taken by every hamster', G + 'core.js', '        seed = false;\n        return true;', '        return true;', CORE),
    ('a gadget fits on a worn stick', G + 'core.js', "const FLOOR = new Set(['#', 'bridge']); ", "const FLOOR = new Set(['#', 'bridge', 'stick']); ", CORE),
    ('a stick snaps under the third', G + 'core.js', 'const snap = by.size >= SNAP ||', 'const snap = by.size >= SNAP - 1 ||', CORE),
    ('a snapped stick stays', G + 'core.js', '        if (snap) delete placed[k];\n', '', CORE),
    ('a board 25 wide is accepted', G + 'core.js', 'export const MAX_COLS = 24;', 'export const MAX_COLS = 25;', CORE),
    ('one hamster tips the see-saw', G + 'core.js', 'export const PAIR = 2;', 'export const PAIR = 1;', CORE),
    ('the see-saw carries nobody', G + 'core.js', 'if (was !== now && (r === was || r === now + 1))', 'if (false)', CORE),
    ('the see-saw tips at once', G + 'core.js', 'dur: Math.max(1, s.tippedAt + TIP - t)', 'dur: 1', CORE),
    ('a lone hamster waits for ever', G + 'core.js', 'if (++waited > SEESAW_WAIT)', 'if (++waited > 1e9)', CORE),
    ('they step up onto its raised end', G + 'core.js', "    if (ctx.plank(c + 1, r)) return done('stuck');", '', CORE),
    ('a gadget fits in its space', G + 'core.js', '\n  && !(level.shaft && level.shaft.has(key(c, r))) && !(level.space && level.space.has(key(c, r)))\n', '\n  && !(level.shaft && level.shaft.has(key(c, r)))\n', CORE),
    ('the second cup is a third of a loop on', G + 'core.js', 'const u = t + (k * all) / 2;', 'const u = t + (k * all) / 3;', CORE),
    ('a lift keeps only its first cup', G + 'core.js', 'Array.from({ length: p.cups || 1 }, (_, k) => k)', 'Array.from({ length: 1 }, (_, k) => k)', CORE),
    ('a lift may have three cups', G + 'core.js', '&& (cups === 1 || cups === 2);', '&& (cups >= 1 && cups <= 3);', CORE),
    ('a rider\'s cup is not named', G + 'core.js', "act: 'ride', cup: stop.cup, seat: stop.seat }", "act: 'ride', seat: stop.seat }", CORE),
    ('level 9 has no spare bridge', G + 'levels.js', 'tray: { bridge: 2, ramp: 1, floater: 1 }', 'tray: { bridge: 1, ramp: 1, floater: 1 }', CORE),
    ('level 10 has two tubes', G + 'levels.js', 'tray: { bridge: 1, ramp: 2, bouncer: 1, floater: 1, tube: 3 }', 'tray: { bridge: 1, ramp: 2, bouncer: 1, floater: 1, tube: 2 }', CORE),
    ('the cups stand still during a run', G + 'game.js', '  moveCups(R);\n', '', E2E),
    ('a click on a placed gadget keeps it down', G + 'game.js', '    const kind = S.placed[k];\n    delete S.placed[k];\n', '    const kind = S.placed[k];\n    void k;\n', E2E),
    ('no party when all five are home', G + 'game.js', "if (R.res.outcome === 'home' && R.home === WALKERS) {", "if (R.res.outcome === 'home' && R.home > WALKERS) {", E2E),
    ('tries count after a level is done', G + 'progress.js', '  if (!ids.includes(id) || q.done[id]) return q;', '  if (!ids.includes(id)) return q;', CORE),
    ('a seed is kept on a level not done', G + 'progress.js', 'if (seeds[id] === true && p.done[id])', 'if (seeds[id] === true)', CORE),
    ('any format is read', G + 'progress.js', '  if (!isMap(raw) || !READS.includes(raw.v)) return p;', '  if (!isMap(raw)) return p;', CORE),
    ('no format version saved', G + 'progress.js', 'export const pack = (p) => ({ v: FORMAT, ...copy(p) });', 'export const pack = (p) => ({ ...copy(p) });', CORE),
    ('the house always opens at level 1', G + 'progress.js', '  return i < 0 ? Math.max(0, ids.length - 1) : i;', '  return 0;', CORE),
    ('level 4 has no spare bridge', G + 'levels.js', 'tray: { bridge: 2, floater: 1 }', 'tray: { bridge: 1, floater: 1 }', CORE),
    ('nothing kept on the device', G + 'game.js', '  try { localStorage.setItem(ENTRY, JSON.stringify(st)); }', '  try { void st; }', E2E),
    ('the wrapper is not told', G + 'game.js', '  if (S.linked) { S.linked.saveState(st); return; }', '  if (S.linked) { return; }', E2E),
    ('the wrapper\'s sound off is ignored', G + 'game.js', '  if (start.sound === false) { setMuted(true); S.soundLocked = true; }', '  if (start.sound === false) { S.soundLocked = true; }', E2E),
    ('card: seen() marks nothing', G + 'progress.js', '  if (kinds.includes(kind)) q.cards[kind] = true;', '  void kinds;', CORE),
    ('card: format 1 no longer read', G + 'progress.js', 'const READS = [1, 2];', 'const READS = [2];', CORE),
    ('card: cards read from format 1', G + 'progress.js', 'raw.v >= 2 && isMap(raw.cards)', 'isMap(raw.cards)', CORE),
    ('card: any card kept', G + 'progress.js', 'for (const k of kinds) if (cards[k] === true)', 'for (const k of Object.keys(cards)) if (cards[k] === true)', CORE),
    ('card: a caption of 7 words', G + 'cards.js', "stick: 'Worn sticks snap. Add another!',", "stick: 'Worn sticks snap, so add another one!',", CORE),
    ('card: a class with no keyframes', G + 'cards.js', "+ kf('hc-tube-spark', '0%, 64% { opacity: 0 } 66%, 72% { opacity: 1 } 76%, 100% { opacity: 0 }')", '', CORE),
    ('card: a card for a gadget the game doesn\'t have', G + 'cards.js', '(def && CARDS.includes(def.new) ? def.new : null)', '(def && def.new ? def.new : null)', CORE),
    ('card: a moving group with a transform attribute', G + 'cards.js', "place(cls('hc-bouncer-squish', gadget('bouncer')), 180, 300, GS)", "place(gadget('bouncer'), 180, 300, GS, 0, ' class=\"hc-bouncer-squish\"')", CORE),
    ('card: the card every time', G + 'game.js', '  if (k && !S.progress.cards[k]) showCard(k, true);', '  if (k) showCard(k, true);', CARDS_E2E),
    ('card: a tap anywhere closes it', G + 'game.js', "    if (t.closest('[data-btn=\"cardok\"]')) closeCard();", '    if (true) closeCard();', CARDS_E2E),
    ('card: help shows the lift for the see-saw', G + 'game.js', "if (!kind && t.closest('[data-saw]')) kind = 'seesaw';", "if (!kind && t.closest('[data-saw]')) kind = 'lift';", CARDS_E2E),
    ('card: the card seen is not saved', G + 'game.js', '  if (first) { S.progress = seen(CARDS, S.progress, kind); keep(); }', '  if (first) { S.progress = seen(CARDS, S.progress, kind); }', CARDS_E2E),
    ('card: the cards\' CSS never added', G + 'game.js', 'document.head.appendChild(cardCss);', 'void cardCss;', CARDS_E2E),
    ('twin: opens() forgets old progress', G + 'progress.js', ' || ids.slice(i).some((id) => !!p.done[id]);', ';', CORE),
    ('twin: level 1\'s twin has no spare bridge', G + 'levels.js', "tray: { bridge: 3 }, spare: 'bridge',", "tray: { bridge: 2 }, spare: 'bridge',", CORE),
    ('twin: level 1\'s twin needs one bridge', G + 'levels.js', "      '###.###.....',\n", "      '#######.....',\n", CORE),
    ('twin: a twin\'s stop on its first\'s', G + 'house.js', 'sink2: [340, 646]', 'sink2: [224, 654]', CORE),
    ('twin: a twin brings in a card', G + 'levels.js', "new: null, twin: 'L1'", "new: 'bridge', twin: 'L1'", CORE),
    ('twin: level 6\'s twin has one stick', G + 'levels.js', 'tray: { stick: 2, ramp: 2 }', 'tray: { stick: 1, ramp: 2 }', CORE),
    ('twin: level 10\'s twin has no step', G + 'levels.js', "      '.....................###',\n", "      '........................',\n", CORE),
    ('twin: the shed\'s second stop not in the plan', G + 'house.js', "  { name: 'shed2', at: [1920, 561], level: 18 },\n", '', CORE),
    ('fix: sticks stack only top first again', G + 'core.js', "    const open = !HOLDS.has(below) || (kind === 'stick' && below === 'stick');", '    const open = !HOLDS.has(below);', CORE),
    ('fix: a bridge fits above a stick', G + 'core.js', "|| (kind === 'stick' && below === 'stick');", "|| below === 'stick';", CORE),
    ('fix: no ramp on the see-saw\'s card', G + 'cards.js', "  + fit(60, 180, 'seesaw') + cls('hc-seesaw-drop', place(gadget('ramp'), 60, 180, GS)) + sparks('seesaw', 82, 180)\n", '', CORE),
    ('fix: the see-saw card\'s ramp before the tip', G + 'cards.js', "dropIn('seesaw', SL, 52)", "dropIn('seesaw', SL, 30)", CORE),
    ('fix: the third climbs before the ramp lands', G + 'cards.js', '44%, 60% { ${T(30, 240)} } 66% { ${T(124, 180)} }', '44%, 50% { ${T(30, 240)} } 56% { ${T(124, 180)} }', CORE),
    ('fix: never carries the dandelion', G + 'core.js', 'const mark = (st) => { if (floater) st.carry = true; if (d < 0) st.dir = -1; return st; };', 'const mark = (st) => { if (d < 0) st.dir = -1; return st; };', CORE),
    ('fix: carries it on the floater\'s own square', G + 'core.js', "    yield mark(touch(st, c, r));\n  }\n  return done('stuck');",
     "    if (at(c, r) === 'floater') st.carry = true;\n    yield mark(touch(st, c, r));\n  }\n  return done('stuck');", CORE),
    ('fix: still carries it after landing', G + 'core.js', 'const mark = (st) => { if (floater) st.carry = true; if (d < 0) st.dir = -1; return st; };',
     'let held = false; const mark = (st) => { if (floater) held = true; if (held) st.carry = true; if (d < 0) st.dir = -1; return st; };', CORE),
    ('fix: the carrying poses without the dandelion', G + 'art.js', "else if (pose === 'float' || pose === 'carry1' || pose === 'carry2') {", "else if (pose === 'float') {", CORE),
    ('fix: the carrying poses never drawn', G + 'game.js', "    if (s.carry && pose !== 'float' && pose !== 'boing' && !pose.startsWith('zip') && pose !== 'bonk')", "    if (false && s.carry && pose !== 'float' && pose !== 'boing' && !pose.startsWith('zip') && pose !== 'bonk')", E2E),
    ('twin: levels open by the old rule', G + 'game.js', '  return opens(IDS, S.progress, i);', '  return i === 0 || !!S.progress.done[LEVELS[i - 1].id];', CARDS_E2E),
    # step 13, the spike (core.js 1.7, game.js 1.10, preview_debug_hamster_highway.js 1.0): by the core test, then the spike's browser test
    ('spike: 9-row boards refused', G + 'core.js', 'export const MAX_ROWS = 9;', 'export const MAX_ROWS = 7;', CORE),
    ('spike: the bottom is always row 6', G + 'core.js', 'const tall = (level) => level.height || ROWS;', 'const tall = (level) => ROWS;', CORE),
    ('spike: a signpost doesn\'t turn them', G + 'core.js', "      d = -d;\n      yield mark({ c, r, act: 'turn' });", "      yield mark({ c, r, act: 'turn' });", CORE),
    ('spike: dizzy at the second turn', G + 'core.js', 'export const DIZZY = 3;', 'export const DIZZY = 2;', CORE),
    ('spike: no nap in the start tube', G + 'core.js', "    if (k === 'S' && away) return done('nap');", "    if (k === 'S' && away && false) return done('nap');", CORE),
    ('spike: steps never say they face left', G + 'core.js', ' if (d < 0) st.dir = -1; return st; };', ' return st; };', CORE),
    ('spike: a bouncer always throws right', G + 'core.js', "      const on = at(c + d, r);\n      if (on !== null && on !== '#') c += d;", "      const on = at(c + 1, r);\n      if (on !== null && on !== '#') c += 1;", CORE),
    ('spike: tubes always join rightwards', G + 'core.js', '[[lc, lr - 1], [lc + d, lr], [lc, lr + 1], [lc - d, lr]]', '[[lc, lr - 1], [lc + 1, lr], [lc, lr + 1], [lc - 1, lr]]', CORE),
    ('spike: a ramp\'s back is no step', G + 'core.js', "    if (next === (d > 0 ? 'rampL' : 'ramp')) return done('stuck');   // a ramp's back: a step (D-190)\n", '', CORE),
    ('spike: a left ramp doesn\'t climb', G + 'core.js', "    if (next === (d > 0 ? 'ramp' : 'rampL')) {", "    if (next === 'ramp' && d > 0) {", CORE),
    ('spike: falling into a signpost doesn\'t turn them', G + 'core.js', "    if (fell && at(c, r) === 'signpost') continue;", '', CORE),
    ('spike: the see-saw both ways', G + 'core.js', "    if (d < 0 && (ctx.plank(c, r + 1) || ctx.plank(c + d, r) || at(c + d, r) === 'seesaw')) return done('stuck');", '', CORE),
    ('spike: the lift only from the left', G + 'core.js', '      const stop = ctx.stop(c + d, r);', '      const stop = ctx.stop(c + 1, r);', CORE),
    ('spike: a zip-line\'s low end on its high end\'s row', G + 'core.js', '  for (let r = hr + 1; r < tall(level); r++) {', '  for (let r = hr; r < tall(level); r++) {', CORE),
    ('spike: zip-lines 11 across', G + 'core.js', 'export const ZIP_MAX = 10;', 'export const ZIP_MAX = 11;', CORE),
    ('spike: a zip-line crosses blocks', G + 'core.js', "if (level.rows[r][c] === '#' && crosses(a, b, c, r)) return false;", "if (level.rows[r][c] === '#' && crosses(a, b, c, r) && false) return false;", CORE),
    ('spike: touching a corner blocks a zip-line', G + 'core.js', '  return less(lo, hi);\n}', '  return !less(hi, lo);\n}', CORE),
    ('spike: a high end needs no block above', G + 'core.js', "const under = (level, c, r) => r >= 1 && level.rows[r - 1][c] === '#';", 'const under = (level, c, r) => r >= 1;', CORE),
    ('spike: a low end needs no floor', G + 'core.js', ' || !empty(level, placed, c, r) || !FLOOR.has(terrain(level, placed, c, r + 1))) continue;', ' || !empty(level, placed, c, r)) continue;', CORE),
    ('spike: a zip-line counted twice in the tray', G + 'core.js', "    if (kind !== 'peg') n[kind] = (n[kind] || 0) - 1;", "    const kk = kind === 'peg' ? 'zip' : kind;\n    n[kk] = (n[kk] || 0) - 1;", CORE),
    ('spike: the slide two ticks a column', G + 'core.js', 'turn: 2, zip: 1, fling: 1', 'turn: 2, zip: 2, fling: 1', CORE),
    ('spike: off the zip-line always facing right', G + 'core.js', '      d = lc > hc ? 1 : -1;\n', '      d = 1;\n', CORE),
    ('spike: the slide stays on the high end\'s row', G + 'core.js', '        r = hr + ((lr - hr) * i) / n;', '        r = hr + (i === n ? lr - hr : 0);', CORE),
    ('spike: a bounce into a high end doesn\'t grab the reel', G + 'core.js', "      if (at(c, r) === 'zip') continue;   // thrown into a zip-line's high end: it grabs the reel\n", '', CORE),
    ('spike: the window stays 7 rows', G + 'game.js', '  BH = lv.height * CELL;', '  BH = ROWS * CELL;', SPIKE_E2E),
    ('spike: walkers never drawn mirrored', G + 'game.js', 'scale(${dir < 0 ?', 'scale(${dir < -9 ?', SPIKE_E2E),
    ('spike: a zip-line\'s other end stays when one is tapped', G + 'game.js', '    delete S.placed[key(oc, or)];\n', '', SPIKE_E2E),
    ('catapult: flung 3 squares on', G + 'core.js', 'export const CATAPULT = 4;', 'export const CATAPULT = 3;', CORE),
    ('catapult: a flat arc', G + 'core.js', 'export const ARC = [1, 2, 1, 0];', 'export const ARC = [0, 0, 0, 0];', CORE),
    ('catapult: always flung right', G + 'core.js', '        const [nc, nr] = [c0 + d * i, r0 - ARC[i - 1]];', '        const [nc, nr] = [c0 + i, r0 - ARC[i - 1]];', CORE),
    ('catapult: gadgets in the way don\'t bonk', G + 'core.js', '        if (there === null || HOLDS.has(there)) { hit = true; break; }', "        if (there === null || there === '#') { hit = true; break; }", CORE),
    ('catapult: no bonk step', G + 'core.js', "      if (hit) yield mark({ c, r, act: 'hit' });", '      if (hit) { /* no bonk */ }', CORE),
    ('catapult: the seed on the arc missed', G + 'core.js', "        yield mark(touch({ c, r, act: 'fling' }, c, r));", "        yield mark({ c, r, act: 'fling' });", CORE),
    ('catapult: two ticks a square', G + 'core.js', 'zip: 1, fling: 1, hit: 1 };', 'zip: 1, fling: 2, hit: 1 };', CORE),
    ('catapult: not a gadget', G + 'core.js', "'rampL', 'signpost', 'zip', 'catapult'];", "'rampL', 'signpost', 'zip'];", CORE),
    ('catapult: no card', G + 'cards.js', "'seesaw', 'lift', 'catapult', 'signpost', 'button', 'pudding', 'zip'];", "'seesaw', 'lift', 'signpost', 'button', 'pudding', 'zip'];", CORE),
    ('catapult: level 21 without its spare ramp', G + 'levels.js', '    tray: { catapult: 1, ramp: 1 }, spare: \'ramp\',', '    tray: { catapult: 1 }, spare: \'ramp\',', CORE),
    ('catapult: level 21\'s pond 2 wide', G + 'levels.js', "      '#####..........G',\n      '#####...########',\n", "      '#####..........G',\n      '#####..#########',\n", CORE),
    ('park: level 22\'s branch a square shorter', G + 'levels.js', "      '...########.............',\n", "      '...#######..............',\n", CORE),
    ('park: two stops overlap', G + 'park.js', "  { name: 'picnic2', at: [1620, 640] },", "  { name: 'picnic2', at: [1500, 650] },", CORE),
    ('park: the ride\'s stop on the treehouse\'s', G + 'house.js', 'export const RIDE = [2380, 180];', 'export const RIDE = [2352, 302];', CORE),
    ('park: the ride\'s stop always open', G + 'house.js', '  if (!ride.open) {', '  if (false) {', CORE),
    ('park: Play opens the park before the ride', G + 'game.js', "  return inPark(i) && LEVELS.some((d, j) => inPark(j) && (S.progress.tries[d.id] || S.progress.done[d.id])) ? 'park' : 'house';", "  return inPark(i) ? 'park' : 'house';", CARDS_E2E),
    ('park: Next crosses into the park', G + 'game.js', ' && inPark(S.li + 1) === inPark(S.li);', ';', E2E),
    ('park: the house button after a park level goes to the garden', G + 'game.js', "S.scene = inPark(S.li) ? 'park' : 'house'; S.mode = 'build';", "S.scene = 'house'; S.mode = 'build';", E2E),
    ('catapult: the spoon only sits there', G + 'game.js', "  el.classList.add('throw');\n", "  el.classList.add('wobble');\n", E2E),
    ('catapult: the spoon in one piece', G + 'art.js', "g(catapultReel(), '', ' class=\"reel\"') + g(catapultSpoon(), '', ' class=\"spoon\"')", "g(catapultArt(), '', ' class=\"spoon\"')", CORE),
    ('catapult: the card in the corner of a tall window', G + 'game.js', '  const mid = BW === 720 && BH === 420 ? cardArt(kind)', '  const mid = true ? cardArt(kind)', CARDS_E2E),
    ('pudding: bounces like a Nibble', G + 'core.js', "    if (k === 'bouncer' && ctx.heavy) ctx.squash(c, r);", "    if (k === 'bouncer' && false) ctx.squash(c, r);", CORE),
    ('pudding: a worn stick holds it', G + 'core.js', "const snap = by.size >= SNAP || level.pudding === who;", "const snap = by.size >= SNAP;", CORE),
    ('pudding: needs a friend on a see-saw', G + 'core.js', "(s.far.size >= PAIR || level.pudding === who)", "(s.far.size >= PAIR)", CORE),
    ('pudding: any place in the line', G + 'core.js', "def.pudding >= 0 && def.pudding < WALKERS)", "def.pudding >= 0 && def.pudding < 99)", CORE),
    ('pudding: one dandelion', G + 'art.js', "s = g(dandelion(), 'rotate(-16 8 -72)') + g(dandelion(), 'rotate(16 8 -72)') + s;", "s = '' + s;", CORE),
    ('pudding: the card\'s Pudding leaves the floor', G + 'cards.js', "50% { ${T(210, 360)} } 80%, 100% { ${T(398, 360)} }`) + rule('hc-pudding-pud'", "50% { ${T(210, 300)} } 80%, 100% { ${T(398, 360)} }`) + rule('hc-pudding-pud'", CORE),
    ('playground: level 27 without its spare bouncer', G + 'levels.js', "    tray: { bridge: 4, ramp: 2, floater: 1, catapult: 1, bouncer: 1 }, spare: 'bouncer',", "    tray: { bridge: 4, ramp: 2, floater: 1, catapult: 1 }, spare: 'bouncer',", CORE),
    ('playground: Pudding first on level 27', G + 'levels.js', "new: 'pudding', pudding: 2,", "new: 'pudding', pudding: 0,", CORE),
    ('playground: the backdrop drawn 420 tall', G + 'art.js', "name === 'picnic' || name === 'playground' || name === 'fairA' ? 540 : H", "name === 'picnic' || name === 'fairA' ? 540 : H", CORE),
    ('pudding: not drawn as Pudding', G + 'game.js', "? pudding : hamster)(pose);   // Pudding (D-189 A)", "? hamster : hamster)(pose);   // Pudding (D-189 A)", E2E),
    ('pudding: the marshmallow doesn\'t squish', G + 'game.js', "  if (e.kind === 'squash') { squishMallow(`${e.c},${e.r}`); play('flump'); return; }", "  if (e.kind === 'squash') return;", E2E),
    ('button: never pressed', G + 'core.js', "    if (ctx.press) ctx.press(c, r);   // a bottle-top button", "    // a bottle-top button", CORE),
    ('button: not pressed on landing', G + 'core.js', "    if (fell && ctx.press) ctx.press(c, r);\n", "", CORE),
    ('button: the lid never holds', G + 'core.js', "holds(level, placed, c, r) || lidDown(c, r) || parts.some", "holds(level, placed, c, r) || parts.some", CORE),
    ('button: pressed again each time', G + 'core.js', "        if (!p || pressed.has(p)) return;", "        if (!p) return;", CORE),
    ('button: a gadget on a lid', G + 'core.js', " && !(level.lids && level.lids.has(key(c, r)));", ";", CORE),
    ('button: the card\'s lid drops after the gap', G + 'cards.js', "37%, 100% { transform: rotate(0deg) }", "50%, 100% { transform: rotate(0deg) }", CORE),
    ('picnic: level 25 without its spare ramp', G + 'levels.js', "    tray: { ramp: 5, bouncer: 1, bridge: 1, catapult: 1, floater: 1 }, spare: 'ramp',", "    tray: { ramp: 4, bouncer: 1, bridge: 1, catapult: 1, floater: 1 }, spare: 'ramp',", CORE),
    ('picnic: level 25\'s lid a square shorter', G + 'levels.js', "lid: [[13, 8], [14, 8], [15, 8]] }]", "lid: [[13, 8], [14, 8]] }]", CORE),
    ('picnic: level 26\'s button gone', G + 'levels.js', "    parts: [{ kind: 'button', c: 19, r: 2, lid: [[15, 7], [16, 7], [17, 7]] }],\n", "", CORE),
    ('picnic: the backdrop drawn 420 tall', G + 'art.js', "name === 'frame' || name === 'picnic' || name === 'playground' || name === 'fairA' ? 540 : H", "name === 'frame' || name === 'playground' || name === 'fairA' ? 540 : H", CORE),
    ('button: the lid never swings down', G + 'game.js', "    if (lid) lid.style.transform = 'rotate(0deg)';\n", "", E2E),
    ('signpost: no card', G + 'cards.js', "'seesaw', 'lift', 'catapult', 'signpost', 'button', 'pudding', 'zip'];", "'seesaw', 'lift', 'catapult', 'button', 'pudding', 'zip'];", CORE),
    ('signpost: the card\'s caption changed', G + 'cards.js', "  signpost: 'Signposts turn them round!',", "  signpost: 'Signs turn them!',", CORE),
    ('signpost: the card\'s hamster never faces left', G + 'cards.js', "kf('hc-signpost-back', '0%, 47.9% { opacity: 0 } 48%, 75.9% { opacity: 1 }", "kf('hc-signpost-back', '0%, 47.9% { opacity: 0 } 48%, 75.9% { opacity: 0 }", CORE),
    ('signpost: the card\'s hamster walks back unmirrored', G + 'cards.js', "const left = (body) => g(body, 'scale(-1 1)');", "const left = (body) => g(body, 'scale(1 1)');", CORE),
    ('signpost: the card\'s signpost drops in after the turn', G + 'cards.js', "dropIn('signpost', 6, 28);", "dropIn('signpost', 6, 50);", CORE),
    ('signpost: the card\'s hamster off the walk', G + 'cards.js', "19%, 40% { ${T(270, 360)} }", "19%, 40% { ${T(240, 360)} }", CORE),
    ('frame: level 23 without its spare left ramp', G + 'levels.js', "    tray: { bouncer: 2, signpost: 1, rampL: 1 }, spare: 'rampL',", "    tray: { bouncer: 2, signpost: 1 }, spare: 'rampL',", CORE),
    ('frame: level 23\'s bar a square shorter', G + 'levels.js', "      '....#########...',\n", "      '....########....',\n", CORE),
    ('frame: level 24\'s start on the ground', G + 'levels.js', "      '###...S...##........',\n      '......#..........#..',\n      '...............###..',\n",
     "      '###.......##........',\n      '......#..........#..',\n      '......S........###..',\n", CORE),
    ('frame: level 24 one road', G + 'levels.js', "twin: 'L12', roads: 3,", "twin: 'L12',", CORE),
    ('frame: the backdrop drawn 420 tall', G + 'art.js', "(name === 'pond' || name === 'frame' || name === 'picnic' || name === 'playground' || name === 'fairA' ? 540 : H)", "(name === 'pond' || name === 'picnic' || name === 'playground' || name === 'fairA' ? 540 : H)", CORE),
    ('frame: the pond\'s backdrop on the frame', G + 'art.js', "  if (name === 'frame') return g(frameQ1(w), '', ' data-back=\"frame\"');", "  if (name === 'frame') return g(pondArt(w), '', ' data-back=\"frame\"');", CORE),
    ('frame: level 24\'s stop off the park', G + 'levels.js', "room: 'park', spot: 'frame2', back: 'frame'", "room: 'park', spot: 'picnic', back: 'frame'", CORE),
    ('spike: the low ends never glow', G + 'game.js', '      + zipLows(S.level, S.placed, hc, hr).map(', '      + [].map(', SPIKE_E2E),
    ('spike: the test board\'s party is saved', G + 'game.js', '    if (!S.test) { S.progress = finished(IDS, S.progress, id, S.seedTaken); keep(); }', '    S.progress = finished(IDS, S.progress, id, S.seedTaken); keep();', SPIKE_E2E),
    ('spike: the counter shows while building', G + 'game.js', "  if (S.mode === 'build') { layer('count').innerHTML = ''; return; }", '', SPIKE_E2E),
    ('spike: the counter over the board during a run', G + 'game.js', '  const box = side ? { x: BW + 17, y: 80,', '  const box = side ? { x: 17, y: 80,', SPIKE_E2E),
    ('spike: the slots stay during a run', G + 'game.js', '  const slots = run ? \'\' : slotBoxes()', '  const slots = false ? \'\' : slotBoxes()', SPIKE_E2E),
    ('spike: the panel counts a tap on the ring as wrong', 'tools/tests/games/preview_debug_hamster_highway.js', '      if (cell[0] === t.c && cell[1] === t.r) T.gadgetHits += 1;', '      if (false) T.gadgetHits += 1;', SPIKE_E2E),
    ('spike: the panel misses a line let go of', 'tools/tests/games/preview_debug_hamster_highway.js', '      if (before.zipFrom && !after.zipFrom && lines(after.placed) === lines(before.placed)) T.zipCancelled += 1;', '', SPIKE_E2E),
    # step 17b (ii) (D-211, D-212, D-214 to D-216)
    ('17b: level 25\'s pond filled', G + 'levels.js', "      '#############...########',", "      '########################',", CORE),
    ('17b: level 28 without its trap named', G + 'levels.js', "roads: 2, pudding: 1, trap: 'stick',", "roads: 2, pudding: 1,", CORE),
    ('17b: Pudding third on level 28', G + 'levels.js', "roads: 2, pudding: 1, trap: 'stick',", "roads: 2, pudding: 2, trap: 'stick',", CORE),
    ('17b: the frame at full strength again', G + 'art.js', "  if (name === 'frame') return g(frameQ1(w), '', ' data-back=\"frame\"');", "  if (name === 'frame') return g(frameArt(w), '', ' data-back=\"frame\"');", CORE),
    ('17b: Pudding\'s counter face the size of a Nibble\'s', G + 'art.js', "    kk = k * 1.2;\n", "    kk = k;\n", CORE),
    ('17b: the counter lit by count on Pudding\'s levels', G + 'game.js', "    const lit = pud !== null ? got.has(who) : i < home;", "    const lit = i < home;", E2E),
    ('17b: Pudding\'s counter face never drawn', G + 'game.js', "    s += countHead('C2', who === pud, lit,", "    s += countHead('C2', false, lit,", E2E),
    ('17b solver: level 28\'s sticks not named a trap', G + 'levels.js', "roads: 2, pudding: 1, trap: 'stick',", "roads: 2, pudding: 1,", SOLVE + ' L14b'),
    ('17b solver: a worn stick holds Pudding', G + 'core.js', "const snap = by.size >= SNAP || level.pudding === who;", "const snap = by.size >= SNAP;", SOLVE + ' L14b'),
    # step 17c (ii) (D-226 to D-230): the sketch pages' planted faults where they are in the game, and a few more
    ('17c: level 22 without its channel', G + 'levels.js', "      '####.####..###.#########',\n      '####.####..###.#########',\n      '####.####..###.#########',\n",
     "      '####.####..#############',\n      '####.####..#############',\n      '####.####..#############',\n", CORE),
    ('17c: level 22 names 2 roads', G + 'levels.js', "twin: 'L11', roads: 3,", "twin: 'L11', roads: 2,", CORE),
    ('17c: level 24\'s top bar with v0.1\'s first gap', G + 'levels.js', "      '...#.#######.####.##',", "      '...#####.###.####.##',", CORE),
    ('17c: level 25 without the thermos', G + 'levels.js', "      '............#.........##',\n      '............#....*...###',\n      'S.#########.#.......####',",
     "      '......................##',\n      '.................*...###',\n      'S.#########.........####',", CORE),
    ('17c: level 26\'s button on the cake stand', G + 'levels.js', "parts: [{ kind: 'button', c: 19, r: 2,", "parts: [{ kind: 'button', c: 14, r: 3,", CORE),
    ('17c solver: level 27 without the roof over home', G + 'levels.js', "      '#####..##............###',", "      '#####..##...............',", SOLVE + ' L14'),
    ('17c: level 28\'s home a row higher', G + 'levels.js', "      '........................',\n      '............##.G......##',",
     "      '...............G........',\n      '............##.#......##',", CORE),
    ('17c: level 28 with three straws', G + 'levels.js', "    tray: { ramp: 3, tube: 4, bridge: 2,", "    tray: { ramp: 3, tube: 3, bridge: 2,", CORE),
    ('17c: the picnic at full strength', G + 'art.js', "  if (name === 'picnic') return g(picnicQ1(w), '', ' data-back=\"picnic\"');", "  if (name === 'picnic') return g(picnicArt(w), '', ' data-back=\"picnic\"');", CORE),
    ('17c: the playground\'s busy things at full strength', G + 'art.js', "const PARK_QUIET = 0.4;", "const PARK_QUIET = 1;", CORE),
    ('17c solver: level 22 without its channel', G + 'levels.js', "      '####.####..###.#########',\n      '####.####..###.#########',\n      '####.####..###.#########',\n",
     "      '####.####..#############',\n      '####.####..#############',\n      '####.####..#############',\n", SOLVE + ' L11b'),
    ('17c solver: level 24\'s top bar with v0.1\'s first gap', G + 'levels.js', "      '...#.#######.####.##',", "      '...#####.###.####.##',", SOLVE + ' L12b'),
    ('17c solver: level 26 without the hamper\'s end', G + 'levels.js', "      '...*....#...............',\n      '........#G..............',\n      'S......########...######',",
     "      '...*....................',\n      '.........G..............',\n      'S.......#######...######',", SOLVE + ' L13b'),
    # step 18a (ii): level 29, the fair, the zip ride R2, the zip-line's card and the party P1
    ('18a: level 29 without the balcony\'s end (no hook)', G + 'levels.js', "      '......####...........###',", "      '......###............###',", CORE),
    ('18a: level 29 with five straws', G + 'levels.js', "    tray: { zip: 1, bouncer: 2, ramp: 4, tube: 6,", "    tray: { zip: 1, bouncer: 2, ramp: 4, tube: 5,", CORE),
    ('18a: no zip-line card', G + 'cards.js', "'button', 'pudding', 'zip'];", "'button', 'pudding'];", CORE),
    ('18a: the zip card\'s peg in before its hook', G + 'cards.js', "kf('hc-zip-peg', '0%, 43.9% { opacity: 0; transform: translateY(-60px) } 44% { opacity: 1;",
     "kf('hc-zip-peg', '0%, 23.9% { opacity: 0; transform: translateY(-60px) } 24% { opacity: 1;", CORE),
    ('18a: the fast wheel never paused', G + 'style.css', ".fx-spin-run { animation: fx-spin 9s linear infinite paused; }", ".fx-spin-run { animation: fx-spin 9s linear infinite; }", CORE),
    ('18a solver: level 29\'s home on the coconut shy', G + 'levels.js', "      '.....................G..',\n      '......####...........###',\n      '....................####',",
     "      '........................',\n      '......####...........###',\n      '..................G.####',", SOLVE + ' L15'),
    ('18a: the board\'s mode never set', G + 'game.js', "  board.dataset.mode = S.mode;   // build, run or party: style.css moves the fair by it (D-234)\n", '', E2E),
    ('18a: the fair at full strength while building', G + 'style.css', ".fair-busy { opacity: .4; transition: opacity .8s; }", ".fair-busy { opacity: .75; transition: opacity .8s; }", E2E),
    ('18a: the line never sags', G + 'game.js', "const ry = s.l0.y + (s.l1.y - s.l0.y) * u + ZIP_SAG * 4 * u * (1 - u);", "const ry = s.l0.y + (s.l1.y - s.l0.y) * u;", E2E),
    ('18a: no kicks on the line', G + 'game.js', "pose: Math.floor(local / 0.18) % 2 ? 'zipk1' : 'zipk2' };", "pose: 'zip' };", E2E),
    ('18a: no sparkles', G + 'game.js', "      if (u >= i / cols && !w.sparks[k]) {", "      if (false) {", E2E),
    ('18a: the usual party at the fair', G + 'game.js', "  const fair = S.def.back === 'fairA';", "  const fair = false;", E2E),
    ('18a: the zip card\'s caption gone', G + 'cards.js', "  zip: 'Hook it high, peg it low!',", "  zip: '',", CARDS_E2E),
    # step 18b (ii): level 30, the lantern gate G2 and the poppers C1
    ('18b: level 30\'s drawbridge one square short', G + 'levels.js', "lid: [[2, 5], [3, 5]] }],", "lid: [[3, 5]] }],", CORE),
    ('18b: level 30 with one straw fewer', G + 'levels.js', "    tray: { zip: 1, catapult: 1, signpost: 1, ramp: 1, bridge: 2, tube: 5, bouncer: 1 },", "    tray: { zip: 1, catapult: 1, signpost: 1, ramp: 1, bridge: 2, tube: 4, bouncer: 1 },", CORE),
    ('18b: eight lanterns on the string', G + 'art.js', "  const N = 9;\n", "  const N = 8;\n", CORE),
    ('18b: the poppers move with reduced motion', G + 'style.css', "@media (prefers-reduced-motion: reduce) { .pp-cone, .pp-flash, .pp-bit, [data-lit] .gl-halo { animation: none; } }\n", '', CORE),
    ('18b solver: level 30\'s home on the coconut shy', G + 'levels.js', "      'G................###.###',\n      '##..####................',",
     "      '.................###.###',\n      '##..####...G............',", SOLVE + ' L15b'),
    ('18b: no lantern gate at the fair', G + 'game.js', "const gate = S.def.back === 'fairA' ? gateLook('G2'", "const gate = false ? gateLook('G2'", E2E),
    ('18b: the lantern gate on every button', G + 'game.js', "const gate = S.def.back === 'fairA' ? gateLook('G2'", "const gate = true ? gateLook('G2'", E2E),
    ('18b: the lanterns never light', G + 'game.js', "    board.querySelector(`[data-button=\"${i}\"]`)?.setAttribute('data-lit', '');", "", E2E),
    ('18b: no poppers at level 30', G + 'game.js', "const POPPERS = { L15b: 'C1' };", "const POPPERS = {};", E2E),
]


def run(fault):
    name, rel, old, new, test = fault
    tmp = tempfile.mkdtemp(prefix='hh-mut-')
    try:
        for d in ('games', 'tools/tests/games') + (('shared',) if test in (E2E, CARDS_E2E, SPIKE_E2E) else ()):   # the game loads P-020's shared/bridge.js (link.js); without it every browser test fails to load (ER-017)
            shutil.copytree(os.path.join(REPO, d), os.path.join(tmp, d))
        path = os.path.join(tmp, rel)
        text = open(path, encoding='utf-8').read()
        if text.count(old) != 1:
            return name, 'error: the fault\'s text is not found exactly once'
        open(path, 'w', encoding='utf-8').write(text.replace(old, new))
        if test == SPIKE_E2E:   # it builds the preview, whose stamp names a commit: give the copy a git of its own
            env = dict(os.environ, GIT_AUTHOR_NAME='bench', GIT_AUTHOR_EMAIL='bench@localhost', GIT_COMMITTER_NAME='bench', GIT_COMMITTER_EMAIL='bench@localhost')
            for cmd in (['init', '-q'], ['add', '-A'], ['commit', '-q', '-m', 'bench copy']):
                subprocess.run(['git', '-C', tmp] + cmd, capture_output=True, env=env, check=True)
        script, *ids = test.split(' ')   # the solver's faults name the levels to solve after it
        r = subprocess.run([sys.executable, '-B', os.path.join(tmp, 'tools/tests/games', script)] + (ids or [os.path.join(tmp, 'pics')]),
                           capture_output=True, text=True, timeout=900)
        return name, 'caught' if r.returncode != 0 else 'MISSED'
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


only = sys.argv[sys.argv.index('--only') + 1] if '--only' in sys.argv else ''
faults = [f for f in FAULTS if not ('--fast' in sys.argv and f[4] in (E2E, CARDS_E2E, SPIKE_E2E)) and only in f[0]]
if '--control' in sys.argv:   # no fault: the copy (and its git, for the spike's browser test) must pass, or every catch means nothing
    faults = [('control: no fault', 'games/hamster-highway/core.js', 'export const BIG_FALL = 3;', 'export const BIG_FALL = 3;', SPIKE_E2E),
              ('control: no fault', 'games/hamster-highway/core.js', 'export const BIG_FALL = 3;', 'export const BIG_FALL = 3;', CORE)]
results = [run(f) for f in faults]
for name, res in results:
    print(f'{res:8} {name}')
caught = sum(1 for _, r in results if r == 'caught')
print(f'{caught} of {len(results)} faults caught')
sys.exit(0 if caught == len(results) else 1)
