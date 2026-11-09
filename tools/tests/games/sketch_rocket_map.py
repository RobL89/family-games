"""Crude sketches: Rocket Lander as one game with a map of solar systems. Version 1.0.

Step 2c-1 (D-058 to D-060, D-063). Rough SVG screens to talk through how the map works before
any proper mock-ups: the map as the home screen (phone sideways and upright), a level's card,
the end of a replay, a system finished and the hyperspace jump, the galaxy view, a dice line
(D-060) and route (a) (D-059). Crude on purpose: shapes and flow, not the look. The systems'
colours and names come from games/_common/rocket/planets.js (read with Node); everything else
is drawn here as plain SVG, original art. Nothing in the game's files changes. All progress
shown is made up.

Writes index.html into the folder given (default /mnt/user-data/outputs/map-sketch/).
Stand-in: Node 22 reads planets.js. Usage, from the repo root:
    python3 -B tools/tests/games/sketch_rocket_map.py [out-folder]
"""
import json, math, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
OUT = sys.argv[1] if len(sys.argv) > 1 else '/mnt/user-data/outputs/map-sketch'
os.makedirs(OUT, exist_ok=True)
VERSION = '1.0'

js = ("import { pathToFileURL } from 'node:url';"
      "const m = await import(pathToFileURL(process.argv[1]).href);"
      "console.log(JSON.stringify(m.PLANETS));")
PLANETS = json.loads(subprocess.check_output(
    ['node', '--input-type=module', '-e', js, os.path.join(REPO, 'games/_common/rocket/planets.js')]))
P = {p['id']: p for p in PLANETS}
COMMIT = subprocess.check_output(['git', '-C', REPO, 'rev-parse', '--short', 'HEAD'], text=True).strip()

INK, SUN, LILAC, MINT = '#1B1446', '#FFC93C', '#7C6CF0', '#3FE0A0'
STAR_D = 'M12 2.2l2.9 6 6.5.8-4.8 4.5 1.2 6.5L12 16.9 6.2 20l1.2-6.5L2.6 9l6.5-.8z'  # round.js's star
_uid = [0]


def uid(p):
    _uid[0] += 1
    return f'{p}{_uid[0]}'


def rnd(seed):
    s = [seed * 9301 + 49297]
    def r():
        s[0] = (s[0] * 9301 + 49297) % 233280
        return s[0] / 233280
    return r


def txt(x, y, s, size=16, fill='#fff', anchor='middle', weight=700, stroke=INK, sw=4):
    st = f' stroke="{stroke}" stroke-width="{sw}" paint-order="stroke" stroke-linejoin="round"' if stroke else ''
    return (f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" text-anchor="{anchor}" '
            f'fill="{fill}"{st}>{s}</text>')


def star(x, y, size, on=True, off='#D9D3F7'):
    k = size / 24
    return (f'<path transform="translate({x - size / 2},{y - size / 2}) scale({k})" d="{STAR_D}" '
            f'fill="{SUN if on else off}" stroke="{INK}" stroke-width="{1.8 / k * 0.9:.2f}" stroke-linejoin="round"/>')


def stars(x, y, n, size=14, of=3, off='#D9D3F7'):
    return ''.join(star(x + (i - (of - 1) / 2) * size * 1.05, y, size, i < n, off) for i in range(of))


def rock(x, y, r=7, on=True):
    pts = [(math.cos(a) * r * f, math.sin(a) * r * f) for a, f in
           zip([i * math.pi / 4 for i in range(8)], [1, .82, 1, .9, .78, 1, .86, .95])]
    d = 'M' + ' L'.join(f'{x + px:.1f} {y + py:.1f}' for px, py in pts) + 'Z'
    return (f'<path d="{d}" fill="{"#B9BDD1" if on else "none"}" stroke="{INK if on else "#B9BDD1"}" '
            f'stroke-width="{2 if on else 1.6}" stroke-dasharray="{"" if on else "2 2"}"/>')


