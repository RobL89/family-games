"""Mock-ups of Bip's end-of-round moment (D-025), for Rob to choose from (step 2a-3). Version 1.0.

Not a check, and not part of the game: it draws options to look at before anything is built.
It copies games/rocket-lander/ and games/_common/ to a temporary folder, adds one line to the
copy's round.js so the scene can be reached (window.__sk), plays the real game in headless
Chromium to set up each round, then freezes it and paints each picture with the game's own
drawing code (scene.js), plus the few new pieces each option needs (a pad, a big flag with
stars, a ladder, fireworks), drawn here only. The repo's game files are not changed.

Options drawn (on a phone held sideways, 844 x 390, unless said), three moments each:
  A1 to A3  a gold pad slides out under the last landing; Bip climbs down and plants the big flag
  A3u       A3 on a phone held upright (390 x 844)
  B1 to B3  after the last landing, a victory landing on a home pad in the middle
  C1 to C3  each right landing leaves a small flag on its number; the big flag joins them
  S1 to S3  the flag on each right landing: today's, a shorter pole, everything smaller

Stand-ins: headless Chromium for the phone; Fredoka from the npm package @fontsource/fredoka
5.3.0 (the font the game asks Google Fonts for), passed in as a folder. Math.random is seeded,
and every picture is painted at a fixed time, so the scenery is the same each run.

Usage, from the repo root:
    python3 -I -B tools/tests/games/sketch_rocket_bip_moment.py FONT_DIR OUT_DIR
FONT_DIR holds fredoka-latin-{500,600,700}-normal.woff2. Writes one JPEG per picture,
mockups.json (ids, titles, captions) and mockups.html (one page with the pictures inlined, for
a private artifact; Rob's only) to OUT_DIR, then checks the page at phone and PC widths, light
and dark, and fails on script errors, sideways scrolling or a picture that didn't load.
"""
import base64, functools, html, http.server, json, os, shutil, socketserver, subprocess, sys, tempfile, threading
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
FONT_DIR, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)

# The served copy: the game and engine folders plus the font files, and one added line in round.js.
ROOT = tempfile.mkdtemp(prefix='rl-bip-')
for part in ('rocket-lander', '_common'):
    shutil.copytree(os.path.join(REPO, 'games', part), os.path.join(ROOT, 'games', part))
os.makedirs(os.path.join(ROOT, 'fonts'))
for w in (500, 600, 700):
    shutil.copyfile(os.path.join(FONT_DIR, f'fredoka-latin-{w}-normal.woff2'), os.path.join(ROOT, 'fonts', f'fredoka-{w}.woff2'))
ROUND = os.path.join(ROOT, 'games', '_common', 'rocket', 'round.js')
src = open(ROUND, encoding='utf-8').read()
HOOK = '  window.__test = api;\n'
if src.count(HOOK) != 1:
    raise SystemExit('round.js: the line to hook onto was not found exactly once')
src = src.replace(HOOK, HOOK + '  window.__sk = { scene, fx, R, V, G }; // added by the sketch script only\n')
open(ROUND, 'w', encoding='utf-8').write(src)


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


httpd = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=ROOT))
httpd.daemon_threads = True
threading.Thread(target=httpd.serve_forever, daemon=True).start()
LOCAL = f'http://127.0.0.1:{httpd.server_address[1]}/'
BASE = LOCAL + 'games/rocket-lander/index.html'
FONT_CSS = ''.join(f"@font-face{{font-family:'Fredoka';font-weight:{w};font-display:block;"
                   f"src:url({LOCAL}fonts/fredoka-{w}.woff2) format('woff2')}}" for w in (500, 600, 700))

SEED = """(() => { let s = 20261109; Math.random = () => { s |= 0; s = (s + 0x6D2B79F5) | 0;
  let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; })();"""

