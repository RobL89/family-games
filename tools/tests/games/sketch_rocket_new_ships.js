// The five new ships for Rocket Lander's hangar, drawn in detail for the step 2d-1 mock-ups
// (D-073 to D-077). Version 1.0. A sketch, not the game: tools/tests/games/sketch_rocket_new_ships.py
// splices each part below into a copy of a game module for the mock-up page only, so the ships
// are drawn by exactly the code they would have in the game. Nothing in games/ changes. Once Rob
// has chosen, step 2d-2 moves each part into its file as it stands (as D-049 did for the first
// eight), test-first.
//
// The parts, each starting at a "// @part" line:
//   ships      the five ships, as ships.js writes them: drawn round their middle (x, y), h tall,
//              feet on the ground at y + h/2 (D-045, D-046), narrow where they land (D-076).
//              Spliced into ships.js just before its SHIPS table, so they use its helpers.
//   particles  three new kinds of spark for drawPart: a music note, a petal and a water drop.
//              Spliced into drawPart's switch, before its default.
//   sounds     each ship's own landing sound (D-077), made in code. Spliced into sound.js's SOUNDS.
//   fleet      the five rows for fleet.js's FLEET (D-077's tiers and prices), each placed after
//              the row it names, so the hangar runs from cheapest to dearest in each tier.
//   order      the SHIPS table in the same order.
//
// New for the game (proposed, to build in step 2d-2): three small hooks a ship may give, which
// round.js would read; ships without them play exactly as today.
//   seat(S)    where Bip is aboard: { x, y, s }, Bip's feet and size in units of h from the
//              ship's middle. Bip hops out from here to plant the flag, and back to it. The
//              Classic's window is { x: 0, y: 0.255, s: 0.3 }.
//   ladder(S)  a ship with its own ladder (the Christmas Tree): { top, foot }. Bip climbs down
//              it instead of hopping, and Bip's moment uses it in place of the rope ladder.
//   S.side     set by the round to the side the flag goes (1 right, -1 left), so the tree's
//              ladder leans the right way.

// @part ships

// ---------- the five new ships (step 2d-1, D-073 to D-077) ----------

// Bip on his own, outside a window: feet at (x, y), size s, as drawPilot draws him.
function bipOut(ctx, S, t, x, y, s, o = {}) {
  drawPilot(ctx, { x, y, s, mood: o.mood || S.mood || 'happy', blink: S.blink || 0, wave: !!o.wave, flip: !!o.flip, squash: o.squash || 0 }, t);
}

// A music note, its head at (0, 0), size s; two joined when two is true.
function musicNote(ctx, s, col, two) {
  const lw = Math.max(1.2, s * 0.13);
  ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.fillStyle = col || '#FFFFFF';
  const heads = two ? [[-0.42, 0.1], [0.42, 0]] : [[0, 0]];
  for (const [hx, hy] of heads) {
    ctx.beginPath(); ctx.ellipse(hx * s, hy * s, s * 0.34, s * 0.25, -0.4, 0, TAU); ctx.fill(); ctx.stroke();
  }
  ctx.beginPath();
  if (two) { ctx.moveTo(-0.12 * s, 0.05 * s); ctx.lineTo(-0.12 * s, -0.95 * s); ctx.lineTo(0.72 * s, -1.05 * s); ctx.lineTo(0.72 * s, -0.05 * s); }
  else { ctx.moveTo(0.3 * s, -0.05 * s); ctx.lineTo(0.3 * s, -1.0 * s); ctx.quadraticCurveTo(0.75 * s, -0.75 * s, 0.6 * s, -0.4 * s); }
  ctx.lineWidth = lw * 2.4; ctx.strokeStyle = INK; ctx.stroke();
  ctx.lineWidth = lw * 1.1; ctx.strokeStyle = col || '#FFFFFF'; ctx.stroke();
}

// A sock: cuff at the top (0, 0), toe to the right, size s; striped when stripe is a colour.
function sockShape(ctx, s, col, stripe) {
  const lw = Math.max(1, s * 0.09);
  ctx.beginPath();
  ctx.moveTo(-0.22 * s, 0); ctx.lineTo(0.22 * s, 0); ctx.lineTo(0.22 * s, 0.62 * s);
  ctx.quadraticCurveTo(0.22 * s, 0.74 * s, 0.38 * s, 0.74 * s); ctx.lineTo(0.62 * s, 0.74 * s);
  ctx.quadraticCurveTo(0.85 * s, 0.76 * s, 0.82 * s, 0.97 * s); ctx.quadraticCurveTo(0.78 * s, 1.12 * s, 0.55 * s, 1.1 * s);
  ctx.lineTo(0.0, 1.1 * s); ctx.quadraticCurveTo(-0.22 * s, 1.1 * s, -0.22 * s, 0.88 * s); ctx.closePath();
  ctx.fillStyle = col; ctx.fill();
  if (stripe) {
    ctx.save(); ctx.clip(); ctx.fillStyle = stripe;
    ctx.fillRect(-0.3 * s, 0.3 * s, 1.3 * s, 0.13 * s); ctx.fillRect(-0.3 * s, 0.55 * s, 1.3 * s, 0.13 * s);
    ctx.restore();
  }
  ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.stroke();
  rr(ctx, -0.26 * s, -0.08 * s, 0.52 * s, 0.2 * s, 0.06 * s); ctx.fillStyle = '#FFFFFF'; ctx.fill(); ctx.stroke();
}

// A rubber duck sitting at (0, 0), facing right, size s.
function rubberDuck(ctx, s, t) {
  const lw = Math.max(1, s * 0.1);
  ctx.lineWidth = lw; ctx.strokeStyle = INK;
  ctx.beginPath(); ctx.ellipse(0, 0, s * 0.62, s * 0.42, 0, 0, TAU); ctx.fillStyle = GOLD[1]; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-0.55 * s, -0.1 * s); ctx.quadraticCurveTo(-0.85 * s, -0.35 * s, -0.62 * s, -0.42 * s); ctx.quadraticCurveTo(-0.5 * s, -0.2 * s, -0.4 * s, -0.25 * s); ctx.fillStyle = GOLD[1]; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(0.32 * s, -0.48 * s, s * 0.33, 0, TAU); ctx.fillStyle = GOLD[1]; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0.68 * s, -0.42 * s, s * 0.22, s * 0.11, 0.15, 0, TAU); ctx.fillStyle = '#FF9F43'; ctx.fill(); ctx.stroke();
  ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(0.42 * s, -0.56 * s, s * 0.06, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.ellipse(-0.15 * s, -0.12 * s, s * 0.2, s * 0.1, -0.3, 0, TAU); ctx.fill();
  void t;
}

// A soft heap of foam: circles [x, y, r] in units of h.
function foam(ctx, h, blobs, lw, shade = '#E4E8FA') {
  ctx.fillStyle = INK;
  for (const [x, y, r] of blobs) { ctx.beginPath(); ctx.arc(x * h, y * h, r * h + lw, 0, TAU); ctx.fill(); }
  ctx.fillStyle = shade;
  for (const [x, y, r] of blobs) { ctx.beginPath(); ctx.arc(x * h, y * h, r * h, 0, TAU); ctx.fill(); }
  ctx.fillStyle = '#FFFFFF';
  for (const [x, y, r] of blobs) { ctx.beginPath(); ctx.arc(x * h - r * h * 0.15, y * h - r * h * 0.18, r * h * 0.78, 0, TAU); ctx.fill(); }
}