def rocket(x, y, s=1.0, flame=False):
    """A crude rocket, nose up, its feet at (x, y)."""
    g = f'<g transform="translate({x},{y}) scale({s})">'
    if flame:
        g += '<path d="M-7 0Q0 22 7 0Z" fill="#FF9F43" stroke="#1B1446" stroke-width="2"/>'
    g += ('<path d="M-12 -6L-20 2L-12 0Z M12 -6L20 2L12 0Z" fill="#FF6B6B" stroke="#1B1446" stroke-width="2.5" stroke-linejoin="round"/>'
          '<path d="M0 -46Q14 -30 12 0H-12Q-14 -30 0 -46Z" fill="#F2F4FF" stroke="#1B1446" stroke-width="3" stroke-linejoin="round"/>'
          '<path d="M0 -46Q7 -40 9 -33H-9Q-7 -40 0 -46Z" fill="#FF6B6B" stroke="#1B1446" stroke-width="2.5"/>'
          '<circle cx="0" cy="-20" r="6" fill="#8CF5FF" stroke="#1B1446" stroke-width="2.5"/></g>')
    return g


def padlock(x, y, s=1.0):
    return (f'<g transform="translate({x},{y}) scale({s})"><path d="M-5 -3V-7Q-5 -12 0 -12Q5 -12 5 -7V-3" fill="none" '
            f'stroke="{INK}" stroke-width="2.6"/><rect x="-8" y="-4" width="16" height="12" rx="3" fill="#D9D3F7" '
            f'stroke="{INK}" stroke-width="2.4"/></g>')


def die(x, y, n, s=26):
    """A die face centred at (x, y); n = 0 is the empty face (D-060)."""
    h = s / 2
    pip = {1: [(0, 0)], 2: [(-1, -1), (1, 1)], 3: [(-1, -1), (0, 0), (1, 1)], 4: [(-1, -1), (1, -1), (-1, 1), (1, 1)],
           5: [(-1, -1), (1, -1), (0, 0), (-1, 1), (1, 1)], 6: [(-1, -1), (1, -1), (-1, 0), (1, 0), (-1, 1), (1, 1)]}
    g = f'<rect x="{x - h}" y="{y - h}" width="{s}" height="{s}" rx="{s * .22}" fill="#fff" stroke="{INK}" stroke-width="2.2"/>'
    for px, py in pip.get(n, []):
        g += f'<circle cx="{x + px * s * .27:.1f}" cy="{y + py * s * .27:.1f}" r="{s * .085:.1f}" fill="{INK}"/>'
    return g


def dice_for(n):
    """D-060: up to 6 one die; 7 to 12 a 6 and the rest."""
    return [n] if n <= 6 else [6, n - 6]


def sky(w, h, p, seed=1):
    gid = uid('sky')
    r = rnd(p['seed'] + seed)
    g = (f'<defs><linearGradient id="{gid}" x1="0" y1="0" x2="0" y2="1">'
         + ''.join(f'<stop offset="{i / 2}" stop-color="{c}"/>' for i, c in enumerate(p['sky']))
         + f'</linearGradient></defs><rect width="{w}" height="{h}" fill="url(#{gid})"/>')
    for _ in range(int(w * h / 4000)):
        g += f'<circle cx="{r() * w:.0f}" cy="{r() * h * .75:.0f}" r="{.6 + r() * 1.4:.1f}" fill="#fff" opacity="{.4 + r() * .6:.2f}"/>'
    f = p['far'][0]
    fx, fy, fr = f['x'] * w, f['y'] * h * .8, f['r'] * min(w, h) * 1.1
    g += f'<circle cx="{fx:.0f}" cy="{fy:.0f}" r="{fr:.0f}" fill="{f["c1"]}" stroke="{f["c2"]}" stroke-width="4" opacity=".85"/>'
    if p.get('rings'):
        g += f'<ellipse cx="{fx:.0f}" cy="{fy:.0f}" rx="{fr * 1.9:.0f}" ry="{fr * .45:.0f}" fill="none" stroke="{p["rings"][0]}" stroke-width="4" opacity=".8"/>'
    return g


