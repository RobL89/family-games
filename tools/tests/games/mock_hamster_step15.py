"""Hamster Highway step 15: mock-ups for Rob to pick from before building (project rules), version 0.1 (21 Nov).

1. The climbing frame's backdrop (levels 23 and 24): three looks (mock_hamster_frame_backdrops.js 0.1), each drawn by
   the real game behind a stand-in 9 x 16 board (bars in the air, not level 23's layout), screenshot on a phone held
   sideways (844 x 390, touch) and a PC window (1366 x 650); and an extra, look A with the board's floors drawn as
   climbing bars in place of earth blocks. A scratch worktree of HEAD gets the looks appended to its art.js, and
   game.js draws them at their own 540 height; the repo itself is not changed. Headless Chromium stands in for the
   phone and the PC.
2. The signpost's help card (D-167, D-168): two storyboards, A (it stops at the pond's edge, the signpost drops in,
   it turns round and walks back home, as the other nine cards go) and B (the first hamster walks into the pond,
   splash; then the signpost drops in and the next one turns and goes home). Drawn with the game's own art
   (art.js 1.8, cards.js 1.2's badge); every hamster's square and the way it faces is taken from core.js 1.8's walk()
   on the scene's board (padded to 12 wide, the narrowest board core.js takes), so the cards show the real rules.

Checks (exit 1 if one fails): card A's road goes home with one turn at the signpost and walks back under the ledge;
without the signpost it splashes (card B's first hamster); every screenshot made and not blank; the page names no web
address; every svg closed; the game logged no errors. --fault N plants a fault the checks must catch (1: a web address
in the page; 2: a screenshot left out; 3: an svg left open; 4: card A's signpost left off its board).

Usage, from the repo root:
    python3 -B tools/tests/games/mock_hamster_step15.py OUT.html [--fault N]
"""
import base64, functools, http.server, json, os, re, socketserver, subprocess, sys, threading

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
GAME = os.path.join(REPO, 'games', 'hamster-highway')
args = sys.argv[1:]
FAULT = 0
if '--fault' in args:
    i = args.index('--fault')
    FAULT = int(args[i + 1])
    del args[i:i + 2]
OUT = args[0] if args else '/tmp/hamster-step15-mockups.html'
FAILS = []


def check(ok, what):
    print(('ok   ' if ok else 'FAIL ') + what)
    if not ok:
        FAILS.append(what)


