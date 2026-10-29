// All Monster Café art, drawn in code as SVG strings. Plum ink outlines, pastel fills.

export const INK = '#3D2340';
const MOUTH = '#5A1F3D';
const TONGUE = '#FF7A9C';

// ---------- Shared symbols (food, bite mask) ----------

const seeds = [[14, 19], [20, 17.5], [26, 19], [12, 25], [18, 24], [24, 24.5], [29, 25], [15, 30], [21, 30], [26, 30], [20, 34.5]]
  .map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="0.9" ry="1.4" fill="#FFE38A"/>`).join('');

export const SPRITE = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
<symbol id="food-cookie" viewBox="0 0 40 40">
  <path d="M20 4.4c4.2 0 6.4 1.6 9.5 3.4 3.3 1.8 6 4.6 6.1 8.9.1 3.4 1.1 5.6-.2 9.2-1.6 4.4-5.6 8.6-11.2 9.4-4.4.6-7.4-.4-10.9-2.3C9.4 31.3 5 27.3 4.6 21.4 4.2 15.6 6.3 10.5 11 7.1c2.7-1.9 5.6-2.7 9-2.7z" fill="#E9B26B" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M10.5 14c1.8-3.4 5.6-5.6 9.6-5.6" fill="none" stroke="#F8D9A4" stroke-width="2.6" stroke-linecap="round"/>
  <g fill="#6A3A2A"><ellipse cx="14" cy="18" rx="2.5" ry="2"/><ellipse cx="25" cy="13.5" rx="2.2" ry="1.8"/><ellipse cx="21.5" cy="23" rx="2.6" ry="2.1"/><ellipse cx="12.5" cy="26.5" rx="2" ry="1.7"/><ellipse cx="29" cy="23.5" rx="2.3" ry="1.9"/><ellipse cx="19" cy="30.5" rx="1.8" ry="1.5"/></g>
</symbol>
<symbol id="food-cupcake" viewBox="0 0 40 40">
  <path d="M9.4 21h21.2l-2.6 14.1c-.2 1-1 1.7-2 1.7H14c-1 0-1.8-.7-2-1.7z" fill="#7CCFEA" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="M15 23l1 12M20 23v12M25 23l-1 12" stroke="${INK}" stroke-width="1.6" opacity=".4" stroke-linecap="round"/>
  <path d="M8.2 22.6c-2.4-.4-3-3.7-.9-5.1 0-3.4 2.9-5.2 5.6-4.6.7-3.6 4.3-5.6 7.6-4.5 3.4-1.4 7.4.9 7.5 4.6 2.8-.4 5.4 2 4.6 5 1.9 1.3 1.4 4.4-.9 4.6z" fill="#FF9EC4" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
  <path d="M11.5 16.8c1.2-1.2 2.8-1.6 4.2-1.2" stroke="#FFD6E6" stroke-width="2" fill="none" stroke-linecap="round"/>
  <path d="M13 19.6l1.8-1M24.2 17.4l1.9.5M18.6 20.6l.4-1.8M28 20.4l1.2-1.4M21.5 14.6l1.6.8" stroke="#FFE066" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M15.8 15.2l.3 1.8M26.4 21.2l1.7.4" stroke="#6CC8F0" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M20.6 6.4c.5-2 1.7-3.4 3.5-4" stroke="${INK}" stroke-width="1.7" fill="none" stroke-linecap="round"/>
  <circle cx="20" cy="8.4" r="3.5" fill="#E8344E" stroke="${INK}" stroke-width="1.8"/>
  <circle cx="18.9" cy="7.4" r="1" fill="#fff" opacity=".8"/>
</symbol>
<symbol id="food-doughnut" viewBox="0 0 40 40">
  <path fill-rule="evenodd" d="M20 4.4a15.6 15.6 0 1 1 0 31.2 15.6 15.6 0 0 1 0-31.2zm0 10.4a5.2 5.2 0 1 0 0 10.4 5.2 5.2 0 0 0 0-10.4z" fill="#E3A35C" stroke="${INK}" stroke-width="2.3"/>
  <path fill-rule="evenodd" d="M20 7c3.9 0 6.6 1.1 8.8 3.4 2.5 2.6 3.8 5.5 3.3 8.5-.3 1.8.8 2.9-.3 4.9-1.2 2.1-2.3 1.6-3.4 3.3-1.8 3-4.9 4.4-8.6 4.4-3.4 0-6.1-1.2-8.2-3.4-1.3-1.4-.5-2.7-1.9-4.3-1.4-1.6-2-3.5-1.6-6C8.7 13 13.2 7 20 7zm0 7.8a5.2 5.2 0 1 0 0 10.4 5.2 5.2 0 0 0 0-10.4z" fill="#FF8DB8" stroke="${INK}" stroke-width="2"/>
  <path d="M12.6 13.6l1.6 1.2M25.6 11.6l1.8-.6M28.8 18.2l.4 1.9M12 21.6l1.6-.9M24.6 27.4l1.6 1M16.6 27.6l-1 1.5" stroke="#FFF6B0" stroke-width="1.9" stroke-linecap="round"/>
  <path d="M18.6 10.4l1.9-.2M27.4 23.6l.8 1.6M10.8 17.6l.2 1.8" stroke="#7CCFEA" stroke-width="1.9" stroke-linecap="round"/>
</symbol>
<symbol id="food-strawberry" viewBox="0 0 40 40">
  <path d="M20 37c-6.5-2.4-13.5-9.6-13.4-17.6C6.7 14 10.4 11 15 11.4c2 .2 3.4.9 5 .9s3-.7 5-.9c4.6-.4 8.3 2.6 8.4 8C33.5 27.4 26.5 34.6 20 37z" fill="#F2475F" stroke="${INK}" stroke-width="2.3" stroke-linejoin="round"/>
  <path d="M10.6 18.4c.2-2.2 1.8-3.7 3.7-3.9" stroke="#FF9AA8" stroke-width="2.3" fill="none" stroke-linecap="round"/>
  ${seeds}
  <path d="M20 13.6c-2.6.6-6.2.3-8-1.6 2-.6 3.5-1.1 4.6-2.4-1-1.4-1-3 .1-4.4 1.6.6 2.6 1.8 3.3 3.2.7-1.4 1.7-2.6 3.3-3.2 1.1 1.4 1.1 3 .1 4.4 1.1 1.3 2.6 1.8 4.6 2.4-1.8 1.9-5.4 2.2-8 1.6z" fill="#5CC46A" stroke="${INK}" stroke-width="1.9" stroke-linejoin="round"/>
</symbol>
<mask id="bite-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="40" height="40">
  <rect width="40" height="40" fill="#fff"/><circle cx="35" cy="9" r="9.5" fill="#000"/><circle cx="38" cy="19" r="6" fill="#000"/><circle cx="27" cy="2" r="6" fill="#000"/>
</mask>
<symbol id="coin" viewBox="0 0 40 40">
  <circle cx="20" cy="21.5" r="16" fill="#E59A12" stroke="${INK}" stroke-width="2.6"/>
  <circle cx="20" cy="19.5" r="16" fill="#FFC83D" stroke="${INK}" stroke-width="2.6"/>
  <circle cx="20" cy="19.5" r="11" fill="none" stroke="#E59A12" stroke-width="2"/>
  <path d="M20 12.2l2.2 4.6 5 .6-3.7 3.4 1 5-4.5-2.5-4.5 2.5 1-5-3.7-3.4 5-.6z" fill="#FFE9A3"/>
</symbol>
<symbol id="heart" viewBox="0 0 40 40">
  <path d="M20 35C9 27.5 3.6 21 3.6 14c0-5.3 4-9 8.8-9 3.4 0 5.9 1.9 7.6 4.7C21.7 6.9 24.2 5 27.6 5c4.8 0 8.8 3.7 8.8 9 0 7-5.4 13.5-16.4 21z" fill="#FF5C8D" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
  <path d="M9.4 12.6c.4-2 2-3.4 3.8-3.6" stroke="#FFB3CB" stroke-width="2.6" fill="none" stroke-linecap="round"/>
</symbol>
<symbol id="star" viewBox="0 0 24 24">
  <path d="M12 2.5l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 16.9 6.3 20l1.2-6.4L2.8 9.2l6.4-.8z" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/>
</symbol>
</defs></svg>`;