def ground(w, h, p, top):
    c = p['ground']
    return (f'<path d="M0 {top} Q{w * .25} {top - 14} {w * .5} {top} T{w} {top} V{h} H0Z" fill="{c[1]}" stroke="{INK}" stroke-width="3"/>'
            f'<path d="M0 {top + 18} Q{w * .3} {top + 8} {w * .6} {top + 20} T{w} {top + 16} V{h} H0Z" fill="{c[2]}" opacity=".7"/>')


def hangar_btn(x, y, rocks=37):
    """The top-right hangar button: a door and the moon rocks (D-052, crude)."""
    return (f'<g transform="translate({x},{y})"><rect x="0" y="0" width="92" height="36" rx="18" fill="{LILAC}" stroke="{INK}" stroke-width="3"/>'
            f'<path d="M6 34V14Q6 2 20 2Q34 2 34 14V34Z" fill="#5B4CC4" stroke="{INK}" stroke-width="2.5"/>'
            f'<path d="M11 34V16Q11 8 20 8Q29 8 29 16V34Z" fill="#8CF5FF" stroke="{INK}" stroke-width="2"/>'
            f'{rock(50, 18, 7)}{txt(74, 24, rocks, 16)}</g>')


def galaxy_btn(x, y):
    return (f'<g transform="translate({x},{y})"><circle r="18" fill="{LILAC}" stroke="{INK}" stroke-width="3"/>'
            f'<ellipse rx="11" ry="5" fill="none" stroke="#fff" stroke-width="2" transform="rotate(-20)"/>'
            f'<circle r="4" fill="{SUN}" stroke="{INK}" stroke-width="1.5"/></g>')


def arrow(x, y, left, on=True):
    d = 'M5 -9L-4 0L5 9' if left else 'M-5 -9L4 0L-5 9'
    return (f'<g transform="translate({x},{y})" opacity="{1 if on else .35}"><circle r="15" fill="#ffffff33" stroke="#fff" stroke-width="2"/>'
            f'<path d="{d}" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></g>')


def portal(x, y, to, r=26):
    return (f'<g transform="translate({x},{y})">'
            + ''.join(f'<ellipse rx="{r - i * 6}" ry="{(r - i * 6) * 1.25:.0f}" fill="none" stroke="{c}" stroke-width="3"/>'
                      for i, c in enumerate(['#B07CFF', '#8CF5FF', '#FF7EC8', '#fff']))
            + f'</g>{txt(x, y + r * 1.25 + 16, "to " + to, 11)}')


def level_nodes(xs, ys, p, done, cur, r=21, final_big=True):
    """The path and the eight level markers. done = best stars of each finished level."""
    g = ''
    pts = list(zip(xs, ys))
    d = 'M' + ' '.join(f'{x:.0f} {y:.0f}' for x, y in pts)
    g += f'<path d="{d}" fill="none" stroke="#ffffff88" stroke-width="5" stroke-dasharray="2 10" stroke-linecap="round"/>'
    if len(done) > 0:
        dd = 'M' + ' '.join(f'{x:.0f} {y:.0f}' for x, y in pts[:len(done) + 1])
        g += f'<path d="{dd}" fill="none" stroke="{SUN}" stroke-width="5" stroke-linecap="round"/>'
    for i, (x, y) in enumerate(pts):
        n = i + 1
        last = n == len(pts)
        rr = r * 1.3 if (last and final_big) else r
        if i < len(done):
            g += f'<circle cx="{x}" cy="{y}" r="{rr}" fill="{p["glow"]}" stroke="{INK}" stroke-width="3"/>'
            g += txt(x, y + 6, n, 17, INK, stroke=None)
            g += stars(x, y + rr + 13, done[i], 16, off='#4A4570')
        elif i == cur:
            g += f'<circle cx="{x}" cy="{y}" r="{rr + 9}" fill="none" stroke="{SUN}" stroke-width="3" opacity=".7"/>'
            g += f'<circle cx="{x}" cy="{y}" r="{rr}" fill="{SUN}" stroke="{INK}" stroke-width="3"/>'
            g += txt(x, y + 6, n, 17, INK, stroke=None)
        else:
            g += f'<circle cx="{x}" cy="{y}" r="{rr}" fill="#8A8FA8" stroke="{INK}" stroke-width="3" opacity=".9"/>'
            g += padlock(x, y + 2, .9)
        if last:
            g += (f'<path d="M{x + 4} {y - rr - 2}V{y - rr - 26}L{x + 20} {y - rr - 20}L{x + 4} {y - rr - 14}" '
                  f'fill="{SUN}" stroke="{INK}" stroke-width="2.5" stroke-linejoin="round"/>')
    return g


