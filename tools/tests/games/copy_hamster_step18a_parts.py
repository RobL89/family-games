"""Hamster Highway step 18a (ii): copies the fair's agreed parts (D-234, D-235) from their mock-ups into the game, by
script, never by hand. Version 0.1 (27 Nov). The shape of the earlier copy scripts.

  - art.js: the fair's look A (fairA and its helpers: the big wheel, the helter-skelter, flags, bunting, the balloon
    stall and the balloons let go, and their colours and fx()), the zip ride R2's kicked feet (ZIP_SAG, ZIP_FEET,
    kickFeet, kickOk) and the fair party P1 (fairHorse, partyConfetti, zcls, note, partyCarousel), each copied whole from
    mock_hamster_fair.js 0.1 in its order there; kickFeet is exported (export added before it, its text unchanged).
    backdrop('fairA') draws fairA (data-back="fairA") and backHeight('fairA') is 540, as the pond's.
  - style.css: mock_hamster_fair.css 0.1's rules, after its header comment, unchanged.
  - cards.js: the zip-line's card, card B of mock_hamster_zipcards.js 0.1 with the name zipB made zip: its board
    (ZROWS), onLine, rider, zline, VIEW and SCENE, and its keyframes (the swing and kicks, the ride's path and B's
    timeline) as zipCss(), called from css(); kick is art.js's kickFeet (one home); 'zip' added to CARDS, its caption
    and its 7 s loop.

Writes nothing if a part is missing from a mock-up or a place to edit isn't found exactly once; copies nothing that is
there already (then it only checks). Then checks: node imports art.js and cards.js; every copied part is in its file.

Usage, from the repo root:
    python3 -B tools/tests/games/copy_hamster_step18a_parts.py
"""
import os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.abspath(os.path.join(HERE, '..', '..', '..', 'games', 'hamster-highway'))
FAIR = open(os.path.join(HERE, 'mock_hamster_fair.js'), encoding='utf-8').read()
FCSS = open(os.path.join(HERE, 'mock_hamster_fair.css'), encoding='utf-8').read()
ZIPS = open(os.path.join(HERE, 'mock_hamster_zipcards.js'), encoding='utf-8').read()
bad = []


def block(src, start):
    """From the line starting `start` to its end: a one-line const, else to the next line '}' or '};' at the left edge."""
    i = src.find('\n' + start)
    if i < 0:
        bad.append(f'not in its mock-up: {start}')
        return ''
    i += 1
    line = src[i:src.index('\n', i)]
    if re.sub(r'\s+//.*$', '', line).endswith(';'):   # a one-line const, a comment after it or not
        return line + '\n'
    ends = [src.find('\n}\n', i), src.find('\n};\n', i)]
    e = min(x for x in ends if x >= 0)
    return src[i:src.index('\n', e + 1) + 1]


def two_line(src, start):
    """A const that runs onto a second line (note)."""
    i = src.find('\n' + start) + 1
    j = src.index('\n', src.index('\n', i) + 1) + 1
    return src[i:j]


# ---------------------------------------------------------------- art.js
ART_PARTS = ["const FBLUE", "const FLILAC", "const FMINT", "const FCOLS", "const fx =", "function fairCar(", "function fairWheel(", "function fairFlag(",
             "function fairHelter(", "function fairBunting(", "function fairBalloon(", "function fairStall(", "function fairLetGo(", "function fairHorse(",
             "function fairA(", "export const ZIP_SAG", "const ZIP_FEET", "const kickFeet", "export const kickOk", "function partyConfetti(", "const note =",
             "const zcls", "export function partyCarousel("]
art_texts = []
for p in ART_PARTS:
    t = two_line(FAIR, p) if p == 'const note =' else block(FAIR, p)
    if p == 'const kickFeet':
        t = 'export ' + t
    art_texts.append(t)
