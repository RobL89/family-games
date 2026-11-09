"""Rocket Lander's maths spike (D-030, branch claude/games-spike-maths). Version 1.2.

Changes at v1.2: near-miss pads (a fixed case, and pads inside a window); the
'window + pads' layout in the browser; the landing beam points at the snapped spot.

Changes at v1.1: with pads, a landing between pads but nearer the answer must count as
the answer (a planted fault, pads ignored on landing, got past v1.0).

1. sums.js by Node, with a seeded random (so the run is the same every time), 5000 sums
   per set of operations:
   - each number at most 10 (D-021); nothing below zero (D-024); ÷ only by 2, 5 or 10,
     answer up to 10 (D-023, D-028); every answer right;
   - every fact can come up: + 121, − 66, × 121, ÷ 33 (counted in claude/rocket-lander-ideas.md);
   - windows are 10 wide, inside 0 to the top, with the answer in them;
   - pads hold the answer, are unique, sorted, inside the line and at least `gap` apart.
2. In a headless browser, phone sideways (844x390) and upright (390x844) and PC
   (1280x800), for each layout:
   the sum shows at the top, the line suits it (window: 10 wide round the answer; pads:
   only the pads labelled), a right landing counts, a wrong one doesn't, no page errors
   and no sideways scrolling. One screenshot of each layout on the phone, for the eye.

Stand-ins: Node 22 for the core; headless Chromium (Playwright) for the phone and PC.
Usage, from the repo root:
    python3 -B tools/tests/games/test_rocket_lander_maths_spike.py [folder for screenshots]
"""
import functools, http.server, json, os, socketserver, subprocess, sys, tempfile, threading

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
GAME = os.path.join(REPO, 'games', 'rocket-lander')
OUT = sys.argv[1] if len(sys.argv) > 1 else tempfile.mkdtemp(prefix='rl-maths-')
os.makedirs(OUT, exist_ok=True)
fails = []


def check(ok, what):
    print(('ok   ' if ok else 'FAIL ') + what)
    if not ok:
        fails.append(what)


JS = r"""
const M = await import(process.argv[1] + '/sums.js');
let seed = 20261109;
const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const out = { bad: [], facts: {}, windows: [], pads: [], parse: [M.parseOps('+ −'), M.parseOps('÷'), M.parseOps(''), M.parseOps('+ − × ÷')],
              tops: [M.lineTop(['+', '−']), M.lineTop(['−', '÷']), M.lineTop(['+', '×'])] };
const calc = { '+': (a, b) => a + b, '−': (a, b) => a - b, '×': (a, b) => a * b, '÷': (a, b) => a / b };
for (const op of M.OPS) {
  const seen = new Set();
  for (let i = 0; i < 5000; i++) {
    const s = M.makeSum([op], rnd);
    seen.add(s.text);
    const why = [];
    if (s.op !== op) why.push('op');
    if (s.answer !== calc[op](s.a, s.b)) why.push('answer');
    if (s.answer < 0 || s.a < 0 || s.b < 0) why.push('below zero');
    if (op === '÷') { if (![2, 5, 10].includes(s.b) || s.answer > 10 || !Number.isInteger(s.answer)) why.push('division rule'); }
    else if (s.a > 10 || s.b > 10) why.push('number over 10');
    if (s.text !== `${s.a} ${op} ${s.b}`) why.push('text');
    if (why.length) out.bad.push([s, why]);
  }
  out.facts[op] = seen.size;
}
for (let i = 0; i < 2000; i++) {
  const ops = [['+'], ['×'], ['+', '−', '×', '÷']][i % 3];
  const top = M.lineTop(ops), s = M.makeSum(ops, rnd);
  const w = M.windowFor(s.answer, top, 10, rnd);
  out.windows.push([s.answer, top, w.from, w.to]);
  const gap = [1, 2, 9][i % 3], n = [2, 4, 6][i % 3];
  out.pads.push([s, top, gap, n, M.padsFor(s, top, n, gap, rnd)]);
}
out.near = [M.nearestPad([3, 7, 12], 4.9), M.nearestPad([3, 7, 12], 5.1), M.nearestPad([3, 7, 12], 40)];
out.zeroTimes = M.padsFor({ a: 0, op: '×', b: 9, answer: 0, text: '0 × 9' }, 100, 4, 9, rnd);
out.inWindow = [];
for (let i = 0; i < 1000; i++) { const s = M.makeSum(['+', '−', '×', '÷'], rnd); const w = M.windowFor(s.answer, M.lineTop(['+', '−', '×', '÷']), 10, rnd);
  out.inWindow.push([s.answer, w.from, w.to, M.padsFor(s, w.to, 4, 1, rnd, w.from)]); }
console.log(JSON.stringify(out));
"""
r = subprocess.run(['node', '--input-type=module', '-e', JS, 'file://' + GAME], capture_output=True, text=True)
if r.returncode != 0:
    print(r.stderr)
    check(False, 'node ran sums.js')
    sys.exit(1)
