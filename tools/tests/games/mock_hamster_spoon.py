"""Hamster Highway step 14b: three ways the spoon catapult could throw, for Rob to pick from (his feedback on preview 16,
20 Nov: "i'd expect the spoon to have an animation when it flings them, at the moment it just wobbles a bit").
Version 0.1 (20 Nov). Each option loops (2.4 s, or slowed down by its button) on a strip of the pond drawn with the
game's own art (art.js 1.7: the spoon, the hamster's poses, blocks and water); the spoon is split from its reel the
way art.js would split it. Not part of the game.

A. Flip: the bowl dips as the hamster lands in it, snaps up and over, then swings back with a little bounce.
B. Flip and roll: A, and the reel rolls a turn, a puff of dust and whoosh lines fly from the bowl.
C. Wind-up: the bowl presses right down and trembles, then a bigger snap and a twang as the handle shivers back.

Checks (exit 1 if one fails): the spoon splits into reel and spoon; every option has its keyframes; every svg closed;
no web address. --fault N plants a fault the checks must catch (1: a web address; 2: option B's keyframes left out;
3: the spoon left unsplit).

Usage, from the repo root:
    python3 -B tools/tests/games/mock_hamster_spoon.py OUT.html [--fault N]
"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.abspath(os.path.join(HERE, '..', '..', '..', 'games', 'hamster-highway'))
args = sys.argv[1:]
FAULT = 0
if '--fault' in args:
    i = args.index('--fault')
    FAULT = int(args[i + 1])
    del args[i:i + 2]
OUT = args[0] if args else '/tmp/hamster-spoon-mockups.html'
FAILS = []


def check(ok, what):
    print(('ok   ' if ok else 'FAIL ') + what)
    if not ok:
        FAILS.append(what)


JS = r'''
const A = await import(process.argv[1]);
const cat = A.catapultArt();
const cut = cat.indexOf('<line x1="30"');
console.log(JSON.stringify({ reel: cut > 0 ? cat.slice(0, cut) : cat, spoon: cut > 0 ? cat.slice(cut) : '',
  walk1: A.hamster('walk1'), walk2: A.hamster('walk2'), boing: A.hamster('boing'), home: A.hamster('home'),
  block: A.block(), water: A.water ? A.water(60) : '' }));
'''
r = subprocess.run(['node', '--input-type=module', '-e', JS, 'file://' + os.path.join(GAME, 'art.js')], capture_output=True, text=True)
if r.returncode != 0:
    print(r.stderr)
    sys.exit(1)
ART = json.loads(r.stdout)
if FAULT == 3:
    ART['reel'], ART['spoon'] = ART['reel'] + ART['spoon'], ''
check(ART['spoon'].startswith('<line') and '<rect' in ART['reel'] and '<rect' not in ART['spoon'], 'the spoon splits from its reel (the handle and bowl apart from the reel)')

CELL = 60
SC = 0.6   # the gadget's 100 square in a 60 square, as game.js places it


def strip(opt):
    # cols 0 to 6: bank 0-1 (the spoon on col 1), water 2-4, far bank 5-6; the hamsters walk along row 1 (feet at y 120)
    s = f'<rect x="0" y="0" width="{7 * CELL}" height="{3 * CELL}" fill="#DDF1FB"/>'
    for c in (0, 1, 5, 6):
        for rr in (2,):
            s += f'<g transform="translate({c * CELL} {rr * CELL})">{ART["block"]}</g>'
    for c in (2, 3, 4):
        s += f'<rect x="{c * CELL}" y="{2 * CELL + 14}" width="{CELL}" height="{CELL - 14}" fill="#7FD3F7" stroke="#1B1446" stroke-width="0"/>'
    # the spoon: reel fixed, the spoon turning about the reel's top (63, 66 in its 100 square)
    s += (f'<g transform="translate({CELL} {CELL}) scale({SC})">'
          f'<g class="{opt}-reel">{ART["reel"]}</g><g class="{opt}-spoon">{ART["spoon"]}</g>'
          + (f'<g class="{opt}-puff"><circle cx="20" cy="70" r="10" fill="#fff" stroke="#1B1446" stroke-width="2"/><circle cx="6" cy="60" r="7" fill="#fff" stroke="#1B1446" stroke-width="2"/>'
             f'<path d="M 10 40 l 18 -18 M 30 44 l 20 -24 M 46 52 l 22 -22" stroke="#1B1446" stroke-width="3" stroke-linecap="round" opacity="0.6"/></g>' if opt == 'b' else '')
          + '</g>')
    # the hamster: walks in, rides the spoon, flies over the water, lands, hops home
    s += (f'<g class="{opt}-ham"><g class="{opt}-walk"><g transform="scale(0.5)">{ART["walk1"]}</g></g>'
          f'<g class="{opt}-fly"><g transform="scale(0.5)">{ART["boing"]}</g></g>'
          f'<g class="{opt}-home"><g transform="scale(0.5)">{ART["home"]}</g></g></g>')
    return f'<svg viewBox="0 0 {7 * CELL} {3 * CELL}" class="strip" role="img" aria-label="Option {opt.upper()}">{s}</svg>'


def T(x, y):
    return f'transform: translate({x}px, {y}px)'


def ham(opt, lift_at, land_at):
    # the hamster's path, shared by the three: in at 0 to 25% to the bowl, flies lift_at to land_at, home by 85%
    bowl = (CELL + 0.18 * CELL, 112)
    pts = [(0, (6, 120)), (25, bowl), (lift_at, bowl)]
    x0, y0 = bowl
    x1, y1 = (5.5 * CELL, 120)
    for k in range(1, 6):
        f = k / 6
        x = x0 + (x1 - x0) * f
        y = (1 - f) ** 2 * y0 + 2 * (1 - f) * f * (y0 - 170) + f * f * y1
        pts.append((lift_at + (land_at - lift_at) * f, (x, y)))
    pts += [(land_at, (x1, y1)), (85, (6.3 * CELL, 120)), (100, (6.3 * CELL, 120))]
    kf = ' '.join(f'{p:.1f}% {{ {T(x, y)} }}' for p, (x, y) in pts)
    vis = lambda a, b: f'0%, {a - 0.1:.1f}% {{ opacity: 0 }} {a:.1f}%, {b - 0.1:.1f}% {{ opacity: 1 }} {b:.1f}%, 100% {{ opacity: 0 }}'
    return (f'@keyframes {opt}-ham {{ {kf} }}\n.{opt}-ham {{ animation: {opt}-ham var(--d) linear infinite; }}\n'
            f'@keyframes {opt}-walk {{ 0%, {lift_at - 0.1:.1f}% {{ opacity: 1 }} {lift_at:.1f}%, {land_at - 0.1:.1f}% {{ opacity: 0 }} {land_at:.1f}%, 84.9% {{ opacity: 1 }} 85%, 100% {{ opacity: 0 }} }}\n'
            f'.{opt}-walk {{ animation: {opt}-walk var(--d) linear infinite; }}\n'
            f'@keyframes {opt}-fly {{ {vis(lift_at, land_at)} }}\n.{opt}-fly {{ animation: {opt}-fly var(--d) linear infinite; }}\n'
            f'@keyframes {opt}-home {{ {vis(85, 100.1)} }}\n.{opt}-home {{ animation: {opt}-home var(--d) linear infinite; }}\n')


PIVOT = 'transform-box: view-box; transform-origin: 63px 66px;'   # the reel's top, in the spoon's own 100 square
CSS = ':root { --d: 2.4s; } body.slow { --d: 7.2s; }\n'
# A: dips as it lands (25-30%), snaps up and over (30-36%), holds, swings back with a bounce
CSS += ham('a', 34, 58)
CSS += ('@keyframes a-spoon { 0%, 25% { transform: rotate(0) } 30% { transform: rotate(-12deg) } 36% { transform: rotate(96deg) } 44% { transform: rotate(96deg) }'
        ' 54% { transform: rotate(-14deg) } 60% { transform: rotate(7deg) } 66% { transform: rotate(-3deg) } 70%, 100% { transform: rotate(0) } }\n'
        f'.a-spoon {{ animation: a-spoon var(--d) ease-in-out infinite; {PIVOT} }}\n')
# B: A, the reel rolls a turn, a puff and whoosh lines at the throw
CSS += ham('b', 34, 58)
CSS += ('@keyframes b-spoon { 0%, 25% { transform: rotate(0) } 30% { transform: rotate(-12deg) } 36% { transform: rotate(96deg) } 44% { transform: rotate(96deg) }'
        ' 54% { transform: rotate(-14deg) } 60% { transform: rotate(7deg) } 66% { transform: rotate(-3deg) } 70%, 100% { transform: rotate(0) } }\n'
        f'.b-spoon {{ animation: b-spoon var(--d) ease-in-out infinite; {PIVOT} }}\n'
        '@keyframes b-reel { 0%, 30% { transform: rotate(0) } 50%, 100% { transform: rotate(360deg) } }\n'
        '.b-reel { animation: b-reel var(--d) ease-out infinite; transform-box: view-box; transform-origin: 63px 82px; }\n'
        '@keyframes b-puff { 0%, 31% { opacity: 0; transform: scale(0.4) } 36% { opacity: 1; transform: scale(1) } 50% { opacity: 0; transform: scale(1.4) } 100% { opacity: 0 } }\n'
        '.b-puff { animation: b-puff var(--d) ease-out infinite; transform-box: view-box; transform-origin: 20px 70px; }\n')
# C: a longer wind-up, pressed right down and trembling (25-38%), a bigger snap (38-42%), a twang back (50-70%)
CSS += ham('c', 40, 62)
tremble = ' '.join(f'{p}% {{ transform: rotate({a}deg) }}' for p, a in [(28, -18), (30, -21), (32, -17), (34, -22), (36, -18), (38, -22)])
twang = ' '.join(f'{p}% {{ transform: rotate({a}deg) }}' for p, a in [(50, 110), (54, -16), (57, 12), (60, -9), (63, 6), (66, -4), (69, 2)])
CSS += (f'@keyframes c-spoon {{ 0%, 25% {{ transform: rotate(0) }} {tremble} 42% {{ transform: rotate(112deg) }} {twang} 72%, 100% {{ transform: rotate(0) }} }}\n'
        f'.c-spoon {{ animation: c-spoon var(--d) ease-in-out infinite; {PIVOT} }}\n')
if FAULT == 2:
    CSS = re.sub(r'@keyframes b-spoon \{.*?\}\n\.b-spoon \{[^}]*\}\n', '', CSS, flags=re.S)
check(all(f'@keyframes {o}-spoon' in CSS and f'@keyframes {o}-ham' in CSS for o in 'abc'), 'each option has its spoon\'s and hamster\'s keyframes')

NAMES = {'a': 'A. Flip: the bowl dips as the hamster lands in it, snaps up and over, then swings back with a little bounce',
         'b': 'B. Flip and roll: as A, and the cotton reel rolls a turn, with a puff of dust and whoosh lines from the bowl',
         'c': 'C. Wind-up: the bowl presses right down and trembles, then a bigger snap, and the handle twangs as it settles'}
page = f'''<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Hamster Highway: the spoon's throw</title><style>
body{{font:16px/1.45 system-ui, sans-serif;color:#1B1446;background:#FFF8EE;margin:0;padding:16px}}
h1{{font-size:22px;margin:4px 0}} h2{{font-size:17px;margin:22px 0 6px}} .strip{{width:100%;max-width:640px;display:block;border:2px solid #1B144622;border-radius:14px;background:#fff}}
.rec{{background:#FFF1C2;border-radius:10px;padding:2px 8px;font-weight:700}} .stamp{{font-size:12px;color:#666}}
button{{font:700 16px system-ui,sans-serif;border:3px solid #1B1446;border-radius:14px;background:#FFD23F;padding:8px 16px}}
{CSS}</style></head><body>
<h1>The spoon's throw: three ways</h1>
<p class="stamp">mock_hamster_spoon.py 0.1 · 20 Nov · drawn with the game's own art; looping, 2.4 s (the game's throw is about 0.8 s of it). Not built yet.</p>
<p><button type="button" id="slow" onclick="document.body.classList.toggle('slow');this.textContent=document.body.classList.contains('slow')?'Normal speed':'Slow motion'">Slow motion</button></p>
''' + ''.join(f'<h2>{NAMES[o]}{" <span class=rec>recommended</span>" if o == "b" else ""}</h2>{strip(o)}\n' for o in 'abc') + '''
<h2>What I'd pick</h2>
<p><b>B:</b> the flip reads clearly at phone size, and the rolling reel and puff make the moment of the throw easy to see. A is the quietest; C's wind-up holds the hamster longer in the spoon.</p>
</body></html>'''
if FAULT == 1:
    page = page.replace('</body>', '<img src="https://example.com/x.png"></body>')
check(not re.search(r'(https?:)?//[a-z0-9.-]+\.[a-z]{2,}', page, re.I), 'the page names no web address')
check(page.count('<svg') == page.count('</svg>'), f'every svg closed ({page.count("<svg")})')
open(OUT, 'w').write(page)
print(f'wrote {OUT} ({len(page)} bytes); {len(FAILS)} failed')
sys.exit(1 if FAILS else 0)
