// Word Worm art, all drawn in code: fruit and flower letter tokens, hats and stars.

export const INK = '#2B2118';
export const FONT = '"Fredoka", "Baloo 2", "Nunito", ui-rounded, "Arial Rounded MT Bold", system-ui, sans-serif';
const TAU = Math.PI * 2;

// c = main colour (also used for the word bar slot), hi/lo = light and shade.
export const FRUITS = [
  { id: 'apple', c: '#F2505D', hi: '#FFA3A8', lo: '#C2303F' },
  { id: 'orange', c: '#FF9A1F', hi: '#FFCB78', lo: '#D97100' },
  { id: 'berry', c: '#4F78E6', hi: '#A3BCFF', lo: '#2F4FB0' },
  { id: 'plum', c: '#A35FE3', hi: '#D6B0FA', lo: '#7638B5' },
  { id: 'daisy', c: '#FFC933', hi: '#FFF1A8', lo: '#E59E00' },
  { id: 'blossom', c: '#FF78B0', hi: '#FFC6DE', lo: '#DE4C8B' },
];

function shine(ctx, r) {
  ctx.beginPath();
  ctx.ellipse(-r * 0.44, -r * 0.46, r * 0.2, r * 0.11, -0.75, 0, TAU);
  ctx.fillStyle = 'rgba(255,255,255,.75)';
  ctx.fill();
}

function ball(ctx, r, c, hi, lo, lw) {
  const g = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.08, 0, 0, r);
  g.addColorStop(0, hi);
  g.addColorStop(0.55, c);
  g.addColorStop(1, lo);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = lw;
  ctx.stroke();
}

function leaf(ctx, x, y, rx, ry, rot, lw) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot, 0, TAU);
  ctx.fillStyle = '#62C04A';
  ctx.fill();
  ctx.lineWidth = lw;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - Math.cos(rot) * rx * 0.7, y - Math.sin(rot) * rx * 0.7);
  ctx.lineTo(x + Math.cos(rot) * rx * 0.6, y + Math.sin(rot) * rx * 0.6);
  ctx.strokeStyle = 'rgba(30,80,20,.45)';
  ctx.lineWidth = lw * 0.5;
  ctx.stroke();
  ctx.strokeStyle = INK;
}

function star(ctx, x, y, R, r, points = 5, rot = -Math.PI / 2) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const a = rot + (i * Math.PI) / points;
    const d = i % 2 ? r : R;
    ctx.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d);
  }
  ctx.closePath();
}

const fitCache = new Map();

