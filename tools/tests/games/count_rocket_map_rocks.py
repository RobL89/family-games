"""Counts for the one-game map (D-058, Q-026). Version 1.0.

Step 2c-1. Not a check: works out the numbers quoted in Claude's assessment and in Q-026,
so none of them is typed by hand. With replays paying only the rocks above a level's best,
a level pays at most one rock for each landing of a round, so the map holds a fixed number
of moon rocks; this sets that against the ships' prices. Also the room a dice face has on a
line of 0 to 10 (D-060), from the line lengths measured by measure_rocket_lander_line.py 1.0.

Usage, from the repo root:
    python3 -B tools/tests/games/count_rocket_map_rocks.py
"""
import math

PRICES = {  # D-046's starting values (one home: games/_common/rocket/fleet.js)
    'Cardboard Box': 20, 'Teapot': 30, 'Bubble Pod': 50, 'Saucer': 70,
    'Crystal Comet': 100, 'Golden Phoenix': 140, 'Aurora Cruiser': 200,
}
LANDINGS_A_ROUND = 8       # round.js: landings_per_round defaults to 8, one rock a perfect landing
LEVELS_A_SYSTEM = 8        # Rob's "8?" (D-058)
SYSTEMS_NOW = 6            # planets.js: Moon, Red Dust, Candy, Ice, Jungle, Ringed
LADDERS_NOW = 8 + 8        # Rocket Lander's and Rocket Sums' levels (D-038, D-039)
LINE_PX = {'phone upright': 330, 'phone sideways': 768, 'PC': 1165}  # measure_rocket_lander_line.py 1.0

total = sum(PRICES.values())
levels = SYSTEMS_NOW * LEVELS_A_SYSTEM
per_system = LEVELS_A_SYSTEM * LANDINGS_A_ROUND
print(f'ship prices, all seven: {total} rocks')
print(f'levels on a map of {SYSTEMS_NOW} systems: {levels}; today\'s two ladders: {LADDERS_NOW}; '
      f'new levels needed: {levels - LADDERS_NOW}')
print(f'most rocks the map holds: {levels * LANDINGS_A_ROUND}')
print(f'systems needed to buy every ship, every landing perfect: {total / per_system:.2f} '
      f'-> {math.ceil(total / per_system)}')
for name, px in LINE_PX.items():
    print(f'{name}: a line of 0 to 10 gives {px / 10:.1f} px a mark')
