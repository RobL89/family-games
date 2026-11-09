"""Sketches of Rocket Lander's Number mode targets, for Rob to choose from (step 2a-1). Version 1.1.

Changes at v1.1: sketches 2, fewer written numbers (G1 to G3) and a proposed ladder, after Rob
found bare ticks too advanced; sketches 1 kept on the page below them, marked as decided (D-035).

Not a check, and not part of the game: it draws options to look at before anything is built.
It copies games/rocket-lander/ to a temporary folder, adds one line to the copy's game.js so
the scene can be reached (window.__scene), and plays the real game in headless Chromium
with small drawing patches for each option. The repo's game files are not changed.

Options drawn (on a phone held sideways, 844 x 390, unless said):
  D1 to D3  the dots target (the ideas draft's level 2, line 0 to 5)
  E1 to E3  odd and even colour hints (level 4, line 0 to 10)
  T1 to T3  ticks only (Rob's 1.1.1, level 7, line 0 to 10)
  Q6        how a miss looks today (Q-006's fade), unpatched, upright (390 x 844), line 0 to 20
  G1 to G3  sketches 2: fewer written numbers (line 0 to 10)

Stand-ins: headless Chromium for the phone; Fredoka from the npm package @fontsource/fredoka
(the font the game asks Google Fonts for), passed in as a folder. Math.random is seeded, so the
scenery and the rocket's start are the same each run; the pictures are timed by the clock, so
stars and flames differ a little between runs (the files' bytes are not repeatable).

Usage, from the repo root:
    python3 -I -B tools/tests/games/sketch_rocket_lander_number_mode.py FONT_DIR OUT_DIR
FONT_DIR holds fredoka-latin-{500,600,700}-normal.woff2. Writes one JPEG per option,
sketches.json (ids, titles, captions) and sketches.html (one page with the pictures inlined,
for a private artifact; Rob's only) to OUT_DIR, then checks the page at phone and PC widths,
light and dark, and fails on script errors, sideways scrolling or a picture that didn't load.
"""
import functools, http.server, json, os, shutil, socketserver, subprocess, sys, tempfile, threading
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
FONT_DIR, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)

# The served copy: the game folder plus the font files, and one added line in game.js.
ROOT = tempfile.mkdtemp(prefix='rl-sketch-')
shutil.copytree(os.path.join(REPO, 'games', 'rocket-lander'), os.path.join(ROOT, 'rocket-lander'))
os.makedirs(os.path.join(ROOT, 'fonts'))
for w in (500, 600, 700):
    shutil.copyfile(os.path.join(FONT_DIR, f'fredoka-latin-{w}-normal.woff2'), os.path.join(ROOT, 'fonts', f'fredoka-{w}.woff2'))
with open(os.path.join(ROOT, 'rocket-lander', 'game.js'), 'a', encoding='utf-8') as f:
    f.write('\nwindow.__scene = scene; // added by the sketch script only\n')


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


httpd = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=ROOT))
httpd.daemon_threads = True
threading.Thread(target=httpd.serve_forever, daemon=True).start()
LOCAL = f'http://127.0.0.1:{httpd.server_address[1]}/'
BASE = LOCAL + 'rocket-lander/index.html'
# The Google Fonts stylesheet is answered with one pointing at the local copies (full URLs:
# a bare /fonts/ path would resolve against fonts.googleapis.com).
FONT_CSS = ''.join(f"@font-face{{font-family:'Fredoka';font-weight:{w};font-display:block;"
                   f"src:url({LOCAL}fonts/fredoka-{w}.woff2) format('woff2')}}" for w in (500, 600, 700))

SEED = """(() => { let s = 20261109; Math.random = () => { s |= 0; s = (s + 0x6D2B79F5) | 0;
  let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; })();"""

