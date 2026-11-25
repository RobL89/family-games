// Hamster Highway step 18a: mock-ups of the fair by day (levels 29 and 30, D-191, D-193), its animations (Rob, 25 Nov:
// "maximum fun, animations"; the zip ride, a lively fair backdrop and a fair party at home; gentle while building, full
// speed and brighter once GO is pressed and at the party), all Claude's, proposed, for Rob's pick.
// Version 0.1 (25 Nov). Not part of the game: mock_hamster_step18a.py appends this to a scratch copy of art.js (1.13),
// where its helpers (pondSky, frameHill, frameBush, picBunting's colours, reel, hamster, hamsterHead) are in scope, and
// draws each backdrop behind a stand-in board in the real game; the zip rides and parties are drawn from the same art
// and moved by mock_hamster_fair.css (in the game, game.js would move them frame by frame, as it moves the ride today).
//
// Every moving part sits in an inner group whose own class moves it (a group with a transform attribute is never
// animated, handoff quirk). The fair's busy shapes sit in one group, fair-busy, faded to 0.4 as the park's (D-219, D-226)
// and brightened to 0.75 in a run; a part that goes faster in a run has a second, inner group whose animation is paused
// while building, so the speed-up never jumps (fx-*-run).

const FBLUE = '#4FA3E0';
const FLILAC = '#C9B8FF';
const FMINT = '#5FE3BD';
const FCOLS = ['#E8505B', SUN, LEAF, FBLUE, PINK, FLILAC];

// A part that moves gently while building and more in a run: the outer class always, the inner only in a run.
const fx = (name, body, extra = '') => `<g class="fx-${name}"${extra}><g class="fx-${name}-run">${body}</g></g>`;

// ---------------------------------------------------------------- the big wheel
// Centred on (0, 0) inside its turning group, so it turns about its hub; each car hangs from its pin and turns back
// the other way, so it stays upright. An invisible ring makes the group's box square about the hub.
function fairCar(i) {
  const col = FCOLS[i % FCOLS.length];
  let s = line(0, 0, 0, 12, INK, 2.4) + path('M -17 12 L 17 12 L 14 32 Q 0 40 -14 32 Z', col, 2.6) + rect(-19, 8, 38, 7, WHITE, 3, 2.2);
  if (i === 2) s = s + place(hamsterHead('open'), 0, 18, 0.32);   // a Nibble already riding, for fun
  return s;
}
function fairWheel(x, y, R) {
  let wheel = circle(0, 0, R + 44, 'none', 0, 'none') + circle(0, 0, R, 'none', 7, '#E8505B') + circle(0, 0, R - 16, 'none', 3, FBLUE);
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    wheel += line(0, 0, R * Math.cos(a), R * Math.sin(a), FBLUE, 3.5);
  }
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6 + 0.26;
    wheel += circle((R + 3) * Math.cos(a), (R + 3) * Math.sin(a), 4, SUN, 1.6);   // the lights round the rim
  }
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    wheel += g(fx('unspin', fairCar(i)), `translate(${(R * Math.cos(a)).toFixed(1)} ${(R * Math.sin(a)).toFixed(1)})`);
  }
  wheel += circle(0, 0, 13, SUN, 3) + circle(0, 0, 4, INK, 0);
  const legs = path(`M ${x - R * 0.62} 452 L ${x} ${y} L ${x + R * 0.62} 452`, 'none', 9, FBLUE) + path(`M ${x - R * 0.62} 452 L ${x} ${y} L ${x + R * 0.62} 452`, 'none', 3, '#8CC8F0')
    + rect(x - R * 0.7, 446, R * 1.4, 10, '#B9D6E6', 4, 2.4);
  return legs + g(fx('spin', wheel), `translate(${x} ${y})`, ' data-fx="wheel"');
}