# Paints one picture on the frozen scene. F: what's in it (see the options below).
PAINT = r"""
async (F) => {
  const M = await import('../_common/rocket/scene.js');
  const { INK, FONT, rr, sparkle, drawRocket, drawPilot, clamp } = M;
  const { scene: sc, fx } = window.__sk;
  const TAU = Math.PI * 2, SUN = '#FFC93C', CORAL = '#FF5D73', MINT = '#5FE3BD', LILAC = '#D9D3F7';
  const t = F.t ?? 1.3, gy = sc.groundY, h = sc.rocketH, W = sc.W, H = sc.H;
  const xOf = (v) => (v === 'mid' ? W / 2 : sc.xOf(v));

  function starPath(ctx, x, y, r) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5, rad = i % 2 ? r * 0.45 : r;
      ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
    }
    ctx.closePath();
  }
  // A flag with a number, as the game's drawFlag but with the pole and the number sized apart.
  function numberFlag(ctx, x, poleH, fs, text, dir) {
    const top = gy - 2 - poleH;
    ctx.save(); ctx.lineCap = 'round';
    ctx.strokeStyle = INK; ctx.lineWidth = Math.max(4, fs * 0.36);
    ctx.beginPath(); ctx.moveTo(x, gy - 2); ctx.lineTo(x, top); ctx.stroke();
    ctx.strokeStyle = '#F4F1FF'; ctx.lineWidth = Math.max(2, fs * 0.18); ctx.stroke();
    ctx.fillStyle = SUN; ctx.strokeStyle = INK; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, top - 3, Math.max(3.5, fs * 0.28), 0, TAU); ctx.fill(); ctx.stroke();
    ctx.font = `600 ${fs}px ${FONT}`;
    const pw = ctx.measureText(text).width + fs * 0.9, ph = fs * 1.35, y0 = top + 2;
    const wav = (u) => Math.sin(t * 6 - u * 4) * fs * 0.08 * u;
    ctx.beginPath(); ctx.moveTo(x, y0);
    for (let u = 0; u <= 1.001; u += 0.1) ctx.lineTo(x + dir * pw * u, y0 + wav(u));
    for (let u = 1; u >= -0.001; u -= 0.1) ctx.lineTo(x + dir * pw * u, y0 + ph + wav(u));
    ctx.closePath(); ctx.fillStyle = CORAL; ctx.fill(); ctx.lineJoin = 'round'; ctx.stroke();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const cx = x + dir * pw / 2, cy = y0 + ph / 2 + wav(0.5) + fs * 0.04;
    ctx.lineWidth = fs * 0.22; ctx.strokeStyle = INK; ctx.strokeText(text, cx, cy);
    ctx.fillStyle = '#FFFFFF'; ctx.fillText(text, cx, cy);
    ctx.restore();
  }
  // The big flag: a tall pole and a wide cloth with the round's stars (gold earned, pale not).
  function bigFlag(ctx, x, stars, dir, grow = 1) {
    const ph = h * 1.55 * grow, top = gy - 2 - ph;
    ctx.save(); ctx.lineCap = 'round';
    ctx.strokeStyle = INK; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.moveTo(x, gy - 2); ctx.lineTo(x, top); ctx.stroke();
    ctx.strokeStyle = '#F4F1FF'; ctx.lineWidth = 4.5; ctx.stroke();
    ctx.fillStyle = SUN; ctx.strokeStyle = INK; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(x, top - 5, 7.5, 0, TAU); ctx.fill(); ctx.stroke();
    if (grow < 0.6) { ctx.restore(); return; }
    const cw = h * 1.25, ch = h * 0.56, y0 = top + 3;
    const wav = (u) => Math.sin(t * 5 - u * 4) * ch * 0.07 * u;
    ctx.beginPath(); ctx.moveTo(x, y0);
    for (let u = 0; u <= 1.001; u += 0.05) ctx.lineTo(x + dir * cw * u, y0 + wav(u));
    for (let u = 1; u >= -0.001; u -= 0.05) ctx.lineTo(x + dir * cw * u, y0 + ch + wav(u));
    ctx.closePath(); ctx.fillStyle = CORAL; ctx.fill(); ctx.lineJoin = 'round'; ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
    for (let i = 0; i < 3; i++) {
      const u = (i + 0.5) / 3, sx = x + dir * cw * u, sy = y0 + ch / 2 + wav(u) + ch * 0.03;
      starPath(ctx, sx, sy, ch * 0.33);
      ctx.fillStyle = i < stars ? SUN : 'rgba(255,255,255,.35)'; ctx.fill();
      ctx.lineWidth = 2.5; ctx.strokeStyle = INK; ctx.globalAlpha = i < stars ? 1 : 0.55; ctx.stroke(); ctx.globalAlpha = 1;
      if (i < stars) { ctx.fillStyle = '#FFF6CF'; sparkle(ctx, sx - ch * 0.1, sy - ch * 0.1, ch * 0.06); }
    }
    ctx.restore();
  }
  // A landing pad on the strip: gold, with striped ends and lamps; k grows it out from the middle.
  function pad(ctx, P) {
    const x = xOf(P.at), w = Math.min(h * (P.wide ? 3.2 : 2.2), W * (P.wide ? 0.42 : 0.3)) * (P.k ?? 1), y = gy - 9, ph = 17;
    ctx.save();
    const g = ctx.createRadialGradient(x, gy, 0, x, gy, w * 0.8);
    g.addColorStop(0, 'rgba(255,201,60,.55)'); g.addColorStop(1, 'rgba(255,201,60,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, gy, w * 0.85, h * 0.5, 0, 0, TAU); ctx.fill();
    rr(ctx, x - w / 2, y, w, ph, 8); ctx.fillStyle = SUN; ctx.fill();
    ctx.save(); rr(ctx, x - w / 2, y, w, ph, 8); ctx.clip();
    ctx.fillStyle = INK;
    for (const end of [-1, 1]) {
      for (let k = 0; k < 3; k++) {
        const sx = x + end * (w / 2 - 6 - k * 11);
        ctx.beginPath(); ctx.moveTo(sx - 3, y + ph); ctx.lineTo(sx + 3, y + ph); ctx.lineTo(sx + 9, y); ctx.lineTo(sx + 3, y); ctx.closePath(); ctx.fill();
      }
    }
    ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(x - w / 2, y + 2, w, 3);
    ctx.restore();
    rr(ctx, x - w / 2, y, w, ph, 8); ctx.lineWidth = 2.5; ctx.strokeStyle = INK; ctx.stroke();
    for (const end of [-1, 1]) {
      const lx = x + end * (w / 2 + 2);
      const lg = ctx.createRadialGradient(lx, y - 4, 0, lx, y - 4, 13);
      lg.addColorStop(0, 'rgba(95,227,189,.9)'); lg.addColorStop(1, 'rgba(95,227,189,0)');
      ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(lx, y - 4, 13, 0, TAU); ctx.fill();
      ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(lx, y - 4, 5.5, 0, TAU); ctx.fill();
      ctx.fillStyle = MINT; ctx.beginPath(); ctx.arc(lx, y - 4, 3.5, 0, TAU); ctx.fill();
    }
    if (P.sparks) {
      ctx.fillStyle = '#FFF6CF';
      [[-0.62, -1.15, 7], [0.58, -1.3, 6], [-0.35, -1.75, 5], [0.42, -1.85, 8], [0.0, -2.25, 5]]
        .forEach(([a, b, r]) => sparkle(ctx, x + a * w, gy + b * h * 0.5, r));
    }
    ctx.restore();
  }
  // A rope ladder from the rocket's side down to the ground.
  function ladder(ctx, x, dir) {
    const x0 = x + dir * h * 0.2, y0 = gy - h * 0.62, x1 = x + dir * h * 0.36, y1 = gy - 2;
    ctx.save(); ctx.lineCap = 'round';
    const rail = (dx) => { ctx.beginPath(); ctx.moveTo(x0 + dx, y0); ctx.lineTo(x1 + dx, y1); };
    for (const dx of [-h * 0.06, h * 0.06]) {
      rail(dx); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.stroke();
      rail(dx); ctx.strokeStyle = LILAC; ctx.lineWidth = 2.2; ctx.stroke();
    }
    for (let k = 1; k <= 4; k++) {
      const u = k / 5, rx = x0 + (x1 - x0) * u, ry = y0 + (y1 - y0) * u;
      ctx.beginPath(); ctx.moveTo(rx - h * 0.06, ry); ctx.lineTo(rx + h * 0.06, ry);
      ctx.strokeStyle = INK; ctx.lineWidth = 4.5; ctx.stroke(); ctx.strokeStyle = SUN; ctx.lineWidth = 2; ctx.stroke();
    }
    ctx.restore();
  }
  // A firework burst: rings of dots along each ray, a white sparkle at each tip, a soft glow.
  function firework(ctx, f) {
    const x = f.x * W, y = f.y * H, r = f.r * Math.min(W, H), cols = f.cols, n = f.n || 16, k = f.k ?? 1;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 0.8);
    g.addColorStop(0, 'rgba(255,246,207,.35)'); g.addColorStop(1, 'rgba(255,246,207,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 0.8, 0, TAU); ctx.fill();
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + (f.turn || 0), col = cols[i % cols.length];
      for (let j = 0; j < 6; j++) {
        const d = r * k * (1 - j * 0.11), drop = (d / r) ** 2 * r * 0.12;
        ctx.globalAlpha = 1 - j / 6; ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d + drop, Math.max(1.2, r * 0.045 * (1 - j * 0.12)), 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1; ctx.fillStyle = '#FFFFFF';
      sparkle(ctx, x + Math.cos(a) * r * k, y + Math.sin(a) * r * k + r * 0.12 * k * k, r * 0.07);
    }
    if (f.trail) {
      ctx.globalAlpha = 0.7; ctx.strokeStyle = '#FFE066'; ctx.lineWidth = 2.5; ctx.setLineDash([3, 6]);
      ctx.beginPath(); ctx.moveTo(f.trail * W, gy - 6); ctx.quadraticCurveTo((f.trail * W + x) / 2, (gy + y) / 2, x, y + r * 0.15); ctx.stroke();
    }
    ctx.restore();
  }

  // the round's other layers: no speech bubble, no confetti or flying rocks
  document.getElementById('hud').hidden = !F.hud;
  document.getElementById('bubble').hidden = true;
  fx.bits = []; fx.rocks = [];
  fx.ctx.setTransform(1, 0, 0, 1, 0, 0); fx.ctx.clearRect(0, 0, fx.c.width, fx.c.height);
  if (F.chip != null) { const c = document.getElementById('target-n'); c.className = 'chip'; c.textContent = String(F.chip); }
  sc.particles = [];
  const Rk = F.rocket;
  const rx = Rk ? xOf(Rk.at) : 0;
  const touchY = gy - 1 - h * 0.5;
  if (F.dust && Rk) { sc.dust(rx, gy, 16, h, '#EDE9FF'); sc.updateParticles(0.16); }

  const ctx = sc.ctx;
  ctx.setTransform(sc.dpr, 0, 0, sc.dpr, 0, 0);
  ctx.drawImage(sc.sky, 0, 0, W, H);
  sc.drawStars(ctx, t); sc.drawShooting(ctx); sc.drawFar(ctx, t);
  (F.fireworks || []).forEach((f) => firework(ctx, f));
  ctx.drawImage(sc.hills, -sc.hillsPad - sc.offX * 0.03, 0, W + sc.hillsPad * 2, H);
  ctx.drawImage(sc.ground, 0, 0, W, H);
  if (F.pad) pad(ctx, F.pad);
  sc.drawLabels(ctx, F.faint ? { x: -1e4, y: -1e4, w: 2e4, h: 2e4, a: 0.5 } : null);
  if (F.glow != null) sc.drawGlow(ctx, { value: F.glow, a: 1 }, t);
  sc.drawLights(ctx, t);
  sc.drawParticles(ctx, false);
  const small = (v) => numberFlag(ctx, xOf(v), h * 0.6, Math.round(h * 0.95 * 0.3), String(v), xOf(v) > W * 0.88 ? -1 : 1);
  (F.smallFlags || []).forEach(small);
  const dir = Rk && rx > W / 2 ? -1 : 1;
  const s = h * 0.5, outX = rx + dir * (h * 0.42 + s * 0.38);
  if (F.flag) {
    const fxp = outX + dir * s * 0.42, text = String(Rk.at);
    if (F.flag === 'today') numberFlag(ctx, fxp, h * 0.95, Math.round(h * 0.95 * 0.3), text, dir);
    else if (F.flag === 'short') numberFlag(ctx, fxp, h * 0.6, Math.round(h * 0.95 * 0.3), text, dir);
    else numberFlag(ctx, fxp, h * 0.6, Math.round(h * 0.6 * 0.3), text, dir);
  }
  if (F.big) bigFlag(ctx, outX + dir * s * 0.55, F.big.stars, dir, F.big.grow ?? 1);
  if (Rk) {
    const y = Rk.air ? touchY - h * Rk.air : touchY;
    drawRocket(ctx, { x: rx, y, h, rot: 0, sx: 1, sy: 1, legs: Rk.air ? 0.7 : 1, flame: Rk.air ? 0.85 : 0,
      pilotIn: !F.pilot, blink: 0, mood: 'happy', look: Rk.air ? 0 : dir * 0.6 }, t);
    if (F.ladder) ladder(ctx, rx, dir);
  }
  if (F.pilot) {
    const px = F.pilot === 'plant' ? outX + dir * s * 0.18 : outX;
    drawPilot(ctx, { x: px, y: gy - 1 - (F.pilot === 'jump' ? h * 0.22 : 0), s, mood: 'happy', wave: true,
      flip: dir < 0, squash: F.pilot === 'jump' ? -0.08 : 0, blink: 0 }, t);
  }
  sc.drawParticles(ctx, true);
  if (F.perfect && Rk) { ctx.fillStyle = '#FFF6CF'; [[-0.7, -1.2, 9], [0.75, -1.05, 7], [0.1, -1.6, 6]].forEach(([a, b, r]) => sparkle(ctx, rx + a * h, touchY + b * h * 0.6, r)); }
  return { h, gy, W, H };
}
"""

