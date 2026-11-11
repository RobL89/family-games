"""Ship prices against a year's moon rocks (Rob, 11 Nov 2026: "able to buy around half the ships by
the end of one year"). Version 1.0. Not a check: works out the numbers quoted in Claude's options,
so none of them is typed by hand.

A year is one school year of a track: 3 systems of 8 levels (7 and a challenge), each paying at most
one rock a perfect landing, 8 a level across replays (progress.js ROCKS_PER_LEVEL). Prices are read
from fleet.js, their one home. Each option scales every price and rounds to the nearest 5.

Usage, from the repo root:
    python3 -B tools/tests/games/count_rocket_ship_prices.py
"""
import re
from pathlib import Path

src = Path('games/_common/rocket/fleet.js').read_text()
rows = re.findall(r"\{ id: '(\w+)', name: '([^']+)', tier: '(\w+)', price: (\d+),", src)
ships = [(n, int(p)) for _, n, _, p in rows if int(p) > 0]
ROCKS_PER_LEVEL = int(re.search(r'ROCKS_PER_LEVEL = (\d+)', Path('games/_common/rocket/progress.js').read_text()).group(1))
YEAR_MAX = 3 * 8 * ROCKS_PER_LEVEL
TRACK_MAX = 2 * YEAR_MAX
half = len(ships) // 2


def r5(x):
    return max(5, int(5 * round(x / 5)))


print(f'{len(ships)} ships to buy; half is {half}. A year holds at most {YEAR_MAX} rocks, a track {TRACK_MAX}.')
for f in (1.0, 0.75, 0.6, 0.5):
    p = sorted(r5(v * f) for _, v in ships)
    cheap = sum(p[:half])
    print(f'x{f}: prices {p}; all {sum(p)}; cheapest {half} cost {cheap} = '
          f'{100 * cheap / YEAR_MAX:.0f}% of a year\'s rocks')