# The patches, run in the page before Play. P: the option's parameters.
PATCH = r"""
async (P) => {
  const sc = window.__scene;
  const M = await import('./scene.js');
  const { rr, INK, FONT } = M;
  const EVEN = '#7FD8FF', ODD = '#FFC93C';            // sky blue and sun yellow (colour-blind safe pair)
  const colourOf = (v) => (Math.round(v) % 2 === 0 ? EVEN : ODD);
  const origLabels = sc.drawLabels.bind(sc), origStrip = sc.drawStrip.bind(sc);

  if (P.labels === 'none') sc.drawLabels = () => {};
  if (P.labels === 'colour') sc.drawLabels = function (ctx) {
    const S = this.labelStyle; if (!S) return;
    ctx.font = `600 ${S.fs}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round'; ctx.lineWidth = S.lw;
    for (const b of this.labelBoxes) {
      ctx.strokeStyle = INK; ctx.strokeText(b.text, b.px, S.ly);
      ctx.fillStyle = colourOf(this.line.value(b.i)); ctx.fillText(b.text, b.px, S.ly);
    }
  };
  if (P.labels === 'badge') sc.drawLabels = function (ctx) {
    const S = this.labelStyle; if (!S) return;
    const r = S.fs * 0.78, cy = S.ly - S.fs * 0.36;
    ctx.font = `700 ${S.fs}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const b of this.labelBoxes) {
      ctx.beginPath(); ctx.arc(b.px, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = colourOf(this.line.value(b.i)); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
      ctx.fillStyle = INK; ctx.fillText(b.text, b.px, cy + S.fs * 0.05);
    }
  };
  if (P.labels === 'dots') sc.drawLabels = function (ctx, hb) {
    origLabels(ctx, hb);
    const S = this.labelStyle; if (!S) return;
    for (const b of this.labelBoxes) {
      const n = Math.round(this.line.value(b.i)), rad = 4.6, gap = 12.5;
      for (let k = 0; k < n; k++) {
        const x = b.px + (k - (n - 1) / 2) * gap, y = S.ly + 15;
        ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.lineWidth = 2.2; ctx.strokeStyle = INK; ctx.stroke();
      }
    }
  };
  if (P.labels === 'faintodd') sc.drawLabels = function (ctx, hb) {
    const S = this.labelStyle; if (!S) return;
    ctx.font = `600 ${S.fs}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round'; ctx.lineWidth = S.lw;
    for (const b of this.labelBoxes) {
      ctx.globalAlpha = Math.round(this.line.value(b.i)) % 2 ? 0.3 : 1;
      ctx.strokeStyle = INK; ctx.strokeText(b.text, b.px, S.ly);
      ctx.fillStyle = '#FFFFFF'; ctx.fillText(b.text, b.px, S.ly);
    }
    ctx.globalAlpha = 1;
  };
  if (P.strip === 'tiles') sc.drawStrip = function (x) {
    origStrip(x);
    const { x0, groundY: gy, line, pps, planet: Pl } = this;
    for (let i = 0; i <= line.gaps; i++) {
      const px = x0 + i * pps, half = Math.min(pps / 2 - 1.5, 30);
      rr(x, px - half, gy - 4, half * 2, 14, 5); x.fillStyle = colourOf(line.value(i)); x.fill();
      x.lineWidth = 1.6; x.strokeStyle = INK; x.stroke();
      rr(x, px - 2.5, gy - 15, 5, 30, 2.5); x.fillStyle = INK; x.fill();
      rr(x, px - 1.5, gy - 14, 3, 28, 1.5); x.fillStyle = Pl.glow; x.fill();
    }
  };
  if (P.strip === 'tall5') sc.drawStrip = function (x) {
    origStrip(x);
    const { groundY: gy, planet: Pl } = this, px = this.xOf(5);
    rr(x, px - 3.5, gy - 24, 7, 44, 3.5); x.fillStyle = INK; x.fill();
    rr(x, px - 2, gy - 22.5, 4, 41, 2); x.fillStyle = Pl.glow; x.fill();
  };
  await document.fonts.ready;
  window.__test.begin({ settings: P.settings });
  return true;
}
"""

