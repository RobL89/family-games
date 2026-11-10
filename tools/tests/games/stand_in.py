"""The stand-in map the older browser tests play (step 2c-3b). Version 1.0.

Until step 2c-3b the higher track (?track=year2) held the stand-in levels (map.js 2.0, D-068): Moon 1 to 8
were Number mode's eight levels and Red Dust 1 to 8 the eight sums levels, and the older browser tests
were written for them (test_rocket_lander_e2e.py, _levels.py, _sums_e2e.py, _map_e2e.py,
test_rocket_hangar_e2e.py). Year 2 now holds that track (map.js 2.1, D-100), so those tests keep playing
the stand-ins this way, their checks unchanged: map.js 2.0, kept byte for byte as fixture_map_stand_in.js
(its sha256 below, checked before every use), is served to their pages in place of
games/rocket-lander/map.js. The game's own maps have their own tests (test_rocket_lander_core.py,
test_rocket_lander_reception_e2e.py, test_rocket_lander_year2_e2e.py). A preview bundle carries its map
inside the page, so this can't reach it: tests of a bundle play real levels.

Usage, in a test: import stand_in; stand_in.serve(ctx) after the context's own routes (Playwright runs
the last route registered first).
"""
import hashlib
import os

HERE = os.path.dirname(os.path.abspath(__file__))
FIXTURE = os.path.join(HERE, 'fixture_map_stand_in.js')
SHA256 = '614c309b3b57412b728a4a48dd5f30bfb51ebc3782fdc527c559375a735420dc'  # map.js 2.0 at cb0ee04


def body():
    """The fixture's bytes, once its sha256 is map.js 2.0's; stops the test otherwise."""
    with open(FIXTURE, 'rb') as f:
        data = f.read()
    if hashlib.sha256(data).hexdigest() != SHA256:
        raise SystemExit(f'{os.path.basename(FIXTURE)} is not map.js 2.0 (its sha256 differs): stopping rather than testing the wrong map')
    return data


def serve(ctx):
    """Serve the stand-in map to every page of a Playwright context, in place of the game's map.js."""
    data = body()
    ctx.route('**/games/rocket-lander/map.js*', lambda r: r.fulfill(status=200, body=data, content_type='text/javascript; charset=utf-8'))