ART_BLOCK = ('\n// ---------------------------------------------------------------- the fair (step 18a (ii), D-234, D-235)\n'
             '// Copied by tools/tests/games/copy_hamster_step18a_parts.py 0.1 from mock_hamster_fair.js 0.1 (07eea02), unchanged\n'
             '// (kickFeet exported): the fair\'s look A, gentle while building and brighter and faster in a run and at the party\n'
             '// (style.css moves it, on the board\'s data-mode); the zip ride R2\'s kicked feet; the fair party P1, the merry-go-round.\n'
             + '\n'.join(art_texts))
ART_EDITS = [
    ("  if (name === 'playground') return g(playgroundQ1(w), '', ' data-back=\"playground\"');   // faded (D-226)\n",
     "  if (name === 'playground') return g(playgroundQ1(w), '', ' data-back=\"playground\"');   // faded (D-226)\n"
     "  if (name === 'fairA') return g(fairA(w), '', ' data-back=\"fairA\"');   // the fair's look A (D-235), its busy shapes faded while building\n"),
    ("export const backHeight = (name) => (name === 'pond' || name === 'frame' || name === 'picnic' || name === 'playground' ? 540 : H);",
     "export const backHeight = (name) => (name === 'pond' || name === 'frame' || name === 'picnic' || name === 'playground' || name === 'fairA' ? 540 : H);"),
]

# ---------------------------------------------------------------- style.css
CSS_BLOCK = ('\n/* The fair (step 18a (ii), D-234, D-235): copied by tools/tests/games/copy_hamster_step18a_parts.py 0.1 from\n'
             '   mock_hamster_fair.css 0.1 (07eea02), unchanged. game.js sets data-mode (build, run, party) on the board. */\n'
             + FCSS[FCSS.index('*/\n') + 3:])

# ---------------------------------------------------------------- cards.js
zl = ZIPS.split('\n')
pick = lambda pre: [x for x in zl if x.startswith(pre)]   # noqa: E731
scene = []
for x in zl:
    if x.startswith(('const ZROWS', 'const onLine', 'const rider', 'const zline', 'VIEW.zipB', 'SCENE.zipB', "  + cls('hc-zipB", "  + g(cls('hc-zipB", "  + rider('zipB")):
        scene.append(x)
    if x.startswith('const ZROWS'):
        scene.append('const kick = kickFeet;   // the zip pose, feet kicked (art.js, D-235\'s ride)')
i0 = ZIPS.index('function zipCss() {')
body = ZIPS[i0:ZIPS.index('\n}\n', i0) + 3].split('\n')
css_lines = [body[0]]
keep = False
for x in body[1:]:
    if x.startswith("  let s = '.hc-zipA-swing"):
        css_lines += [x, body[body.index(x) + 1], body[body.index(x) + 2]]
        continue
    if x.startswith('  const ride = '):
        css_lines.append(x)
        continue
    if x.startswith('  // B: '):
        keep = True
    if x.startswith('  return s;'):
        keep = False
        css_lines += [x, '}']
        break
    if keep:
        css_lines.append(x)
ZIP_CSS = '\n'.join(css_lines).replace('.hc-zipA-swing, .hc-zipB-swing', '.hc-zip-swing') + '\n'
CARD_BLOCK = ('// ---------------------------------------------------------------- the zip-line (step 18a (ii), D-235, card B)\n'
              '// Copied by tools/tests/games/copy_hamster_step18a_parts.py 0.1 from mock_hamster_zipcards.js 0.1 (07eea02), with the\n'
              '// name zipB made zip and kick art.js\'s kickFeet: the hook\'s square lights up and the hook drops in under the block,\n'
              '// then the low end\'s, a dashed line stretches out to it and the peg drops in, and the line turns solid; then the\n'
              '// ride, swinging about the reel and kicking, a hop down onto the bank and home. 7 s.\n'
              + '\n'.join(scene).replace('zipB', 'zip') + '\n\n' + ZIP_CSS.replace('zipB', 'zip') + '\n')