DIE = {1: [(15, 15)], 2: [(8, 8), (22, 22)], 3: [(8, 8), (15, 15), (22, 22)], 4: [(8, 8), (22, 8), (8, 22), (22, 22)],
       5: [(8, 8), (22, 8), (15, 15), (8, 22), (22, 22)], 6: [(8, 8), (22, 8), (8, 15), (22, 15), (8, 22), (22, 22)]}


def die_svg(n):
    pips = ''.join(f'<circle cx="{x}" cy="{y}" r="3.1" fill="#1B1446"/>' for x, y in DIE[n])
    return (f'<svg viewBox="0 0 30 30" style="height:1.05em;width:1.05em;display:block">'
            f'<rect x="1.8" y="1.8" width="26.4" height="26.4" rx="6.5" fill="#fff" stroke="#1B1446" stroke-width="2.6"/>{pips}</svg>')


def row_svg(n):
    w = n * 13 + 3
    dots = ''.join(f'<circle cx="{8 + k * 13}" cy="8" r="5" fill="#1B1446"/>' for k in range(n))
    return f'<svg viewBox="0 0 {w} 16" style="height:.62em;width:{w * 0.62 / 16:.2f}em;display:block">{dots}</svg>'


L05 = {'from': 0, 'to': 5, 'step': 1, 'label_every': 1, 'speak': False}
L10 = {'from': 0, 'to': 10, 'step': 1, 'label_every': 1, 'speak': False}
L10_ENDS = {**L10, 'label_every': 0}

OPTIONS = [
    dict(id='D1', group='Dots target', title='Dice face', rec=True, status='chosen (D-035)', target=3, at=1.6, settings=L05, chip=('html', die_svg(3)),
         caption='The target is a dice face; the line keeps its numbers, so the child matches three dots to the 3. '
                 'Said out loud: "Land on three!" Dice patterns can be recognised without counting, up to 6.'),
    dict(id='D2', group='Dots target', title='A row of dots', target=3, at=1.6, settings=L05, chip=('html', row_svg(3)),
         caption='The target is a row of dots to count, one by one. Up to 10 would need two rows of five.'),
    dict(id='D3', group='Dots target', title='Dots on the line too', target=3, at=1.6, settings=L05, labels='dots',
         chip=('html', row_svg(3)),
         caption='As D2, and each number on the line has its dots under it, so it\'s picture-to-picture matching. '
                 'A first step before D1 or D2: on a later level the line\'s dots go.'),
    dict(id='E1', group='Odd and even colours', title='Coloured numbers', status='chosen (D-035)', target=6, at=4.2, settings=L10, labels='colour',
         chip=('word', 'even', '#7FD8FF'),
         caption='Even numbers are blue and odd ones yellow. Any blue number counts. Said: "Land on an even number, a blue one!" '
                 'On later levels the colours fade.'),
    dict(id='E2', group='Odd and even colours', title='Coloured badges', rec=True, target=6, at=4.2, settings=L10, labels='badge',
         chip=('word', 'even', '#7FD8FF'),
         caption='Each number sits on a coloured badge, blue for even and yellow for odd. Bigger blocks of colour than E1, '
                 'and the dark numbers are easier to read.'),
    dict(id='E3', group='Odd and even colours', title='Striped landing strip', target=6, at=4.2, settings=L10, strip='tiles',
         chip=('word', 'even', '#7FD8FF'),
         caption='The landing strip is painted in blue and yellow tiles, one round each mark, and the numbers stay white. '
                 'The colour sits right where the rocket lands.'),
    dict(id='T1', group='Ticks only', title='No numbers at all', status='too advanced: see sketches 2', target=7, at=4.6, settings=L10_ENDS, labels='none',
         chip=('text', '7'),
         caption='Only tick marks. The child counts from the green lamp at the left end. After landing, Bip\'s flag shows the number.'),
    dict(id='T2', group='Ticks only', title='Just 0 and 10', rec=True, status='the top rung (ladder, level 8)', target=7, at=4.6, settings=L10_ENDS,
         chip=('text', '7'),
         caption='Only the two ends are numbered, so the child knows where counting starts. The game can already do this '
                 '(label_every 0), so it costs nothing to build.'),
    dict(id='T3', group='Ticks only', title='0 and 10, with a tall 5', target=7, at=4.6, settings=L10_ENDS, strip='tall5',
         chip=('text', '7'),
         caption='As T2, plus a taller mark at 5 with no number, so the child can count on from 5. '
                 'This sits between the "0, 5, 10" level and T1.'),
    dict(id='Q6', group='Q-006: a miss today', title='The fade after a miss', status='kept (D-035)', target=13, wrong=10,
         settings={'from': 0, 'to': 20, 'step': 1, 'label_every': 1, 'speak': False}, size=(390, 844), chip=None,
         caption='The game as it is, on an upright phone with a crowded line of 0 to 20. The rocket landed on 10, '
                 'and the right number, 13, lights up in its yellow box. The 12 and 14 it would cover fade out as '
                 'the box lights up, so numbers never sit on top of each other (the RL-3 fix).'),
    # Sketches 2 (v1.1): fewer written numbers, after Rob found bare ticks too advanced.
    dict(id='G1', set=2, group='Fewer written numbers', title='Odd numbers faint', target=7, at=4.6,
         settings=L10, labels='faintodd', chip=('text', '7'),
         caption='Every number is still there, but the odd ones are faint. A gentle first step: the child can still '
                 'peek, and the faint numbers fade further as the levels go.'),
    dict(id='G2', set=2, group='Fewer written numbers', title='Every other number', target=7, at=4.6,
         settings={**L10, 'label_every': 2}, chip=('text', '7'),
         caption='0, 2, 4, 6, 8, 10 written, with one bare mark between each. Landing on 7 means finding 6 or 8 '
                 'and stepping one along. The game can already do this (label_every 2).'),
    dict(id='G3', set=2, group='Fewer written numbers', title='0, 5 and 10', target=7, at=4.6,
         settings={**L10, 'label_every': 5}, chip=('text', '7'),
         caption='Four bare marks between written numbers; the 5 is a tall mark, like on a ruler. Landing on 7 means '
                 'counting on two from 5. Also already possible (label_every 5).'),
]