# ---------------------------------------------------------------- 2. the signpost card, from core.js's own walk
JS = r'''
const [coreUrl, artUrl, cardsUrl, fault] = process.argv.slice(1);
const C = await import(coreUrl);
const A = await import(artUrl);
const K = await import(cardsUrl);
// The card's scene, 8 across and 7 down (as the catapult's card), padded with 4 empty columns to 12 for core.js.
// A start tube on a ledge (row 4), a drop of 2 to the floor (row 6), the pond at its right end, home under the ledge.
const SCENE = ['........', '........', '........', '.S......', '.###....', 'G.......', '######..'];
const def = { id: 'card', rows: SCENE.map((r) => r + '....'), tray: { signpost: 1 } };
const lv = C.parseLevel(def);
const SIGN = [5, 5];
const withSign = fault === '4' ? {} : { [C.key(...SIGN)]: 'signpost' };
const walkA = C.walk(lv, withSign);
const walkB = C.walk(lv, {});
const SC = 0.56, GS = C.COLS && 0.6;
const feet = (c, r) => [(c + 0.5) * 60, (r + 1) * 60];
let board = '';
SCENE.forEach((row, r) => { for (let c = 0; c < row.length; c++) if (row[c] === '#') board += A.block(c, r, r === 0 || SCENE[r - 1][c] !== '#'); });
for (let c = 6; c < 8; c++) board += A.water(c, 6);
board += A.place(A.startArt(), 60, 180, GS) + A.place(A.homeArt(), 0, 300, GS);
const ham = (c, r, pose = 'walk1', dir = 1, dx = 0, dy = 0) => {
  const [x, y] = feet(c, r);
  return A.g(A.hamster(pose), `translate(${x + dx} ${y + dy}) scale(${dir < 0 ? -SC : SC} ${SC})`);
};
const huh = (c, r) => { const [x, y] = feet(c, r); return A.text(x + 10, y - 62, '?', 30, A.INK, ' stroke="#fff" stroke-width="5" paint-order="stroke"'); };
const sign = (dy = 0) => A.place(A.gadget('signpost'), SIGN[0] * 60, SIGN[1] * 60 + dy, GS);
const fit = () => A.rect(SIGN[0] * 60 + 3, SIGN[1] * 60 + 1, 54, 54, A.SUN, 8, 3, A.SUN, ' fill-opacity="0.3" stroke-dasharray="6 5"');
const drop = () => sign(-46) + [0, 1, 2].map((i) => A.line(SIGN[0] * 60 + 18 + 12 * i, SIGN[1] * 60 - 70, SIGN[0] * 60 + 18 + 12 * i, SIGN[1] * 60 - 50, A.INK, 3, ' opacity="0.4"')).join('');
const sparks = () => A.place(A.sparkle(0, 0, 12), SIGN[0] * 60 - 4, SIGN[1] * 60 + 10) + A.place(A.sparkle(0, 0, 12), SIGN[0] * 60 + 64, SIGN[1] * 60 + 6, 0.7);
const swirl = (c, r) => { const [x, y] = feet(c, r); return A.path(`M ${x - 22} ${y - 66} A 22 11 0 1 1 ${x + 20} ${y - 72}`, 'none', 4, A.INK) + A.path(`M ${x + 12} ${y - 80} L ${x + 22} ${y - 72} L ${x + 10} ${y - 66}`, 'none', 4, A.INK, ' stroke-linejoin="round"'); };
const splash = (c, r) => { const [x, y] = feet(c, r); return [[-20, -20, 6], [18, -26, 5], [-4, -38, 4], [28, -10, 4]].map(([dx, dy, rr]) => A.circle(x + dx, y - 24 + dy, rr, '#7FD3F7', 2)).join(''); };
const hearts = (c, r) => { const [x, y] = feet(c, r); return A.heart(x + 30, y - 70, 9) + A.heart(x - 22, y - 80, 7); };
// the steps the frames are drawn at, found in the walks, not typed
const iTurn = walkA.steps.findIndex((s) => s.act === 'turn');
const at = (w, f) => w.steps.find(f);
const land = at(walkA, (s) => s.act === 'fall' && s.land);
const left = walkA.steps.find((s, i) => i > iTurn && s.dir === -1 && s.c === 2);
const end = walkA.steps[walkA.steps.length - 1];
const off = at(walkB, (s) => s.act === 'fall' && !s.land);
const lastB = walkB.steps[walkB.steps.length - 1];
const pre = [land ? land.c : 4, land ? land.r : 5];
const F = {
  A: [
    ['Out of the tube, along the ledge', board + ham(2, 3)],
    ['Down to the floor; the pond ahead. It stops: ?', board + fit() + ham(...pre, 'walk2') + huh(...pre)],
    ['The signpost drops in', board + drop() + ham(...pre) + huh(...pre)],
    ['It walks on, and turns round at the sign', board + sign() + sparks() + ham(...SIGN, 'walk1', -1) + swirl(...SIGN)],
    ['Back the other way, under the ledge', board + sign() + (left ? ham(left.c, left.r, 'walk2', -1) : '')],
    ['Home!', board + sign() + ham(end.c, end.r, 'home', -1, 0, -4) + hearts(end.c, end.r)],
  ],
  B: [
    ['No signpost yet: off the ledge…', board + (off ? ham(off.c, off.r, 'fall') : '')],
    ['…and into the pond: splash!', board + ham(lastB.c, Math.min(lastB.r, 6), 'fall', 1, 0, 4) + splash(lastB.c, Math.min(lastB.r, 6))],
    ['The signpost drops in', board + drop() + ham(1, 3, 'walk1')],
    ['The next one turns round at it', board + sign() + sparks() + ham(...SIGN, 'walk1', -1) + swirl(...SIGN)],
    ['Home!', board + sign() + ham(end.c, end.r, 'home', -1, 0, -4) + hearts(end.c, end.r)],
  ],
};
const CAP = 'Signposts turn them round!';
const size = Math.min(34, Math.floor(470 / (0.52 * CAP.length)));
const tickD = 'M 340 368 L 355 382 L 382 352';
const card = (scene) => A.rect(58, 16, 604, 390, '#FFF8EE', 28, 4) + K.badgeArt('signpost') + A.text(412, 70 + size * 0.36, CAP, size)
  + A.rect(90, 120, 540, 212, '#F3E3C8', 12, 2.5)
  + `<svg x="90" y="120" width="540" height="212" viewBox="0 136 480 284" preserveAspectRatio="xMidYMid meet" overflow="hidden">${scene}</svg>`
  + A.rect(300, 340, 120, 54, '#3CC864', 27, 3.5) + A.path(tickD, 'none', 14, A.INK) + A.path(tickD, 'none', 8, '#fff');
const summary = (w) => ({ outcome: w.outcome, turns: w.steps.filter((s) => s.act === 'turn').map((s) => [s.c, s.r]),
  under: w.steps.filter((s) => s.dir === -1 && s.r === 5 && s.c >= 1 && s.c <= 3).length, squares: w.steps.map((s) => [s.c, s.r, s.act, s.dir || 1]) });
console.log(JSON.stringify({ A: summary(walkA), B: summary(walkB), frames: F, cardA: card(F.A[3][1]), cardB: card(F.B[1][1]) }));
'''
r = subprocess.run(['node', '--input-type=module', '-e', JS] + ['file://' + os.path.join(GAME, f) for f in ('core.js', 'art.js', 'cards.js')] + [str(FAULT)],
                   capture_output=True, text=True)