// Splash Tub (D-073): a pink bath seen from its end, so it's narrow where it lands.
const tub = {
  id: 'tub',
  look: 'A pink bath seen end on, full of bubbles: gold claw feet, two taps, a shower on a curly pipe and a rubber duck. Bubbles stream from the plughole; it lands with a SPLOSH.',
  fw: [[PINK, SKY, '#FFFFFF'], [SUN, '#FFFFFF', PINK], [SKY, MINT, '#FFFFFF']],
  conf: [PINK, SKY, '#FFFFFF', SUN, MINT],
  seat() { return { x: 0, y: -0.02, s: 0.3 }; },
  showerAt(S) { return { x: S.x - 0.05 * S.h, y: S.y - 0.39 * S.h }; },
  draw(ctx, S, t) {
    const h = S.h, lw = lwOf(h), k = ease.back(clamp(S.legs, 0, 1)), sp = S.splash || 0;
    // the water sloshing over both ends (behind the tub)
    if (sp > 0.01) {
      const grow = 1 - sp * sp;
      for (const s of [-1, 1]) {
        ctx.save(); ctx.translate(s * 0.24 * h, -0.08 * h); ctx.scale(s * (0.5 + 0.7 * grow), 0.4 + 0.9 * grow); ctx.globalAlpha = Math.min(1, sp * 2.2);
        ctx.beginPath(); ctx.moveTo(0, 0.02 * h); ctx.quadraticCurveTo(0.1 * h, -0.02 * h, 0.2 * h, -0.17 * h); ctx.quadraticCurveTo(0.12 * h, -0.13 * h, 0.11 * h, -0.15 * h);
        ctx.quadraticCurveTo(0.14 * h, -0.25 * h, 0.1 * h, -0.34 * h); ctx.quadraticCurveTo(0.06 * h, -0.22 * h, 0.04 * h, -0.19 * h); ctx.quadraticCurveTo(0.03 * h, -0.29 * h, -0.03 * h, -0.34 * h);
        ctx.quadraticCurveTo(-0.02 * h, -0.18 * h, -0.04 * h, 0.0); ctx.closePath();
        ctx.fillStyle = grad(ctx, 0, -0.34 * h, 0, 0, ['#E6FBFF', SKY, '#5CC8F0']); ctx.fill(); outline(ctx, lw * 0.7);
        ctx.restore();
      }
    }
    // the shower on its curly pipe, behind the tub
    ctx.beginPath(); ctx.moveTo(-0.205 * h, -0.05 * h); ctx.lineTo(-0.205 * h, -0.37 * h); ctx.quadraticCurveTo(-0.205 * h, -0.47 * h, -0.1 * h, -0.47 * h);
    ctx.lineWidth = 0.045 * h + lw * 2; ctx.strokeStyle = INK; ctx.stroke();
    ctx.lineWidth = 0.045 * h; ctx.strokeStyle = grad(ctx, -0.23 * h, 0, -0.18 * h, 0, SILVER); ctx.stroke();
    ctx.save(); ctx.translate(-0.07 * h, -0.45 * h); ctx.rotate(0.3);
    ctx.beginPath(); ctx.moveTo(-0.075 * h, 0.04 * h); ctx.quadraticCurveTo(-0.07 * h, -0.035 * h, 0, -0.035 * h); ctx.quadraticCurveTo(0.07 * h, -0.035 * h, 0.075 * h, 0.04 * h); ctx.closePath();
    ctx.fillStyle = grad(ctx, -0.075 * h, 0, 0.075 * h, 0, SILVER); ctx.fill(); outline(ctx, lw * 0.9);
    ctx.fillStyle = INK; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.arc(i * 0.026 * h, 0.03 * h, 0.007 * h, 0, TAU); ctx.fill(); }
    ctx.restore();
    // gold claw feet: two seen end on, tucked up in flight
    for (const s of [-1, 1]) {
      const fx = s * 0.15 * h, fy = lerp(0.37, 0.465, k) * h;
      ctx.beginPath(); ctx.moveTo(fx - 0.045 * h, 0.28 * h); ctx.quadraticCurveTo(fx - s * 0.02 * h, fy - 0.06 * h, fx - 0.022 * h, fy - 0.01 * h);
      ctx.lineTo(fx + 0.022 * h, fy - 0.01 * h); ctx.quadraticCurveTo(fx + s * 0.03 * h, fy - 0.08 * h, fx + 0.045 * h, 0.28 * h); ctx.closePath();
      ctx.fillStyle = grad(ctx, fx - 0.05 * h, 0, fx + 0.05 * h, 0, GOLD); ctx.fill(); outline(ctx, lw * 0.8);
      for (const dx of [-0.032, 0.032]) { ctx.beginPath(); ctx.arc(fx + dx * h, fy + 0.016 * h, 0.019 * h, 0, TAU); ctx.fillStyle = GOLD[2]; ctx.fill(); outline(ctx, lw * 0.6); }
      ctx.beginPath(); ctx.arc(fx, fy, 0.034 * h, 0, TAU); ctx.fillStyle = grad(ctx, fx - 0.03 * h, fy - 0.03 * h, fx + 0.03 * h, fy + 0.03 * h, [GOLD[0], GOLD[1], GOLD[2]]); ctx.fill(); outline(ctx, lw * 0.7);
    }
    // the tub's end: a deep rounded U
    const end = () => { ctx.beginPath(); ctx.moveTo(-0.25 * h, -0.08 * h); ctx.bezierCurveTo(-0.25 * h, 0.3 * h, -0.2 * h, 0.39 * h, 0, 0.39 * h); ctx.bezierCurveTo(0.2 * h, 0.39 * h, 0.25 * h, 0.3 * h, 0.25 * h, -0.08 * h); ctx.closePath(); };
    end(); ctx.fillStyle = grad(ctx, 0, -0.08 * h, 0, 0.39 * h, ['#FFE3EE', '#FFB3CC', '#FF8FB1']); ctx.fill();
    ctx.save(); end(); ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.ellipse(-0.165 * h, 0.12 * h, 0.03 * h, 0.17 * h, 0.12, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(200,60,120,.16)'; ctx.beginPath(); ctx.ellipse(0.2 * h, 0.15 * h, 0.07 * h, 0.25 * h, -0.1, 0, TAU); ctx.fill();
    ctx.restore();
    end(); outline(ctx, lw);
    // the plug on its chain, swinging on the left; one tap with its spout on the right
    const sw = (S.air ? Math.sin(t * 9) * 0.25 : Math.sin(t * 2) * 0.08) + sp * 0.5 * Math.sin(t * 14);
    ctx.save(); ctx.translate(-0.12 * h, -0.035 * h); ctx.rotate(sw);
    ctx.setLineDash([0.012 * h, 0.01 * h]); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 0.14 * h); ctx.lineWidth = lw * 0.9; ctx.strokeStyle = SILVER[2]; ctx.stroke(); ctx.setLineDash([]);
    rr(ctx, -0.03 * h, 0.14 * h, 0.06 * h, 0.04 * h, 0.012 * h); ctx.fillStyle = '#3A3560'; ctx.fill(); outline(ctx, lw * 0.6);
    ctx.restore();
    {
      const x = 0.12 * h, y = 0.04 * h, turn = (S.air ? t * 3 : 0) + sp * 2;
      ctx.beginPath(); ctx.arc(x, y, 0.034 * h, 0, TAU); ctx.fillStyle = grad(ctx, x - 0.035 * h, y - 0.035 * h, x + 0.035 * h, y + 0.035 * h, SILVER); ctx.fill(); outline(ctx, lw * 0.7);
      ctx.save(); ctx.translate(x, y); ctx.rotate(turn);
      for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); rr(ctx, -0.012 * h, -0.058 * h, 0.024 * h, 0.04 * h, 0.012 * h); ctx.fillStyle = '#E8ECF7'; ctx.fill(); outline(ctx, lw * 0.6); }
      ctx.beginPath(); ctx.arc(0, 0, 0.016 * h, 0, TAU); ctx.fillStyle = CORAL; ctx.fill(); outline(ctx, lw * 0.5);
      ctx.restore();
    }
    // the bubbles, Bip in among them, and the rolled rim
    foam(ctx, h, [[-0.21, -0.12, 0.06], [-0.13, -0.17, 0.07], [-0.05, -0.15, 0.06], [0.07, -0.16, 0.065], [0.15, -0.13, 0.06], [0.22, -0.11, 0.05]], lw);
    if (S.pilotIn !== false) drawPilotHead(ctx, 0, -0.205 * h, 0.1 * h, { blink: S.blink || 0, mood: S.mood || 'happy', look: S.look || 0, t });
    foam(ctx, h, [[-0.065, -0.115, 0.04], [0, -0.1, 0.045], [0.065, -0.115, 0.04], [-0.17, -0.1, 0.035], [0.17, -0.1, 0.035]], lw * 0.8);
    const beard = S.beard || 0;
    if (beard > 0.02 && S.pilotIn !== false) {
      ctx.globalAlpha = Math.min(1, beard * 2);
      foam(ctx, h, [[-0.04, -0.16, 0.022], [0, -0.148, 0.026], [0.04, -0.16, 0.022]], lw * 0.5);
      ctx.globalAlpha = 1;
    }
    rr(ctx, -0.28 * h, -0.105 * h, 0.56 * h, 0.065 * h, 0.032 * h); ctx.fillStyle = grad(ctx, 0, -0.105 * h, 0, -0.04 * h, ['#FFFFFF', '#E4E0FA']); ctx.fill(); outline(ctx, lw);
    // the duck, on the rim, hopping up at the splash
    const d = S.duckT;
    const up = d != null && d < 0.8 ? Math.sin((d / 0.8) * Math.PI) * 0.34 * h : 0;
    const bob = S.idle || S.air ? Math.sin(t * 3.1) * 0.008 * h : 0;
    ctx.save(); ctx.translate(0.17 * h, -0.135 * h - up + bob); ctx.rotate(d != null && d < 0.8 ? (d / 0.8) * TAU : 0);
    rubberDuck(ctx, 0.07 * h, t); ctx.restore();
  },
  tick(S, dt) {
    S.splash = Math.max(0, (S.splash || 0) - dt * 1.7);
    if (S.duckT != null) { S.duckT += dt; if (S.duckT > 1) S.duckT = null; }
    if (S.air) S.beard = Math.max(0, (S.beard || 0) - dt * 2.5);
  },
  thrust(S, P, dt) {
    const h = S.h, p = S.thrust;
    every(S, 'bb', 10 * p * P.k, dt, () => P.add({ kind: 'bubble', x: S.x + rnd(-0.04, 0.04) * h, y: S.y + 0.4 * h, vx: rnd(-30, 30), vy: rnd(70, 150), drag: 1.2, life: rnd(0.6, 1.1), size: h * rnd(0.025, 0.05), sway: 4, swayAmp: 20, layer: 'back' }));
    const sh = this.showerAt(S);
    every(S, 'dr', 5 * P.k, dt, () => P.add({ kind: 'drop', x: sh.x + rnd(-0.03, 0.03) * h, y: sh.y, vx: rnd(-10, 25), vy: rnd(60, 110), g: 300, life: 0.3, size: h * 0.018, col: SKY }));
  },
  land(S, P) {
    S.splash = 1; S.duckT = 0; S.beard = 1;
    dust(S, P, S.dust, 10);
    const h = S.h, n = Math.round(9 * P.k) + 2;
    for (const s of [-1, 1]) for (let i = 0; i < n; i++) P.add({ kind: 'drop', x: S.x + s * 0.27 * h, y: S.y - 0.12 * h, vx: s * rnd(60, 220), vy: rnd(-300, -130), g: 620, life: rnd(0.55, 0.95), size: h * rnd(0.022, 0.038), col: SKY });
    for (let i = 0; i < Math.round(6 * P.k) + 1; i++) P.add({ kind: 'bubble', x: S.x + rnd(-0.22, 0.22) * h, y: S.y - 0.2 * h, vx: rnd(-30, 30), vy: rnd(-90, -40), drag: 0.6, life: rnd(1, 1.6), size: h * rnd(0.03, 0.055), sway: 3, swayAmp: 22, delay: i * 0.06 });
  },
  idle(S, P, dt) {
    every(S, 'id', 1.4 * P.k, dt, () => P.add({ kind: 'bubble', x: S.x + rnd(-0.2, 0.2) * S.h, y: S.y - 0.18 * S.h, vy: rnd(-40, -25), drag: 0.3, life: rnd(1.4, 2.2), size: S.h * rnd(0.025, 0.045), sway: 2.5, swayAmp: 16 }));
    const sh = this.showerAt(S);
    every(S, 'dr', 1.6 * P.k, dt, () => P.add({ kind: 'drop', x: sh.x, y: sh.y, vy: 40, g: 400, life: 0.32, size: S.h * 0.02, col: SKY }));
  },
};