# Sketches 2's proposed ladder for Number mode (Q-021): Claude's judgement, for Rob to change.
LADDER = [
    ('1', '0 to 5', 'all', 'any number'),
    ('2', '0 to 10', 'all', 'any number; some dice faces'),
    ('3', '0 to 10', 'all, odd and even coloured (E1)', 'even or odd; some dice faces'),
    ('4', '0 to 10', 'all, colours faint', 'even or odd, any number; some dice faces'),
    ('5', '0 to 10', 'odd numbers faint (G1)', 'any number; some dice faces'),
    ('6', '0 to 10', 'every other number (G2)', 'any number, mostly a bare mark; some dice faces'),
    ('7', '0 to 10', '0, 5 and 10 (G3)', 'any number; some dice faces'),
    ('8', '0 to 10', '0 and 10 only (T2)', 'any number'),
]


def chip_js(chip):
    if chip is None:
        return ''
    kind = chip[0]
    if kind == 'html':
        return f"document.getElementById('target-n').innerHTML = {json.dumps(chip[1])};"
    if kind == 'word':
        return (f"const c = document.getElementById('target-n'); c.textContent = {json.dumps(chip[1])};"
                f"c.style.background = {json.dumps(chip[2])}; c.style.fontSize = '1em'; c.style.padding = '.14em .5em .18em';")
    return f"document.getElementById('target-n').textContent = {json.dumps(chip[1])};"


