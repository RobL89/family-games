"""Bench, not part of the close: plants faults in Rocket Lander and counts how many the tests catch.
Version 1.4.

Changes at v1.4: faults in Bip's moment (D-044), the progress kept on the device (D-042) and
the shipped font (D-043); two faults' texts follow round.js 1.1; --finale runs only these new
faults. Not planted: faults in build_preview.py, as a copy without git history can't build.

Changes at v1.3: the round flow moved to games/_common/rocket/round.js (step 2a-2), so the
faults planted in it point there; two faults in the mode interface; --engine runs only the
faults in round.js and the mode file (game.js).

Changes at v1.2: faults in Number mode's level table, rules, label looks and level wiring
(D-035, D-038), caught by the core test or the levels test; --fast skips the levels test too.
Changes at v1.1: the shared engine's files are in games/_common/rocket/ (D-027).

Each fault is one exact text change in a copy of the repo's games/ and tools/tests/games/
folders (a temporary folder), run against the test meant to catch it. The repo itself is
never changed. A fault whose text isn't found exactly once is an error, not a catch.

Usage, from the repo root:
    python3 -B tools/tests/games/mutate_rocket_lander.py [--fast] [--number-mode] [--engine] [--finale]
--fast skips the faults that need a full browser test (about 3 minutes each).
--number-mode runs only the Number mode faults (added at v1.2).
--engine runs only the faults in round.js and games/rocket-lander/game.js (added at v1.3).
"""
import os, shutil, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
G = 'games/rocket-lander/'
C = 'games/_common/rocket/'
CORE, LABELS, E2E = 'test_rocket_lander_core.py', 'test_rocket_lander_labels.py', 'test_rocket_lander_e2e.py'
LEVELS = 'test_rocket_lander_levels.py'

