"""Bench, not part of the close: plants faults in Hamster Highway's first build and counts how many the
tests catch (project rules: test the tests). Version 1.8 (16 Nov, step 10).
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
FAULTS = [
    ('a drop of 3 is safe', G + 'core.js', 'export const BIG_FALL = 3;', 'export const BIG_FALL = 4;', CORE),
    ('a bouncer throws 2 up', G + 'core.js', 'export const BOUNCE = 3;', 'export const BOUNCE = 2;', CORE),
    ('a bridge holds nobody', G + 'core.js', "const HOLDS = new Set(['#', 'bridge', 'ramp', 'tube', 'stick']);", "const HOLDS = new Set(['#', 'ramp', 'tube', 'stick']);", CORE),
    ('a bridge fits where they stand', G + 'core.js', 'return !HOLDS.has(below) && (side(-1) || side(1));', 'return HOLDS.has(below) && (side(-1) || side(1));', CORE),
    ('a ramp fits in mid-air', G + 'core.js', '  return FLOOR.has(below);\n}', '  return below !== null;\n}', CORE),
    ('a wall does not stop them', G + 'core.js', "if (next === null || next === '#') return done('stuck');", "if (next === null) return done('stuck');", CORE),
    ('a ramp does not lift', G + 'core.js', '      c += 1;\n      r -= 1;\n', '      c += 1;\n', CORE),
    ('the seed is missed on foot', G + 'core.js', "    yield touch(st, c, r);\n  }\n  return done('stuck');", "    yield st;\n  }\n  return done('stuck');", CORE),
    ('an empty tray entry is allowed', G + 'core.js', 'n < 1) throw', 'n < 0) throw', CORE),
    ('a placed gadget stays in the tray', G + 'core.js', 'n[kind] = (n[kind] || 0) - 1;', 'n[kind] = (n[kind] || 0) - 0;', CORE),
    ('any number fit in a cup', G + 'core.js', 'return aboard(s.part, k).length < SEATS && !!cs', 'return !!cs', CORE),
    ('three fit in a cup', G + 'core.js', 'export const SEATS = 2;', 'export const SEATS = 3;', CORE),
    ('the second in a cup steps out at once', G + 'core.js', "      if (stop.seat) yield { c, r, act: 'wait', dur: SHARE_WAIT, seat: stop.seat };", '', CORE),
    ('a hamster steps onto a cup about to move', G + 'core.js', 'cs.leaves - t >= TICKS.walk', 'cs.leaves - t >= 0', CORE),
    ('a rider sets off before the cup does', G + 'core.js', "      if (leaves > ctx.now()) yield { c, r, act: 'wait', dur: leaves - ctx.now(), seat: stop.seat };\n", '', CORE),
    ('all five come out at once', G + 'core.js', 'next: i * RELEASE,', 'next: 0,', CORE),
    ('the seed is taken by every hamster', G + 'core.js', '        seed = false;\n        return true;', '        return true;', CORE),
    ('a gadget fits on a worn stick', G + 'core.js', "const FLOOR = new Set(['#', 'bridge']); ", "const FLOOR = new Set(['#', 'bridge', 'stick']); ", CORE),
    ('a stick snaps under the third', G + 'core.js', 'const snap = by.size >= SNAP;', 'const snap = by.size >= SNAP - 1;', CORE),
    ('a snapped stick stays', G + 'core.js', '        if (snap) delete placed[k];\n', '', CORE),
    ('a board 25 wide is accepted', G + 'core.js', 'export const MAX_COLS = 24;', 'export const MAX_COLS = 25;', CORE),
    ('one hamster tips the see-saw', G + 'core.js', 'export const PAIR = 2;', 'export const PAIR = 1;', CORE),
    ('the see-saw carries nobody', G + 'core.js', 'if (was !== now && (r === was || r === now + 1))', 'if (false)', CORE),
    ('the see-saw tips at once', G + 'core.js', 'dur: Math.max(1, s.tippedAt + TIP - t)', 'dur: 1', CORE),
    ('a lone hamster waits for ever', G + 'core.js', 'if (++waited > SEESAW_WAIT)', 'if (++waited > 1e9)', CORE),
    ('they step up onto its raised end', G + 'core.js', "    if (ctx.plank(c + 1, r)) return done('stuck');", '', CORE),
    ('a gadget fits in its space', G + 'core.js', ' || (level.space && level.space.has(key(c, r)))) return false;', ') return false;', CORE),
    ('the second cup is a third of a loop on', G + 'core.js', 'const u = t + (k * all) / 2;', 'const u = t + (k * all) / 3;', CORE),
    ('a lift keeps only its first cup', G + 'core.js', 'Array.from({ length: p.cups || 1 }, (_, k) => k)', 'Array.from({ length: 1 }, (_, k) => k)', CORE),
    ('a lift may have three cups', G + 'core.js', '&& (cups === 1 || cups === 2);', '&& (cups >= 1 && cups <= 3);', CORE),
    ('a rider\'s cup is not named', G + 'core.js', "act: 'ride', cup: stop.cup, seat: stop.seat }", "act: 'ride', seat: stop.seat }", CORE),
    ('level 9 has no spare bridge', G + 'levels.js', 'tray: { bridge: 2, ramp: 1, floater: 1 }', 'tray: { bridge: 1, ramp: 1, floater: 1 }', CORE),
    ('level 10 has two tubes', G + 'levels.js', 'tray: { bridge: 1, ramp: 2, bouncer: 1, floater: 1, tube: 3 }', 'tray: { bridge: 1, ramp: 2, bouncer: 1, floater: 1, tube: 2 }', CORE),
    ('the cups stand still during a run', G + 'game.js', '  moveCups(R);\n', '', E2E),
    ('a click on a placed gadget keeps it down', G + 'game.js', '    delete S.placed[k];\n', '    void k;\n', E2E),
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
    ('twin: levels open by the old rule', G + 'game.js', '  return opens(IDS, S.progress, i);', '  return i === 0 || !!S.progress.done[LEVELS[i - 1].id];', CARDS_E2E),
]


def run(fault):
    name, rel, old, new, test = fault
    tmp = tempfile.mkdtemp(prefix='hh-mut-')
    try:
        for d in ('games', 'tools/tests/games'):
            shutil.copytree(os.path.join(REPO, d), os.path.join(tmp, d))
        path = os.path.join(tmp, rel)
        text = open(path, encoding='utf-8').read()
        if text.count(old) != 1:
            return name, 'error: the fault\'s text is not found exactly once'
        open(path, 'w', encoding='utf-8').write(text.replace(old, new))
        r = subprocess.run([sys.executable, '-B', os.path.join(tmp, 'tools/tests/games', test), os.path.join(tmp, 'pics')],
                           capture_output=True, text=True, timeout=600)
        return name, 'caught' if r.returncode != 0 else 'MISSED'
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


only = sys.argv[sys.argv.index('--only') + 1] if '--only' in sys.argv else ''
faults = [f for f in FAULTS if not ('--fast' in sys.argv and f[4] in (E2E, CARDS_E2E)) and only in f[0]]
results = [run(f) for f in faults]
for name, res in results:
    print(f'{res:8} {name}')
caught = sum(1 for _, r in results if r == 'caught')
print(f'{caught} of {len(results)} faults caught')
sys.exit(0 if caught == len(results) else 1)