o = json.loads(r.stdout)
check(not o['bad'], f'20000 sums keep the rules (numbers up to 10, nothing below zero, ÷ by 2, 5, 10 up to 10)' + (f': {o["bad"][:3]}' if o['bad'] else ''))
check(o['facts'] == {'+': 121, '−': 66, '×': 121, '÷': 33}, f'every fact comes up: + 121, − 66, × 121, ÷ 33 ({o["facts"]})')
check(o['parse'] == [['+', '−'], ['÷'], ['+'], ['+', '−', '×', '÷']], f'operations read from the setting ({o["parse"]})')
check(o['tops'] == [20, 10, 100], f'line tops: + − 20, − ÷ 10, + × 100 ({o["tops"]})')
badw = [w for w in o['windows'] if not (w[2] <= w[0] <= w[3] and w[2] >= 0 and w[3] <= w[1] and (w[3] - w[2] == min(10, w[1])))]
check(not badw, f'windows: 10 wide (or the whole line if shorter), inside it, answer in them' + (f': {badw[:3]}' if badw else ''))
starts = {w[2] - w[0] for w in o['windows'] if w[1] > 10 and 10 <= w[0] <= w[1] - 10}
check(len(starts) > 5, f'the answer isn\'t always in the same place in its window ({len(starts)} different places)')
badp = []
for s, top, gap, n, pads in o['pads']:
    ok = (s['answer'] in pads and pads == sorted(set(pads)) and all(0 <= p <= top for p in pads)
          and all(b - a >= gap for a, b in zip(pads, pads[1:])) and len(pads) <= n)
    if not ok:
        badp.append((s['text'], gap, n, pads))
check(not badp, 'pads: hold the answer, unique, sorted, on the line, at least gap apart' + (f': {badp[:3]}' if badp else ''))
short = [p for p in o['pads'] if len(p[4]) < p[3]]
check(len(short) == 0, f'pads: always as many as asked for on these lines ({len(short)} short)')
check(o['zeroTimes'] == [0, 9, 18, 27], f'near misses, not random: 0 × 9 with pads 9 apart gives 0, 9, 18, 27 ({o["zeroTimes"]})')
badw2 = [x for x in o['inWindow'] if not (len(x[3]) == 4 and x[0] in x[3] and all(x[1] <= p <= x[2] for p in x[3]))]
check(not badw2, 'near-miss pads always fit in a window: 4 pads, the answer among them, all inside it' + (f': {badw2[:3]}' if badw2 else ''))
edge = sum(1 for x in o['inWindow'] if x[3].index(x[0]) in (0, 3))
check(edge > 100, f'the answer isn\'t always a middle pad (first or last in {edge} of 1000)')
check(o['near'] == [3, 7, 12], f'nearest pad: 4.9 -> 3, 5.1 -> 7, 40 -> 12 ({o["near"]})')

# ---------- In the browser ----------
from playwright.sync_api import sync_playwright  # noqa: E402


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


httpd = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=REPO))
httpd.daemon_threads = True
threading.Thread(target=httpd.serve_forever, daemon=True).start()
LOCAL = f'http://127.0.0.1:{httpd.server_address[1]}/'
CASES = [('whole', '+ −'), ('window', '+ − × ÷'), ('window + pads', '×'), ('pads', '×')]