// Jack-in-the-Box (D-073): a starry box with a winding handle; Bip peeps out under the lid.
// The box is drawn a little in 3-D: x across, y down, z into the page (0 at the front).
const JK = { x0: -0.23, x1: 0.23, y0: -0.2, y1: 0.43, d: 0.26, ox: 0.3, oy: 0.22, L: 0.4 };
const jkP = (x, y, z, h) => [(x + JK.ox * z) * h, (y - JK.oy * z) * h];
function jackPop(S) {
  if (S.popT != null) { const u = S.popT; return JK.L * (1 - Math.exp(-6 * u) * Math.cos(15 * u)); }
  return JK.L * (S.retract || 0);
}
const jack = {
  id: 'jack',
  look: 'A starry toy box with a winding handle. The handle turns like a propeller and music notes float out; on landing, POP! Bip springs out on a coil.',
  fw: [['#A88BFF', SUN, '#FFFFFF'], [SUN, CORAL, '#A88BFF'], [SKY, '#FFFFFF', SUN]],
  conf: ['#A88BFF', SUN, CORAL, SKY, '#FFFFFF'],
  seat(S) {
    const L = jackPop(S);
    return L > 0.05 ? { x: 0.03, y: JK.y0 - 0.02 - L, s: 0.3 } : { x: 0.03, y: 0.0, s: 0.3 };
  },
  draw(ctx, S, t) {
    const h = S.h, lw = lwOf(h), k = ease.back(clamp(S.legs, 0, 1)), P3 = (x, y, z) => jkP(x, y, z, h);
    const L = jackPop(S);
    const aboard = S.pilotIn !== false;
    const lid = S.popT != null ? Math.min(2.15, S.popT * 16) : (S.retract || 0) > 0.02 ? Math.max(0.75, 2.15 * S.retract) : !aboard ? 0.05 + (S.idle ? 0.1 * Math.pow(Math.max(0, Math.sin(t * 1.1)), 12) : 0)
      : S.air ? 0.8 + 0.07 * Math.sin(t * 11) : 0.72 + (S.idle ? 0.06 * Math.sin(t * 1.7) : 0);
    const quad = (pts, fill, w = lw) => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); outline(ctx, w); };
    // little gold ball feet (front two seen)
    for (const fx of [-0.16, 0.16]) {
      const fy = lerp(0.4, 0.465, k) * h;
      ctx.beginPath(); ctx.arc(fx * h, fy, 0.035 * h, 0, TAU); ctx.fillStyle = grad(ctx, (fx - 0.03) * h, fy - 0.03 * h, (fx + 0.03) * h, fy + 0.03 * h, [GOLD[0], GOLD[1], GOLD[2]]); ctx.fill(); outline(ctx, lw * 0.8);
    }
    const s = Math.sin(lid), co = Math.cos(lid);
    const lidPts = [P3(JK.x0, JK.y0, JK.d), P3(JK.x1, JK.y0, JK.d), P3(JK.x1, JK.y0 - JK.d * s, JK.d - JK.d * co), P3(JK.x0, JK.y0 - JK.d * s, JK.d - JK.d * co)];
    const drawLid = () => {
      quad(lidPts, co > 0 ? grad(ctx, 0, lidPts[2][1], 0, lidPts[0][1], ['#C4AEFF', '#9270F2']) : '#5E3FC4');
      if (co > 0.2) { const [mx, my] = P3(0.0, JK.y0 - JK.d * s * 0.5, JK.d - JK.d * co * 0.5); ctx.save(); ctx.translate(mx, my); ctx.scale(1, Math.max(0.2, co * 0.5)); star5(ctx, 0.05 * h); ctx.fillStyle = SUN; ctx.fill(); ctx.lineWidth = lw * 0.6; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); }
    };
    const lidBehind = lid > 0.3;
    if (lidBehind) drawLid();
    // the open top: dark inside, then Bip peeping or the coil
    quad([P3(JK.x0, JK.y0, 0), P3(JK.x1, JK.y0, 0), P3(JK.x1, JK.y0, JK.d), P3(JK.x0, JK.y0, JK.d)], '#2A1D6B', lw * 0.8);
    if (L > 0.03) {
      const top = (JK.y0 - 0.02 - L) * h, x = 0.03 * h, n = 7;
      ctx.beginPath(); ctx.moveTo(x, (JK.y0 + 0.02) * h);
      for (let i = 1; i <= n * 2; i++) ctx.lineTo(x + (i % 2 ? 1 : -1) * 0.05 * h, lerp((JK.y0 + 0.02) * h, top + 0.02 * h, i / (n * 2)));
      ctx.lineTo(x, top);
      ctx.lineWidth = 0.022 * h + lw * 1.6; ctx.strokeStyle = INK; ctx.stroke();
      ctx.lineWidth = 0.022 * h; ctx.strokeStyle = grad(ctx, x - 0.05 * h, 0, x + 0.05 * h, 0, SILVER); ctx.stroke();
      if (S.pilotIn !== false) {
        const b = S.popT != null ? Math.exp(-4 * S.popT) * Math.sin(S.popT * 15) : 0;
        bipOut(ctx, S, t, x, top, 0.3 * h, { wave: true, squash: -0.18 * b, mood: 'happy' });
      } else {
        ctx.save(); ctx.translate(x, top - 0.035 * h); ctx.rotate(Math.sin(t * 3) * 0.2); star5(ctx, 0.055 * h);
        ctx.fillStyle = grad(ctx, -0.05 * h, -0.05 * h, 0.05 * h, 0.05 * h, [GOLD[0], GOLD[1], GOLD[2]]); ctx.fill(); outline(ctx, lw * 0.7); ctx.restore();
      }
    } else if (S.pilotIn !== false) {
      drawPilotHead(ctx, 0.03 * h, (JK.y0 - 0.085) * h, 0.1 * h, { blink: S.blink || 0, mood: S.mood || 'happy', look: S.look || 0, t });
      for (const x of [-0.08, 0.14]) { ctx.beginPath(); ctx.arc(x * h, (JK.y0 + 0.005) * h, 0.026 * h, 0, TAU); ctx.fillStyle = MINT; ctx.fill(); outline(ctx, lw * 0.6); }
    }
    // the side, with the winding handle
    quad([P3(JK.x1, JK.y0, 0), P3(JK.x1, JK.y0, JK.d), P3(JK.x1, JK.y1, JK.d), P3(JK.x1, JK.y1, 0)], grad(ctx, JK.x1 * h, 0, (JK.x1 + JK.ox * JK.d) * h, 0, ['#6A49D8', '#4E31B4']));
    const [ax, ay] = P3(JK.x1, 0.1, JK.d * 0.5), c = S.crank || 0;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax + 0.05 * h, ay); ctx.lineWidth = 0.025 * h + lw * 1.6; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 0.025 * h; ctx.strokeStyle = SILVER[1]; ctx.stroke();
    const ex = ax + 0.05 * h + Math.cos(c) * 0.02 * h, ey = ay + Math.sin(c) * 0.085 * h;
    ctx.beginPath(); ctx.moveTo(ax + 0.05 * h, ay); ctx.lineTo(ex, ey); ctx.lineWidth = 0.022 * h + lw * 1.6; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 0.022 * h; ctx.strokeStyle = SILVER[1]; ctx.stroke();
    ctx.beginPath(); ctx.arc(ex, ey, 0.028 * h, 0, TAU); ctx.fillStyle = CORAL; ctx.fill(); outline(ctx, lw * 0.7);
    // the front, starry
    const front = [P3(JK.x0, JK.y0, 0), P3(JK.x1, JK.y0, 0), P3(JK.x1, JK.y1, 0), P3(JK.x0, JK.y1, 0)];
    quad(front, grad(ctx, 0, JK.y0 * h, 0, JK.y1 * h, ['#B79CFF', '#9270F2', '#7553E0']));
    ctx.save(); ctx.beginPath(); front.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.clip();
    [[-0.12, -0.08, 0.055, 0.2], [0.11, 0.06, 0.07, -0.3], [-0.1, 0.25, 0.05, 0.5], [0.13, 0.31, 0.04, 0.1], [0.0, 0.15, 0.035, -0.2]].forEach(([x, y, r, a], i) => {
      ctx.save(); ctx.translate(x * h, y * h); ctx.rotate(a + (S.idle ? Math.sin(t * 2 + i) * 0.08 : 0)); star5(ctx, r * h); ctx.fillStyle = i % 2 ? '#FFFFFF' : SUN; ctx.fill(); ctx.lineWidth = lw * 0.6; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore();
    });
    ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fillRect(JK.x0 * h, JK.y0 * h, 0.05 * h, (JK.y1 - JK.y0) * h);
    ctx.restore();
    ctx.lineWidth = lw * 0.7; ctx.strokeStyle = GOLD[1];
    ctx.beginPath(); ctx.moveTo((JK.x0 + 0.02) * h, (JK.y0 + 0.03) * h); ctx.lineTo((JK.x1 - 0.02) * h, (JK.y0 + 0.03) * h); ctx.moveTo((JK.x0 + 0.02) * h, (JK.y1 - 0.03) * h); ctx.lineTo((JK.x1 - 0.02) * h, (JK.y1 - 0.03) * h); ctx.stroke();
    quad(front, 'rgba(0,0,0,0)');
    // a shut lid lies over the top, hinged along its back
    if (!lidBehind) drawLid();
  },
  tick(S, dt) {
    S.crank = (S.crank || 0) + dt * (S.air ? 4 + 14 * S.thrust : S.idle ? 1.2 : 0) * (S.calm ? 0.4 : 1);
    if (S.popT != null) {
      S.popT += dt;
      if (S.air) { S.popT = null; S.retract = 1; }
    }
    if ((S.retract || 0) > 0) S.retract = Math.max(0, S.retract - dt * 5);
  },
  thrust(S, P, dt) {
    const h = S.h, p = S.thrust;
    every(S, 'nt', 3.2 * P.k, dt, () => P.add({ kind: 'note', x: S.x + 0.4 * h, y: S.y + 0.05 * h, vx: rnd(20, 60), vy: rnd(-70, -30), drag: 0.4, life: rnd(1.0, 1.5), size: h * rnd(0.06, 0.08), col: pick(['#FFFFFF', SUN, PINK, SKY]), two: Math.random() < 0.4, rot: rnd(-0.3, 0.3), ph: Math.random() * 6 }));
    every(S, 'pf', 10 * p * P.k, dt, () => P.add({ kind: 'glow', x: S.x + rnd(-0.12, 0.12) * h, y: S.y + 0.47 * h, vx: rnd(-40, 40), vy: rnd(60, 140), drag: 2, life: rnd(0.3, 0.6), size: h * rnd(0.015, 0.03), col: pick(['#FFFFFF', '#D9CCFF', SUN]), layer: 'back' }));
  },
  land(S, P) {
    S.popT = 0; S.retract = 0;
    dust(S, P, S.dust, 10);
    burst(P, S.x + 0.03 * S.h, S.y - 0.55 * S.h, 14, [SUN, '#FFFFFF', '#A88BFF', PINK], { kind: 'star5', size: [S.h * 0.035, S.h * 0.06], g: 160, sp: 200 });
    for (let i = 0; i < Math.round(4 * P.k) + 1; i++) P.add({ kind: 'note', x: S.x + rnd(-0.2, 0.3) * S.h, y: S.y - 0.3 * S.h, vx: rnd(-60, 60), vy: rnd(-120, -60), drag: 0.8, life: 1.2, size: S.h * 0.07, col: pick(['#FFFFFF', SUN, PINK]), two: i % 2 === 0, rot: rnd(-0.3, 0.3), ph: i });
  },
  idle(S, P, dt) {
    every(S, 'nt', 0.7 * P.k, dt, () => P.add({ kind: 'note', x: S.x + 0.4 * S.h, y: S.y + 0.05 * S.h, vx: rnd(10, 30), vy: rnd(-40, -25), drag: 0.3, life: 1.6, size: S.h * 0.06, col: pick(['#FFFFFF', SUN, PINK]), two: Math.random() < 0.4, ph: Math.random() * 6 }));
  },
};