def shoot(br, o):
    w, h = o.get('size', (844, 390))
    ctx = br.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2, is_mobile=True, has_touch=True)
    ctx.add_init_script(SEED)

    def route(r):
        url = r.request.url
        if url.startswith(LOCAL) or url.startswith('data:') or url.startswith('blob:'):
            return r.continue_()
        if url.startswith('https://fonts.googleapis.com/'):
            return r.fulfill(status=200, content_type='text/css', body=FONT_CSS)
        return r.abort()
    ctx.route('**/*', route)
    pg = ctx.new_page()
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(BASE)
    pg.wait_for_function('window.__test && __test.state().ready && window.__scene')
    params = {'settings': o['settings'], 'labels': o.get('labels'), 'strip': o.get('strip')}
    pg.evaluate(PATCH, params)
    pg.wait_for_timeout(300)
    pg.evaluate("document.getElementById('play').click()")  # it breathes, so Playwright never sees it still
    pg.wait_for_function("__test.state().phase === 'fly'")
    pg.evaluate(f"__test.aim({o['target']})")
    pg.evaluate(f"() => {{ {chip_js(o['chip'])} }}")
    if 'wrong' in o:
        pg.evaluate(f"__test.place({o['wrong']}); __test.drop();")
        pg.wait_for_function("__test.state().phase !== 'fly'")
        pg.wait_for_timeout(1700)
    else:
        pg.evaluate(f"__test.place({o['at']})")
        pg.wait_for_timeout(2600)
    pg.evaluate('__test.freeze(true)')
    pg.wait_for_timeout(100)
    path = os.path.join(OUT, f"{o['id']}.jpg")
    pg.screenshot(path=path, type='jpeg', quality=82)
    fonts_ok = pg.evaluate("document.fonts.check('600 20px Fredoka')")
    ctx.close()
    if errs:
        raise SystemExit(f"{o['id']}: page errors: {errs}")
    if not fonts_ok:
        raise SystemExit(f"{o['id']}: Fredoka didn't load")
    print(f"{o['id']}: {path}")


GROUPS = {
    'Dots target': ('1', 'How should a dots target look?',
                    'For the younger child, still learning numerals: the target is shown as dots and said out loud. '
                    'Line 0 to 5; 0 is never a dots target, as it has no dots.'),
    'Odd and even colours': ('2', 'How should odd and even be coloured?',
                             'Any even number counts (or any odd one). Blue for even and yellow for odd, a pair that '
                             'stays apart for colour-blind eyes; the colours fade on later levels.'),
    'Ticks only': ('3', 'How bare should "ticks only" be?', 'Your 1.1.1: numbers hidden, only tick marks. Line 0 to 10.'),
    'Q-006: a miss today': ('4', 'Does the fade after a miss look right?',
                            'Not a new option: the game as you played it, shown on a crowded line where the fade matters.'),
    'Fewer written numbers': ('1', 'How should the written numbers thin out?',
                              'Your idea, in place of bare ticks: fewer written numbers, with bare marks between. '
                              'Line 0 to 10, land on 7. Each could be a rung on the ladder below.'),
}


def cards_for(opts, html, base64):
    out = []
    for k, o in enumerate(opts):
        if k == 0 or opts[k - 1]['group'] != o['group']:
            n, q, why = GROUPS[o['group']]
            out.append(f'<h2><span class="n">{n}</span> {html.escape(q)}</h2><p class="why">{html.escape(why)}</p><div class="grid">')
        with open(os.path.join(OUT, f"{o['id']}.jpg"), 'rb') as f:
            src = 'data:image/jpeg;base64,' + base64.b64encode(f.read()).decode()
        tall = ' tall' if 'size' in o else ''
        rec = '<span class="rec">recommended</span>' if o.get('rec') and o.get('set', 1) == 2 else ''
        status = f'<span class="status">{html.escape(o["status"])}</span>' if o.get('status') else ''
        out.append(f'<figure class="opt{tall}"><img src="{src}" alt="{html.escape(o["title"])}">'
                   f'<figcaption><b class="id">{o["id"]}</b> <b>{html.escape(o["title"])}</b> {rec}{status}'
                   f'<br>{html.escape(o["caption"])}</figcaption></figure>')
        if k == len(opts) - 1 or opts[k + 1]['group'] != o['group']:
            out.append('</div>')
    return out