def map_sideways(pid='moon', done=(3, 2, 3), cur=3, idx=1, nxt='Red Dust', rocks=37, w=844, h=390, extra='',
                 rocket_at=True, bip_moment=False):
    p = P[pid]
    g = sky(w, h, p) + ground(w, h, p, 318)
    xs = [70 + i * 92 for i in range(8)]
    ys = [222 + 34 * math.sin(i * 1.1) for i in range(8)]
    g += level_nodes(xs, ys, p, list(done), cur)
    g += portal(800, 200, nxt)
    if rocket_at and cur < 8:
        g += rocket(xs[cur], ys[cur] - 26, .75)
        g += (f'<g transform="translate({xs[cur]},{ys[cur] - 92})"><rect x="-30" y="-16" width="60" height="28" rx="14" fill="#fff" '
              f'stroke="{INK}" stroke-width="3"/>{txt(0, 4, "Play", 15, INK, stroke=None)}</g>')
    if bip_moment:
        x, y = xs[7], ys[7]
        g += rocket(x - 30, y - 6, .7)
        g += (f'<g transform="translate({x + 34},{y - 4})"><path d="M0 -70V0" stroke="{INK}" stroke-width="3"/>'
              f'<path d="M0 -70H44V-40H0Z" fill="{SUN}" stroke="{INK}" stroke-width="3"/>{stars(22, -55, 3, 11)}'
              f'<circle cx="-12" cy="-12" r="9" fill="#fff" stroke="{INK}" stroke-width="2.5"/>'
              f'<rect x="-17" y="-4" width="10" height="12" rx="3" fill="#fff" stroke="{INK}" stroke-width="2.5"/></g>')
    g += f'<rect x="0" y="0" width="{w}" height="56" fill="#0006"/>'
    g += galaxy_btn(30, 28) + arrow(72, 28, True, idx > 1)
    g += txt(w / 2 - 40, 26, f'{p["name"]}', 22) + txt(w / 2 - 40, 46, f'system {idx} of 6', 12, '#ffffffcc', sw=3)
    g += arrow(w / 2 + 70, 28, False, False)
    g += hangar_btn(w - 104, 10, rocks)
    return g + extra


def map_upright(pid='moon', done=(3, 2, 3), cur=3, w=390, h=844, rocks=37):
    p = P[pid]
    g = sky(w, h, p) + ground(w, h, p, 640)
    xs = [34 + i * 46 for i in range(8)]
    ys = [490 if i % 2 else 370 for i in range(8)]  # two rows, odd levels above, so stars and labels have room
    g += level_nodes(xs, ys, p, list(done), cur, r=19)
    g += rocket(xs[cur], ys[cur] - 24, .7)
    g += (f'<g transform="translate({max(40, xs[cur])},{ys[cur] - 88})"><rect x="-30" y="-16" width="60" height="28" rx="14" fill="#fff" '
          f'stroke="{INK}" stroke-width="3"/>{txt(0, 4, "Play", 15, INK, stroke=None)}</g>')
    g += f'<rect x="0" y="0" width="{w}" height="64" fill="#0006"/>'
    g += galaxy_btn(30, 32) + txt(w / 2 - 20, 30, p['name'], 20) + txt(w / 2 - 20, 50, 'system 1 of 6', 12, '#ffffffcc', sw=3)
    g += hangar_btn(w - 100, 14, rocks)
    g += txt(w / 2, 760, 'the portal to the next system', 12, '#ffffffcc', sw=3) + portal(w / 2, 700, 'Red Dust', 20)
    return g


def card(x, y, w, h, body):
    return (f'<g transform="translate({x},{y})"><rect width="{w}" height="{h}" rx="22" fill="#FFF8E6" stroke="{INK}" stroke-width="4"/>'
            f'{body}</g>')