export const food = (kind, cls = '') => `<svg class="food ${cls}" viewBox="0 0 40 40" aria-hidden="true"><use href="#food-${kind}"/></svg>`;
export const coinSvg = (cls = 'coin') => `<svg class="${cls}" viewBox="0 0 40 40" aria-hidden="true"><use href="#coin"/></svg>`;
export const heartSvg = (cls = 'heart') => `<svg class="${cls}" viewBox="0 0 40 40" aria-hidden="true"><use href="#heart"/></svg>`;
export const starSvg = (on) => `<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#star" fill="${on ? '#FFC83D' : '#FFF3E4'}"/></svg>`;

// A bitten, faded food item (for "I ate 2").
export const eaten = (kind) => `<svg class="food eaten" viewBox="0 0 40 40" aria-hidden="true">
  <g mask="url(#bite-mask)" opacity=".38"><use href="#food-${kind}"/></g>
  <g fill="#C98B4E"><circle cx="31" cy="16" r="1.6"/><circle cx="34.5" cy="22" r="1.2"/><circle cx="29" cy="7" r="1.1"/></g></svg>`;

// An empty dotted place where food is missing.
export const slot = (cls = '') => `<svg class="food slot ${cls}" viewBox="0 0 40 40" aria-hidden="true">
  <circle cx="20" cy="20" r="14.5" fill="rgba(255,255,255,.55)" stroke="${INK}" stroke-width="2.2" stroke-dasharray="4.2 3.6" opacity=".55"/></svg>`;