// ---------------------------------------------------------------- the helter-skelter
function fairFlag(x, y, col, k = 1) {
  return line(x, y, x, y - 34 * k, INK, 3) + g(fx('flag', path(`M 0 0 L ${30 * k} ${8 * k} L 0 ${16 * k} Z`, col, 2.2)), `translate(${x} ${y - 34 * k})`);
}
function fairHelter(x) {
  const top = 150;
  let s = path(`M ${x - 40} 452 L ${x - 28} ${top + 40} L ${x + 28} ${top + 40} L ${x + 40} 452 Z`, WHITE, 3);
  for (let i = 0; i < 6; i++) {   // the red stripes
    const y0 = top + 40 + i * 44;
    s += path(`M ${x - 28 - i * 2} ${y0 + 22} L ${x + 28 + i * 2} ${y0 + 4} L ${x + 30 + i * 2} ${y0 + 20} L ${x - 30 - i * 2} ${y0 + 38} Z`, '#E8505B', 0, 'none');
  }
  for (let i = 0; i < 6; i++) {   // the slide winding round
    const y0 = top + 60 + i * 44;
    s += path(`M ${x - 52 - i * 2} ${y0 + 20} Q ${x} ${y0 - 6} ${x + 52 + i * 2} ${y0}`, 'none', 9, INK) + path(`M ${x - 52 - i * 2} ${y0 + 20} Q ${x} ${y0 - 6} ${x + 52 + i * 2} ${y0}`, 'none', 5, SUN);
  }
  s += rect(x - 36, top + 30, 72, 14, FBLUE, 5, 2.6);   // the balcony
  s += path(`M ${x - 34} ${top + 32} L ${x} ${top - 12} L ${x + 34} ${top + 32} Z`, '#E8505B', 3) + fairFlag(x, top - 12, SUN);
  return s;
}

// ---------------------------------------------------------------- bunting that flaps, tents, balloons
function fairBunting(x0, x1, y, sag = 34) {
  let s = path(`M ${x0} ${y} Q ${(x0 + x1) / 2} ${y + 2 * sag} ${x1} ${y}`, 'none', 2.4);
  const n = Math.max(5, Math.round((x1 - x0) / 46));
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const x = x0 + (x1 - x0) * t;
    const yy = y + 2 * sag * 2 * t * (1 - t);
    s += g(fx('flap', path('M -11 0 L 0 22 L 11 0 Z', FCOLS[i % FCOLS.length], 2), ` style="animation-delay:-${(i * 0.37).toFixed(2)}s"`), `translate(${x.toFixed(1)} ${yy.toFixed(1)})`);
  }
  return s;
}
function fairTent(x, col) {
  let s = path(`M ${x - 70} 452 L ${x - 70} 372 L ${x} 318 L ${x + 70} 372 L ${x + 70} 452 Z`, WHITE, 3);
  for (let i = 0; i < 4; i++) s += path(`M ${x - 70 + i * 35} 372 L ${x - 52 + i * 35} 372 L ${x} 318 Z`, col, 0, 'none');
  s += path(`M ${x - 70} 372 L ${x} 318 L ${x + 70} 372`, 'none', 3) + path(`M ${x - 16} 452 Q ${x} 404 ${x + 16} 452 Z`, INK, 0, 'none', ' opacity="0.25"');
  return s + fairFlag(x, 318, col === '#E8505B' ? SUN : '#E8505B', 0.8);
}
function fairBalloon(x, y, col, i) {   // swaying about the string's end, tied at (x, 360); the balloon at height y
  const h = 360 - y;
  const b = path(`M 0 0 q -2 ${-h * 0.5} -6 ${-h + 18}`, 'none', 1.6) + ellipse(-6, -h, 15, 19, col, 2.4) + path(`M -10 ${-h + 18} l 4 -6 l 4 6 Z`, col, 1.6)
    + ellipse(-11, -h - 6, 4, 6, WHITE, 0, INK, -20, ' opacity="0.6"');
  return g(fx('sway', b, ` style="animation-delay:-${(i * 0.6).toFixed(1)}s"`), `translate(${x} 360)`);
}
function fairStall(x) {   // a balloon stall: a striped awning, a counter and a bunch of balloons swaying
  let s = rect(x - 50, 392, 100, 60, '#F3D9A4', 6, 3) + rect(x - 56, 360, 112, 22, WHITE, 6, 3);
  for (let i = 0; i < 4; i++) s += rect(x - 56 + i * 28, 360, 14, 22, FBLUE, 0, 0);
  s += rect(x - 56, 360, 112, 22, 'none', 6, 3);
  [[-30, 300], [-8, 286], [14, 296], [34, 310], [2, 312]].forEach(([dx, y], i) => { s += fairBalloon(x + dx, y, FCOLS[(i + 1) % FCOLS.length], i); });
  return s;
}
// Balloons let go: in a run they float up from the stall and away (run only; while building they aren't there).
function fairLetGo(x) {
  return [0, 1, 2].map((i) => g(g(ellipse(0, -16, 13, 16, FCOLS[(i + 3) % FCOLS.length], 2.2) + path('M 0 0 q 4 18 -2 34', 'none', 1.4), '',
    ` class="fx-up" style="animation-delay:${(i * 1.7).toFixed(1)}s"`), `translate(${x - 20 + i * 22} 300)`)).join('');
}