def big_btn(x, y, label, w=150, fill=SUN):
    return (f'<g transform="translate({x},{y})"><rect x="{-w / 2}" y="-24" width="{w}" height="48" rx="24" fill="{fill}" '
            f'stroke="{INK}" stroke-width="4"/>{txt(0, 8, label, 22, INK, stroke=None)}</g>')


def level_card(level, about, best, rocks_found, note, btn='Play'):
    w, h = 844, 390
    g = map_sideways(rocket_at=False) + f'<rect width="{w}" height="{h}" fill="#000a"/>'
    body = txt(170, 46, f'Level {level}', 28, INK, stroke=None) + txt(170, 72, about, 15, '#5B4CC4', stroke=None, weight=600)
    body += txt(170, 104, 'Your best', 12, '#6b6790', stroke=None, weight=600) + stars(170, 128, best, 34)
    body += ''.join(rock(170 + (i - 3.5) * 24, 172, 9, i < rocks_found) for i in range(8))
    body += txt(170, 202, note, 14, INK, stroke=None, weight=600)
    body += big_btn(170, 244, btn)
    return g + card(252, 52, 340, 286, body)


def end_card(title, best_before, best_now, new_rocks, found, note):
    w, h = 844, 390
    g = sky(w, h, P['moon'], 3) + ground(w, h, P['moon'], 318) + f'<rect width="{w}" height="{h}" fill="#0008"/>'
    body = txt(170, 50, title, 28, INK, stroke=None)
    body += stars(170, 92, best_now, 38)
    if best_now > best_before:
        body += (f'<g transform="translate({170 + 44},{70})"><rect x="-20" y="-11" width="40" height="20" rx="10" fill="{MINT}" '
                 f'stroke="{INK}" stroke-width="2.5"/>{txt(0, 4, "NEW", 11, INK, stroke=None)}</g>')
    body += ''.join(rock(170 + (i - 3.5) * 24, 140, 9, i < found) for i in range(8))
    body += txt(170, 172, f'+{new_rocks} moon rocks' if new_rocks else 'No new rocks', 18, '#5B4CC4', stroke=None)
    body += txt(170, 198, note, 13, INK, stroke=None, weight=600)
    body += big_btn(170, 240, 'Back to the map', 200)
    return g + card(252, 46, 340, 296, body)


def hyperspace(w=844, h=390):
    r = rnd(5)
    g = f'<rect width="{w}" height="{h}" fill="#05031A"/>'
    for _ in range(90):
        a = r() * math.tau
        d0, d1 = 40 + r() * 80, 200 + r() * 340
        c = ['#fff', '#8CF5FF', '#B07CFF', '#FF7EC8'][int(r() * 4)]
        g += (f'<line x1="{w / 2 + math.cos(a) * d0:.0f}" y1="{h / 2 + math.sin(a) * d0:.0f}" x2="{w / 2 + math.cos(a) * d1:.0f}" '
              f'y2="{h / 2 + math.sin(a) * d1:.0f}" stroke="{c}" stroke-width="{1 + r() * 2.5:.1f}" stroke-linecap="round" opacity=".85"/>')
    g += f'<g transform="rotate(90 {w / 2} {h / 2 + 20})">{rocket(w / 2, h / 2 + 40, 1.3, True)}</g>'
    g += txt(w / 2, 60, 'Hyperspace!', 34) + txt(w / 2, h - 30, 'off to Red Dust…', 18, '#ffffffcc')
    return g


def banner(w, s):
    return (f'<g transform="translate({w / 2},96)"><rect x="-190" y="-26" width="380" height="46" rx="23" fill="{SUN}" '
            f'stroke="{INK}" stroke-width="4"/>{txt(0, 6, s, 20, INK, stroke=None)}</g>')


