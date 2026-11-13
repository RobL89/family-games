"""Shared parts of the games' release checks (contract 0.4, GC7): a stand-in Sheet, browser pages at
the three sizes, and the PASS/FAIL tally. Each game's check is tools/tests/games/<id>/check.py.

From the repo root, serve the site with `python3 -m http.server 8123 --bind 127.0.0.1`, then run
`python3 -B tools/tests/games/<id>/check.py <folder for screenshots>`. Ends "PASS n of n".

Outside sites are blocked in the test browser. Google Fonts are refused (the games fall back to
their other fonts). Games that load three.js r128 from cdnjs get a local copy if FG_THREE_JS names
one (for example `npm pack three@0.128.0`, then package/build/three.min.js); without it their 3D
parts are skipped.
"""
import json
import os
import re
import sys
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))
from test_config import route_config  # noqa: E402

BASE = 'http://127.0.0.1:8123/'
CODE = 'test-code'
SIZES = [('phone', 390, 844, True), ('sideways', 844, 390, True), ('pc', 1366, 768, False)]
THREE_JS = os.environ.get('FG_THREE_JS', '')
THREE_URL = re.compile(r'https://cdnjs\.cloudflare\.com/ajax/libs/three\.js/r128/three\.min\.js')


class Check:
    """Stand-in Sheet with made-up players, pages, and the tally for one game's check.
    script='0.4.0' answers like apps-script/Code.gs 0.4.0: one set of lists per child and each game's
    state with its time, the newest save winning (P78). The default answers like 0.3.0."""

    def __init__(self, game_id, out, lists=None, script='0.3.0'):
        self.game_id = game_id
        self.out = out
        os.makedirs(out, exist_ok=True)
        self.results = []
        self.errors = []
        self.scores = []
        self.profiles = [
            {'profile_id': 'p_sam', 'nickname': 'Sam', 'avatar': 'fox', 'colour': '#2E8FD0', 'skin': 'sticker'},
            {'profile_id': 'p_alex', 'nickname': 'Alex', 'avatar': 'bunny', 'colour': '#E0457B', 'skin': 'sticker'},
        ]
        self.lists = lists or {}
        self.script = script
        self.held = []
        self.states = {}  # (profile_id, game_id) -> {'state', 'at'}, script 0.4.0 only
        self.three = open(THREE_JS, encoding='utf-8').read() if THREE_JS else None

    def handle(self, body):
        if body.get('code') != CODE:
            return {'ok': False, 'error': 'wrong_code'}
        a = body.get('action')
        v4 = self.script == '0.4.0'
        if a == 'ping':
            return {'ok': True, 'version': self.script}
        if a == 'profiles':
            return {'ok': True, 'version': self.script, 'profiles': self.profiles, 'skins': []}
        if a == 'profile':
            p = next(x for x in self.profiles if x['profile_id'] == body['profile_id'])
            out = {'ok': True, 'profile': p, 'recent': [], 'achievements': [],
                   'stats': {'total_plays': 0, 'stars_total': 0, 'games': {}, 'days_played': []}}
            if v4:
                per_game = self.lists.get(p['profile_id'], {})
                out['word_lists'] = per_game[sorted(per_game)[0]] if per_game else []
                out['states'] = {g: dict(v) for (pid, g), v in self.states.items() if pid == p['profile_id']}
            else:
                out['lists'] = self.lists.get(p['profile_id'], {})
            return out
        if a == 'saveState' and v4:
            now = datetime.now(timezone.utc).isoformat(timespec='milliseconds').replace('+00:00', 'Z')
            at = min(body.get('at') or now, now)  # ISO times in UTC sort as text
            key = (body['profile_id'], body['game_id'])
            if key in self.states and self.states[key]['at'] > at:
                return {'ok': True, 'saved': False, 'at': self.states[key]['at']}
            self.states[key] = {'state': body.get('state'), 'at': at}
            return {'ok': True, 'saved': True, 'at': at}
        if a == 'sync':
            self.scores += body.get('results', [])
            return {'ok': True, 'accepted': [r['event_id'] for r in body.get('results', [])], 'duplicates': [], 'rejected': [],
                    'achievements_recorded': []}
        return {'ok': False, 'error': 'unknown_action'}

    def check(self, name, ok, detail=''):
        self.results.append((name, bool(ok), detail))
        print(('PASS ' if ok else 'FAIL ') + name + (f'  ({detail})' if detail and not ok else ''))

    def page(self, browser, w, h, mobile=False, muted=False, features=None):
        """A fresh device with the family code, the Testing switch on, and sound on or off."""
        ctx = browser.new_context(viewport={'width': w, 'height': h}, is_mobile=mobile, has_touch=mobile,
                                  device_scale_factor=2 if mobile else 1)
        ctx.add_init_script(f"if (!localStorage.getItem('fg.familyCode')) {{ localStorage.setItem('fg.familyCode', JSON.stringify('{CODE}'));"
                            f" localStorage.setItem('fg.testing', 'true'); localStorage.setItem('fg.muted', '{'true' if muted else 'false'}'); }}")
        ctx.route(re.compile(r'https://script\.google\.com/.*'), self._sheet)
        ctx.route(re.compile(r'https://fonts\.(googleapis|gstatic)\.com/.*'), lambda route: route.abort())
        if self.three:
            ctx.route(THREE_URL, lambda route: route.fulfill(status=200, content_type='text/javascript', body=self.three))
        route_config(ctx, features)
        pg = ctx.new_page()
        pg.on('pageerror', lambda e: self.errors.append(f'pageerror: {e}'))
        pg.on('console', lambda m: self.errors.append(f'console {m.type}: {m.text}')
              if m.type == 'error' and 'ERR_FAILED' not in m.text and 'ERR_BLOCKED' not in m.text else None)
        return ctx, pg

    # The stand-in Sheet. While `hold` is True its answers wait, like the live Sheet's 2.5 to 3 seconds
    # (P81), until release() sends them.
    hold = False

    def _sheet(self, route):
        if self.hold:
            self.held.append(route)
        else:
            self._answer(route)

    def _answer(self, route):
        route.fulfill(status=200, content_type='application/json',
                      body=json.dumps(self.handle(json.loads(route.request.post_data or '{}'))))

    def release(self):
        self.hold = False
        while self.held:
            self._answer(self.held.pop(0))

    def open_game(self, pg, player='p_sam', wait=2500):
        """Home first (fills the device's cache), then the game's tile, as a child would."""
        pg.goto(BASE + f'index.html?player={player}')
        pg.wait_for_selector('.home')
        pg.wait_for_timeout(1000)
        href = pg.get_attribute(f'[data-g="{self.game_id}"]', 'href') or ''
        self.check(f'tile opens the wrapper ({player})', href == f'play.html?game={self.game_id}&player={player}', href)
        pg.click(f'[data-g="{self.game_id}"]')
        pg.wait_for_selector('.wframe iframe')
        pg.wait_for_timeout(wait)
        return pg.frame_locator('.wframe iframe'), pg.frames[1]

    def fits_under_bar(self, pg, name, w, h):
        bar = pg.evaluate("document.querySelector('.wbar').getBoundingClientRect().height")
        fr = pg.evaluate("(() => { const r = document.querySelector('.wframe iframe').getBoundingClientRect(); return [r.top, r.bottom, r.width]; })()")
        self.check(f'{name}: the game starts below the bar and fills the rest', abs(fr[0] - bar) < 2 and abs(fr[1] - h) < 2 and abs(fr[2] - w) < 2,
                   f'bar {bar}, frame {fr}')

    def finish(self):
        self.check('no page errors', not self.errors, '; '.join(self.errors[:5]))
        passed = sum(1 for _, ok, _ in self.results if ok)
        print(f'\nPASS {passed} of {len(self.results)}' if passed == len(self.results)
              else f'\n{len(self.results) - passed} FAILED of {len(self.results)}')
        return passed == len(self.results)


# Run inside a game's page: is sound off in force? (games/_common/sound-off/sound-off.js)
SOUND_STATE = """() => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const quiet = ctx.destination instanceof GainNode && ctx.destination.gain.value === 0;
  ctx.close();
  return { flag: !!window.__fgSoundOff, quietAudio: quiet,
           speechPatched: !!window.SpeechSynthesis && !/native code/.test(String(SpeechSynthesis.prototype.speak)) };
}"""