FW = ['#FF5D73', '#FFC93C', '#5FE3BD', '#8CF5FF', '#B9A7FF', '#FF8FB1']
FIREWORKS = [
    dict(x=0.2, y=0.24, r=0.2, cols=['#FFC93C', '#FFFFFF', '#FF8FB1'], n=18, k=1.0, turn=0.1),
    dict(x=0.5, y=0.16, r=0.16, cols=['#5FE3BD', '#8CF5FF', '#FFFFFF'], n=16, k=0.75, turn=0.3, trail=0.47),
    dict(x=0.8, y=0.28, r=0.22, cols=['#B9A7FF', '#FF5D73', '#FFC93C'], n=18, k=0.95),
]
FIREWORKS_UP = [
    dict(x=0.28, y=0.22, r=0.24, cols=['#FFC93C', '#FFFFFF', '#FF8FB1'], n=18, k=1.0, turn=0.1),
    dict(x=0.72, y=0.36, r=0.2, cols=['#B9A7FF', '#FF5D73', '#FFC93C'], n=16, k=0.9),
    dict(x=0.5, y=0.5, r=0.14, cols=['#5FE3BD', '#8CF5FF', '#FFFFFF'], n=14, k=0.7, turn=0.3, trail=0.52),
]

# Landings played before each picture: (right or wrong, target). A: 8 of 8 (3 stars);
# B: 6 of 8 (2 stars); C: 7 of 8 (3 stars), its right landings leaving flags.
ALL_RIGHT = [('r', v) for v in (3, 8, 1, 6, 9, 2, 4)]
TWO_MISSED = [('r', 3), ('w', 8), ('r', 1), ('r', 6), ('w', 9), ('r', 2), ('r', 4)]
C_ROUND = [('r', 2), ('r', 9), ('w', 6), ('r', 4), ('r', 1), ('r', 10), ('r', 0)]
C_FLAGS = [2, 9, 4, 1, 10, 0]