// ---------------------------------------------------------------- the carousel
function fairHorse(col) {
  return path('M -22 0 q 4 -14 18 -14 l 14 0 q 6 -12 14 -12 q 8 2 6 10 l -6 4 q 0 10 -6 12 l -2 16 m -26 -16 l -4 16', col, 2.4)
    + circle(20, -20, 2, INK, 0) + path('M 14 -26 q -6 -6 -14 -2', 'none', 3, '#E8505B');
}
function fairCarousel(x) {
  let s = rect(x - 120, 438, 240, 16, FBLUE, 6, 3);
  for (let i = 0; i < 4; i++) {
    const px = x - 84 + i * 56;
    s += line(px, 270, px, 438, '#F0C860', 4) + g(fx('bob', g(fairHorse([WHITE, FLILAC, PINK, FMINT][i]), 'translate(0 0)'), ` style="animation-delay:-${(i * 0.45).toFixed(2)}s"`), `translate(${px} 380)`);
  }
  s += path(`M ${x - 132} 270 L ${x} 196 L ${x + 132} 270 Z`, WHITE, 3);
  for (let i = 0; i < 6; i++) s += path(`M ${x - 132 + i * 44} 270 L ${x - 110 + i * 44} 270 L ${x} 196 Z`, '#E8505B', 0, 'none');
  s += path(`M ${x - 132} 270 L ${x} 196 L ${x + 132} 270`, 'none', 3);
  let lights = '';
  for (let i = 0; i < 9; i++) lights += path(`M ${x - 132 + i * 29.3} 270 q 14.6 18 29.3 0`, i % 2 ? SUN : '#E8505B', 2.4)
    + g(fx('blink', circle(0, 0, 4, '#FFF3B0', 1.6), ` style="animation-delay:-${(i * 0.25).toFixed(2)}s"`), `translate(${(x - 117 + i * 29.3).toFixed(1)} 282)`);
  return s + lights + fairFlag(x, 196, LEAF);
}

// ---------------------------------------------------------------- the boating lake (look C)
function fairSwan(col) {
  return path('M -26 0 q 0 14 26 14 q 26 0 30 -14 Z', col, 2.6) + path('M 18 -2 q 6 -30 -6 -34 q -10 -2 -8 8', 'none', 6) + path('M 18 -2 q 6 -30 -6 -34 q -10 -2 -8 8', 'none', 3, WHITE)
    + path('M 4 -28 l -8 2 l 8 3 Z', '#F0A51C', 1.4) + circle(8, -30, 1.6, INK, 0);
}
function fairLake(w) {
  let s = rect(0, 470, w, 70, '#9FD3F5', 0, 0) + path(`M 0 470 L ${w} 470`, 'none', 3, '#6CB7E0');
  for (let x = 60; x < w; x += 180) s += g(fx('wave', path('M -18 0 q 9 -6 18 0 q 9 6 18 0', 'none', 2.4, '#6CB7E0')), `translate(${x} 500)`);
  return s;
}
function fairSwans(w) {
  let s = '';
  for (let x = 140, i = 0; x < w; x += 300, i++) s += g(fx('bob', fairSwan(i % 2 ? WHITE : '#FFE6EE'), ` style="animation-delay:-${(i * 0.7).toFixed(1)}s"`), `translate(${x} 470)`);
  return s;
}