def page(commit):
    """One self-contained page of the sketches (images inlined), for a private artifact."""
    import base64, html
    two = [o for o in OPTIONS if o.get('set', 1) == 2]
    one = [o for o in OPTIONS if o.get('set', 1) == 1]
    rows = ''.join(f'<tr><td>{a}</td><td>{html.escape(b)}</td><td>{html.escape(c)}</td><td>{html.escape(d)}</td></tr>'
                   for a, b, c, d in LADDER)
    cards = ['<h2 class="set">Sketches 2: fewer written numbers</h2>'] + cards_for(two, html, base64)
    cards.append('<h2><span class="n">2</span> A proposed ladder for Number mode</h2>'
                 '<p class="why">Claude\'s proposal (Q-021), for you to change. Written numbers come first; dice faces '
                 'join at level 2, about one landing in three, targets 1 to 6. The launcher decides the level (contract GC3); '
                 'played on its own, the game is on level 1. No numbers at all (T1) is left out of v1.</p>'
                 f'<div class="tw"><table><tr><th>Level</th><th>Line</th><th>Numbers written</th><th>Targets</th></tr>{rows}</table></div>')
    cards.append('<h2 class="set">Sketches 1: decided (D-035)</h2>')
    cards += cards_for(one, html, base64)
    return f"""<!DOCTYPE html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Rocket Lander: Number mode sketches</title>
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&display=swap" rel="stylesheet">
<style>
:root {{ --ink:#1B1446; --night:#120C3A; --sun:#FFC93C; --mint:#5FE3BD; --lilac:#EDE8FF; }}
* {{ box-sizing:border-box }}
body {{ margin:0; background:var(--night); color:#fff; font:500 17px/1.4 Fredoka, "Segoe UI", system-ui, sans-serif; }}
main {{ max-width:1180px; margin:0 auto; padding:18px 14px 40px; }}
h1 {{ margin:4px 0 6px; font-size:28px; color:var(--sun); }}
.lead {{ margin:0 0 6px; color:var(--lilac); }}
h2 {{ margin:28px 0 4px; font-size:23px; display:flex; align-items:center; gap:10px; }}
.n {{ display:inline-grid; place-items:center; width:34px; height:34px; border-radius:50%; background:var(--sun); color:var(--ink); border:3px solid #fff; flex:none; }}
.why {{ margin:0 0 12px; color:var(--lilac); }}
.grid {{ display:grid; grid-template-columns:repeat(auto-fill, minmax(min(100%, 520px), 1fr)); gap:14px; }}
.opt {{ margin:0; background:#fff; color:var(--ink); border:4px solid var(--ink); border-radius:20px; overflow:hidden; box-shadow:0 0 0 2px rgba(255,255,255,.15); }}
.opt img {{ display:block; width:100%; height:auto; cursor:zoom-in; }}
.opt.tall {{ max-width:400px; }}
figcaption {{ padding:10px 14px 14px; font-size:16px; }}
.id {{ display:inline-block; padding:0 8px; border-radius:10px; background:var(--lilac); }}
.rec {{ display:inline-block; padding:0 8px; border-radius:10px; background:var(--mint); font-size:14px; }}
.status {{ display:inline-block; padding:0 8px; border-radius:10px; background:#FFE3A3; font-size:14px; }}
h2.set {{ margin:34px 0 0; padding-top:14px; border-top:2px solid rgba(255,255,255,.2); color:var(--sun); font-size:25px; }}
.tw {{ overflow-x:auto; }}
table {{ border-collapse:collapse; background:#fff; color:var(--ink); border-radius:14px; overflow:hidden; min-width:100%; font-size:16px; }}
th, td {{ padding:7px 10px; text-align:left; vertical-align:top; border-bottom:1px solid #DDD6FF; }}
th {{ background:var(--lilac); }}
.stamp {{ margin-top:30px; font-size:13px; color:#B9B3E6; }}
#big {{ position:fixed; inset:0; background:rgba(10,6,40,.94); display:none; align-items:center; justify-content:center; padding:8px; cursor:zoom-out; }}
#big.on {{ display:flex; }} #big img {{ max-width:100%; max-height:100%; }}
</style></head><body><main>
<h1>Rocket Lander: Number mode sketches</h1>
<p class="lead">Step 2a-1. Drawn by the real game with small changes for each option, on a phone held sideways. Tap a picture to enlarge it.
Sketches 2 are new: say which of G1 to G3 to keep (the ladder uses all three), and change the ladder as you like. Sketches 1, below them, are decided.</p>
{''.join(cards)}
<p class="stamp">Sketches, not the game. Drawn from claude/games at {commit} by tools/tests/games/sketch_rocket_lander_number_mode.py 1.1,
in headless Chromium standing in for the phone, with Fredoka from @fontsource/fredoka 5.3.0. Stars and flames differ a little from run to run.</p>
</main><div id="big"><img alt=""></div>
<script>
const big = document.getElementById('big'), bi = big.querySelector('img');
document.querySelectorAll('.opt img').forEach((im) => im.addEventListener('click', () => {{ bi.src = im.src; big.classList.add('on'); }}));
big.addEventListener('click', () => big.classList.remove('on'));
</script></body></html>
"""