if r.returncode != 0:
    print(r.stderr)
    sys.exit(1)
CD = json.loads(r.stdout)
check(CD['A']['outcome'] == 'home' and CD['A']['turns'] == [[5, 5]] and CD['A']['under'] == 3,
      f"card A's road: home, one turn at the signpost (5,5), back under the ledge (got {CD['A']['outcome']}, turns {CD['A']['turns']}, {CD['A']['under']} squares under)")
check(CD['B']['outcome'] == 'splash', f"card B's first hamster, no signpost: splash (got {CD['B']['outcome']})")

# ---------------------------------------------------------------- 1. the climbing frame, in the real game
WT = '/tmp/hh-step15-mockwt'
SERVE = '/tmp/hh-step15-serve'
if os.path.exists(WT):
    subprocess.run(['git', '-C', REPO, 'worktree', 'remove', '--force', WT], capture_output=True)
subprocess.run(['git', '-C', REPO, 'worktree', 'add', '--detach', WT, 'HEAD'], check=True, capture_output=True)
try:
    art = os.path.join(WT, 'games', 'hamster-highway', 'art.js')
    src = open(art).read()
    for old, new in [
        ("export function backdrop(name, w = W) {\n",
         "export function backdrop(name, w = W) {\n  if (name.startsWith('frame')) return g({ frameA, frameB, frameC }[name.replace('bars', '')](w), '', ` data-back=\"${name}\"`);\n"),
        ("export const backHeight = (name) => (name === 'pond' ? 540 : H);",
         "export const backHeight = (name) => (name === 'pond' || name.startsWith('frame') ? 540 : H);"),
    ]:
        assert src.count(old) == 1, old
        src = src.replace(old, new)
    mock = open(os.path.join(HERE, 'mock_hamster_frame_backdrops.js')).read()
    assert mock.count('\nfunction frameBar(') == 1
    src += '\n' + mock.replace('\nfunction frameBar(', '\nexport function frameBar(')
    open(art, 'w').write(src)
    gj = os.path.join(WT, 'games', 'hamster-highway', 'game.js')
    gsrc = open(gj).read()
    for old, new in [
        ("import { CELL, INK, SUN, CORAL, LOOP, ", "import { frameBar, CELL, INK, SUN, CORAL, LOOP, "),
        ("      if (lv.rows[r][c] === '#') bg += block(c, r, r === 0 || lv.rows[r - 1][c] !== '#');",
         "      if (lv.rows[r][c] === '#') bg += (def.back.endsWith('bars') && r < lv.height - 1 ? frameBar : block)(c, r, r === 0 || lv.rows[r - 1][c] !== '#');"),
    ]:
        assert gsrc.count(old) == 1, old
        gsrc = gsrc.replace(old, new)
    open(gj, 'w').write(gsrc)
    os.makedirs(SERVE, exist_ok=True)
    b = subprocess.run([sys.executable, '-B', os.path.join(WT, 'tools', 'tests', 'games', 'build_preview.py'), 'hamster-highway', '--number', '0',
                        '--out', os.path.join(SERVE, 'mock.html')], capture_output=True, text=True, cwd=WT)
    check(b.returncode == 0, 'the scratch copy builds into a preview page' + ('' if b.returncode == 0 else ': ' + b.stderr[-400:]))