// Sunflower Copter (D-073): a flower pot that flies like a helicopter; the sunflower is the rotor.
function sunHead(ctx, h, lw, ang, fast, open = 1) {
  if (fast > 0.05) {
    ctx.save(); ctx.globalAlpha = 0.35 * fast; ctx.beginPath(); ctx.arc(0, 0, 0.2 * h, 0, TAU); ctx.fillStyle = SUN; ctx.fill(); ctx.restore();
  }
  ctx.globalAlpha = 1 - 0.45 * fast;
  for (let i = 0; i < 12; i++) {
    ctx.save(); ctx.rotate(ang + i * TAU / 12); ctx.translate(0, -0.115 * h * open);
    ctx.beginPath(); ctx.ellipse(0, 0, 0.034 * h, 0.07 * h, 0, 0, TAU); ctx.fillStyle = i % 2 ? '#FFD23F' : SUN; ctx.fill(); outline(ctx, lw * 0.55);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  ctx.beginPath(); ctx.arc(0, 0, 0.085 * h, 0, TAU); ctx.fillStyle = grad(ctx, -0.08 * h, -0.08 * h, 0.08 * h, 0.08 * h, ['#9A6236', '#7A4A2A', '#5A3418']); ctx.fill(); outline(ctx, lw * 0.75);
  ctx.fillStyle = '#3E220E';
  for (let i = 0; i < 9; i++) { const a = ang * 0.5 + i * 2.4, r = 0.022 * h * Math.sqrt(i + 0.5); ctx.beginPath(); ctx.arc(Math.cos(a) * r, Math.sin(a) * r, 0.009 * h, 0, TAU); ctx.fill(); }
}
function beeAt(u) {
  // a loop round Bip's head: in from the right, round, and away up to the left (units of h)
  if (u < 0.15) { const k = u / 0.15; return [lerp(0.34, 0.09, k), lerp(-0.5, -0.12, k)]; }
  if (u < 0.78) { const a = ((u - 0.15) / 0.63) * TAU; return [-0.11 + 0.2 * Math.cos(a), -0.12 - 0.17 * Math.sin(a)]; }
  const k = (u - 0.78) / 0.22; return [lerp(0.09, -0.42, k), lerp(-0.12, -0.62, k)];
}
const sunflower = {
  id: 'sunflower',
  look: 'A flower pot that flies like a helicopter: the sunflower spins round as its rotor, shedding the odd petal. Bip peeps over the rim; on landing the flower slows and nods, and a bee buzzes a loop round Bip.',
  fw: [[SUN, '#FFFFFF', '#3FBF6A'], [CORAL, SUN, MINT], ['#FFD23F', '#FF9F43', '#FFFFFF']],
  conf: [SUN, '#3FBF6A', CORAL, '#FFFFFF', '#FF9F43'],
  seat() { return { x: -0.11, y: 0.13, s: 0.3 }; },
  draw(ctx, S, t) {
    const h = S.h, lw = lwOf(h), k = ease.back(clamp(S.legs, 0, 1));
    // three little feet and the saucer
    for (const fx of [-0.15, 0, 0.15]) {
      const fy = lerp(0.42, 0.465, k) * h;
      rr(ctx, (fx - 0.035) * h, fy - 0.035 * h, 0.07 * h, 0.07 * h, 0.02 * h); ctx.fillStyle = '#B85433'; ctx.fill(); outline(ctx, lw * 0.7);
    }
    rr(ctx, -0.25 * h, 0.375 * h, 0.5 * h, 0.065 * h, 0.03 * h); ctx.fillStyle = grad(ctx, 0, 0.375 * h, 0, 0.44 * h, ['#E07A4E', '#B85433']); ctx.fill(); outline(ctx, lw);
    // the stem and its leaves (flapping as it flies)
    const n = S.nodT == null ? 0 : (S.nodT < 0.3 ? ease.out(S.nodT / 0.3) : Math.max(0, 1 - (S.nodT - 1.3) / 0.6)) * (1 + 0.12 * Math.sin((S.nodT || 0) * 9));
    const hx = 0.05 * n * h, hy = (-0.31 + 0.03 * n) * h;
    ctx.beginPath(); ctx.moveTo(0.06 * h, 0.06 * h); ctx.quadraticCurveTo(0.1 * h, -0.13 * h, hx, hy);
    ctx.lineWidth = 0.042 * h + lw * 2; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 0.042 * h; ctx.strokeStyle = '#3FBF6A'; ctx.stroke();
    const flap = S.air ? Math.sin(t * 22) * 0.35 * S.thrust : S.idle ? Math.sin(t * 2) * 0.08 : 0;
    for (const [x, y, s, a] of [[0.085, -0.04, 1, 0.3], [0.095, -0.13, 1, -0.45]]) {
      ctx.save(); ctx.translate(x * h, y * h); ctx.rotate(a + s * flap); ctx.scale(s, 1);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(0.08 * h, -0.08 * h, 0.17 * h, -0.015 * h); ctx.quadraticCurveTo(0.08 * h, 0.05 * h, 0, 0); ctx.closePath();
      ctx.fillStyle = '#5FD47C'; ctx.fill(); outline(ctx, lw * 0.75);
      ctx.beginPath(); ctx.moveTo(0.01 * h, 0); ctx.quadraticCurveTo(0.08 * h, -0.02 * h, 0.14 * h, -0.015 * h); ctx.lineWidth = lw * 0.5; ctx.strokeStyle = '#2E9C55'; ctx.stroke();
      ctx.restore();
    }
    // Bip, peeping over the rim
    if (S.pilotIn !== false) drawPilotHead(ctx, -0.11 * h, -0.07 * h, 0.1 * h, { blink: S.blink || 0, mood: S.mood || 'happy', look: S.look || 0, t });
    // the pot, with a daisy painted on, and its rim
    poly(ctx, [[-0.23, 0.07], [0.23, 0.07], [0.175, 0.385], [-0.175, 0.385]], h);
    ctx.fillStyle = grad(ctx, -0.23 * h, 0, 0.23 * h, 0, ['#F59466', '#E07A4E', '#C25E36']); ctx.fill(); outline(ctx, lw);
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 6; i++) { ctx.save(); ctx.translate(0, 0.22 * h); ctx.rotate(i * TAU / 6 + (S.idle ? t * 0.3 : 0)); ctx.beginPath(); ctx.ellipse(0, -0.04 * h, 0.018 * h, 0.036 * h, 0, 0, TAU); ctx.fill(); ctx.restore(); }
    ctx.beginPath(); ctx.arc(0, 0.22 * h, 0.02 * h, 0, TAU); ctx.fillStyle = SUN; ctx.fill();
    rr(ctx, -0.27 * h, -0.01 * h, 0.54 * h, 0.09 * h, 0.025 * h); ctx.fillStyle = grad(ctx, 0, -0.01 * h, 0, 0.08 * h, ['#FFB28A', '#F49A6E']); ctx.fill(); outline(ctx, lw);
    if (S.pilotIn !== false) for (const x of [-0.18, -0.04]) { ctx.beginPath(); ctx.arc(x * h, -0.005 * h, 0.026 * h, 0, TAU); ctx.fillStyle = MINT; ctx.fill(); outline(ctx, lw * 0.7); }
    // the sunflower, spinning as the rotor
    const fast = clamp(((S.rotorV || 0) - 4) / 10, 0, 1);
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(0.5 * n);
    sunHead(ctx, h, lw, S.rotor || 0, fast);
    ctx.restore();
    if (fast > 0.2) {
      ctx.save(); ctx.globalAlpha = 0.8 * fast; ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = lw * 0.9; ctx.lineCap = 'round';
      for (const a0 of [0.2, Math.PI + 0.2]) { ctx.beginPath(); ctx.arc(hx, hy, 0.235 * h, a0 + (S.rotor || 0) * 0.15, a0 + 0.9 + (S.rotor || 0) * 0.15); ctx.stroke(); }
      ctx.restore();
    }
    // the bee, after landing
    if (S.beeT != null && S.beeT < 2) {
      const u = S.beeT / 2, [bx, by] = beeAt(u);
      ctx.save(); ctx.setLineDash([0.012 * h, 0.022 * h]); ctx.lineWidth = lw * 0.6; ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.beginPath();
      for (let i = 0; i <= 14; i++) { const [x, y] = beeAt(Math.max(0, u - 0.22 + (i / 14) * 0.22)); if (i) ctx.lineTo(x * h, y * h); else ctx.moveTo(x * h, y * h); }
      ctx.stroke(); ctx.restore();
      const [px, py] = beeAt(Math.max(0, u - 0.01)), dir = bx >= px ? 1 : -1;
      ctx.save(); ctx.translate(bx * h, by * h); ctx.scale(dir, 1);
      const w = Math.sin(t * 60) * 0.4;
      ctx.scale(1.6, 1.6);
      ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = lw * 0.5; ctx.strokeStyle = INK;
      for (const s of [-1, 1]) { ctx.save(); ctx.rotate(s * (0.5 + w)); ctx.beginPath(); ctx.ellipse(-0.005 * h, -0.035 * h, 0.018 * h, 0.03 * h, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore(); }
      ctx.beginPath(); ctx.ellipse(0, 0, 0.04 * h, 0.028 * h, 0, 0, TAU); ctx.fillStyle = SUN; ctx.fill(); outline(ctx, lw * 0.6);
      ctx.save(); ctx.clip(); ctx.fillStyle = INK; ctx.fillRect(-0.016 * h, -0.04 * h, 0.012 * h, 0.08 * h); ctx.fillRect(0.008 * h, -0.04 * h, 0.012 * h, 0.08 * h); ctx.restore();
      ctx.beginPath(); ctx.ellipse(0, 0, 0.04 * h, 0.028 * h, 0, 0, TAU); outline(ctx, lw * 0.6);
      ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(0.026 * h, -0.006 * h, 0.006 * h, 0, TAU); ctx.fill();
      ctx.restore();
    }
  },
  tick(S, dt) {
    const want = S.air ? 6 + 20 * S.thrust : S.idle ? 1.4 : 0;
    S.rotorV = (S.rotorV || 0) + (Math.min(want, S.calm ? 2 : 99) - (S.rotorV || 0)) * Math.min(1, dt * (want > (S.rotorV || 0) ? 4 : 1.3));
    S.rotor = (S.rotor || 0) + dt * (S.rotorV || 0);
    if (S.nodT != null) { S.nodT += dt; if (S.nodT > 2) S.nodT = null; }
    if (S.beeT != null) { S.beeT += dt; if (S.beeT > 2) S.beeT = null; }
    if (S.air && S.thrust > 0.3) { S.nodT = null; }
  },
  thrust(S, P, dt) {
    const h = S.h, p = S.thrust;
    every(S, 'pt', 3 * p * P.k, dt, () => P.add({ kind: 'petal', x: S.x + rnd(-0.15, 0.15) * h, y: S.y - 0.3 * h, vx: rnd(-90, 90), vy: rnd(30, 90), g: 30, drag: 1.4, life: rnd(1.0, 1.5), size: h * rnd(0.03, 0.045), col: pick([SUN, '#FFD23F']), rot: Math.random() * 6, vr: rnd(-5, 5), ph: Math.random() * 6 }));
    every(S, 'dw', 12 * p * P.k, dt, () => { const s = Math.random() < 0.5 ? -1 : 1; P.add({ kind: 'smoke', x: S.x + s * rnd(0.05, 0.2) * h, y: S.y + 0.46 * h, vx: s * rnd(60, 160), vy: rnd(30, 90), drag: 2.5, life: rnd(0.4, 0.7), size: h * rnd(0.025, 0.045), grow: h * 0.1, col: '#F7F3FF', a: 0.55, layer: 'back' }); });
  },
  land(S, P) {
    S.nodT = 0; S.beeT = 0;
    dust(S, P, S.dust, 10);
    for (let i = 0; i < Math.round(8 * P.k) + 2; i++) P.add({ kind: 'petal', x: S.x + rnd(-0.18, 0.18) * S.h, y: S.y - 0.31 * S.h, vx: rnd(-140, 140), vy: rnd(-160, -40), g: 220, drag: 1.2, life: rnd(1, 1.4), size: S.h * rnd(0.032, 0.045), col: pick([SUN, '#FFD23F']), rot: Math.random() * 6, vr: rnd(-6, 6), ph: Math.random() * 6 });
  },
  idle(S, P, dt) {
    every(S, 'pt', 0.6 * P.k, dt, () => P.add({ kind: 'petal', x: S.x + rnd(-0.15, 0.15) * S.h, y: S.y - 0.3 * S.h, vx: rnd(-20, 20), vy: 25, g: 10, life: 2.2, size: S.h * 0.035, col: SUN, rot: Math.random() * 6, vr: rnd(-2, 2), ph: Math.random() * 6, sway: 2, swayAmp: 20 }));
  },
};

// Spin Cycle (D-073): a washing machine that flies; Bip whirls round in the window with the socks.
const spin = {
  id: 'spin',
  look: 'A washing machine that flies on puffs of suds, one sock stuck in its door. Bip whirls round in the window with the socks; on landing it shakes to a stop, CLUNK, and the door swings open.',
  fw: [[SKY, '#FFFFFF', CORAL], ['#4F7BEA', '#FFFFFF', SUN], [MINT, SKY, '#FFFFFF']],
  conf: ['#4F7BEA', CORAL, '#FFFFFF', SKY, SUN],
  seat(S) { return (S.door || 0) > 0.5 ? { x: 0.03, y: 0.33, s: 0.36 } : { x: 0, y: 0.3, s: 0.32 }; },
  draw(ctx, S, t) {
    const h = S.h, lw = lwOf(h), k = ease.back(clamp(S.legs, 0, 1)), sh = S.calm ? 0 : S.shake || 0;
    // four little feet (two seen)
    for (const s of [-1, 1]) {
      const fy = lerp(0.4, 0.46, k) * h;
      rr(ctx, (s * 0.23 - 0.03) * h, 0.38 * h, 0.06 * h, fy - 0.38 * h, 0.01 * h); ctx.fillStyle = '#9FA6BF'; ctx.fill(); outline(ctx, lw * 0.6);
      rr(ctx, (s * 0.23 - 0.06) * h, fy, 0.12 * h, 0.04 * h, 0.02 * h); ctx.fillStyle = '#3A3560'; ctx.fill(); outline(ctx, lw * 0.6);
    }
    ctx.save();
    if (sh > 0.01) { ctx.translate(Math.sin(t * 71) * 0.012 * h * sh, Math.cos(t * 53) * 0.008 * h * sh); ctx.rotate(Math.sin(t * 37) * 0.035 * sh); }
    // the machine
    rr(ctx, -0.32 * h, -0.43 * h, 0.64 * h, 0.84 * h, 0.07 * h); ctx.fillStyle = grad(ctx, -0.32 * h, 0, 0.32 * h, 0, ['#FFFFFF', '#F1EEFF', '#D9D3F0']); ctx.fill(); outline(ctx, lw);
    ctx.beginPath(); ctx.moveTo(-0.32 * h, -0.27 * h); ctx.lineTo(0.32 * h, -0.27 * h); outline(ctx, lw * 0.7);
    ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillRect(-0.28 * h, -0.2 * h, 0.03 * h, 0.5 * h);
    rr(ctx, -0.27 * h, -0.38 * h, 0.17 * h, 0.075 * h, 0.015 * h); ctx.fillStyle = '#F1F2F8'; ctx.fill(); outline(ctx, lw * 0.6);
    ctx.beginPath(); ctx.moveTo(-0.23 * h, -0.343 * h); ctx.lineTo(-0.14 * h, -0.343 * h); ctx.lineWidth = lw * 0.7; ctx.strokeStyle = INK; ctx.stroke();
    const run = S.air || S.idle || (S.wcT != null && S.wcT < 0.35);
    glow(ctx, 0.0, -0.34 * h, 0.05 * h, MINT, run && Math.sin(t * 6) > 0 ? 0.9 : 0.1);
    glow(ctx, 0.07 * h, -0.34 * h, 0.05 * h, CORAL, run && Math.sin(t * 6) <= 0 ? 0.9 : 0.1);
    for (const [x, col] of [[0, MINT], [0.07, CORAL]]) { ctx.beginPath(); ctx.arc(x * h, -0.34 * h, 0.022 * h, 0, TAU); ctx.fillStyle = col; ctx.fill(); outline(ctx, lw * 0.5); }
    // the dial: dots, no numbers
    ctx.beginPath(); ctx.arc(0.21 * h, -0.34 * h, 0.05 * h, 0, TAU); ctx.fillStyle = '#FFFFFF'; ctx.fill(); outline(ctx, lw * 0.6);
    const da = -0.8 + (S.drum || 0) * 0.15;
    ctx.beginPath(); ctx.moveTo(0.21 * h, -0.34 * h); ctx.lineTo(0.21 * h + Math.cos(da) * 0.035 * h, -0.34 * h + Math.sin(da) * 0.035 * h); ctx.lineWidth = lw * 0.8; ctx.strokeStyle = INK; ctx.stroke();
    ctx.fillStyle = INK; for (let i = 0; i < 5; i++) { const a = Math.PI * (1.1 + i * 0.2); ctx.beginPath(); ctx.arc(0.21 * h + Math.cos(a) * 0.072 * h, -0.34 * h + Math.sin(a) * 0.072 * h, 0.008 * h, 0, TAU); ctx.fill(); }
    // the door: shut with the wash whirling, or swung open with Bip leaning out
    const cx = 0, cy = 0.08 * h, R = 0.235 * h, r = 0.17 * h, op = S.door || 0, ang = S.calm ? 0 : S.drum || 0;
    ctx.beginPath(); ctx.arc(cx, cy, R * 1.04, 0, TAU); ctx.fillStyle = '#E3E0F2'; ctx.fill(); outline(ctx, lw * 0.6);
    if (op > 0.02) {
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fillStyle = '#3B3561'; ctx.fill(); outline(ctx, lw * 0.8);
      ctx.fillStyle = '#5E5790'; for (let i = 0; i < 10; i++) { const a = i * TAU / 10 + 0.3; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r * 0.72, cy + Math.sin(a) * r * 0.72, 0.012 * h, 0, TAU); ctx.fill(); }
      ctx.save(); ctx.translate(cx - 0.04 * h, cy + 0.08 * h); ctx.rotate(-0.3); sockShape(ctx, 0.08 * h, CORAL); ctx.restore();
      if (S.pilotIn !== false && op > 0.4) {
        const dz = S.wcT != null && S.wcT < 1.4 ? Math.sin(S.wcT * 10) * 0.15 : 0;
        drawPilotHead(ctx, cx + 0.03 * h, cy - 0.02 * h, 0.1 * h, { blink: S.blink || 0, mood: 'oh', look: dz, t });
        ctx.save(); ctx.translate(cx + 0.0 * h, cy - 0.17 * h); ctx.rotate(-1.3 + dz); sockShape(ctx, 0.09 * h, '#FFFFFF', '#4F7BEA'); ctx.restore();
        for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(cx + s * 0.12 * h, cy + 0.08 * h, 0.026 * h, 0, TAU); ctx.fillStyle = MINT; ctx.fill(); outline(ctx, lw * 0.6); }
      }
      foam(ctx, h, [[-0.08, 0.19, 0.03], [-0.02, 0.205, 0.035], [0.05, 0.2, 0.03], [0.1, 0.185, 0.025]], lw * 0.6);
    }
    const phi = op * 1.95, cz = Math.cos(phi), dx = -R + R * cz;
    ctx.save(); ctx.translate(cx + dx, cy); ctx.scale(Math.max(0.06, Math.abs(cz)), 1);
    ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fillStyle = grad(ctx, -R, -R, R, R, SILVER); ctx.fill(); outline(ctx, lw / Math.max(0.3, Math.abs(cz)));
    if (cz > 0.15) {
      ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.clip();
      ctx.fillStyle = '#C9F1FF'; ctx.fillRect(-r, -r, r * 2, r * 2);
      const wave = Math.sin(t * 5) * 0.02 * h;
      ctx.beginPath(); ctx.moveTo(-r, 0.03 * h + wave); ctx.quadraticCurveTo(0, -0.01 * h - wave, r, 0.03 * h + wave); ctx.lineTo(r, r); ctx.lineTo(-r, r); ctx.closePath(); ctx.fillStyle = 'rgba(95,180,240,.75)'; ctx.fill();
      if (op < 0.02) {
        for (const [a0, col, st] of [[0, CORAL, null], [Math.PI, '#FFFFFF', '#4F7BEA'], [Math.PI * 0.5, SUN, null]]) {
          ctx.save(); ctx.rotate(ang + a0); ctx.translate(0.1 * h, 0); ctx.rotate(ang * 1.5); sockShape(ctx, 0.06 * h, col, st); ctx.restore();
        }
        if (S.pilotIn !== false) { ctx.save(); ctx.rotate(ang); drawPilotHead(ctx, 0, 0, 0.085 * h, { blink: S.blink || 0, mood: S.air ? 'oh' : S.mood || 'happy', look: 0, t }); ctx.restore(); }
        ctx.fillStyle = '#FFFFFF'; for (const [x, y, rr0] of [[-0.11, 0.06, 0.016], [0.1, 0.09, 0.02], [-0.03, 0.12, 0.014], [0.06, -0.08, 0.012]]) { ctx.beginPath(); ctx.arc(x * h, y * h, rr0 * h, 0, TAU); ctx.fill(); }
      }
      ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.beginPath(); ctx.arc(0, 0, r * 0.82, Math.PI * 1.05, Math.PI * 1.45); ctx.arc(0, 0, r * 0.6, Math.PI * 1.45, Math.PI * 1.05, true); ctx.fill();
      ctx.restore();
      ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); outline(ctx, lw * 0.8 / Math.max(0.3, cz));
      rr(ctx, R * 0.82, -0.05 * h, 0.05 * h, 0.1 * h, 0.02 * h); ctx.fillStyle = '#E8ECF7'; ctx.fill(); outline(ctx, lw * 0.6);
    }
    ctx.restore();
    // a sock stuck in the door, flapping like a flag
    if (op < 0.02 && S.air) {
      ctx.save(); ctx.translate(0.19 * h, 0.22 * h); ctx.rotate(-1.9 + Math.sin(t * 16) * 0.45 * (0.4 + 0.6 * S.thrust)); sockShape(ctx, 0.085 * h, '#FFFFFF', '#4F7BEA'); ctx.restore();
    }
    ctx.restore();
    // a sock flung out as the door opens
    if (S.wcT != null && S.wcT > 0.3 && S.wcT < 1.1) {
      const v = (S.wcT - 0.3) / 0.8;
      ctx.save(); ctx.globalAlpha = Math.min(1, (1 - v) * 3); ctx.translate((0.05 + 0.45 * v) * h, (0.05 - 0.9 * v + 0.7 * v * v) * h); ctx.rotate(v * 8); sockShape(ctx, 0.08 * h, CORAL); ctx.restore();
    }
  },
  tick(S, dt) {
    if (S.wcT != null) { S.wcT += dt; if (S.air) S.wcT = null; }
    const want = S.wcT != null && S.wcT > 0.28 ? 1 : 0;
    S.door = (S.door || 0) + (want - (S.door || 0)) * Math.min(1, dt * (want ? 9 : 14));
    const landed = S.wcT != null;
    S.shake = landed ? Math.max(0, 1 - S.wcT / 0.32) : S.air ? 0.3 * S.thrust : 0;
    const spinWant = landed ? 0 : S.air ? 5 + 9 * S.thrust : S.idle ? 1 : 0;
    S.drumV = (S.drumV || 0) + (spinWant - (S.drumV || 0)) * Math.min(1, dt * (landed ? 5 : 2));
    S.drum = (S.drum || 0) + dt * (S.drumV || 0);
  },
  thrust(S, P, dt) {
    const h = S.h, p = S.thrust;
    every(S, 'sd', 11 * p * P.k, dt, () => P.add({ kind: 'steam', x: S.x + rnd(-0.18, 0.18) * h, y: S.y + 0.45 * h, vx: rnd(-50, 50), vy: rnd(60, 140), drag: 2.2, g: -50, life: rnd(0.5, 0.9), size: h * rnd(0.04, 0.065), grow: h * 0.1, layer: 'back' }));
    every(S, 'sb', 3 * p * P.k, dt, () => P.add({ kind: 'bubble', x: S.x + rnd(-0.2, 0.2) * h, y: S.y + 0.44 * h, vx: rnd(-40, 40), vy: rnd(40, 90), drag: 1, life: rnd(0.6, 1), size: h * rnd(0.02, 0.035), sway: 3, swayAmp: 18, layer: 'back' }));
  },
  land(S, P) {
    S.wcT = 0;
    dust(S, P, S.dust, 12);
    for (let i = 0; i < Math.round(8 * P.k) + 2; i++) P.add({ kind: 'bubble', x: S.x + rnd(-0.1, 0.15) * S.h, y: S.y + 0.05 * S.h, vx: rnd(-60, 80), vy: rnd(-120, -50), drag: 0.8, life: rnd(0.9, 1.5), size: S.h * rnd(0.025, 0.05), sway: 3, swayAmp: 20, delay: 0.3 + i * 0.04 });
  },
  idle(S, P, dt) {
    every(S, 'sb', 0.8 * P.k, dt, () => P.add({ kind: 'bubble', x: S.x + rnd(-0.1, 0.1) * S.h, y: S.y + 0.0 * S.h, vy: -30, drag: 0.3, life: 1.8, size: S.h * 0.03, sway: 2.5, swayAmp: 14 }));
  },
};