CARD_EDITS = [
    ("export const CARDS = ['bridge', 'ramp', 'bouncer', 'floater', 'tube', 'stick', 'seesaw', 'lift', 'catapult', 'signpost', 'button', 'pudding'];",
     "export const CARDS = ['bridge', 'ramp', 'bouncer', 'floater', 'tube', 'stick', 'seesaw', 'lift', 'catapult', 'signpost', 'button', 'pudding', 'zip'];"),
    ("  pudding: 'Pudding is too heavy to bounce!',\n};", "  pudding: 'Pudding is too heavy to bounce!',\n  zip: 'Hook it high, peg it low!',\n};"),
    ("signpost: 6, button: 5.5, pudding: 6 };", "signpost: 6, button: 5.5, pudding: 6, zip: 7 };"),
    ("seesawArt, potArt, heart, place, g, rect, path, text } from './art.js';", "seesawArt, potArt, heart, place, g, rect, path, text, line, zipLine, zipHook, zipPeg, kickFeet } from './art.js';"),
    ("function css() {\n", CARD_BLOCK + "function css() {\n"),
    ("  return s;\n}\nexport const CARD_CSS = css();", "  s += zipCss();   // the zip-line's (step 18a (ii))\n  return s;\n}\nexport const CARD_CSS = css();"),
]

if bad:
    print('FAIL, nothing written:\n  ' + '\n  '.join(bad))
    sys.exit(1)


def apply(name, edits, append=''):
    p = os.path.join(GAME, name)
    src = open(p, encoding='utf-8').read()
    if (append and append.strip().split('\n')[1] in src) or (not append and edits[0][1] in src):
        return src, False
    for old, new in edits:
        if src.count(old) != 1:
            bad.append(f'{name}: {old[:70]!r} found {src.count(old)} times')
        src = src.replace(old, new, 1)
    return src + append, True


art, art_new = apply('art.js', ART_EDITS, ART_BLOCK)
css_src = open(os.path.join(GAME, 'style.css'), encoding='utf-8').read()
css_new = CSS_BLOCK.split('\n')[1] not in css_src
cards, cards_new = apply('cards.js', CARD_EDITS)
if bad:
    print('FAIL, nothing written:\n  ' + '\n  '.join(bad))
    sys.exit(1)
if art_new:
    open(os.path.join(GAME, 'art.js'), 'w', encoding='utf-8').write(art)
if css_new:
    open(os.path.join(GAME, 'style.css'), 'w', encoding='utf-8').write(css_src + CSS_BLOCK)
if cards_new:
    open(os.path.join(GAME, 'cards.js'), 'w', encoding='utf-8').write(cards)
print(f'copied: art.js {"yes" if art_new else "already there"}, style.css {"yes" if css_new else "already there"}, cards.js {"yes" if cards_new else "already there"}')

# the checks
ART = open(os.path.join(GAME, 'art.js'), encoding='utf-8').read()
CSS = open(os.path.join(GAME, 'style.css'), encoding='utf-8').read()
CARDS = open(os.path.join(GAME, 'cards.js'), encoding='utf-8').read()
miss = [p for p, t in zip(ART_PARTS, art_texts) if t not in ART] + ([] if FCSS[FCSS.index('*/\n') + 3:] in CSS else ['the CSS'])
miss += [x[:40] for x in scene if x.replace('zipB', 'zip') not in CARDS] + ([] if ZIP_CSS.replace('zipB', 'zip') in CARDS else ['zipCss'])
r = subprocess.run(['node', '--input-type=module', '-e',
                    "const A = await import(process.argv[1]); const K = await import(process.argv[2]);"
                    "console.log(A.backdrop('fairA', 960).length > 0 && A.partyCarousel().length > 0 && K.cardArt('zip').length > 0 && K.CARD_CSS.includes('hc-zip-ham'))",
                    'file://' + os.path.join(GAME, 'art.js'), 'file://' + os.path.join(GAME, 'cards.js')], capture_output=True, text=True)
ok = not miss and r.returncode == 0 and r.stdout.strip() == 'true'
print(('ok   ' if ok else 'FAIL ') + f'every part in its file, unchanged ({len(ART_PARTS)} in art.js, the CSS, {len(scene)} scene lines and zipCss in cards.js); node draws the fair, the party and the card'
      + ('' if ok else f' (missing {miss}; {r.stdout.strip()} {r.stderr[-400:]})'))
sys.exit(0 if ok else 1)