// ---------------------------------------------------------------- the three looks (w wide, 540 tall)
// Look A, the big wheel: the big wheel turning and the helter-skelter, bunting between, a balloon stall.
function fairA(w) {
  const [s, sky] = pondSky(w, 90);
  let d = sky + frameHill(w);
  for (let x = 40; x < w; x += 520) d += frameBush(x, 448);
  let busy = '';
  for (let x = 0; x < w; x += 960) {
    busy += fairWheel(x + 300, 290, 136) + fairHelter(x + 640) + fairBunting(x + 440, x + 610, 210) + fairBunting(x + 680, x + 900, 232) + fairStall(x + 820);
  }
  d += g(busy, '', ' class="fair-busy" data-quiet="fair"');
  for (let x = 0; x < w; x += 960) d += fairLetGo(x + 820);
  return s + g(d, '', ' opacity="0.92"');
}
// Look B, the carousel: the carousel going round, two striped tents with flags, bunting, a balloon stall.
function fairB(w) {
  const [s, sky] = pondSky(w, 90);
  let d = sky + frameHill(w);
  for (let x = 40; x < w; x += 520) d += frameBush(x, 448);
  let busy = '';
  for (let x = 0; x < w; x += 960) {
    busy += fairTent(x + 150, '#E8505B') + fairCarousel(x + 420) + fairTent(x + 690, FBLUE) + fairBunting(x + 220, x + 620, 150, 26) + fairStall(x + 860);
  }
  d += g(busy, '', ' class="fair-busy" data-quiet="fair"');
  for (let x = 0; x < w; x += 960) d += fairLetGo(x + 860);
  return s + g(d, '', ' opacity="0.92"');
}
// Look C, the boating lake: swan boats bobbing on the lake, the big wheel behind, bunting along the shore.
function fairC(w) {
  const [s, sky] = pondSky(w, 90);
  let d = sky + frameHill(w);
  let busy = '';
  for (let x = 0; x < w; x += 960) busy += fairWheel(x + 640, 280, 136) + fairHelter(x + 230) + fairBunting(x + 280, x + 560, 230);
  busy += fairLake(w) + fairSwans(w);
  d += g(busy, '', ' class="fair-busy" data-quiet="fair"');
  return s + g(d, '', ' opacity="0.92"');
}
export const FAIR_LOOKS = { fairA, fairB, fairC };