def galaxy(w=844, h=390):
    r = rnd(9)
    g = f'<rect width="{w}" height="{h}" fill="#0B0A26"/>'
    for _ in range(80):
        g += f'<circle cx="{r() * w:.0f}" cy="{r() * h:.0f}" r="{.5 + r() * 1.3:.1f}" fill="#fff" opacity="{.3 + r() * .6:.2f}"/>'
    g += txt(w / 2, 40, 'Your galaxy', 26) + txt(w / 2, 62, 'tap a system to fly there', 13, '#ffffffcc', sw=3)
    ids = ['moon', 'dust', 'candy', 'ice', 'jungle', 'ringed']
    got = [sum(MOON_DONE), 19, 3, None, None, None]  # made up, Moon as in section 4
    xs = [90 + i * 133 for i in range(6)]
    g += f'<path d="M{xs[0]} 200H{xs[-1]}" stroke="#ffffff55" stroke-width="4" stroke-dasharray="2 10" stroke-linecap="round"/>'
    g += f'<path d="M{xs[0]} 200H{xs[2]}" stroke="{SUN}" stroke-width="4"/>'
    for i, (pid, x) in enumerate(zip(ids, xs)):
        p = P[pid]
        open_ = got[i] is not None
        gid = uid('orb')
        g += (f'<defs><radialGradient id="{gid}" cx=".35" cy=".35"><stop offset="0" stop-color="{p["ground"][0]}"/>'
              f'<stop offset="1" stop-color="{p["ground"][2]}"/></radialGradient></defs>')
        g += f'<circle cx="{x}" cy="200" r="40" fill="url(#{gid})" stroke="{INK}" stroke-width="3" opacity="{1 if open_ else .35}"/>'
        if p.get('rings'):
            g += f'<ellipse cx="{x}" cy="200" rx="62" ry="13" fill="none" stroke="{p["rings"][0]}" stroke-width="4" opacity="{1 if open_ else .35}"/>'
        g += txt(x, 268, p['name'], 15, '#fff' if open_ else '#ffffff77', sw=3)
        if open_:
            g += star(x - 26, 292, 16) + txt(x + 8, 298, f'{got[i]} of {OF}', 13, '#fff', sw=3)
        else:
            g += padlock(x, 204, 1.6)
        if i == 2:
            g += rocket(x + 40, 168, .6)
    g += big_btn(w / 2, 350, 'Back to the map', 200)
    return g


def dice_line(w, h, upright=False):
    p = P['moon']
    g = sky(w, h, p, 7)
    gtop = h - 110 if upright else h - 96
    g += ground(w, h, p, gtop)
    x0, x1 = (30, w - 30) if upright else (38, w - 38)
    ly = gtop - 4
    g += f'<path d="M{x0} {ly}H{x1}" stroke="#fff" stroke-width="4"/>'
    step = (x1 - x0) / 10
    s = 24 if upright else 34
    for n in range(11):
        x = x0 + n * step
        g += f'<path d="M{x:.1f} {ly - 8}V{ly + 8}" stroke="#fff" stroke-width="3"/>'
        stack = dice_for(n)
        for j, v in enumerate(stack):  # the 6 nearest the line, then the rest
            g += die(x, ly + 26 + s / 2 + j * (s + 4), v, s)
    ty = 120 if upright else 70
    g += (f'<g transform="translate({w / 2},{ty})"><rect x="-70" y="-38" width="140" height="70" rx="20" fill="#FFF8E6" '
          f'stroke="{INK}" stroke-width="4"/>{txt(0, -14, "Land on", 14, INK, stroke=None, weight=600)}'
          f'{txt(0, 22, "7", 40, INK, stroke=None)}</g>')
    rx = x0 + 4.4 * step
    g += rocket(rx, ly - (150 if upright else 90), .8, True)
    g += f'<path d="M{x0 + 4 * step:.1f} {ly - 6}V{ly - 60}" stroke="#8CF5FF" stroke-width="3" stroke-dasharray="4 5" opacity=".9"/>'
    return g