FAULTS = [
    ('stars rule 85% becomes 80%', C + 'numbers.js', 'right * 100 >= 85 * total', 'right * 100 >= 80 * total', CORE),
    ('ends no longer swapped', C + 'numbers.js', '[from, to] = [to, from];', '', CORE),
    ('ordinary minus sign', C + 'numbers.js', "const MINUS = '−';", "const MINUS = '-';", CORE),
    ('settings not kept in range', C + 'settings.js', 'v = Math.min(spec.max, Math.max(spec.min, n));', 'v = n;', CORE),
    ('any option accepted', C + 'settings.js', 'if (spec.options.includes(raw)) v = raw;', 'v = raw;', CORE),
    ('a default changed', C + 'settings.js', 'landings_per_round: { default: 8,', 'landings_per_round: { default: 10,', CORE),
    ('clock in the core', C + 'numbers.js', 'export const tidy = (n) =>', 'export const started = Date.now();\nexport const tidy = (n) =>', CORE),
    ('a launcher import comes back', G + 'game.js', "from '../_common/rocket/round.js';", "from '../../shared/round.js';", CORE),
    ('state kept on the device', C + 'kit.js', 'export function saveState(state) { saved = copy(state || {});',
     "export function saveState(state) { saved = copy(state || {}); localStorage.setItem('rl', '1');", CORE),
    ('RL-3: labels never fade', C + 'scene.js', 'b.alpha = crosses(b) ? clamp(1 - hb.a * 1.5, 0, 1) : 1;', 'b.alpha = 1;', LABELS),
    ('RL-3: overlap tested on half the box', C + 'scene.js', 'b.x < hb.x + hb.w && hb.x < b.x + b.w', 'b.x < hb.x + hb.w / 2 && hb.x + hb.w / 2 < b.x + b.w', LABELS),
    ('begin() drops the saved state', C + 'round.js', "progress = { ...DEFAULT_PROGRESS, ...(state && typeof state === 'object' ? state : keptOnDevice(mode.id) || {}) };",
     'progress = { ...DEFAULT_PROGRESS };', E2E),
    ('a good round unlocks nothing', C + 'round.js', 'if (stars >= 2 && progress.unlocked < PLANETS.length) {', 'if (stars >= 3 && progress.unlocked < PLANETS.length) {', E2E),
    # Number mode (D-035, D-038)
    ('level 2 loses its dice faces', G + 'levels.js', "mix: { any: 2, dice: 1 }, source: 'D-038: 0 to 10, dice faces join'",
     "mix: { any: 1 }, source: 'D-038: 0 to 10, dice faces join'", CORE),
    ('level 7 writes every number', G + 'levels.js', "label_every: 5, labels: 'plain'", "label_every: 1, labels: 'plain'", CORE),
    ('ties go to dice first', G + 'rules.js', "export const RULES = ['any', 'parity', 'dice'];", "export const RULES = ['dice', 'parity', 'any'];", CORE),
    ('remainders dropped', G + 'rules.js', 'out[e.r] += 1; left -= 1;', 'left -= 1;', CORE),
    ('a dice face may be 0', G + 'rules.js', 'whole(v) && v >= 1 && v <= 6', 'whole(v) && v >= 0 && v <= 6', CORE),
    ('the same number twice running', G + 'rules.js', 'const pool = list.length > 1 ? list.filter((v) => !near(v, prevValue)) : list;', 'const pool = list;', CORE),
    ('a half counts as even or odd', G + 'rules.js', "return whole(spot) && parityOf(spot) === T.parity;", "return parityOf(spot) === T.parity;", CORE),
    ('a miss shows the higher number on a tie', G + 'rules.js', 'Math.abs(v - raw) < Math.abs(best - raw) - 1e-9', 'Math.abs(v - raw) <= Math.abs(best - raw) + 1e-9', CORE),
    ('level 9 accepted', C + 'ladder.js', 'n >= 1 && n <= levels.length)', 'n >= 1 && n <= levels.length + 1)', CORE),
    ('randomness in the rules', G + 'rules.js', 'export function planRound(mix, total, rand) {', 'export function planRound(mix, total, rand = Math.random) {', CORE),
    ('odd numbers not faint', C + 'scene.js', "return { fill: '#FFFFFF', a: 0.3 };", "return { fill: '#FFFFFF', a: 1 };", LEVELS),
    ('even chip in the odd colour', C + 'game.css', '.chip.even, .bubble b.even { background: var(--even); }', '.chip.even, .bubble b.even { background: var(--odd); }', LEVELS),
    ('the report says level 1', C + 'round.js', 'report({ score, stars, seconds, level: level.level });', 'report({ score, stars, seconds, level: 1 });', LEVELS),
    ('the address level ignored', C + 'round.js', '    useLevel(levelFromAddress());\n    progress =', '    useLevel(null);\n    progress =', LEVELS),
    # The mode interface (v1.3)
    ('right landings scored as wrong', C + 'round.js', 'const right = mode.isRight(T, spot, near.allowed);', 'const right = !mode.isRight(T, spot, near.allowed);', E2E),
    ('the even or odd chip loses its colour', G + 'game.js', "{ cls: `word ${T.parity}`, html: T.parity }", "{ cls: 'word', html: T.parity }", LEVELS),
    # Bip's moment, progress on the device, the shipped font (v1.4; D-042, D-043, D-044)
    ('Bip\'s moment skipped', C + 'round.js', 'at(0.6, () => startFinale());', 'at(0.6, () => endRound());', E2E),
    ('no moment after a missed last landing', C + 'round.js', 'at(4.3, () => (last ? startFinale() : takeOff()));', 'at(4.3, () => takeOff());', E2E),
    ('reported before the moment', C + 'round.js', "    setPhase('finale');\n    sfx('sparkle');",
     "    setPhase('finale');\n    report({ score: 0, stars, seconds: 0, level: level.level });\n    sfx('sparkle');", E2E),
    ('the big flag shows no stars', C + 'round.js', 'const stars = starsFor(G.right, G.total);\n    const dir', 'const stars = 0;\n    const dir', E2E),
    ('no fireworks', C + 'round.js', 'V.fireworks.push({ ...b, k: 0, a: 1, age: 0 });', '', E2E),
    ('Bip stays in the rocket', C + 'round.js', '      R.pilotIn = false;\n      V.pilot = {', '      V.pilot = {', E2E),
    ('progress not kept', C + 'round.js', 'keepOnDevice(mode.id, kept);', '', E2E),
    ('kept progress not read back', C + 'round.js', 'progress = { ...DEFAULT_PROGRESS, ...(keptOnDevice(mode.id) || {}) };', 'progress = { ...DEFAULT_PROGRESS };', E2E),
    ('any format version accepted', C + 'kit.js', 'e.v !== FORMAT)', 'false)', E2E),
    ('one entry for both tiles', C + 'kit.js', 'const entryOf = (tile) => `family-games:${tile}:progress`;', "const entryOf = (tile) => 'family-games:progress';", E2E),
    ('the entry loses its format version', C + 'kit.js', 'JSON.stringify({ v: FORMAT, ...copy(state || {}) })', 'JSON.stringify(copy(state || {}))', E2E),
    ('a second keeper of progress', C + 'scene.js', 'export class Scene {', "export const peek = () => sessionStorage.getItem('x');\nexport class Scene {", CORE),
    ('a storage read outside try', C + 'kit.js', "export function keptOnDevice(tile) {\n  try {", "export function keptOnDevice(tile) {\n  localStorage.getItem('x');\n  try {", CORE),
    ('the web font comes back', G + 'index.html', '<link rel="stylesheet" href="../_common/fonts/fredoka.css">',
     '<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&display=swap" rel="stylesheet">', CORE),
    ('the font file renamed', 'games/_common/fonts/fredoka.css', 'url(fredoka-latin-600-normal.woff2)', 'url(fredoka-600.woff2)', CORE),
    ('the font never loads', 'games/_common/fonts/fredoka.css', "font-family: 'Fredoka'; font-style: normal; font-weight: 600;", "font-family: 'Fredoka One'; font-style: normal; font-weight: 600;", E2E),
]