// Christmas Tree (D-073, as Rob changed it): Bip holds on to the top while it flies, the star in
// his other hand; on landing he puts the star on the top, it lights, and he climbs down a ladder.
const TREE_TIERS = [[-0.04, 0.22, 0.3], [-0.2, 0.06, 0.235], [-0.355, -0.1, 0.165]];
const TREE_LIGHTS = [[-0.2, 0.15], [-0.07, 0.17], [0.07, 0.17], [0.2, 0.14], [-0.15, 0.0], [0.0, 0.02], [0.14, -0.01], [-0.08, -0.15], [0.07, -0.16], [0.0, -0.27]];
const LIGHT_COLS = ['#FFE14D', '#FF6B81', '#8CF5FF', '#7CFF6B'];
function treeLadder(S) {
  const s = S.side || 1;
  return { top: { x: s * 0.13, y: -0.18 }, foot: { x: s * 0.4, y: 0.5 } };
}
// Bip on the tree, in units of h: flying, he holds the top and streams out in the wind; standing
// before he's landed, he dangles from the top; once landed, he stands on the ladder's top.
// th turns him (his head towards the top); hand is his free hand, holding the star.
function treePose(S, t) {
  const L = treeLadder(S);
  if (S.tadaT != null && !S.air) return { kind: 'ladder', fx: L.top.x, fy: L.top.y, th: 0, hand: { x: L.top.x + (S.side || 1) * 0.07, y: L.top.y - 0.33 } };
  const s = 0.3, d = 0.98 * s, wind = !!S.air;
  const th = wind ? 1.15 + (S.calm ? 0.04 : 0.13) * Math.sin(t * 13) * (0.4 + 0.6 * S.thrust) : 0.35 + (S.calm ? 0 : 0.05 * Math.sin(t * 2));
  const fx = -0.02 - d * Math.sin(th), fy = -0.36 + d * Math.cos(th);
  const hx = -0.1185 * s, hy = -0.211 * s, c = Math.cos(th), sn = Math.sin(th); // drawPilot's left hand
  return { kind: wind ? 'wind' : 'dangle', fx, fy, th, hand: { x: fx + hx * c - hy * sn - 0.02, y: fy + hx * sn + hy * c - 0.03 } };
}
function treeStar(S, t, h) {
  // where the star is: in Bip's hand until he's landed, then on the top
  const top = { x: 0, y: -0.425 * h, on: true };
  if (S.pilotIn === false) return top;
  const P = treePose(S, t);
  if (P.kind !== 'ladder') return { x: P.hand.x * h, y: P.hand.y * h, on: false };
  if (S.tadaT < 0.3) { const k = ease.inOut(clamp((S.tadaT - 0.1) / 0.2, 0, 1)); return { x: lerp(P.hand.x * h, top.x, k), y: lerp(P.hand.y * h, top.y, k), on: k >= 1 }; }
  return top;
}
const tree = {
  id: 'tree',
  look: 'A little fir tree flying out of a wrapped gift box, lights twinkling. Bip holds on to the top with the star in his other hand; on landing he puts the star on the top, it lights up, and he climbs down a ladder.',
  fw: [['#2FA36B', SUN, '#FFFFFF'], ['#E8443A', '#FFFFFF', SUN], [SUN, '#7CFF6B', SKY]],
  conf: ['#2FA36B', '#E8443A', SUN, '#FFFFFF', SKY],
  seat(S) { const P = treePose(S, 0); return { x: P.fx, y: P.fy, s: 0.3 }; },
  ladder(S) { return treeLadder(S); },
  draw(ctx, S, t) {
    const h = S.h, lw = lwOf(h), side = S.side || 1, lit = S.lit || 0;
    // the gift box it flies out of
    rr(ctx, -0.17 * h, 0.31 * h, 0.34 * h, 0.19 * h, 0.02 * h); ctx.fillStyle = grad(ctx, -0.17 * h, 0, 0.17 * h, 0, ['#FF6A5E', '#E8443A', '#C2332B']); ctx.fill(); outline(ctx, lw);
    ctx.fillStyle = grad(ctx, -0.03 * h, 0, 0.03 * h, 0, GOLD); ctx.fillRect(-0.03 * h, 0.31 * h, 0.06 * h, 0.19 * h);
    ctx.beginPath(); ctx.rect(-0.03 * h, 0.31 * h, 0.06 * h, 0.19 * h); outline(ctx, lw * 0.5);
    // the trunk and the three tiers, with snow, garland, baubles and lights
    rr(ctx, -0.035 * h, 0.18 * h, 0.07 * h, 0.12 * h, 0.01 * h); ctx.fillStyle = '#8E5A34'; ctx.fill(); outline(ctx, lw * 0.7);
    TREE_TIERS.forEach(([yt, yb, hw]) => {
      const path = () => { ctx.beginPath(); ctx.moveTo(0, yt * h); ctx.lineTo(hw * h, yb * h); ctx.quadraticCurveTo(0, (yb + 0.05) * h, -hw * h, yb * h); ctx.closePath(); };
      path(); ctx.fillStyle = '#2FA36B'; ctx.fill();
      ctx.save(); path(); ctx.clip();
      ctx.fillStyle = '#24865A'; ctx.beginPath(); ctx.moveTo(0, yt * h); ctx.lineTo(-hw * h, yb * h); ctx.lineTo(-hw * 0.15 * h, (yb + 0.05) * h); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      for (let i = 0; i <= 8; i++) { const u = i / 8, x = lerp(-hw, hw, u) * h, y = (yb + 0.05 * 4 * u * (1 - u) * 0.5) * h; ctx.beginPath(); ctx.arc(x, y, 0.022 * h, 0, TAU); ctx.fill(); }
      ctx.restore();
      path(); outline(ctx, lw);
    });
    ctx.lineWidth = lw * 0.8; ctx.strokeStyle = GOLD[1];
    ctx.beginPath(); ctx.moveTo(-0.22 * h, 0.04 * h); ctx.quadraticCurveTo(0, 0.13 * h, 0.22 * h, 0.02 * h); ctx.moveTo(-0.16 * h, -0.11 * h); ctx.quadraticCurveTo(0, -0.04 * h, 0.15 * h, -0.13 * h); ctx.stroke();
    for (const [x, y, c] of [[-0.19, 0.17, CORAL], [0.13, 0.18, SKY], [-0.02, 0.05, SUN], [-0.12, -0.03, PINK], [0.1, -0.05, CORAL], [0.0, -0.21, SKY], [-0.06, -0.17, SUN]]) {
      ctx.beginPath(); ctx.arc(x * h, y * h, 0.028 * h, 0, TAU); ctx.fillStyle = c; ctx.fill(); outline(ctx, lw * 0.5);
      ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.beginPath(); ctx.arc((x - 0.009) * h, (y - 0.009) * h, 0.008 * h, 0, TAU); ctx.fill();
    }
    TREE_LIGHTS.forEach(([x, y], i) => {
      const tw = 0.5 + 0.5 * Math.sin(t * (S.calm ? 2 : 6) + i * 1.7), a = Math.min(1, 0.45 + 0.55 * tw + lit);
      glow(ctx, x * h, y * h, (0.035 + 0.03 * lit) * h, LIGHT_COLS[i % 4], a * 0.8);
      ctx.beginPath(); ctx.arc(x * h, y * h, 0.014 * h, 0, TAU); ctx.fillStyle = LIGHT_COLS[i % 4]; ctx.fill();
    });
    // the bow on the box, in front of the trunk
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, 0.31 * h); ctx.quadraticCurveTo(s * 0.11 * h, 0.22 * h, s * 0.11 * h, 0.3 * h); ctx.quadraticCurveTo(s * 0.06 * h, 0.33 * h, 0, 0.31 * h); ctx.fillStyle = GOLD[1]; ctx.fill(); outline(ctx, lw * 0.6); }
    ctx.beginPath(); ctx.arc(0, 0.31 * h, 0.022 * h, 0, TAU); ctx.fillStyle = GOLD[2]; ctx.fill(); outline(ctx, lw * 0.5);
    // the ladder, leaning on the tree once landed
    const lk = S.ladK || 0;
    if (lk > 0.01) {
      const L = treeLadder(S), tx = L.top.x * h, ty = L.top.y * h, fx = L.foot.x * h, fy = L.foot.y * h;
      const bx = lerp(tx, fx, lk), by = lerp(ty, fy, lk);
      const nx = (fy - ty), ny = -(fx - tx), nl = Math.hypot(nx, ny), ox = (nx / nl) * 0.055 * h, oy = (ny / nl) * 0.055 * h;
      ctx.lineCap = 'round';
      for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(tx + s * ox, ty + s * oy); ctx.lineTo(bx + s * ox, by + s * oy); ctx.lineWidth = 0.016 * h + lw * 1.4; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 0.016 * h; ctx.strokeStyle = '#D9A06A'; ctx.stroke(); }
      for (let i = 1; i <= 8; i++) { const u = (i - 0.5) / 8; if (u > lk) break; const x = lerp(tx, fx, u), y = lerp(ty, fy, u); ctx.beginPath(); ctx.moveTo(x - ox * 0.85, y - oy * 0.85); ctx.lineTo(x + ox * 0.85, y + oy * 0.85); ctx.lineWidth = lw * 2.2; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = lw * 0.9; ctx.strokeStyle = '#C98A5A'; ctx.stroke(); }
    }
    // the star: in Bip's hand, or on the top and lit
    const st = treeStar(S, t, h);
    if (st.on) {
      glow(ctx, st.x, st.y, (0.14 + 0.1 * lit) * h, SUN, 0.5 + 0.5 * lit);
      if (lit > 0.02) {
        ctx.save(); ctx.translate(st.x, st.y); ctx.rotate(t * 0.8); ctx.strokeStyle = `rgba(255,236,150,${0.85 * lit})`; ctx.lineWidth = lw * 0.9; ctx.lineCap = 'round';
        for (let i = 0; i < 8; i++) { ctx.rotate(TAU / 8); ctx.beginPath(); ctx.moveTo(0.1 * h, 0); ctx.lineTo((0.15 + 0.03 * Math.sin(t * 6 + i)) * h, 0); ctx.stroke(); }
        ctx.restore();
      }
    }
    // Bip: holding the top in the wind, dangling from it, or on the ladder's top
    if (S.pilotIn !== false) {
      const P = treePose(S, t), s = 0.3 * h;
      if (P.kind === 'ladder') bipOut(ctx, S, t, P.fx * h, P.fy * h, s, { wave: S.tadaT < 0.45 || S.idle, flip: side < 0, mood: 'happy' });
      else {
        ctx.save(); ctx.translate(P.fx * h, P.fy * h); ctx.rotate(P.th);
        bipOut(ctx, S, t, 0, 0, s, { wave: true, mood: P.kind === 'wind' && S.thrust > 0.6 ? 'oh' : 'happy' });
        ctx.restore();
      }
    }
    {
      ctx.save(); ctx.translate(st.x, st.y); ctx.rotate(st.on ? Math.sin(t * 2) * 0.05 : Math.sin(t * 4) * 0.2); star5(ctx, 0.065 * h);
      ctx.fillStyle = grad(ctx, -0.06 * h, -0.06 * h, 0.06 * h, 0.06 * h, [GOLD[0], GOLD[1], GOLD[2]]); ctx.fill(); outline(ctx, lw * 0.8);
      ctx.restore();
    }
  },
  tick(S, dt) {
    if (S.tadaT != null) { S.tadaT += dt; if (S.air) S.tadaT = null; }
    const placed = S.tadaT != null && S.tadaT >= 0.3;
    S.lit = placed ? Math.max(0, 1 - (S.tadaT - 0.3) / 1.6) : Math.max(0, (S.lit || 0) - dt * 2);
    const want = S.tadaT != null && !S.air ? 1 : 0;
    S.ladK = (S.ladK || 0) + (want - (S.ladK || 0)) * Math.min(1, dt * (want ? 7 : 12));
  },
  thrust(S, P, dt) {
    const h = S.h, p = S.thrust;
    every(S, 'ts', 16 * p * P.k, dt, () => P.add({ kind: 'star', x: S.x + rnd(-0.14, 0.14) * h, y: S.y + 0.5 * h, vx: rnd(-50, 50), vy: rnd(70, 160), drag: 1.8, life: rnd(0.4, 0.8), size: h * rnd(0.02, 0.04), col: pick([SUN, '#FFFFFF', GOLD[0], '#FFE14D']), tw: 20, add: true, layer: 'back' }));
    every(S, 'sn', 7 * p * P.k, dt, () => P.add({ kind: 'smoke', x: S.x + rnd(-0.12, 0.12) * h, y: S.y + 0.5 * h, vx: rnd(-40, 40), vy: rnd(40, 100), drag: 2, life: rnd(0.5, 0.9), size: h * rnd(0.025, 0.045), grow: h * 0.08, col: '#FFFFFF', a: 0.7, layer: 'back' }));
  },
  land(S, P) {
    S.tadaT = 0;
    dust(S, P, S.dust, 10);
    burst(P, S.x, S.y - 0.42 * S.h, 16, [SUN, '#FFFFFF', '#FFE14D'], { kind: 'star', size: [S.h * 0.03, S.h * 0.06], sp: 180, g: 60, add: true, life: [0.7, 1.2] });
    for (const p of P.list.slice(-Math.max(3, Math.round(16 * P.k)))) p.delay = 0.3;
  },
  idle(S, P, dt) {
    every(S, 'sn', 1.2 * P.k, dt, () => P.add({ kind: 'star', x: S.x + rnd(-0.3, 0.3) * S.h, y: S.y + rnd(-0.45, 0.2) * S.h, vy: -10, life: 1.2, size: S.h * 0.03, col: pick(['#FFFFFF', SUN]), tw: 10, add: true }));
  },
};

