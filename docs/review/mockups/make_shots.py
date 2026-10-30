# Review only: makes the screenshots in this folder from docs/review/shell-mockup.html.
# Needs Python Playwright, and local copies of the fonts (npm install @fontsource/patrick-hand @fontsource/orbitron @fontsource/rajdhani);
# set the FONTS environment variable to their folder. Usage: python3 make_shots.py <output folder>
"""Screenshots for the game-shell mockup (review only). Serves the repo locally, uses local font copies."""
import functools, http.server, os, re, sys, threading
from playwright.sync_api import sync_playwright

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))
FONTS = os.environ.get('FONTS', 'node_modules/@fontsource')
OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)

handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=REPO)
handler.log_message = lambda *a, **k: None
srv = http.server.ThreadingHTTPServer(('127.0.0.1', 8125), handler)
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = 'http://127.0.0.1:8125/'

FACES = {'Patrick Hand': ('patrick-hand', [400]), 'Orbitron': ('orbitron', [500, 600, 700, 800]), 'Rajdhani': ('rajdhani', [500, 600, 700])}
CSS = ''.join(
    f"@font-face{{font-family:'{fam}';font-style:normal;font-weight:{w};font-display:block;"
    f"src:url(https://fonts.gstatic.com/local/{pkg}/{pkg}-latin-{w}-normal.woff2) format('woff2');}}\n"
    for fam, (pkg, ws) in FACES.items() for w in ws)

def font_file(route):
    pkg, name = route.request.url.split('/local/')[1].split('/')
    with open(f'{FONTS}/{pkg}/files/{name}', 'rb') as f:
        route.fulfill(status=200, content_type='font/woff2', body=f.read())

errors = []

def context(browser, w, h, mobile):
    ctx = browser.new_context(viewport={'width': w, 'height': h}, device_scale_factor=2 if mobile else 1,
                              is_mobile=mobile, has_touch=mobile)
    ctx.route(re.compile(r'https://fonts\.googleapis\.com/.*'), lambda r: r.fulfill(status=200, content_type='text/css', body=CSS))
    ctx.route(re.compile(r'https://fonts\.gstatic\.com/local/.*'), font_file)
    ctx.route(re.compile(r'https://script\.google\.com/.*'), lambda r: r.abort())
    return ctx

# Undo the current hook's additions so the frame shows her game as she made it.
UNHOOK = """
  document.querySelectorAll('button[aria-label="Back to games"]').forEach(b => b.remove());
  document.querySelectorAll('.top, .bar').forEach(el => { el.style.paddingLeft = ''; });
  const s = document.getElementById('fgSaved'); if (s) s.remove();
"""
BUILD = """
  const t = document.getElementById('puzzleTitle'), w = document.getElementById('wordInput');
  t.value = 'Week 3 spellings'; w.value = 'apple\\npear\\nplum\\npeach\\nlemon\\nlime';
  t.dispatchEvent(new Event('input', {bubbles: true})); w.dispatchEvent(new Event('input', {bubbles: true}));
  document.getElementById('buildBtn').click();
"""
KID = {
    'as-made': '',
    'recommended': '#printBtn, #editBtn { display: none !important; }',
    'also-solution': '#printBtn, #editBtn, #solBtn { display: none !important; }',
}

def open_shell(ctx, query=''):
    pg = ctx.new_page()
    pg.on('pageerror', lambda e: errors.append(str(e)))
    pg.goto(BASE + 'docs/review/shell-mockup.html' + query)
    pg.wait_for_timeout(800)
    fr = pg.frame_locator('#game')
    frame = next(f for f in pg.frames if f.url.endswith('kriss-kross/index.html'))
    frame.wait_for_selector('#buildBtn')
    frame.evaluate(UNHOOK)
    frame.evaluate(BUILD)
    frame.wait_for_selector('#play:not([hidden])', timeout=10000)
    return pg, frame

def hints(frame, n=None):
    for _ in range(40 if n is None else n):
        if n is None and frame.evaluate("document.getElementById('grid').classList.contains('solved')"):
            break
        frame.evaluate("document.getElementById('hintBtn').click()"); frame.wait_for_timeout(80)

with sync_playwright() as pw:
    br = pw.chromium.launch()

    # Phone: playing, then round over
    ph = context(br, 390, 844, True)
    pg, fr = open_shell(ph)
    fr.add_style_tag(content=KID['recommended'])
    hints(fr, 2); fr.evaluate("document.getElementById('msg').textContent = ''"); pg.wait_for_timeout(400)
    pg.screenshot(path=f'{OUT}/phone-playing.png')
    pg2, fr2 = open_shell(ph, '?panel=1')
    fr2.add_style_tag(content=KID['recommended'])
    hints(fr2); fr2.evaluate("document.getElementById('msg').textContent = 'Puzzle complete. Every word fits. No hints used.'")
    pg2.wait_for_timeout(600)
    pg2.screenshot(path=f'{OUT}/phone-round-over.png')

    # PC: round over
    pc = context(br, 1366, 768, False)
    pg3, fr3 = open_shell(pc, '?panel=1')
    fr3.add_style_tag(content=KID['recommended'])
    hints(fr3); fr3.evaluate("document.getElementById('msg').textContent = 'Puzzle complete. Every word fits. No hints used.'")
    pg3.wait_for_timeout(600)
    pg3.screenshot(path=f'{OUT}/pc-round-over.png')
    pg4, fr4 = open_shell(pc)
    fr4.add_style_tag(content=KID['recommended'])
    hints(fr4, 2); fr4.evaluate("document.getElementById('msg').textContent = ''"); pg4.wait_for_timeout(400)
    pg4.screenshot(path=f'{OUT}/pc-playing.png')

    # Kid mode: the toolbar three ways, on a phone
    for name, css in KID.items():
        p, f = open_shell(ph)
        if css: f.add_style_tag(content=css)
        p.wait_for_timeout(300)
        f.locator('#play .bar').screenshot(path=f'{OUT}/kid-{name}.png')
    br.close()
srv.shutdown()
print('\n'.join(errors) or 'no page errors')