// A paper bag of n (times orders). ghost = a dotted bag still to work out.
export function bag(kind, n, ghost = false) {
  if (ghost) {
    return `<svg class="bag ghost" viewBox="0 0 44 54" aria-hidden="true">
      <path d="M6 18h32l-2.4 30c-.1 1.4-1.2 2.4-2.6 2.4H11c-1.4 0-2.5-1-2.6-2.4z" fill="rgba(255,255,255,.6)" stroke="${INK}" stroke-width="2.4" stroke-dasharray="5 4" stroke-linejoin="round"/>
      <text x="22" y="40" text-anchor="middle" class="bag-n">${n}</text></svg>`;
  }
  return `<svg class="bag" viewBox="0 0 44 54" aria-hidden="true">
    <use href="#food-${kind}" x="4" y="0" width="22" height="22"/><use href="#food-${kind}" x="17" y="2" width="22" height="22"/>
    <path d="M6 18h32l-2.4 30c-.1 1.4-1.2 2.4-2.6 2.4H11c-1.4 0-2.5-1-2.6-2.4z" fill="#EBC48F" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M6 18l2.7 3.4 2.7-3.4 2.7 3.4 2.7-3.4 2.7 3.4 2.7-3.4 2.7 3.4 2.7-3.4 2.7 3.4 2.7-3.4 2.7 3.4 2.7-3.4" fill="none" stroke="#C99A5E" stroke-width="1.8" stroke-linejoin="round"/>
    <circle cx="22" cy="35" r="10.5" fill="#FFFDF8" stroke="${INK}" stroke-width="2"/>
    <text x="22" y="40.2" text-anchor="middle" class="bag-n">${n}</text></svg>`;
}

// A box of ten (for big numbers): ten little items in two rows of five.
export function tenBox(kind, cls = '') {
  let uses = '';
  for (let i = 0; i < 10; i++) {
    const x = 5 + (i % 5) * 18, y = 4 + Math.floor(i / 5) * 18;
    uses += `<use href="#food-${kind}" x="${x}" y="${y}" width="18" height="18"/>`;
  }
  return `<svg class="tenbox ${cls}" viewBox="0 0 100 44" aria-hidden="true">
    <rect x="1.5" y="1.5" width="97" height="41" rx="9" fill="#FFF3F7" stroke="${INK}" stroke-width="2.4"/>${uses}</svg>`;
}

// A little plate for sharing.
export const plate = () => `<svg class="plate" viewBox="0 0 48 30" aria-hidden="true">
  <ellipse cx="24" cy="17" rx="21" ry="10.5" fill="#FFFFFF" stroke="${INK}" stroke-width="2.3"/>
  <ellipse cx="24" cy="16" rx="13" ry="5.6" fill="none" stroke="#B9DDF0" stroke-width="2"/></svg>`;

export const speakerSvg = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M15.5 9c1 .8 1.6 1.8 1.6 3s-.6 2.2-1.6 3M18 6.5c1.8 1.4 2.8 3.4 2.8 5.5s-1 4.1-2.8 5.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
export const clearSvg = `<svg viewBox="0 0 32 24" aria-hidden="true"><path d="M10 3h18a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H10l-8-9z" fill="#fff" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/><path d="M14.5 8l8 8m0-8l-8 8" stroke="#FF5C8D" stroke-width="2.8" stroke-linecap="round"/></svg>`;
export const brushSvg = `<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="5" y="4" width="20" height="9" rx="3" fill="#FFC83D" stroke="${INK}" stroke-width="2.4"/><path d="M25 8.5h2.5v7H16v4" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/><rect x="13" y="19" width="6" height="10" rx="2" fill="#FF8FB6" stroke="${INK}" stroke-width="2.4"/></svg>`;

// ---------- The serving bell ----------

export const bellSvg = `<svg class="bell-art" viewBox="0 0 120 92" aria-hidden="true">
  <g class="bell-knob"><rect x="54" y="6" width="12" height="13" rx="3" fill="#C9CED8" stroke="${INK}" stroke-width="3.5"/><ellipse cx="60" cy="7" rx="10" ry="4.5" fill="#E9EDF3" stroke="${INK}" stroke-width="3.5"/></g>
  <g class="bell-dome">
    <path d="M14 66c0-25 20.5-46 46-46s46 21 46 46z" fill="#FFC83D" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M30 52c3-12 12.5-21 25-23.5" fill="none" stroke="#FFF0B8" stroke-width="7" stroke-linecap="round"/>
    <path d="M86 60c-.5-6-2.6-11.5-6-16" fill="none" stroke="#E59A12" stroke-width="5" stroke-linecap="round"/>
  </g>
  <rect x="6" y="64" width="108" height="20" rx="8" fill="#FF5C8D" stroke="${INK}" stroke-width="4"/>
  <path d="M14 70.5h70" stroke="#FFB0C8" stroke-width="4" stroke-linecap="round"/>
</svg>`;

// ---------- The big food jar ----------

const JAR_PILE = [[14, 96], [42, 100], [70, 97], [24, 72], [54, 76], [80, 73], [38, 50], [66, 52], [52, 28]];
export function jarSvg(kind) {
  const items = JAR_PILE.map(([x, y], i) => `<use href="#food-${kind}" x="${x}" y="${y}" width="34" height="34" transform="rotate(${(i * 37) % 50 - 25} ${x + 17} ${y + 17})"/>`).join('');
  return `<svg class="jar-art" viewBox="0 0 120 150" aria-hidden="true">
    <defs><clipPath id="jar-clip"><rect x="12" y="38" width="96" height="104" rx="26"/></clipPath></defs>
    <rect x="12" y="38" width="96" height="104" rx="26" fill="#E9F7FF"/>
    <g clip-path="url(#jar-clip)">${items}</g>
    <rect x="12" y="38" width="96" height="104" rx="26" fill="rgba(200,236,255,.22)" stroke="${INK}" stroke-width="4.5"/>
    <path d="M24 60c0-6 3-10 8-12" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".9"/>
    <path d="M22 76v40" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".6"/>
    <rect x="26" y="26" width="68" height="16" rx="5" fill="#E9F7FF" stroke="${INK}" stroke-width="4.5"/>
    <rect x="18" y="6" width="84" height="24" rx="10" fill="#FF8FB6" stroke="${INK}" stroke-width="4.5"/>
    <path d="M28 14h40" stroke="#FFC6D9" stroke-width="5" stroke-linecap="round"/>
    <circle cx="60" cy="6" r="6" fill="#FF5C8D" stroke="${INK}" stroke-width="4"/>
  </svg>`;
}