finally:
    subprocess.run(['git', '-C', REPO, 'worktree', 'remove', '--force', WT], capture_output=True)


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


httpd = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=SERVE))
threading.Thread(target=httpd.serve_forever, daemon=True).start()
URL = f'http://127.0.0.1:{httpd.server_address[1]}/mock.html'
# A stand-in board: two bars in the air and a top bar to home, the ground with a gap (not level 23's layout).
BOARD = {'id': 'framemock', 'name': 'Frame mock-up', 'room': 'garden', 'spot': 'sink', 'new': None,
         'rows': ['................', '...............G', '..........######', '................', '.....######.....',
                  '................', '................', 'S...............', '#######..#######'],
         'tray': {'bouncer': 2, 'signpost': 2, 'rampL': 1, 'bridge': 2}}
LOOKS = ['frameA', 'frameB', 'frameC', 'frameAbars']
SHOTS = {}
errors = []
from playwright.sync_api import sync_playwright  # noqa: E402
with sync_playwright() as pw:
    br = pw.chromium.launch()
    for dev, (w, h, touch) in {'phone': (844, 390, True), 'pc': (1366, 650, False)}.items():
        ctx = br.new_context(viewport={'width': w, 'height': h}, has_touch=touch, is_mobile=touch, device_scale_factor=1)
        pg = ctx.new_page()
        pg.on('pageerror', lambda e: errors.append(str(e)))
        pg.goto(URL)
        pg.wait_for_function('window.__test !== undefined && __test.state().ready', timeout=10000)
        for look in LOOKS:
            pg.evaluate('(d) => __test.openBoard(d)', dict(BOARD, back=look))
            pg.wait_for_function('__test.state().screen === "level"', timeout=5000)
            pg.wait_for_timeout(400)
            drawn = pg.evaluate(f'() => !!document.querySelector(\'[data-back="{look}"]\')')
            check(drawn, f'{look} drawn on the {dev}')
            SHOTS[(look, dev)] = pg.screenshot()
        ctx.close()
    br.close()
httpd.shutdown()
check(not errors, f'the game logged no errors ({errors[:2]})')
if FAULT == 2:
    del SHOTS[('frameB', 'pc')]
check(len(SHOTS) == 8 and all(len(v) > 20000 for v in SHOTS.values()), f'eight screenshots, none blank ({len(SHOTS)}: {sorted(len(v) for v in SHOTS.values())} bytes)')


def img(look, dev):
    if (look, dev) not in SHOTS:
        return '<p class="miss">missing</p>'
    return f'<img src="data:image/png;base64,{base64.b64encode(SHOTS[(look, dev)]).decode()}" alt="{look}, {dev}" class="{dev}">'


def frame_svg(scene, cap, n):
    return (f'<figure class="sb"><svg viewBox="0 136 480 284" role="img" aria-label="{cap}">{scene}</svg>'
            f'<figcaption><b>{n}</b> {cap}</figcaption></figure>')


def card_svg(body):
    return f'<svg viewBox="0 0 720 420" class="card" role="img" aria-label="the whole card">{body}</svg>'


NAMES = {'frameA': 'A. Red and yellow frame: the park\'s own frame, as the park picker draws it: red posts, yellow bars, monkey bars between two towers, a flag, a robin, a ladybird',
         'frameB': 'B. Wooden tower and rope net: a tower with a red pointed roof, a rope net and a rope ladder, a big tree, a squirrel peeking over the deck',
         'frameC': 'C. Rainbow dome: a dome climber in rainbow bars, a tyre swing on a big tree, two butterflies'}