// ---------------------------------------------------------------- the zip ride, four ways (a scene 720 x 300)
// The ledge (blocks), the hook under the block at square (2, 1), the line to the peg at (9, 3), the far bank and home.
// Hamster 1 walks out, grabs its reel, zips, lets go and walks home; the scene loops. The classes zr-* (in
// mock_hamster_fair.css) move it; R0 is the ride as game.js draws it today, for comparison.
const ZA = [150, 90];
const ZB = [570, 210];
export const ZIP_SAG = 20;
const ZIP_FEET = () => [ellipse(-8, 4, 8, 5, PINK, 2.4), ellipse(14, 6, 8, 5, PINK, 2.4)];   // the zip pose's feet, as hamster() draws them
const kickFeet = (k) => {   // the zip pose with its feet kicked out (k 1: left forward, 2: right forward)
  const base = hamster('zip');
  const [f1, f2] = ZIP_FEET();
  const [a, b] = k === 1 ? [ellipse(-18, -2, 8, 5, PINK, 2.4, INK, -30), ellipse(10, 10, 8, 5, PINK, 2.4)] : [ellipse(-6, 10, 8, 5, PINK, 2.4), ellipse(26, -1, 8, 5, PINK, 2.4, INK, 30)];
  return base.replace(f1, a).replace(f2, b);
};
export const kickOk = () => ZIP_FEET().every((f) => hamster('zip').split(f).length === 2);   // each foot found once, so both kick
function zipStage() {
  let s = rect(0, 0, 720, 300, '#E7F6FC', 0, 0);
  for (const [c, r] of [[1, 0], [2, 0], [3, 0], [0, 2], [1, 2], [2, 2], [0, 3], [1, 3], [2, 3], [0, 4], [1, 4], [2, 4], [8, 4], [9, 4], [10, 4], [11, 4]]) s += block(c, r, r === 0 || (r === 2) || (c >= 8));
  for (let c = 3; c < 8; c++) s += water(c, 4);
  s += place(homeArt(), 660, 180, 0.6);
  return s;
}
const SCF = 0.56;
const zham = (pose) => place(hamster(pose), 0, 0, SCF);
const zcls = (c, body) => `<g class="${c}">${body}</g>`;
export function zipRide(look) {
  const sag = look >= 2;
  let s = zipStage();
  const lineD = `M ${ZA[0]} ${ZA[1]} L ${(ZA[0] + ZB[0]) / 2} ${(ZA[1] + ZB[1]) / 2} L ${ZB[0]} ${ZB[1]}`;
  s += sag ? path(lineD, 'none', 6.5, INK, ' class="zr-line"') + path(lineD, 'none', 3, '#F3D9A4', ' class="zr-line"') : zipLine(ZA[0], ZA[1], ZB[0], ZB[1]);
  s += zipHook(ZA[0], 60) + zipPeg(ZB[0], 240, 0.85);
  if (sag) {   // a sparkle left behind at each column the reel passes
    for (let i = 1; i < 7; i++) {
      const u = i / 7;
      const x = ZA[0] + (ZB[0] - ZA[0]) * u;
      const y = ZA[1] + (ZB[1] - ZA[1]) * u + ZIP_SAG * 4 * u * (1 - u) + 30;
      s += g(zcls(`zr-spark zr-spark${i}`, star(0, 0, 7, FCOLS[i % FCOLS.length], 1.6)), `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    }
    s += g(zcls('zr-dust', circle(-22, 0, 9, WHITE, 2, '#B9D6E6') + circle(0, -6, 11, WHITE, 2, '#B9D6E6') + circle(22, 0, 9, WHITE, 2, '#B9D6E6')), `translate(${ZB[0]} 236)`);
  }
  // the walker: walking (legs), on the line (zip, swinging and kicking from R1), landing and home; one moving group
  const onLine = look === 0 ? zham('zip')
    : zcls('zr-swing', g(zcls('zr-k1', place(kickFeet(1), 0, 0, SCF)) + zcls('zr-k2', place(kickFeet(2), 0, 0, SCF)), 'translate(0 52)')
      + zcls('zr-lines', [8, 22, 36].map((y) => line(-34, y + 14, -58, y + 6, INK, 2.4, ' stroke-linecap="round"')).join('')));
  const flip = look === 3 ? zcls('zr-flip', g(zham('boing'), 'translate(0 -20)')) : '';
  s += zcls(`zr-ham zr-ham${look}`, zcls('zr-walk', zcls('zr-legs1', zham('walk1')) + zcls('zr-legs2', zham('walk2')))
    + zcls('zr-on', look === 0 ? g(zham('zip'), 'translate(0 52)') : onLine) + flip + zcls('zr-home', zham('home')));
  return `<g data-ride="${look}" class="zr zr${look}">${s}</g>`;
}

// ---------------------------------------------------------------- a fair party at home, two ways (720 x 420)
// P1: a merry-go-round turns where home is, the five Nibbles riding horses round it (they pass along the front, so it
// reads as turning), music notes float up, the usual confetti falls. P2: the five ride in the cars of a big wheel that
// turns, waving, as balloons are let go.
function partyConfetti(n = 26) {
  let s = '';
  let seed = 7;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  for (let i = 0; i < n; i++) {
    const x = 20 + rnd() * 680;
    const k = i % 3;
    const art = k === 0 ? seedArt() : k === 1 ? heart(0, 0, 9, ['#FF8FB1', CORAL, FLILAC][i % 3]) : star(0, 0, 7, [SUN, FMINT, '#8CF5FF'][i % 3]);
    s += place(g(art, '', ` class="confetti" style="--dx:${Math.round(rnd() * 80 - 40)}px;--rot:${Math.round(rnd() * 720 - 360)}deg;--t:${(2.2 + rnd() * 1.6).toFixed(2)}s;--d:${(rnd() * 1.2).toFixed(2)}s;animation-iteration-count:infinite"`), x, -20, 0.9);
  }
  return s;
}
const note = (x, i) => g(g(path('M 0 0 L 0 -26 L 14 -30 L 14 -6', 'none', 3) + ellipse(-4, 0, 6, 4.5, INK, 0, INK, -20) + ellipse(10, -4, 6, 4.5, INK, 0, INK, -20), '',
  ` class="fp-note" style="animation-delay:${(i * 0.8).toFixed(1)}s"`), `translate(${x} 200)`);
export function partyCarousel() {
  let s = rect(220, 330, 280, 18, FBLUE, 7, 3);   // the floor of the merry-go-round
  s += line(360, 150, 360, 330, '#F0C860', 7);
  for (let i = 0; i < 5; i++) {   // riders pass along the front, one after another (each pole moves with its rider)
    const rider = line(0, -150, 0, 20, '#F0C860', 4) + zcls('fp-bob', fairHorse([WHITE, FLILAC, PINK, FMINT, SUN][i]) + place(hamster('home'), 2, -22, 0.4));
    s += g(`<g class="fp-ride" style="animation-delay:-${(i * 0.9).toFixed(1)}s">${rider}</g>`, 'translate(360 312)', ` data-rider="${i}"`);
  }
  s += path('M 200 160 L 360 76 L 520 160 Z', WHITE, 3);
  for (let i = 0; i < 8; i++) s += path(`M ${200 + i * 40} 160 L ${220 + i * 40} 160 L 360 76 Z`, '#E8505B', 0, 'none');
  s += path('M 200 160 L 360 76 L 520 160', 'none', 3);
  for (let i = 0; i < 8; i++) s += path(`M ${200 + i * 40} 160 q 20 18 40 0`, i % 2 ? SUN : '#E8505B', 2.4) + g(zcls('fx-blink', circle(0, 0, 4.5, '#FFF3B0', 1.6)), `translate(${220 + i * 40} 172)`);
  s += line(360, 76, 360, 44, INK, 3) + g(zcls('fx-flag', path('M 0 0 L 30 8 L 0 16 Z', LEAF, 2.2)), 'translate(360 44)');
  s += note(170, 0) + note(560, 1) + note(120, 2) + note(610, 3);
  return `<g data-party="carousel">${s + partyConfetti()}</g>`;
}
export function partyWheel() {
  let wheel = circle(0, 0, 160, 'none', 0, 'none') + circle(0, 0, 118, 'none', 7, '#E8505B') + circle(0, 0, 104, 'none', 3, FBLUE);
  for (let i = 0; i < 10; i++) wheel += line(0, 0, 118 * Math.cos((i * Math.PI) / 5), 118 * Math.sin((i * Math.PI) / 5), FBLUE, 3.5);
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5;
    const rider = i % 2 === 0 ? place(g(hamster('home'), '', ` class="dance" style="animation-delay:${(i * 0.1).toFixed(1)}s"`), 0, 30, 0.34) : '';
    const car = line(0, 0, 0, 12, INK, 2.4) + rider + path('M -20 12 L 20 12 L 17 34 Q 0 42 -17 34 Z', FCOLS[i % FCOLS.length], 2.6);
    wheel += g(zcls('fp-unspin', car), `translate(${(118 * Math.cos(a)).toFixed(1)} ${(118 * Math.sin(a)).toFixed(1)})`);
  }
  wheel += circle(0, 0, 14, SUN, 3) + circle(0, 0, 4, INK, 0);
  let s = path('M 270 400 L 360 210 L 450 400', 'none', 10, FBLUE) + rect(250, 396, 220, 12, '#B9D6E6', 4, 2.4);
  s += g(zcls('fp-spin', wheel), 'translate(360 210)', ' data-fx="partywheel"');
  s += [0, 1, 2, 3, 4, 5].map((i) => g(g(ellipse(0, -16, 14, 18, FCOLS[i % FCOLS.length], 2.2) + path('M 0 2 q 5 18 -2 36', 'none', 1.4), '', ` class="fp-up" style="animation-delay:${(i * 0.6).toFixed(1)}s"`), `translate(${80 + i * 112} 440)`)).join('');
  return `<g data-party="wheel">${s + partyConfetti()}</g>`;
}