def route(w=844, h=300):
    g = f'<rect width="{w}" height="{h}" fill="#F4F1FF" rx="16"/>'
    ids = ['moon', 'dust', 'candy', 'ice', 'jungle', 'ringed']
    nums = [8, 6, 4, 3, 2, 1]  # levels that are number levels, of 8: illustrative only
    xs = [70 + i * 140 for i in range(6)]
    g += txt(w / 2, 34, 'Route (a): one path through the systems', 18, INK, stroke=None)
    for i, (pid, x) in enumerate(zip(ids, xs)):
        p = P[pid]
        for j in range(8):
            c = '#5FB4FF' if j < nums[i] else '#FF9F43'
            g += f'<rect x="{x - 50 + j * 12.5:.1f}" y="70" width="11" height="120" rx="3" fill="{c}" stroke="{INK}" stroke-width="1.5"/>'
        g += f'<circle cx="{x}" cy="224" r="16" fill="{p["ground"][1]}" stroke="{INK}" stroke-width="2.5"/>'
        g += txt(x, 260, p['name'], 13, INK, stroke=None)
    g += f'<path d="M{xs[0] - 50} 284H{xs[1] + 50}" stroke="#5FB4FF" stroke-width="6" stroke-linecap="round"/>'
    g += f'<path d="M{xs[2] - 50} 284H{xs[3] + 50}" stroke="#B9A3FF" stroke-width="6" stroke-linecap="round"/>'
    g += f'<path d="M{xs[4] - 50} 284H{xs[5] + 50}" stroke="#FF9F43" stroke-width="6" stroke-linecap="round"/>'
    g += (f'<rect x="{w - 250}" y="12" width="12" height="12" fill="#5FB4FF" stroke="{INK}"/>' + txt(w - 232, 23, 'number level', 11, INK, 'start', stroke=None)
          + f'<rect x="{w - 140}" y="12" width="12" height="12" fill="#FF9F43" stroke="{INK}"/>' + txt(w - 122, 23, 'sums level', 11, INK, 'start', stroke=None))
    g += (txt(w / 6, 64, 'gentle start: numbers', 13, '#2456B8', stroke=None) + txt(w / 2, 64, 'a mix', 13, '#5B4CC4', stroke=None)
          + txt(5 * w / 6, 64, 'mostly sums', 13, '#C2562A', stroke=None))
    return g


def svg(w, h, body, cls=''):
    return (f'<svg class="{cls}" viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg" role="img" '
            f'font-family="system-ui, sans-serif">{body}</svg>')


def fig(content, caption, cls='wide'):
    return f'<figure class="{cls}">{content}<figcaption>{caption}</figcaption></figure>'


SW, SH, UW, UH = 844, 390, 390, 844
sections = []
sections.append(('1. The map is home',
    'The game opens on the system the child is in. Eight levels run left to right over that system\'s sky. '
    'Done levels show their best stars; the rocket waits on the next one with a Play bubble; later ones are locked. '
    'Level 8 has the flag: Bip\'s big moment, then the portal opens to the next system. '
    'Top: the galaxy button, the arrows to step between systems, and the hangar door with the moon rocks (as today). '
    'There is no planet picker any more: the system is the planet.',
    [fig(svg(SW, SH, map_sideways()), 'Phone sideways and PC: Moon, levels 1 to 3 done, level 4 next'),
     fig(svg(UW, UH, map_upright()), 'Phone upright: the same eight, zig-zagging so each is big enough to tap', 'tall')]))
sections.append(('2. Tapping a level',
    'Any open level, done or next, opens a card: what it asks, the best stars, and the rocks found there (8 to find in each level). '
    'A replay can only add the stars and rocks still missing.',
    [fig(svg(SW, SH, level_card(2, 'Land on numbers, 0 to 10', 2, 5, '3 moon rocks still to find!')), 'A done level with rocks left'),
     fig(svg(SW, SH, level_card(1, 'Land on numbers, 0 to 5', 3, 8, 'All 8 rocks found here!')), 'A level with everything found: it can still be played, for fun')]))
sections.append(('3. The end of a replay',
    'After Bip\'s moment, the end card says what was new. Nothing is taken away, and a round that beats nothing just says so kindly.',
    [fig(svg(SW, SH, end_card('New best!', 2, 3, 2, 7, '2 more found: 1 still hiding')), 'Better than before: a new star and new rocks'),
     fig(svg(SW, SH, end_card('Great flying!', 3, 3, 0, 8, 'You\'ve found all the rocks here')), 'Already perfect: stars stay, no extra rocks')]))