OPTIONS = [
    dict(id='A1', opt='A', title='The last landing', before=ALL_RIGHT, frame=dict(hud=True, chip=7, rocket=dict(at=7), glow=7, perfect=True, pad=dict(at=7, k=0.85, sparks=True)),
         caption='The eighth landing plays as usual. When the rocket touches down on the right number, a gold pad slides out under it. '
                 'The pad appears only after touchdown, so it never gives the answer away. After a miss, it appears once the rocket has hopped to the right number.'),
    dict(id='A2', opt='A', title='Bip climbs down', before=ALL_RIGHT, frame=dict(rocket=dict(at=7), glow=7, pad=dict(at=7), ladder=True, pilot='plant', big=dict(stars=3, grow=1)),
         caption='A ladder drops, and Bip climbs down and plants the big flag. It shows the round\'s stars: gold for each one earned.'),
    dict(id='A3', opt='A', title='Fireworks', before=ALL_RIGHT, frame=dict(rocket=dict(at=7), glow=7, pad=dict(at=7), ladder=True, pilot='jump', big=dict(stars=3), fireworks=FIREWORKS),
         caption='Fireworks go off and Bip jumps for joy. Then the end card comes up, as now. About 4 seconds in all (≈, my judgement).'),
    dict(id='A3u', opt='A', size=(390, 844), title='A3, phone upright', before=ALL_RIGHT, frame=dict(rocket=dict(at=7), glow=7, pad=dict(at=7), ladder=True, pilot='jump', big=dict(stars=3), fireworks=FIREWORKS_UP),
         caption='The same moment on a phone held upright.'),
    dict(id='B1', opt='B', title='Victory flight', before=TWO_MISSED, after_last=('r', 7), frame=dict(rocket=dict(at='mid', air=1.4), faint=True, pad=dict(at='mid', wide=True)),
         caption='After the last landing, the rocket takes off and the numbers fade. It comes down by itself, with no steering, on a big home pad in the middle.'),
    dict(id='B2', opt='B', title='Bip plants the flag', before=TWO_MISSED, after_last=('r', 7), frame=dict(rocket=dict(at='mid'), faint=True, pad=dict(at='mid', wide=True), ladder=True, pilot='plant', big=dict(stars=2)),
         caption='Bip climbs down and plants the big flag on the pad. This round got 2 stars of 3: the third is pale.'),
    dict(id='B3', opt='B', title='Fireworks', before=TWO_MISSED, after_last=('r', 7), frame=dict(rocket=dict(at='mid'), faint=True, pad=dict(at='mid', wide=True), ladder=True, pilot='jump', big=dict(stars=2), fireworks=FIREWORKS),
         caption='Fireworks, then the end card. It\'s clearly a finale, apart from the sums, but longer: about 6 seconds (≈).'),
    dict(id='C1', opt='C', title='Flags along the way', before=C_ROUND[:4], frame=dict(hud=True, chip=1, rocket=dict(at=5.6, air=1.6), smallFlags=[2, 9, 4]),
         caption='During the round, each right landing leaves a small flag standing on its number. Here three have landed right so far, and the rocket is coming down for the next.'),
    dict(id='C2', opt='C', title='The big flag joins them', before=C_ROUND, frame=dict(rocket=dict(at=7), glow=7, smallFlags=C_FLAGS, ladder=True, pilot='plant', big=dict(stars=3)),
         caption='After the last landing, Bip climbs down and plants the big flag among the small ones. The row of flags shows every number the child got right.'),
    dict(id='C3', opt='C', title='Fireworks', before=C_ROUND, frame=dict(rocket=dict(at=7), glow=7, smallFlags=C_FLAGS, ladder=True, pilot='jump', big=dict(stars=3), fireworks=FIREWORKS),
         caption='Fireworks, then the end card, about 4 seconds (≈). The line gets busier as the round goes on, and on a line of 0 to 20 the flags would crowd.'),
    dict(id='S1', opt='S', title='Today\'s flag', before=ALL_RIGHT[:3], frame=dict(hud=True, chip=7, rocket=dict(at=7), glow=7, pilot='stand', flag='today'),
         caption='As the game is now: after each right landing, Bip plants a flag with the number on it.'),
    dict(id='S2', opt='S', title='Shorter pole, same number', before=ALL_RIGHT[:3], frame=dict(hud=True, chip=7, rocket=dict(at=7), glow=7, pilot='stand', flag='short'),
         caption='The pole is shorter, so the big flag stands out at the end, but the number stays as easy to read as now.'),
    dict(id='S3', opt='S', title='All smaller', before=ALL_RIGHT[:3], frame=dict(hud=True, chip=7, rocket=dict(at=7), glow=7, pilot='stand', flag='small'),
         caption='Everything at about 0.6 times today\'s size, number included. That\'s small for a young reader on a phone.'),
]