REC = ' <span class="rec">recommended</span>'
INK = '#1B1446'
FONT = 'system-ui, sans-serif'
page = f'''<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Hamster Highway step 15 mock-ups</title><style>
body{{font:16px/1.45 {FONT};color:{INK};background:#FFF8EE;margin:0;padding:16px}}
h1{{font-size:22px;margin:4px 0 2px}} h2{{font-size:19px;margin:28px 0 6px}} h3{{font-size:16px;margin:16px 0 6px}}
.row{{display:flex;flex-wrap:wrap;gap:14px}} figure{{margin:0;background:#fff;border:2px solid {INK}22;border-radius:14px;padding:8px;max-width:100%}}
figcaption{{font-size:14px;margin-top:4px}} img{{max-width:100%;height:auto;display:block;border-radius:12px}} img.pc{{width:620px}} img.phone{{width:520px}}
figure.sb{{width:250px}} figure.sb svg{{width:100%;height:auto;background:#F3E3C8;border-radius:8px;display:block}} svg.card{{width:420px;max-width:100%;height:auto;display:block}}
.rec{{background:#FFF1C2;border-radius:10px;padding:2px 8px;font-weight:700}} .stamp{{font-size:12px;color:#666}} .miss{{color:#c00}}
</style></head><body>
<h1>Hamster Highway step 15: mock-ups to pick from</h1>
<p class="stamp">mock_hamster_step15.py 0.1 · 21 Nov · drawn with the game's own art; nothing here is built yet. Headless Chromium stands in for the phone and the PC.</p>
<h2>1. The climbing frame's backdrop (levels 23 and 24)</h2>
<p>Drawn by the real game behind a <b>stand-in board</b> (bars in the air and a gap in the ground, 9 rows, 16 across; not level 23's layout, which comes next). The board's floors are the game's usual blocks. Phone held sideways first, then a PC window.</p>
''' + ''.join(f'''<h3>{NAMES[k]}{REC if k == 'frameA' else ''}</h3>
<div class="row"><figure>{img(k, 'phone')}<figcaption>phone, 844 × 390</figcaption></figure><figure>{img(k, 'pc')}<figcaption>PC, 1366 × 650</figcaption></figure></div>''' for k in ('frameA', 'frameB', 'frameC')) + f'''
<h3>Extra: the floors in the air drawn as climbing bars (with look A)</h3>
<p>Only on the climbing frame's two levels: a floor that isn't the ground is drawn as a yellow bar on red posts instead of an earth block. Same squares, same rules; only the drawing changes. Yes or no?</p>
<div class="row"><figure>{img('frameAbars', 'phone')}<figcaption>phone, 844 × 390</figcaption></figure><figure>{img('frameAbars', 'pc')}<figcaption>PC, 1366 × 650</figcaption></figure></div>
<h2>2. The signpost's help card</h2>
<p>Each card loops in a few seconds, as the other nine do; here as stills. Every hamster's square and the way it faces comes from the game's own rules on this little board. Caption (mine, proposed): <b>“Signposts turn them round!”</b></p>
<h3>A. Stop, drop in, turn round{REC}</h3>
<p>As every other card goes: it stops puzzled at the pond's edge, the signpost drops in, it turns round there and walks back under the ledge to home. ≈6 s a loop.</p>
<div class="row">{''.join(frame_svg(s, c, i + 1) for i, (c, s) in enumerate(CD['frames']['A']))}</div>
<div class="row" style="margin-top:10px"><figure>{card_svg(CD['cardA'])}<figcaption>the whole card, at still 4</figcaption></figure></div>
<h3>B. Splash first, then turn</h3>
<p>Shows why: the first hamster walks on into the pond, splash; then the signpost drops in and the next one turns round and goes home. Funnier, but a loop of ≈8 s with two hamsters, and the only card that opens with a fail.</p>
<div class="row">{''.join(frame_svg(s, c, i + 1) for i, (c, s) in enumerate(CD['frames']['B']))}</div>
<div class="row" style="margin-top:10px"><figure>{card_svg(CD['cardB'])}<figcaption>the whole card, at still 2</figcaption></figure></div>
<h2>What I'd pick</h2>
<p><b>Backdrop A:</b> it is the frame the children already see on the park picker, and its towers and monkey bars match levels 23 and 24's plan (up the frame, then the tower or the monkey bars). <b>Bars extra: yes</b>, if you like it: earth blocks floating in the air look odd on a climbing frame. <b>Card A:</b> it reads like the other nine, so the younger child knows what a card is doing.</p>
</body></html>'''
if FAULT == 1:
    page = page.replace('</body>', '<img src="http://example.com/x.png"></body>')
if FAULT == 3:
    assert '</svg><figcaption>' in page
    page = page.replace('</svg><figcaption>', '<figcaption>', 1)
check(not re.search(r'(https?:)?//[a-z0-9.-]+\.[a-z]{2,}', page, re.I) and 'url(' not in page.replace('url(#', ''), 'the page names no web address')
check(page.count('<svg') == page.count('</svg>'), f'every svg closed ({page.count("<svg")} opened, {page.count("</svg>")} closed)')
open(OUT, 'w').write(page)
print(f'wrote {OUT} ({len(page)} bytes); {len(FAILS)} failed')
sys.exit(1 if FAILS else 0)