// ---------- The helper who counts along ----------

export const helperSvg = `<svg class="helper-art" viewBox="0 0 90 100" aria-hidden="true">
  <path d="M27 30c-10 1-15-8-10-15 3-5 9-6 13-4 2-7 9-10 15-10s13 3 15 10c4-2 10-1 13 4 5 7 0 16-10 15z" fill="#fff" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
  <rect x="26" y="26" width="38" height="10" rx="3" fill="#fff" stroke="${INK}" stroke-width="3.5"/>
  <path d="M13 70c0-20 14-34 32-34s32 14 32 34-13 26-32 26-32-6-32-26z" fill="#FFD9A8" stroke="${INK}" stroke-width="3.5"/>
  <circle cx="35" cy="62" r="4.5" fill="${INK}"/><circle cx="55" cy="62" r="4.5" fill="${INK}"/>
  <circle cx="33.6" cy="60.6" r="1.5" fill="#fff"/><circle cx="53.6" cy="60.6" r="1.5" fill="#fff"/>
  <ellipse cx="26" cy="72" rx="6" ry="4" fill="#FF8FB6" opacity=".7"/><ellipse cx="64" cy="72" rx="6" ry="4" fill="#FF8FB6" opacity=".7"/>
  <path d="M37 73q8 8 16 0" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>
  <g class="helper-arm"><path d="M74 72c6-4 10-10 11-17" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><path d="M74 72c6-4 10-10 11-17" fill="none" stroke="#FFD9A8" stroke-width="4.5" stroke-linecap="round"/><circle cx="85" cy="53" r="5.5" fill="#FFD9A8" stroke="${INK}" stroke-width="3"/></g>
</svg>`;

// ---------- Monsters ----------
// Built from parts. Coordinates: viewBox -20 -40 240 280; the counter top sits at y = 200.

export const MONSTERS = [
  { name: 'Gloop', shape: 'drop', body: '#8EDB5A', shade: '#62B53C', light: '#CDF3AE', eyes: 1, mouthY: 162, spots: [[62, 112, 7], [140, 136, 9], [126, 98, 5], [56, 150, 5]], spotFill: '#B6EB8E' },
  { name: 'Fizzwick', shape: 'furry', body: '#B59BFF', shade: '#8B6EE6', light: '#DDD2FF', eyes: 2, top: 'antennae', pom: '#FFD447', teeth: 'fangs', mouthY: 158 },
  { name: 'Bumbleroo', shape: 'round', body: '#FFA552', shade: '#E37F2C', light: '#FFD7AE', eyes: 3, top: 'horns', horn: '#FFF3D6', teeth: 'none', mouthY: 160, spots: [[56, 150, 3], [64, 158, 3], [50, 158, 3], [144, 150, 3], [136, 158, 3], [150, 158, 3]], spotFill: '#C9662A' },
  { name: 'Snorkel', shape: 'tall', body: '#62C6F2', shade: '#3A9DD0', light: '#C3ECFC', eyes: 'stalks', teeth: 'buck', mouthY: 132, spots: [[66, 160, 8], [138, 150, 6], [128, 176, 5]], spotFill: '#8ED8F7' },
  { name: 'Wobbla', shape: 'blob', body: '#FF8DC7', shade: '#E2609F', light: '#FFD3EA', eyes: 2, top: 'horns', horn: '#FFF3D6', teeth: 'buck', mouthY: 158, spots: [[52, 104, 6], [150, 112, 7], [144, 88, 4]], spotFill: '#FFB8DC' },
  { name: 'Grumbletum', shape: 'shaggy', body: '#FFD447', shade: '#E2A91C', light: '#FFF1B3', eyes: 1, top: 'bighorns', horn: '#B98BFF', teeth: 'fangs', mouthY: 166 },
  { name: 'Pip', shape: 'small', body: '#7FE0C4', shade: '#4CBFA0', light: '#CDF6EA', eyes: 2, bigEyes: true, top: 'ears', tuft: true, teeth: 'none', mouthY: 166 },
  { name: 'Mumbo', shape: 'blob', body: '#FF7A6B', shade: '#D9544A', light: '#FFC6BD', eyes: 3, top: 'antenna', pom: '#7CCFEA', teeth: 'fangs', mouthY: 162, spots: [[54, 98, 5], [150, 104, 6], [60, 128, 3.5]], spotFill: '#FFA196' },
];

const r1 = (n) => Math.round(n * 10) / 10;