MOON_DONE = (3, 3, 2, 3, 3, 2, 3, 3)  # made up: best stars of Moon's eight levels
OF = 8 * 3                             # stars a system holds
sections.append(('4. A system done: hyperspace',
    'Level 8 ends with Bip\'s moment on the gold pad, then the rocket jumps through hyperspace and lands on the next system\'s map, level 1 lit.',
    [fig(svg(SW, SH, map_sideways(done=MOON_DONE[:7], cur=7, rocket_at=False, bip_moment=True,
                                  extra=banner(SW, f'Moon done! {sum(MOON_DONE)} stars'))), 'Level 8 done on Moon'),
     fig(svg(SW, SH, hyperspace()), 'The jump (a few seconds, calm version for less motion)'),
     fig(svg(SW, SH, map_sideways('dust', done=(), cur=0, idx=2, nxt='Candy', extra=banner(SW, 'Welcome to Red Dust!'))), 'Arriving: Red Dust, level 1')]))
sections.append(('5. Going back: the galaxy',
    'The galaxy button shows every system: the ones visited with their stars, the next ones locked. Tap one to fly back and replay its levels. '
    'The arrows on the map do the same one system at a time.',
    [fig(svg(SW, SH, galaxy()), 'Three systems open; the rocket is at Candy')]))
sections.append(('6. Dice on the line (D-060)',
    'The target is a written number at the top; the marks show dice in place of numbers. 0 is an empty die; 7 to 10 are a 6 and the rest, stacked, the 6 nearest the line. '
    'Sketched as a whole dice level, so the line stays the same all round.',
    [fig(svg(SW, SH, dice_line(SW, SH)), 'Phone sideways and PC: line 0 to 10'),
     fig(svg(UW, 560, dice_line(UW, 560, True)), 'Phone upright: dice shrink to fit 33 px a mark', 'tall')]))
sections.append(('7. Route (a): numbers first, then a mix, then mostly sums (D-059)',
    'Each column is one system\'s eight levels: blue a number level, orange a sums level. '
    'Illustrative only: the real mix comes from the level plan (step 2c-2) and your syllabus notes.',
    [fig(svg(844, 300, route()), 'How the balance could shift along the route')]))

body = ''.join(f'<section><h2>{t}</h2><p>{d}</p><div class="row">{"".join(f)}</div></section>' for t, d, f in sections)
html = f'''<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Rocket Lander: the map (crude sketches 1)</title>
<style>
:root {{ --bg: #F7F5FF; --fg: #1B1446; --mut: #5d5880; --card: #fff; }}
@media (prefers-color-scheme: dark) {{ :root {{ --bg: #121027; --fg: #EDEBFF; --mut: #a9a5c9; --card: #1d1a3a; }} }}
body {{ margin: 0; padding: 16px; background: var(--bg); color: var(--fg); font: 16px/1.45 system-ui, sans-serif; }}
h1 {{ font-size: 22px; margin: 0 0 4px; }} h2 {{ font-size: 18px; margin: 22px 0 4px; }}
p {{ margin: 0 0 10px; max-width: 70ch; }}
.stamp {{ color: var(--mut); font-size: 13px; }}
.row {{ display: flex; flex-wrap: wrap; gap: 14px; align-items: flex-start; }}
figure {{ margin: 0; background: var(--card); border-radius: 14px; padding: 8px; box-sizing: border-box; }}
figure.wide {{ flex: 1 1 520px; max-width: 860px; }} figure.tall {{ flex: 0 1 260px; }}
figure svg {{ display: block; width: 100%; height: auto; border-radius: 10px; }}
figcaption {{ font-size: 13px; color: var(--mut); text-align: center; margin-top: 4px; }}
</style></head><body>
<h1>Rocket Lander: the map (crude sketches 1)</h1>
<p class="stamp">Crude on purpose: how it works, not how it looks. Made-up progress. sketch_rocket_map.py {VERSION} · built at {COMMIT} · step 2c-1 · draft</p>
{body}
</body></html>'''
with open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8') as fh:
    fh.write(html)
print(os.path.join(OUT, 'index.html'), len(html.encode()), 'bytes')