def run(fault):
    name, path, old, new, test = fault
    tmp = tempfile.mkdtemp(prefix='rl-mut-')
    try:
        shutil.copytree(os.path.join(REPO, 'games'), os.path.join(tmp, 'games'))
        shutil.copytree(os.path.join(REPO, 'tools/tests/games'), os.path.join(tmp, 'tools/tests/games'))
        p = os.path.join(tmp, path)
        text = open(p, encoding='utf-8').read()
        if text.count(old) != 1:
            return name, 'ERROR (text found %d times)' % text.count(old)
        open(p, 'w', encoding='utf-8').write(text.replace(old, new))
        r = subprocess.run([sys.executable, '-B', os.path.join(tmp, 'tools/tests/games', test)], capture_output=True, text=True, timeout=900)
        return name, 'caught' if r.returncode != 0 else 'MISSED'
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


faults = [f for f in FAULTS if not ('--fast' in sys.argv and f[4] in (E2E, LEVELS))]
if '--number-mode' in sys.argv:  # only the Number mode faults (v1.2)
    first = next(i for i, f in enumerate(FAULTS) if f[0] == 'level 2 loses its dice faces')
    faults = [f for f in faults if FAULTS.index(f) >= first]
if '--engine' in sys.argv:  # only the faults in the round flow and the mode file (v1.3)
    faults = [f for f in faults if f[1] in (C + 'round.js', G + 'game.js')]
if '--finale' in sys.argv:  # only the faults added at v1.4
    first = next(i for i, f in enumerate(FAULTS) if f[0] == 'Bip\'s moment skipped')
    faults = [f for f in faults if FAULTS.index(f) >= first]
with ThreadPoolExecutor(max_workers=3) as ex:
    results = list(ex.map(run, faults))
for name, res in results:
    print(f'  {res:<28} {name}')
caught = sum(res == 'caught' for _, res in results)
print(f'{caught}/{len(results)} planted faults caught')
sys.exit(0 if caught == len(results) else 1)