// A fluffy outline: bumps along the sides and over the top.
function furPath(cx, cy, rx, ry, bottom, n, depth, sideStep = 26) {
  const P = [];
  const sideBumps = Math.max(1, Math.round((bottom - cy) / sideStep));
  // Left side, going up.
  let d = `M${cx - rx} ${bottom}`;
  for (let i = 0; i < sideBumps; i++) {
    const y0 = bottom - ((bottom - cy) * i) / sideBumps, y1 = bottom - ((bottom - cy) * (i + 1)) / sideBumps;
    d += ` Q${r1(cx - rx - depth)} ${r1((y0 + y1) / 2)} ${cx - rx} ${r1(y1)}`;
  }
  for (let i = 0; i < n; i++) {
    const a1 = Math.PI + ((i + 1) / n) * Math.PI, am = Math.PI + ((i + 0.5) / n) * Math.PI;
    d += ` Q${r1(cx + (rx + depth) * Math.cos(am))} ${r1(cy + (ry + depth) * Math.sin(am))} ${r1(cx + rx * Math.cos(a1))} ${r1(cy + ry * Math.sin(a1))}`;
  }
  for (let i = 0; i < sideBumps; i++) {
    const y0 = cy + ((bottom - cy) * i) / sideBumps, y1 = cy + ((bottom - cy) * (i + 1)) / sideBumps;
    d += ` Q${r1(cx + rx + depth)} ${r1((y0 + y1) / 2)} ${cx + rx} ${r1(y1)}`;
  }
  P.push(d + ' Z');
  return P[0];
}

const BODY = {
  drop: 'M100 30C110 56 134 70 150 88c18 20 23 46 23 78v74H27v-74c0-32 5-58 23-78 16-18 40-32 50-58z',
  round: 'M100 58c50 0 80 38 80 90v92H20v-92c0-52 30-90 80-90z',
  tall: 'M100 62c38 0 58 26 58 66l6 112H36l6-112c0-40 20-66 58-66z',
  blob: 'M100 54c46-4 72 32 70 76-2 28 8 58 6 110H24c-2-52 8-82 6-110-2-44 24-80 70-76z',
  small: 'M100 84c44 0 70 30 70 74v82H30v-82c0-44 26-74 70-74z',
  furry: furPath(100, 132, 72, 74, 240, 11, 9),
  shaggy: furPath(100, 128, 80, 66, 240, 13, 8, 22),
};

// Top of the head at x = 100, for placing features.
const HEAD_TOP = { drop: 30, round: 58, tall: 62, blob: 54, small: 84, furry: 58, shaggy: 62 };

function eye(cx, cy, r, look = 0.18) {
  return `<g class="m-eye"><circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff" stroke="${INK}" stroke-width="4.5"/>
    <g class="m-pupil"><circle cx="${cx}" cy="${r1(cy + r * look)}" r="${r1(r * 0.52)}" fill="${INK}"/>
    <circle cx="${r1(cx - r * 0.2)}" cy="${r1(cy + r * look - r * 0.2)}" r="${r1(r * 0.19)}" fill="#fff"/></g></g>`;
}

function eyes(m) {
  const t = HEAD_TOP[m.shape];
  if (m.eyes === 'stalks') {
    const stalk = (x0, x1) => `<path d="M${x0} ${t + 18} C${x0} ${t - 4} ${x1} ${t - 14} ${x1} ${t - 34}" fill="none" stroke="${INK}" stroke-width="15" stroke-linecap="round"/>
      <path d="M${x0} ${t + 18} C${x0} ${t - 4} ${x1} ${t - 14} ${x1} ${t - 34}" fill="none" stroke="${m.body}" stroke-width="7" stroke-linecap="round"/>`;
    return { back: stalk(84, 70) + stalk(116, 130), front: eye(70, t - 40, 19) + eye(130, t - 40, 19) };
  }
  const n = m.eyes;
  const y = t + (n === 1 ? 56 : 52);
  if (n === 1) return { back: '', front: eye(100, y, 30) };
  if (n === 2) {
    const r = m.bigEyes ? 23 : 19, dx = m.bigEyes ? 27 : 25;
    return { back: '', front: eye(100 - dx, y + 4, r) + eye(100 + dx, y + 4, r) };
  }
  return { back: '', front: eye(66, y + 10, 14) + eye(100, y - 6, 17) + eye(134, y + 10, 14) };
}

function topParts(m) {
  const t = HEAD_TOP[m.shape];
  const out = [];
  if (m.top === 'horns' || m.top === 'bighorns') {
    const big = m.top === 'bighorns';
    const hornL = big
      ? `M58 ${t + 26}C34 ${t + 10} 26 ${t - 20} 40 ${t - 44}c2 18 10 30 26 38z`
      : `M66 ${t + 14}C54 ${t + 4} 50 ${t - 12} 56 ${t - 28}c6 12 14 20 24 26z`;
    out.push(`<path d="${hornL}" fill="${m.horn}" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>`);
    out.push(`<path d="${hornL}" transform="translate(200 0) scale(-1 1)" fill="${m.horn}" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>`);
  }
  if (m.top === 'antennae' || m.top === 'antenna') {
    const one = (x0, x1, cls) => `<g class="m-ant ${cls}"><path d="M${x0} ${t + 12} Q${(x0 + x1) / 2 - 6} ${t - 20} ${x1} ${t - 34}" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <circle cx="${x1}" cy="${t - 36}" r="10" fill="${m.pom}" stroke="${INK}" stroke-width="4.5"/><circle cx="${x1 - 3}" cy="${t - 39}" r="3" fill="#fff" opacity=".8"/></g>`;
    if (m.top === 'antenna') out.push(one(100, 108, 'a1'));
    else out.push(one(80, 62, 'a1'), one(120, 140, 'a2'));
  }
  if (m.top === 'ears') {
    const ear = `<path d="M46 ${t + 34}C20 ${t + 20} 14 ${t - 10} 26 ${t - 22}c18 4 34 22 40 44z" fill="${m.body}" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M44 ${t + 24}C30 ${t + 14} 26 ${t - 2} 31 ${t - 10}c10 4 19 14 23 26z" fill="#FFB3CB"/>`;
    out.push(`<g class="m-ear m-ear-l">${ear}</g><g class="m-ear m-ear-r"><g transform="translate(200 0) scale(-1 1)">${ear}</g></g>`);
  }
  return out.join('');
}