with sync_playwright() as p:
    br = p.chromium.launch()
    for o in OPTIONS:
        shoot(br, o)
    br.close()
with open(os.path.join(OUT, 'sketches.json'), 'w', encoding='utf-8') as f:
    json.dump([{k: o.get(k) for k in ('id', 'group', 'title', 'caption', 'rec')} for o in OPTIONS], f, indent=1)
head = subprocess.run(['git', '-C', REPO, 'rev-parse', '--short', 'HEAD'], capture_output=True, text=True).stdout.strip()
with open(os.path.join(OUT, 'sketches.html'), 'w', encoding='utf-8') as f:
    f.write(page(head))
print(f"page: {os.path.join(OUT, 'sketches.html')}")


def check_page(path):
    """The page at phone (both ways round) and PC widths, light and dark: no script errors, no
    sideways scrolling, every picture loaded, nothing fetched but Google Fonts (blocked here)."""
    fails = []
    with sync_playwright() as p:
        br = p.chromium.launch()
        for w, h, mob in [(390, 844, True), (844, 390, True), (1280, 800, False)]:
            for scheme in ('light', 'dark'):
                ctx = br.new_context(viewport={'width': w, 'height': h}, is_mobile=mob, color_scheme=scheme)
                asked = []

                def route(r):
                    u = r.request.url
                    if u.startswith('file:') or u.startswith('data:'):
                        return r.continue_()
                    if not u.startswith('https://fonts.googleapis.com/'):
                        asked.append(u)
                    return r.abort()
                ctx.route('**/*', route)
                pg = ctx.new_page()
                errs = []
                pg.on('pageerror', lambda e: errs.append(str(e)))
                pg.goto('file://' + os.path.abspath(path))
                pg.wait_for_timeout(300)
                sw, cw = pg.evaluate('[document.documentElement.scrollWidth, document.documentElement.clientWidth]')
                loaded = pg.evaluate("[...document.querySelectorAll('.opt img')].filter(i => i.complete && i.naturalWidth > 0).length")
                ok = sw <= cw and not errs and not asked and loaded == len(OPTIONS)
                print(('ok   ' if ok else 'FAIL ') + f'page {w}x{h} {scheme}: width {sw}/{cw}, pictures {loaded}/{len(OPTIONS)}'
                      + (f', errors {errs}' if errs else '') + (f', fetched {asked}' if asked else ''))
                if not ok:
                    fails.append(f'{w}x{h} {scheme}')
                ctx.close()
        br.close()
    if fails:
        raise SystemExit(f'page check failed: {fails}')


check_page(os.path.join(OUT, 'sketches.html'))
httpd.shutdown()
shutil.rmtree(ROOT)