with sync_playwright() as pw:
    br = pw.chromium.launch()
    for w, h, mobile, tag in ((844, 390, True, 'phone sideways'), (390, 844, True, 'phone upright'), (1280, 800, False, 'pc')):
        for layout, ops in CASES:
            ctx = br.new_context(viewport={'width': w, 'height': h}, is_mobile=mobile, has_touch=mobile)
            ctx.route('**/*', lambda rt: rt.continue_() if rt.request.url.startswith(LOCAL) else rt.abort())
            pg = ctx.new_page()
            errors = []
            pg.on('pageerror', lambda e: errors.append(str(e)))
            pg.goto(LOCAL + 'games/rocket-lander/index.html')
            pg.wait_for_function('window.__test && __test.state().ready')
            pg.evaluate(f"__test.begin({{ settings: {{ mode: 'maths', ops: '{ops}', layout: '{layout}', pads: 4, landings_per_round: 3, speak: false }} }})")
            pg.click('#play', force=True)
            name = f'{tag}, {layout}, {ops}'
            pg.wait_for_function('__test.state().phase === "fly" && __test.state().idx === 0', timeout=20000)
            s = pg.evaluate('__test.state()')
            sm = s['sum']
            chip = pg.inner_text('#target-n')
            check(sm is not None and chip == sm['text'] and s['target'] == sm['answer'], f'{name}: the sum shows ({chip}) and its answer is the target ({s["target"]})')
            ln = s['line']
            if layout.startswith('window'):
                check(ln['to'] - ln['from'] == min(10, ln['to']) and ln['from'] <= s['target'] <= ln['to'], f'{name}: a stretch of 10 round the answer ({ln["from"]} to {ln["to"]})')
                if layout == 'window + pads':
                    check(s['labels'] == [str(p) for p in s['pads']] and all(ln['from'] <= p <= ln['to'] for p in s['pads']), f'{name}: only near-miss pads inside the window are labelled ({s["labels"]})')
            elif layout == 'pads':
                want = [str(p) for p in s['pads']]
                check(s['target'] in s['pads'] and s['labels'] == want, f'{name}: only the pads are labelled ({s["labels"]})')
            else:
                check(ln['from'] == 0 and ln['to'] == 20, f'{name}: the whole line, 0 to 20 for + and − ({ln["from"]} to {ln["to"]})')
            if tag == 'phone sideways':
                pg.wait_for_timeout(900)
                pg.screenshot(path=os.path.join(OUT, f'maths-{layout.replace(" + ", "-")}.png'))
            pg.evaluate('__test.speed(4)')
            pg.evaluate('__test.right()')
            pg.wait_for_function('__test.state().results.length === 1', timeout=20000)
            r1 = pg.evaluate('__test.state().results[0]')
            check(r1['right'] and r1['spot'] == sm['answer'], f'{name}: landing on the answer counts ({r1})')
            pg.wait_for_function('__test.state().phase === "fly" && __test.state().idx === 1', timeout=20000)
            got = pg.evaluate('__test.wrong()')
            pg.wait_for_function('__test.state().results.length === 2', timeout=20000)
            r2 = pg.evaluate('__test.state().results[1]')
            check(got is not False and not r2['right'], f'{name}: landing on {got} for {r2["target"]} doesn\'t count')
            if tag == 'phone sideways' and layout.endswith('pads'):
                pg.wait_for_timeout(700)
                pg.screenshot(path=os.path.join(OUT, 'maths-pads-miss.png'))
            if layout.endswith('pads'):
                pg.wait_for_function('__test.state().phase === "fly" && __test.state().idx === 2', timeout=20000)
                v = pg.evaluate('''(() => { const s = __test.state(), t = s.target, top = s.line.to;
                    const d = Math.min(...s.pads.filter((p) => p !== t).map((p) => Math.abs(p - t))) / 3;
                    const v = t + d <= top ? t + d : t - d; __test.place(v); return v; })()''')
                pg.wait_for_timeout(150)
                sb = pg.evaluate('[__test.state().snap, __test.state().beam, __test.state().target]')
                check(sb[1] and sb[0] == sb[2], f'{name}: over {v}, the beam points at the answer pad it will land on ({sb})')
                pg.evaluate('__test.drop()')
                pg.wait_for_function('__test.state().results.length === 3', timeout=20000)
                r3 = pg.evaluate('__test.state().results[2]')
                check(r3['right'] and r3['spot'] == r3['target'], f'{name}: landing on {v}, nearest the answer pad {r3["target"]}, counts as the answer ({r3})')
            sideways = pg.evaluate('document.documentElement.scrollWidth > innerWidth')
            check(not sideways and not errors, f'{name}: no sideways scrolling, no page errors' + (f': {errors[:2]}' if errors else ''))
            ctx.close()
    br.close()
httpd.shutdown()
print(f'Screenshots: {OUT}')
print(f'\n{len(fails)} problem(s)' if fails else '\nAll good.')
sys.exit(1 if fails else 0)