// The letter or number: white with a chunky dark outline, centred on its ink.
export function drawLabel(ctx, text, r, { maxW = r * 1.5, size = r * 1.12 } = {}) {
  const key = text + '|' + Math.round(r) + '|' + Math.round(maxW);
  let fit = fitCache.get(key);
  if (!fit) {
    let s = size;
    ctx.font = `600 ${s}px ${FONT}`;
    let m = ctx.measureText(text);
    if (m.width > maxW) {
      s *= maxW / m.width;
      ctx.font = `600 ${s}px ${FONT}`;
      m = ctx.measureText(text);
    }
    const asc = m.actualBoundingBoxAscent || s * 0.7;
    const desc = m.actualBoundingBoxDescent || 0;
    fit = { s, yo: (asc - desc) / 2 };
    if (fitCache.size > 400) fitCache.clear();
    fitCache.set(key, fit);
  }
  ctx.font = `600 ${fit.s}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(4, fit.s * 0.2);
  ctx.strokeStyle = INK;
  ctx.strokeText(text, 0, fit.yo);
  ctx.fillStyle = '#fff';
  ctx.fillText(text, 0, fit.yo);
}

// Fonts arrive late (or never, offline): forget measured sizes when they do.
export function clearTextCache() { fitCache.clear(); }

/** A round letter token centred at x, y with radius r. */
export function drawToken(ctx, x, y, r, f, text, { sx = 1, sy = 1, rot = 0, alpha = 1 } = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(sx, sy);
  if (alpha < 1) ctx.globalAlpha = alpha;
  const lw = Math.max(2.5, r * 0.085);
  ctx.strokeStyle = INK;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  if (f.id === 'daisy') {
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TAU;
      ctx.beginPath();
      ctx.ellipse(Math.cos(a) * r * 0.62, Math.sin(a) * r * 0.62, r * 0.38, r * 0.18, a, 0, TAU);
      ctx.fillStyle = i % 2 ? '#FFFFFF' : '#F6F3FF';
      ctx.fill();
      ctx.lineWidth = lw * 0.8;
      ctx.stroke();
    }
    ball(ctx, r * 0.64, f.c, f.hi, f.lo, lw);
  } else if (f.id === 'blossom') {
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * TAU - Math.PI / 2;
      ctx.save();
      ctx.translate(Math.cos(a) * r * 0.54, Math.sin(a) * r * 0.54);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 0.47);
      g.addColorStop(0, f.hi);
      g.addColorStop(1, f.c);
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.47, 0, TAU);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.lineWidth = lw;
      ctx.stroke();
      ctx.restore();
    }
    ball(ctx, r * 0.58, '#FFE27A', '#FFF6C8', '#F2B92B', lw);
  } else {
    ball(ctx, r, f.c, f.hi, f.lo, lw);
    shine(ctx, r);
    if (f.id === 'apple') {
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.8);
      ctx.quadraticCurveTo(r * 0.02, -r * 1.02, r * 0.12, -r * 1.14);
      ctx.lineWidth = r * 0.17;
      ctx.stroke();
      ctx.strokeStyle = '#7A4A25';
      ctx.lineWidth = r * 0.08;
      ctx.stroke();
      ctx.strokeStyle = INK;
      leaf(ctx, r * 0.36, -r * 0.98, r * 0.3, r * 0.14, -0.45, lw * 0.9);
    } else if (f.id === 'orange') {
      ctx.fillStyle = 'rgba(190,90,0,.35)';
      [[0.5, 0.2], [0.42, 0.52], [-0.55, 0.35], [0.1, 0.62], [-0.2, 0.7]].forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.arc(dx * r, dy * r, r * 0.04, 0, TAU);
        ctx.fill();
      });
      star(ctx, 0, -r * 0.84, r * 0.17, r * 0.08, 5);
      ctx.fillStyle = '#3E9A35';
      ctx.fill();
      ctx.lineWidth = lw * 0.6;
      ctx.stroke();
      leaf(ctx, -r * 0.34, -r * 0.98, r * 0.28, r * 0.13, 0.5, lw * 0.9);
    } else if (f.id === 'berry') {
      star(ctx, 0, -r * 0.7, r * 0.26, r * 0.12, 5);
      ctx.fillStyle = '#26398F';
      ctx.fill();
      ctx.lineWidth = lw * 0.6;
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(r * 0.42, r * 0.5, r * 0.14, r * 0.08, -0.6, 0, TAU);
      ctx.fillStyle = 'rgba(255,255,255,.25)';
      ctx.fill();
    } else if (f.id === 'plum') {
      ctx.beginPath();
      ctx.moveTo(-r * 0.05, -r * 0.82);
      ctx.lineTo(-r * 0.1, -r * 1.08);
      ctx.lineWidth = r * 0.15;
      ctx.stroke();
      ctx.strokeStyle = '#6B4A2A';
      ctx.lineWidth = r * 0.07;
      ctx.stroke();
      ctx.strokeStyle = INK;
      leaf(ctx, -r * 0.42, -r * 1.0, r * 0.28, r * 0.13, 0.35, lw * 0.9);
      leaf(ctx, r * 0.25, -r * 1.04, r * 0.24, r * 0.11, -0.6, lw * 0.9);
    }
  }
  if (text) drawLabel(ctx, text, r);
  ctx.restore();
}

/** A soft round shadow on the lawn under something at height z. */
export function drawShadow(ctx, x, y, r, z = 0, alpha = 0.24) {
  ctx.beginPath();
  ctx.ellipse(x + r * 0.16 + z * 0.35, y + r * 0.24 + z * 0.8, r * 0.98 * (1 - z * 0.004), r * 0.9 * (1 - z * 0.004), 0, 0, TAU);
  ctx.fillStyle = `rgba(28,72,22,${alpha})`;
  ctx.fill();
}

// ---------- Hats ----------

const MONO = '#B9B1A4';
const MONO_LINE = '#8E8578';

/** Draws hat `id` on a head of radius Rh centred at hx, hy. mono: a grey silhouette (locked). */
export function drawHat(ctx, id, hx, hy, Rh, { mono = false } = {}) {
  if (!id) return;
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  const line = mono ? MONO_LINE : INK;
  const lw = Math.max(2, Rh * 0.1);
  ctx.strokeStyle = line;
  ctx.lineWidth = lw;

  if (id === 'party') {
    ctx.translate(hx + Rh * 0.14, hy - Rh * 0.74);
    ctx.rotate(0.2);
    const bw = Rh * 0.6, h = Rh * 1.35;
    const cone = () => {
      ctx.beginPath();
      ctx.moveTo(-bw, 0);
      ctx.quadraticCurveTo(0, Rh * 0.16, bw, 0);
      ctx.lineTo(0, -h);
      ctx.closePath();
    };
    cone();
    ctx.fillStyle = mono ? MONO : '#FF5C9A';
    ctx.fill();
    if (!mono) {
      ctx.save();
      cone();
      ctx.clip();
      ctx.fillStyle = '#FFD447';
      for (let k = -3; k < 4; k++) {
        ctx.save();
        ctx.translate(0, -h * 0.5 + k * Rh * 0.42);
        ctx.rotate(-0.5);
        ctx.fillRect(-Rh * 2, -Rh * 0.1, Rh * 4, Rh * 0.2);
        ctx.restore();
      }
      ctx.fillStyle = '#fff';
      [[-0.2, -0.3], [0.22, -0.55], [-0.05, -0.85]].forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.arc(dx * Rh, dy * Rh, Rh * 0.07, 0, TAU);
        ctx.fill();
      });
      ctx.restore();
    }
    cone();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -h, Rh * 0.2, 0, TAU);
    ctx.fillStyle = mono ? MONO : '#FFF06A';
    ctx.fill();
    ctx.stroke();
    if (!mono) {
      ctx.beginPath();
      ctx.arc(-Rh * 0.06, -h - Rh * 0.06, Rh * 0.06, 0, TAU);
      ctx.fillStyle = '#fff';
      ctx.fill();
    }
  } else if (id === 'flowers') {
    const ring = Rh * 0.93;
    ctx.beginPath();
    ctx.arc(hx, hy, ring, -2.75, -0.39);
    ctx.lineWidth = Rh * 0.16;
    ctx.strokeStyle = line;
    ctx.stroke();
    ctx.lineWidth = Rh * 0.08;
    ctx.strokeStyle = mono ? MONO : '#4E9F3B';
    ctx.stroke();
    ctx.strokeStyle = line;
    ctx.lineWidth = lw * 0.8;
    [-2.33, -1.83, -1.31, -0.81].forEach((a) => {
      ctx.save();
      ctx.translate(hx + Math.cos(a) * (ring + Rh * 0.05), hy + Math.sin(a) * (ring + Rh * 0.05));
      ctx.rotate(a + Math.PI / 2);
      ctx.beginPath();
      ctx.ellipse(0, -Rh * 0.1, Rh * 0.08, Rh * 0.15, 0, 0, TAU);
      ctx.fillStyle = mono ? MONO : '#69BF4E';
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });
    const cols = ['#FF7FB5', '#FFD447', '#FFFFFF', '#B08CF0', '#FF9550'];
    [-2.6, -2.08, -1.57, -1.06, -0.54].forEach((a, i) => {
      const fx = hx + Math.cos(a) * ring, fy = hy + Math.sin(a) * ring;
      const pr = Rh * (i === 2 ? 0.15 : 0.13);
      for (let k = 0; k < 5; k++) {
        const pa = (k / 5) * TAU + i;
        ctx.beginPath();
        ctx.arc(fx + Math.cos(pa) * pr, fy + Math.sin(pa) * pr, pr * 0.85, 0, TAU);
        ctx.fillStyle = mono ? MONO : cols[i];
        ctx.fill();
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(fx, fy, pr * 0.62, 0, TAU);
      ctx.fillStyle = mono ? MONO : i === 1 ? '#FF9550' : '#FFD447';
      ctx.fill();
      ctx.stroke();
    });
  } else if (id === 'wizard') {
    ctx.translate(hx, hy - Rh * 0.72);
    ctx.beginPath();
    ctx.ellipse(0, 0, Rh * 1.08, Rh * 0.26, 0, 0, TAU);
    ctx.fillStyle = mono ? MONO : '#4A2FA6';
    ctx.fill();
    ctx.stroke();
    const cone = () => {
      ctx.beginPath();
      ctx.moveTo(-Rh * 0.62, -Rh * 0.02);
      ctx.quadraticCurveTo(-Rh * 0.32, -Rh * 0.85, -Rh * 0.08, -Rh * 1.42);
      ctx.quadraticCurveTo(Rh * 0.2, -Rh * 1.8, Rh * 0.66, -Rh * 1.66);
      ctx.quadraticCurveTo(Rh * 0.3, -Rh * 1.45, Rh * 0.26, -Rh * 1.1);
      ctx.quadraticCurveTo(Rh * 0.42, -Rh * 0.5, Rh * 0.62, -Rh * 0.02);
      ctx.quadraticCurveTo(0, Rh * 0.12, -Rh * 0.62, -Rh * 0.02);
      ctx.closePath();
    };
    cone();
    if (mono) {
      ctx.fillStyle = MONO;
    } else {
      const g = ctx.createLinearGradient(-Rh * 0.6, 0, Rh * 0.6, -Rh * 1.4);
      g.addColorStop(0, '#5B3CCB');
      g.addColorStop(1, '#8E6BF0');
      ctx.fillStyle = g;
    }
    ctx.fill();
    if (!mono) {
      ctx.save();
      cone();
      ctx.clip();
      ctx.fillStyle = '#FFD447';
      ctx.fillRect(-Rh, -Rh * 0.32, Rh * 2, Rh * 0.2);
      ctx.restore();
      ctx.fillStyle = '#FFE36B';
      ctx.lineWidth = lw * 0.6;
      star(ctx, Rh * 0.02, -Rh * 0.68, Rh * 0.17, Rh * 0.075);
      ctx.fill();
      ctx.stroke();
      star(ctx, -Rh * 0.12, -Rh * 1.1, Rh * 0.1, Rh * 0.045);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(Rh * 0.3, -Rh * 0.5, Rh * 0.045, 0, TAU);
      ctx.fill();
      ctx.lineWidth = lw;
    }
    cone();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(Rh * 0.66, -Rh * 1.66, Rh * 0.12, 0, TAU);
    ctx.fillStyle = mono ? MONO : '#FFE36B';
    ctx.fill();
    ctx.stroke();
  } else if (id === 'crown') {
    ctx.translate(hx, hy - Rh * 0.66);
    const w = Rh * 0.7, h = Rh * 0.72;
    const shape = () => {
      ctx.beginPath();
      ctx.moveTo(-w, 0);
      ctx.lineTo(-w * 1.08, -h);
      ctx.lineTo(-w * 0.52, -h * 0.5);
      ctx.lineTo(0, -h * 1.14);
      ctx.lineTo(w * 0.52, -h * 0.5);
      ctx.lineTo(w * 1.08, -h);
      ctx.lineTo(w, 0);
      ctx.quadraticCurveTo(0, h * 0.18, -w, 0);
      ctx.closePath();
    };
    shape();
    if (mono) {
      ctx.fillStyle = MONO;
    } else {
      const g = ctx.createLinearGradient(0, -h, 0, h * 0.1);
      g.addColorStop(0, '#FFE98A');
      g.addColorStop(0.5, '#FFC21F');
      g.addColorStop(1, '#E29600');
      ctx.fillStyle = g;
    }
    ctx.fill();
    ctx.stroke();
    if (!mono) {
      ctx.beginPath();
      ctx.moveTo(-w * 0.98, -h * 0.24);
      ctx.quadraticCurveTo(0, -h * 0.08, w * 0.98, -h * 0.24);
      ctx.strokeStyle = 'rgba(160,100,0,.6)';
      ctx.lineWidth = lw * 0.7;
      ctx.stroke();
      ctx.strokeStyle = INK;
      ctx.lineWidth = lw * 0.7;
      [[-w * 0.52, '#4F78E6'], [0, '#F2505D'], [w * 0.52, '#3FB760']].forEach(([x, c]) => {
        ctx.beginPath();
        ctx.arc(x, -h * 0.1, Rh * 0.085, 0, TAU);
        ctx.fillStyle = c;
        ctx.fill();
        ctx.stroke();
      });
      ctx.lineWidth = lw;
    }
    [[-w * 1.08, -h], [0, -h * 1.14], [w * 1.08, -h]].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, Rh * 0.1, 0, TAU);
      ctx.fillStyle = mono ? MONO : '#FFF2B0';
      ctx.fill();
      ctx.stroke();
    });
    if (!mono) {
      ctx.fillStyle = '#fff';
      star(ctx, w * 0.42, -h * 0.72, Rh * 0.12, Rh * 0.03, 4, 0);
      ctx.fill();
    }
  }
  ctx.restore();
}

// ---------- Stars for the end card ----------

export function starSvg(on, size = 64) {
  const fill = on ? '#FFC21F' : '#FFF9EC';
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true"><path d="M12 2.2l2.9 6 6.5.8-4.8 4.5 1.3 6.5L12 16.8 6.1 20l1.3-6.5L2.6 9l6.5-.8z" fill="${fill}" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>${on ? '<path d="M8.6 9.6l1.6-.2" stroke="#fff" stroke-width="1.3" stroke-linecap="round"/>' : ''}</svg>`;
}