// @part particles
    case 'note': {
      ctx.globalAlpha = Math.min(1, k * 2.2);
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate((p.rot || 0) + Math.sin(p.age * 4 + (p.ph || 0)) * 0.25);
      musicNote(ctx, p.size, p.col, p.two); ctx.restore();
      break;
    }
    case 'petal':
      ctx.globalAlpha = Math.min(1, k * 2.5);
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, 0.55 + 0.45 * Math.cos(p.age * 7 + (p.ph || 0)));
      ctx.beginPath(); ctx.ellipse(0, 0, p.size * 0.42, p.size, 0, 0, TAU);
      ctx.fillStyle = p.col || SUN; ctx.fill(); ctx.lineWidth = Math.max(1, p.size * 0.16); ctx.strokeStyle = INK; ctx.stroke();
      ctx.restore();
      break;
    case 'drop':
      ctx.globalAlpha = Math.min(1, k * 2.5);
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(Math.atan2(p.vx, -p.vy));
      tear(ctx, p.size * 1.7, p.size * 0.6); ctx.fillStyle = p.col || SKY; ctx.fill();
      ctx.lineWidth = Math.max(1, p.size * 0.22); ctx.strokeStyle = INK; ctx.stroke();
      ctx.restore();
      break;

// @part sounds
  splosh: (t) => { noise(t, 0.45, { from: 2200, to: 180, type: 'lowpass', volume: 0.38 }); tone(190, t, 0.3, 'sine', 0.16, 70); noise(t + 0.05, 0.3, { from: 3500, to: 900, volume: 0.1 }); tone(1500, t + 0.32, 0.09, 'square', 0.045, 1900); tone(1650, t + 0.46, 0.12, 'square', 0.045, 2100); },
  jackPop: (t) => { [1047, 1319, 1568, 1319].forEach((f, i) => { tone(f, t + i * 0.075, 0.22, 'sine', 0.07); tone(f * 2, t + i * 0.075, 0.12, 'sine', 0.02); }); noise(t + 0.33, 0.06, { from: 3000, to: 1200, volume: 0.2 }); tone(190, t + 0.33, 0.42, 'sine', 0.18, 620); tone(380, t + 0.38, 0.26, 'triangle', 0.05, 950); },
  bzzz: (t) => { tone(170, t, 0.42, 'sawtooth', 0.04, 55); noise(t, 0.42, { from: 1100, to: 200, volume: 0.1 }); tone(215, t + 0.3, 0.55, 'sawtooth', 0.04, 245); tone(222, t + 0.3, 0.55, 'square', 0.018, 236); tone(430, t + 0.3, 0.5, 'sawtooth', 0.012, 470); },
  spinClunk: (t) => { tone(320, t, 0.36, 'sawtooth', 0.035, 70); noise(t, 0.36, { from: 900, to: 160, volume: 0.13 }); tone(150, t + 0.32, 0.14, 'square', 0.08, 70); noise(t + 0.32, 0.1, { from: 1600, to: 500, volume: 0.24 }); tone(1319, t + 0.55, 0.12, 'sine', 0.07); tone(1319, t + 0.72, 0.12, 'sine', 0.07); },
  tada: (t) => { for (let i = 0; i < 6; i++) { noise(t + i * 0.055, 0.07, { from: 7000, to: 9000, type: 'highpass', volume: 0.07 }); tone(2637 + (i % 2) * 500, t + i * 0.055, 0.06, 'sine', 0.025); } [1568, 2093, 2637, 3136].forEach((f, i) => tone(f, t + 0.36 + i * 0.07, 0.5, 'sine', 0.055)); tone(523, t + 0.36, 0.6, 'triangle', 0.05); tone(784, t + 0.36, 0.6, 'triangle', 0.04); },

// @part fleet
box | { id: 'tub', name: 'Splash Tub', tier: 'fun', price: 25, sound: 'splosh', flies: true },
teapot | { id: 'jack', name: 'Jack-in-the-Box', tier: 'fun', price: 35, sound: 'jackPop', flies: true },
jack | { id: 'sunflower', name: 'Sunflower Copter', tier: 'fun', price: 40, sound: 'bzzz', flies: true },
pod | { id: 'spin', name: 'Spin Cycle', tier: 'cool', price: 60, sound: 'spinClunk', flies: true },
saucer | { id: 'tree', name: 'Christmas Tree', tier: 'cool', price: 80, sound: 'tada', flies: true },

// @part order
classic, box, tub, teapot, jack, sunflower, pod, spin, saucer, tree, crystal, phoenix, aurora
