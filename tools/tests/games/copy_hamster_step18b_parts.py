"""Hamster Highway step 18b (ii): copies level 30's agreed looks (D-243) from their mock-ups into the game, by script,
never by hand. Version 0.1 (27 Nov). The shape of copy_hamster_step18a_parts.py 0.1.

  - art.js (1.14 to 1.15): mock_hamster_finale.js 0.1's whole body (from `const GL_OFF` to its end: the lanterns, the
    lantern gate's looks gateLook('G1' or 'G2'), the poppers' looks popperLook('C1' or 'C2')), unchanged, after a header
    naming its source; G2 and C1 are the agreed looks (game.js draws only those), G1 and C2 come with them unused.
  - style.css (1.2 to 1.3): mock_hamster_finale.css 0.1's rules, after its header comment, unchanged; then one rule of
    the game's own (Claude's, as every moving part of the game has one): with reduced motion, the poppers and the
    lanterns' glow stay still.

Writes nothing if a place to edit isn't found exactly once; copies nothing that is there already (then it only checks).
Then checks: every copied part is in its file, unchanged; node imports art.js and draws G2 and C1.

Usage, from the repo root:
    python3 -B tools/tests/games/copy_hamster_step18b_parts.py
"""
import os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.abspath(os.path.join(HERE, '..', '..', '..', 'games', 'hamster-highway'))
NJS = open(os.path.join(HERE, 'mock_hamster_finale.js'), encoding='utf-8').read()
NCSS = open(os.path.join(HERE, 'mock_hamster_finale.css'), encoding='utf-8').read()
BODY = NJS[NJS.index('const GL_OFF'):]
CSS_BODY = NCSS[NCSS.index('*/\n') + 3:]

ART_HEAD = ("// Hamster Highway's drawings, as SVG text. Version 1.14.\n//\n",
            "// Hamster Highway's drawings, as SVG text. Version 1.15.\n//\n"
            "// Changes at v1.15 (step 18b (ii), D-240, D-241, D-243): level 30's looks, copied unchanged from\n"
            "// mock_hamster_finale.js 0.1 by tools/tests/games/copy_hamster_step18b_parts.py 0.1, at the end: the lantern gate\n"
            "// (gateLook: G2, a string of lanterns from the button to a wooden drawbridge, lit once the button is pressed) and\n"
            "// the confetti poppers (popperLook: C1, two big poppers either side of the merry-go-round). G1 and C2, not picked,\n"
            "// come with them unused.\n//\n")
ART_BLOCK = ('\n// ---------------------------------------------------------------- the finale (step 18b (ii), D-240, D-241, D-243)\n'
             '// Copied by tools/tests/games/copy_hamster_step18b_parts.py 0.1 from mock_hamster_finale.js 0.1 (efb4607), unchanged:\n'
             '// the lantern gate\'s looks (G2 agreed) and the confetti poppers\' looks (C1 agreed). game.js draws G2 on the fair\'s\n'
             '// levels and C1 at level 30\'s party.\n'
             + BODY)
CSS_HEAD = ('/* Hamster Highway. Version 1.2 (step 18a (ii):',
            '/* Hamster Highway. Version 1.3 (step 18b (ii): the lantern gate G2 and the poppers C1, copied from mock_hamster_finale.css 0.1, with a reduced-motion rule, at the end). 1.2 (step 18a (ii):')
CSS_BLOCK = ('\n/* The finale (step 18b (ii), D-243): copied by tools/tests/games/copy_hamster_step18b_parts.py 0.1 from\n'
             '   mock_hamster_finale.css 0.1 (efb4607), unchanged. game.js sets data-lit on the button\'s group when it is pressed. */\n'
             + CSS_BODY
             + '/* the game\'s own, as for every moving part: the poppers and the lanterns\' glow stay still with reduced motion */\n'
             '@media (prefers-reduced-motion: reduce) { .pp-cone, .pp-flash, .pp-bit, [data-lit] .gl-halo { animation: none; } }\n')

bad = []
art_p, css_p = os.path.join(GAME, 'art.js'), os.path.join(GAME, 'style.css')
art, css = open(art_p, encoding='utf-8').read(), open(css_p, encoding='utf-8').read()
art_new, css_new = BODY not in art, CSS_BODY not in css
if art_new:
    if art.count(ART_HEAD[0]) != 1:
        bad.append(f'art.js: its version line found {art.count(ART_HEAD[0])} times')
    art = art.replace(ART_HEAD[0], ART_HEAD[1], 1) + ART_BLOCK
if css_new:
    if css.count(CSS_HEAD[0]) != 1:
        bad.append(f'style.css: its version line found {css.count(CSS_HEAD[0])} times')
    css = css.replace(CSS_HEAD[0], CSS_HEAD[1], 1) + CSS_BLOCK
if bad:
    print('FAIL, nothing written:\n  ' + '\n  '.join(bad))
    sys.exit(1)
if art_new:
    open(art_p, 'w', encoding='utf-8').write(art)
if css_new:
    open(css_p, 'w', encoding='utf-8').write(css)
print(f'copied: art.js {"yes" if art_new else "already there"}, style.css {"yes" if css_new else "already there"}')

ART = open(art_p, encoding='utf-8').read()
CSS = open(css_p, encoding='utf-8').read()
r = subprocess.run(['node', '--input-type=module', '-e',
                    "const A = await import(process.argv[1]); const G = A.gateLook('G2', { bx: 1320, by: 180, hx: 120, hy: 300, n: 2 });"
                    "console.log(G.lid.length > 0 && G.fixed.includes('gl-lamp') && A.popperLook('C1').includes('data-poppers=\"C1\"'))",
                    'file://' + art_p], capture_output=True, text=True)
ok = BODY in ART and CSS_BODY in CSS and r.returncode == 0 and r.stdout.strip() == 'true'
print(('ok   ' if ok else 'FAIL ') + 'mock_hamster_finale.js 0.1\'s body in art.js and its CSS in style.css, unchanged; node draws G2 and C1'
      + ('' if ok else f' ({r.stdout.strip()} {r.stderr[-400:]})'))
sys.exit(0 if ok else 1)