function arms(m) {
  const arm = (side) => {
    const s = side === 'l' ? 1 : -1;
    const x = (v) => (side === 'l' ? v : 200 - v);
    const sx = m.shape === 'small' ? 40 : m.shape === 'tall' ? 46 : 34;
    const d = `M${x(sx + 8)} 150C${x(sx - 8)} 152 ${x(sx - 22)} 160 ${x(sx - 26)} 176`;
    return `<g class="m-arm m-arm-${side}" style="transform-origin:${x(sx + 8)}px 150px">
      <path d="${d}" fill="none" stroke="${INK}" stroke-width="21" stroke-linecap="round"/>
      <path d="${d}" fill="none" stroke="${m.body}" stroke-width="12" stroke-linecap="round"/>
      <circle cx="${x(sx - 27)}" cy="179" r="10.5" fill="${m.body}" stroke="${INK}" stroke-width="4.5"/>
      <path d="M${x(sx - 32)} 172q${s * 2} -6 ${s * 7} -5" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" opacity=".5"/></g>`;
  };
  return arm('l') + arm('r');
}

function mouths(m) {
  const y = m.mouthY;
  const teeth = m.teeth === 'fangs'
    ? `<path d="M80 ${y - 6}l4 9 4-8zM120 ${y - 6}l-4 9-4-8z" fill="#fff" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`
    : m.teeth === 'buck'
      ? `<rect x="93" y="${y - 6}" width="14" height="11" rx="2.5" fill="#fff" stroke="${INK}" stroke-width="2.5"/>`
      : '';
  return `<g class="mo mo-smile"><path d="M74 ${y - 8}Q100 ${y + 28} 126 ${y - 8}Q100 ${y + 2} 74 ${y - 8}z" fill="${MOUTH}" stroke="${INK}" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M88 ${y + 6}Q100 ${y - 1} 112 ${y + 6}Q100 ${y + 14} 88 ${y + 6}z" fill="${TONGUE}"/>${teeth}</g>
    <g class="mo mo-open"><ellipse cx="100" cy="${y + 4}" rx="25" ry="21" fill="${MOUTH}" stroke="${INK}" stroke-width="4.5"/>
      <ellipse cx="100" cy="${y + 15}" rx="14" ry="7.5" fill="${TONGUE}"/>${m.teeth === 'fangs' ? `<path d="M86 ${y - 13}l4 9 4-8zM114 ${y - 13}l-4 9-4-8z" fill="#fff" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>` : ''}</g>
    <g class="mo mo-shut"><path d="M76 ${y}Q100 ${y + 14} 124 ${y}" fill="none" stroke="${INK}" stroke-width="5.5" stroke-linecap="round"/>
      <path d="M70 ${y - 4}q4 5 8 4M130 ${y - 4}q-4 5-8 4" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/></g>
    <g class="mo mo-wavy"><path d="M74 ${y + 4}q6.5-8 13 0t13 0 13 0 13 0" fill="none" stroke="${INK}" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/></g>`;
}

export function monsterSvg(m) {
  const t = HEAD_TOP[m.shape];
  const e = eyes(m);
  const spots = (m.spots || []).map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${m.spotFill}"/>`).join('');
  const drips = m.extra === 'drips'
    ? `<path d="M50 96c-4 10-2 18 3 18s6-8 3-18z" fill="${m.body}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`
    : '';
  const tuft = m.tuft
    ? `<path d="M92 ${t + 6}c-6-10-2-22 8-24-4 8-2 14 2 18M104 ${t + 4}c2-10 10-16 18-14-6 4-9 9-10 15" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>`
    : '';
  const glossy = m.shape === 'furry' || m.shape === 'shaggy'
    ? ''
    : `<path d="M${r1(66 - (m.shape === 'round' || m.shape === 'small' ? 4 : 0))} ${t + 28}c6-10 16-16 26-18" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".45"/>`;
  return `<svg class="mon" viewBox="-20 -40 240 280" aria-hidden="true">
    <g class="m-all">
      <g class="m-back">${arms(m)}${topParts(m)}${e.back}</g>
      <g class="m-body">
        <path d="${BODY[m.shape]}" fill="${m.body}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
        <ellipse cx="100" cy="226" rx="${m.shape === 'small' ? 46 : 54}" ry="48" fill="${m.light}"/>
        ${spots}${drips}${glossy}${tuft}
      </g>
      <g class="m-face">
        <g class="m-eyes">${e.front}</g>
        <ellipse cx="${m.eyes === 3 ? 58 : 62}" cy="${m.mouthY - 6}" rx="11" ry="6.5" fill="#FF6F9E" opacity=".45"/>
        <ellipse cx="${m.eyes === 3 ? 142 : 138}" cy="${m.mouthY - 6}" rx="11" ry="6.5" fill="#FF6F9E" opacity=".45"/>
        <g class="m-mouth">${mouths(m)}</g>
      </g>
      <g class="m-puzzle">
        <path d="M150 ${t - 30}c-6-14 10-24 18-14 7 9-6 14-6 22" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
        <circle cx="162" cy="${t - 6}" r="4" fill="${INK}"/>
        <path d="M184 ${t - 20}q5-6 10 0t10 0M34 ${t - 22}q5-6 10 0t10 0" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round" opacity=".6"/>
      </g>
    </g>
  </svg>`;
}

