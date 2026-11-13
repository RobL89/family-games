"""Retakes the prototype screenshots with the real Fredoka font (Google Fonts can't be reached from Claude's workspace).
Runs one of the games-wip tests with font requests answered from a local copy.

    git worktree add /tmp/gw 7ef1ff0                         (the games-wip commit)
    npm install @fontsource/fredoka@5                        (anywhere; set FONTS to its files folder)
    cd /tmp/gw && python3 -m http.server 8141 &
    FONTS=.../node_modules/@fontsource/fredoka/files PORT=8141 \
      python3 retake-screenshots.py tools/tests/e2e_word-worm.py <out dir> 8141

Used on 2026-11-08 for the pictures in this pack."""
import sys, re, runpy
import os
GW = os.environ.get('GW', 'tools/tests')
sys.path.insert(0, GW)
import standin
FONTS = os.environ.get('FONTS', 'node_modules/@fontsource/fredoka/files')
CSS = ''.join(
    f"@font-face{{font-family:'Fredoka';font-style:normal;font-weight:{w};font-display:block;"
    f"src:url(https://fonts.gstatic.com/local/fredoka-latin-{w}-normal.woff2) format('woff2');}}\n"
    for w in (400, 500, 600, 700))

def font_file(route):
    name = route.request.url.split('/local/')[1]
    with open(f'{FONTS}/{name}', 'rb') as f:
        route.fulfill(status=200, content_type='font/woff2', body=f.read())

orig = standin.new_page
def new_page(browser, db, w, h, mobile=False, errors=None):
    pg = orig(browser, db, w, h, mobile, errors)
    ctx = pg.context
    ctx.unroute(re.compile(r'https://fonts\.(googleapis|gstatic)\.com/.*'))
    ctx.route(re.compile(r'https://fonts\.googleapis\.com/.*'), lambda r: r.fulfill(status=200, content_type='text/css', body=CSS))
    ctx.route(re.compile(r'https://fonts\.gstatic\.com/local/.*'), font_file)
    return pg
standin.new_page = new_page

script = sys.argv[1]
sys.argv = [script] + sys.argv[2:]
runpy.run_path(script, run_name='__main__')