GROUPS = {
    'A': ('1', 'Option A: a gold pad on the last landing', 'Recommended', 'The finale happens where the child landed, so the number stays the hero. It\'s the shortest, and it\'s closest to what you agreed (D-025).'),
    'B': ('2', 'Option B: a victory landing on a home pad', '', 'A separate finale with no number to find: the game lands the rocket itself.'),
    'C': ('3', 'Option C: a row of flags', '', 'As A, but each right landing leaves its flag standing, so the round ends with a record of what was right. That adds "flags along the line" from the v1.1 ideas.'),
    'S': ('4', 'The flag on each right landing', 'S2 recommended', 'D-025 says this flag gets smaller, so the big one feels special. These show how much smaller.'),
}


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
    pg.wait_for_function('window.__test && __test.state().ready && window.__sk')
    pg.evaluate("async () => { await document.fonts.ready; return __test.begin({ level: 2, settings: { speak: false } }); }")
    pg.wait_for_timeout(200)
    pg.evaluate("document.getElementById('play').click()")
    pg.evaluate('__test.speed(8)')
    for kind, v in o['before'] + ([o['after_last']] if 'after_last' in o else []):
        pg.wait_for_function("__test.state().phase === 'fly'")
        idx = pg.evaluate('__test.state().idx')
        pg.evaluate(f'__test.aim({v})')
        pg.evaluate('__test.right()' if kind == 'r' else '__test.wrong()')
        pg.wait_for_function(f"__test.state().idx > {idx} || __test.state().phase === 'end'", timeout=20000)
    if 'after_last' not in o:
        pg.wait_for_function("__test.state().phase === 'fly'")
    pg.evaluate('__test.speed(1)')
    pg.evaluate('__test.freeze(true)')
    if 'after_last' in o:  # B: the round has ended; its end card waits until after the finale
        pg.evaluate("document.getElementById('end').hidden = true")
    pg.evaluate(PAINT, o['frame'])
    pg.wait_for_timeout(120)
    path = os.path.join(OUT, f"{o['id']}.jpg")
    pg.screenshot(path=path, type='jpeg', quality=84)
    fonts_ok = pg.evaluate("document.fonts.check('600 20px Fredoka')")
    right = pg.evaluate('__test.state().right')
    ctx.close()
    if errs:
        raise SystemExit(f"{o['id']}: page errors: {errs}")
    if not fonts_ok:
        raise SystemExit(f"{o['id']}: Fredoka didn't load")
    print(f"{o['id']}: {path} (right so far: {right})")