// ---------- Café scenery ----------

const FLAG_COLOURS = ['#FF8FB6', '#FFD447', '#7CCFEA', '#8EDB9A', '#B59BFF'];
export function buntingSvg(offset = 0) {
  const flags = [0, 1, 2, 3, 4].map((i) => {
    const x = 6 + i * 24, y = 5 + Math.sin(((i + 0.5) / 5) * Math.PI) * 14;
    return `<path d="M${x} ${r1(y - 1)}h18l-9 ${17}z" fill="${FLAG_COLOURS[(i + offset) % 5]}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`;
  }).join('');
  return `<svg viewBox="0 0 126 40" aria-hidden="true"><path d="M0 3Q63 33 126 3" fill="none" stroke="${INK}" stroke-width="2.4"/>${flags}</svg>`;
}

export const windowSvg = `<svg class="win-art" viewBox="0 0 140 170" aria-hidden="true">
  <defs>
    <clipPath id="win-clip"><path d="M22 160V62a48 48 0 0 1 96 0v98z"/></clipPath>
    <linearGradient id="sky-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FD5F7"/><stop offset="1" stop-color="#DDF4FF"/></linearGradient>
  </defs>
  <path d="M22 160V62a48 48 0 0 1 96 0v98z" fill="url(#sky-g)"/>
  <g clip-path="url(#win-clip)">
    <circle cx="96" cy="44" r="13" fill="#FFE27A"/>
    <g class="cloud c1"><path d="M10 70a9 9 0 0 1 16-6 11 11 0 0 1 20 4 8 8 0 0 1 0 16H12a7 7 0 0 1-2-14z" fill="#fff"/></g>
    <g class="cloud c2"><path d="M40 110a8 8 0 0 1 14-5 10 10 0 0 1 18 4 7 7 0 0 1 0 14H42a6 6 0 0 1-2-13z" fill="#fff"/></g>
    <g class="cloud c3"><path d="M20 140a7 7 0 0 1 12-4 8 8 0 0 1 15 3 6 6 0 0 1 0 12H22a5 5 0 0 1-2-11z" fill="#fff" opacity=".9"/></g>
    <path d="M22 150c20-10 38-8 52-2s30 6 44-2v14H22z" fill="#9BDB8A"/>
  </g>
  <path d="M22 160V62a48 48 0 0 1 96 0v98z" fill="none" stroke="#FFFDF6" stroke-width="10"/>
  <path d="M70 14v146M22 98h96" stroke="#FFFDF6" stroke-width="7"/>
  <path d="M17 160V62a53 53 0 0 1 106 0v98z" fill="none" stroke="${INK}" stroke-width="4"/>
  <path d="M27 160V62a43 43 0 0 1 86 0v98z" fill="none" stroke="${INK}" stroke-width="2.5" opacity=".35"/>
  <path d="M10 22c14 30 14 70 2 124 10 4 16 6 22 6-4-50 0-96-10-130z" fill="#FF8FB6" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M130 22c-14 30-14 70-2 124-10 4-16 6-22 6 4-50 0-96 10-130z" fill="#FF8FB6" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M8 18q12 12 22 0t22 0 22 0 22 0 22 0 22 0" fill="#FFD447" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
  <rect x="2" y="156" width="136" height="12" rx="5" fill="#FFFDF6" stroke="${INK}" stroke-width="3.5"/>
</svg>`;

export const teapotSvg = `<svg viewBox="0 0 70 56" aria-hidden="true">
  <path d="M52 26c8-4 14 0 14 6s-6 10-12 12" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
  <path d="M52 26c8-4 14 0 14 6s-6 10-12 12" fill="none" stroke="#7FE0C4" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M16 30L2 18" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M16 30L2 18" stroke="#7FE0C4" stroke-width="4" stroke-linecap="round"/>
  <path d="M12 38c0-14 10-22 23-22s23 8 23 22c0 8-5 14-12 14H24c-7 0-12-6-12-14z" fill="#7FE0C4" stroke="${INK}" stroke-width="3.5"/>
  <path d="M19 32c1-5 4-8 9-10" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".7"/>
  <circle cx="35" cy="30" r="3" fill="#FF8FB6"/><circle cx="44" cy="38" r="3" fill="#FF8FB6"/><circle cx="26" cy="40" r="3" fill="#FF8FB6"/>
  <path d="M24 17c2-5 6-7 11-7s9 2 11 7z" fill="#7FE0C4" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
  <circle cx="35" cy="8" r="4" fill="#FFD447" stroke="${INK}" stroke-width="3"/>
</svg>`;

