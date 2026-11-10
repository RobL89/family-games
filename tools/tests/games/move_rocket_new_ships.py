"""Moves the five new ships from the step 2d-1 mock-ups into the game (step 2d-2, D-078). Version 1.0.

A one-off, kept as the record of how the move was made. It splices each part of
tools/tests/games/sketch_rocket_new_ships.js 1.0 into the game's own files with the mock-up
builder's splice() (sketch_rocket_new_ships.py 1.0), the same splice that drew the accepted
page, so the code in the game is byte for byte the code Rob saw:
  - games/_common/rocket/ships.js: the five ships before its SHIPS table, the table in D-079's
    order, and the three new kinds of spark in drawPart;
  - games/_common/rocket/fleet.js: the five rows at D-077's tiers and prices;
  - games/_common/rocket/sound.js: each new ship's own landing sound.
Each splice must match exactly one place, or nothing is written. It refuses to run twice (the
ships would be there already). It then checks that each part now appears in its file exactly
once, as it stands in the sketch.

Usage, from the repo root: python3 -I -B tools/tests/games/move_rocket_new_ships.py
"""
import os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import sketch_rocket_new_ships as sk  # noqa: E402

REPO = sk.REPO
FILES = ['games/_common/rocket/ships', 'games/_common/rocket/fleet', 'games/_common/rocket/sound']


def main():
    parts = sk.sketch_parts()
    old = {k: open(os.path.join(REPO, k + '.js'), encoding='utf-8').read() for k in FILES}
    if "id: 'tub'" in old['games/_common/rocket/ships']:
        print('The new ships are in ships.js already: nothing to move.')
        return 1
    new = {k: sk.splice(k, old[k], parts) for k in FILES}  # raises before anything is written
    for k in FILES:
        with open(os.path.join(REPO, k + '.js'), 'w', encoding='utf-8', newline='') as f:
            f.write(new[k])
    ok = True
    for k, names in (('games/_common/rocket/ships', ('ships', 'particles')), ('games/_common/rocket/sound', ('sounds',))):
        for n in names:
            c = new[k].count(parts[n])
            print(f'{"ok  " if c == 1 else "FAIL"} {n} in {k}.js: {c} copy')
            ok = ok and c == 1
    for line in parts['fleet'].split('\n'):
        row = line.split('|', 1)[1].strip()
        c = new['games/_common/rocket/fleet'].count('  ' + row + '\n')
        print(f'{"ok  " if c == 1 else "FAIL"} fleet row {row[:40]}: {c} copy')
        ok = ok and c == 1
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())