def page(commit):
    """One self-contained page of the mock-ups (pictures inlined), for a private artifact."""
    out = []
    for g, (n, q, rec, why) in GROUPS.items():
        opts = [o for o in OPTIONS if o['opt'] == g]
        tag = f' <span class="rec">{html.escape(rec)}</span>' if rec else ''
        out.append(f'<section class="opt"><h2><span class="n">{n}</span> {html.escape(q)}{tag}</h2><p class="why">{html.escape(why)}</p><div class="grid">')
        for o in opts:
            with open(os.path.join(OUT, f"{o['id']}.jpg"), 'rb') as f:
                src = 'data:image/jpeg;base64,' + base64.b64encode(f.read()).decode()
            tall = ' tall' if 'size' in o else ''
            out.append(f'<figure class="pic{tall}"><img src="{src}" alt="{html.escape(o["title"])}">'
                       f'<figcaption><b class="id">{o["id"]}</b> <b>{html.escape(o["title"])}</b><br>{html.escape(o["caption"])}</figcaption></figure>')
        out.append('</div></section>')
    return f"""<!DOCTYPE html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Rocket games: Bip's big moment mock-ups</title>
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&display=swap" rel="stylesheet">
<style>
:root {{ --ink:#1B1446; --night:#120C3A; --sun:#FFC93C; --mint:#5FE3BD; --lilac:#EDE8FF; }}
* {{ box-sizing:border-box }}
body {{ margin:0; background:var(--night); color:#fff; font:500 17px/1.4 Fredoka, "Segoe UI", system-ui, sans-serif; }}
main {{ max-width:1180px; margin:0 auto; padding:18px 14px 40px; }}
h1 {{ margin:4px 0 6px; font-size:28px; color:var(--sun); }}
.lead {{ margin:0 0 6px; color:var(--lilac); }}
h2 {{ margin:28px 0 4px; font-size:23px; display:flex; align-items:center; gap:10px; flex-wrap:wrap; }}
.n {{ display:inline-grid; place-items:center; width:34px; height:34px; border-radius:50%; background:var(--sun); color:var(--ink); border:3px solid #fff; flex:none; }}
.why {{ margin:0 0 12px; color:var(--lilac); }}
.grid {{ display:grid; grid-template-columns:repeat(auto-fill, minmax(min(100%, 340px), 1fr)); gap:14px; align-items:start; }}
.pic {{ margin:0; background:#fff; color:var(--ink); border:4px solid var(--ink); border-radius:20px; overflow:hidden; box-shadow:0 0 0 2px rgba(255,255,255,.15); }}
.pic img {{ display:block; width:100%; height:auto; cursor:zoom-in; }}
.pic.tall {{ max-width:300px; }}
figcaption {{ padding:10px 14px 14px; font-size:16px; }}
.id {{ display:inline-block; padding:0 8px; border-radius:10px; background:var(--lilac); }}
.rec {{ display:inline-block; padding:0 10px; border-radius:10px; background:var(--mint); color:var(--ink); font-size:15px; }}
.stamp {{ margin-top:30px; font-size:13px; color:#B9B3E6; }}
#big {{ position:fixed; inset:0; background:rgba(10,6,40,.94); display:none; align-items:center; justify-content:center; padding:8px; cursor:zoom-out; }}
#big.on {{ display:flex; }} #big img {{ max-width:100%; max-height:100%; }}
</style></head><body><main>
<h1>Rocket games: Bip's big moment</h1>
<p class="lead">Step 2a-3 (D-025). The same finale plays in both tiles, Rocket Lander and Rocket Sums, after the round's last landing and before the end card.
Each option is shown as three moments, drawn by the real game on a phone held sideways, with the new parts sketched on top. Tap a picture to enlarge it.
Pick A, B or C and one of S1 to S3, or mix and change them.</p>
{''.join(out)}
<p class="stamp">Mock-ups, not the game. Drawn from claude/games at {commit} by tools/tests/games/sketch_rocket_bip_moment.py 1.0,
in headless Chromium standing in for the phone, with Fredoka from @fontsource/fredoka 5.3.0. The pad, big flag, ladder and fireworks are sketched for these pictures only.
With reduced motion on, the finale would keep the flag and stars but use fewer bursts and no jump.</p>
</main><div id="big"><img alt=""></div>
<script>
const big = document.getElementById('big'), bi = big.querySelector('img');
document.querySelectorAll('.pic img').forEach((im) => im.addEventListener('click', () => {{ bi.src = im.src; big.classList.add('on'); }}));
big.addEventListener('click', () => big.classList.remove('on'));
</script></body></html>
"""


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
                loaded = pg.evaluate("[...document.querySelectorAll('.pic img')].filter(i => i.complete && i.naturalWidth > 0).length")
                ok = sw <= cw and not errs and not asked and loaded == len(OPTIONS)
                print(('ok   ' if ok else 'FAIL ') + f'page {w}x{h} {scheme}: width {sw}/{cw}, pictures {loaded}/{len(OPTIONS)}'
                      + (f', errors {errs}' if errs else '') + (f', fetched {asked}' if asked else ''))
                if not ok:
                    fails.append(f'{w}x{h} {scheme}')
                ctx.close()
        br.close()
    if fails:
        raise SystemExit(f'page check failed: {fails}')


with sync_playwright() as p:
    br = p.chromium.launch()
    for o in OPTIONS:
        shoot(br, o)
    br.close()
with open(os.path.join(OUT, 'mockups.json'), 'w', encoding='utf-8') as f:
    json.dump([{k: o.get(k) for k in ('id', 'opt', 'title', 'caption')} for o in OPTIONS], f, indent=1)
head = subprocess.run(['git', '-C', REPO, 'rev-parse', '--short', 'HEAD'], capture_output=True, text=True).stdout.strip()
with open(os.path.join(OUT, 'mockups.html'), 'w', encoding='utf-8') as f:
    f.write(page(head))
print(f"page: {os.path.join(OUT, 'mockups.html')}")
check_page(os.path.join(OUT, 'mockups.html'))
httpd.shutdown()
shutil.rmtree(ROOT)