export const lollyJarSvg = `<svg viewBox="0 0 54 70" aria-hidden="true">
  <path d="M18 24l-4-16M27 24V4M36 24l5-14" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="14" cy="8" r="7" fill="#FF8FB6" stroke="${INK}" stroke-width="3"/><circle cx="27" cy="6" r="7" fill="#FFD447" stroke="${INK}" stroke-width="3"/><circle cx="41" cy="10" r="7" fill="#B59BFF" stroke="${INK}" stroke-width="3"/>
  <path d="M14 8a3 3 0 1 1 3 2M27 6a3 3 0 1 1 3 2M41 10a3 3 0 1 1 3 2" fill="none" stroke="#fff" stroke-width="1.8" opacity=".9"/>
  <rect x="8" y="22" width="38" height="44" rx="12" fill="rgba(220,244,255,.75)" stroke="${INK}" stroke-width="3.5"/>
  <circle cx="20" cy="54" r="5" fill="#FF8FB6"/><circle cx="33" cy="56" r="5" fill="#8EDB9A"/><circle cx="27" cy="45" r="5" fill="#FFD447"/><circle cx="36" cy="44" r="4" fill="#7CCFEA"/>
  <path d="M14 32v14" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".8"/>
</svg>`;

export const cupsSvg = `<svg viewBox="0 0 64 50" aria-hidden="true">
  <path d="M8 26h22l-2 14c-.4 3-3 5-6 5h-6c-3 0-5.6-2-6-5z" fill="#FFD447" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
  <path d="M30 30c5 0 6 6 0 8" fill="none" stroke="${INK}" stroke-width="3.2"/>
  <path d="M34 26h22l-2 14c-.4 3-3 5-6 5h-6c-3 0-5.6-2-6-5z" fill="#FF8FB6" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
  <path d="M21 4h22l-2 14c-.4 3-3 5-6 5h-6c-3 0-5.6-2-6-5z" fill="#7CCFEA" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
  <path d="M2 47h60" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>
</svg>`;

// The sign on the start screen.
export const signSvg = `<svg class="sign-art" viewBox="0 0 360 60" aria-hidden="true" preserveAspectRatio="none">
  <path d="M0 0h360v34q-15 22-30 0t-30 0-30 0-30 0-30 0-30 0-30 0-30 0-30 0-30 0-30 0-30 0z" fill="#FF8FB6" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
  <path d="M30 0v34M90 0v34M150 0v34M210 0v34M270 0v34M330 0v34" stroke="#FFF6E8" stroke-width="22" opacity=".9"/>
  <path d="M0 0h360v34q-15 22-30 0t-30 0-30 0-30 0-30 0-30 0-30 0-30 0-30 0-30 0-30 0-30 0z" fill="none" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
</svg>`;

// A chalk menu board for the café wall: the four foods, each with a price in coins.
export const menuSvg = `<svg viewBox="0 0 150 170" aria-hidden="true">
  <path d="M75 2L40 30M75 2l35 28" stroke="${INK}" stroke-width="2.6" fill="none"/><circle cx="75" cy="4" r="4" fill="#C99A5E" stroke="${INK}" stroke-width="2.4"/>
  <rect x="4" y="26" width="142" height="140" rx="14" fill="#C98B4E" stroke="${INK}" stroke-width="4"/>
  <rect x="14" y="36" width="122" height="120" rx="8" fill="#3E5F58" stroke="${INK}" stroke-width="2.6"/>
  <path d="M24 46c20-4 60-4 100 0" stroke="#fff" stroke-width="2" opacity=".25" fill="none"/>
  ${['cookie', 'cupcake', 'doughnut', 'strawberry'].map((f, i) => {
    const y = 44 + i * 27;
    return `<use href="#food-${f}" x="22" y="${y}" width="25" height="25"/>
      <path d="M54 ${y + 13}h40" stroke="#fff" stroke-width="2.4" stroke-dasharray="1 6" stroke-linecap="round" opacity=".7"/>
      ${Array.from({ length: (i % 3) + 1 }, (_, k) => `<circle cx="${122 - k * 11}" cy="${y + 13}" r="4.6" fill="#FFC83D" stroke="#fff" stroke-width="1.4"/>`).join('')}`;
  }).join('')}
  <path d="M30 162l-6 6M120 162l6 6" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
</svg>`;

// A pendant lamp shade (the cord is drawn by CSS, so it can be any length).
export const lampSvg = (shade, rim) => `<svg viewBox="0 0 80 80" aria-hidden="true">
  <circle cx="40" cy="52" r="34" fill="#FFF3B0" opacity=".3"/>
  <circle cx="40" cy="44" r="11" fill="#FFF6C8" stroke="${INK}" stroke-width="2.6"/>
  <rect x="33" y="4" width="14" height="10" rx="2.5" fill="#C99A5E" stroke="${INK}" stroke-width="2.6"/>
  <path d="M28 12h24l26 30H2z" fill="${shade}" stroke="${INK}" stroke-width="3.4" stroke-linejoin="round"/>
  <path d="M5 40h70" stroke="${rim}" stroke-width="4" stroke-linecap="round"/>
  <path d="M16 32l12-14" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".6"/>
</svg>`;
