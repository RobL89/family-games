// Café makeover: the decorations the children can buy with their coins, drawn in SVG.
// Each one has a spot in the café scene (placed by layout() in game.js).

import { INK } from './art.js';

const balloon = (cx, cy, fill, light) => `
  <path d="M${cx} ${cy + 30}l-5 7h10z" fill="${fill}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
  <ellipse cx="${cx}" cy="${cy}" rx="24" ry="29" fill="${fill}" stroke="${INK}" stroke-width="3.2"/>
  <path d="M${cx - 13} ${cy - 12}c2-7 6-11 12-12" fill="none" stroke="${light}" stroke-width="5" stroke-linecap="round"/>`;

const BALLOONS = `<svg viewBox="0 0 120 210" aria-hidden="true">
  <path d="M30 70C40 120 58 150 60 196M62 52C62 110 58 150 60 196M92 82C80 130 64 160 60 196" fill="none" stroke="${INK}" stroke-width="2.2"/>
  <g class="bl bl1">${balloon(30, 44, '#FF8FB6', '#FFD3E3')}</g>
  <g class="bl bl3">${balloon(92, 56, '#7CCFEA', '#D3F1FB')}</g>
  <g class="bl bl2">${balloon(62, 28, '#FFD447', '#FFF2B5')}</g>
  <path d="M50 192h20l-3 14H53z" fill="#B59BFF" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
</svg>`;

const PLANT = `<svg viewBox="0 0 110 140" aria-hidden="true">
  <g class="leaves">
    <path d="M54 92C40 70 14 66 6 44c22-2 42 12 50 44z" fill="#5CC46A" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
    <path d="M56 92C70 66 92 62 104 38c-24 0-44 14-50 50z" fill="#4DB35C" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
    <path d="M55 90C46 60 50 30 66 8c10 24 4 56-11 82z" fill="#74D483" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
    <path d="M55 90C38 64 28 40 34 16c16 14 24 44 21 74z" fill="#5CC46A" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
    <path d="M18 50q16 6 30 26M94 44q-16 8-28 30M62 22q-4 30-6 58M38 28q8 26 14 52" fill="none" stroke="#2E8A44" stroke-width="2" stroke-linecap="round" opacity=".6"/>
  </g>
  <path d="M24 92h62l-7 42c-.4 2.6-2.6 4.4-5.2 4.4H36.2c-2.6 0-4.8-1.8-5.2-4.4z" fill="#FF8FB6" stroke="${INK}" stroke-width="3.4" stroke-linejoin="round"/>
  <rect x="18" y="86" width="74" height="14" rx="5" fill="#FF6FA1" stroke="${INK}" stroke-width="3.4"/>
  <circle cx="42" cy="112" r="3.5" fill="#fff"/><circle cx="58" cy="122" r="3.5" fill="#fff"/><circle cx="68" cy="108" r="3.5" fill="#fff"/><circle cx="48" cy="128" r="2.6" fill="#fff"/>
</svg>`;

const BULB_COLOURS = ['#FF5C8D', '#FFD447', '#7CCFEA', '#8EDB5A', '#B59BFF', '#FFA552'];
// A string of fairy lights with n swags (each 120 wide), so it can be repeated without stretching.
export function lightsStrip(n) {
  let wire = 'M0 4';
  let bulbs = '';
  for (let k = 0; k < n; k++) {
    wire += ` Q${k * 120 + 60} 40 ${k * 120 + 120} 4`;
    for (let j = 0; j < 4; j++) {
      const t = (j + 0.5) / 4;
      const x = k * 120 + t * 120;
      const y = (1 - t) * (1 - t) * 4 + 2 * (1 - t) * t * 40 + t * t * 4;
      const c = BULB_COLOURS[(k * 4 + j) % BULB_COLOURS.length];
      bulbs += `<g class="bulb" style="--d:${((k * 4 + j) * 0.37) % 2}s"><rect x="${x - 3}" y="${y - 2}" width="6" height="6" rx="1.5" fill="#6E5A7A"/>
        <circle class="glow" cx="${x}" cy="${y + 12}" r="12" fill="${c}" opacity=".4"/>
        <path d="M${x} ${y + 3}c5 0 7 5 7 9s-3 7-7 7-7-3-7-7 2-9 7-9z" fill="${c}" stroke="${INK}" stroke-width="2"/>
        <circle cx="${x - 2.5}" cy="${y + 9}" r="1.8" fill="#fff" opacity=".8"/></g>`;
    }
  }
  return `<svg viewBox="-4 0 ${n * 120 + 8} 50" aria-hidden="true"><path d="${wire}" fill="none" stroke="#6E5A7A" stroke-width="2.4"/>${bulbs}</svg>`;
}

const CAKE = `<svg viewBox="0 0 110 120" aria-hidden="true">
  <path d="M55 6v104" stroke="${INK}" stroke-width="4"/>
  <circle cx="55" cy="8" r="6" fill="#FFD447" stroke="${INK}" stroke-width="3"/>
  <use href="#food-cupcake" x="26" y="20" width="28" height="28"/><use href="#food-cupcake" x="56" y="20" width="28" height="28"/>
  <path d="M20 48h70" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M20 48h70" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>
  <path d="M14 98v-18c0-10 8-16 16-16h50c8 0 16 6 16 16v18z" fill="#FFE3EE" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
  <path d="M14 76c6 6 12 6 18 0s12-6 18 0 12 6 18 0 12-6 18 0 12 6 10 2" fill="none" stroke="#FF8FB6" stroke-width="6" stroke-linecap="round"/>
  <circle cx="30" cy="66" r="5" fill="#E8344E" stroke="${INK}" stroke-width="2.4"/><circle cx="55" cy="64" r="5" fill="#E8344E" stroke="${INK}" stroke-width="2.4"/><circle cx="80" cy="66" r="5" fill="#E8344E" stroke="${INK}" stroke-width="2.4"/>
  <path d="M6 100h98" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><path d="M6 100h98" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round"/>
  <path d="M46 102l-6 14h30l-6-14" fill="#FFFFFF" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
</svg>`;

const FISH = `<svg viewBox="0 0 110 104" aria-hidden="true">
  <defs><clipPath id="bowl-water"><path d="M14 44h82a45 45 0 1 1-82 0z"/></clipPath></defs>
  <path d="M30 14h50c0 8-4 10-4 14a46 46 0 1 1-42 0c0-4-4-6-4-14z" fill="rgba(220,244,255,.55)"/>
  <g clip-path="url(#bowl-water)">
    <rect x="0" y="36" width="110" height="70" fill="#9FDDF7"/>
    <path d="M0 40q14-6 28 0t28 0 28 0 28 0v8H0z" fill="#C6ECFB"/>
    <path d="M10 92q12-8 24-2t26-2 24 2 26-2v20H10z" fill="#FFD9A8" stroke="${INK}" stroke-width="2.4"/>
    <path d="M30 92c-4-12 4-22 0-34M38 92c4-10-4-18 2-28" fill="none" stroke="#4DB35C" stroke-width="5" stroke-linecap="round"/>
    <g class="fish-swim"><g class="fish-flip">
      <path d="M50 64c10-10 26-10 32 0-6 10-22 10-32 0z" fill="#FFA552" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M50 64l-10-8v16z" fill="#FF7A3D" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
      <circle cx="74" cy="62" r="2.6" fill="${INK}"/><path d="M60 58q4 6 0 12" fill="none" stroke="#FF7A3D" stroke-width="2.4"/>
    </g></g>
    <g class="fish-bubbles"><circle cx="82" cy="50" r="3" fill="none" stroke="#fff" stroke-width="2"/><circle cx="86" cy="42" r="2" fill="none" stroke="#fff" stroke-width="2"/></g>
  </g>
  <path d="M30 14h50c0 8-4 10-4 14a46 46 0 1 1-42 0c0-4-4-6-4-14z" fill="none" stroke="${INK}" stroke-width="3.4" stroke-linejoin="round"/>
  <rect x="26" y="8" width="58" height="9" rx="4.5" fill="#E9F7FF" stroke="${INK}" stroke-width="3.2"/>
  <path d="M24 56c-2 10 0 18 4 24" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>
</svg>`;

const JUKEBOX = `<svg viewBox="0 0 130 190" aria-hidden="true">
  <path d="M10 186V70C10 34 34 8 65 8s55 26 55 62v116z" fill="#B59BFF" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
  <path class="jb-arc a1" d="M20 120V72c0-28 20-52 45-52s45 24 45 52v48" fill="none" stroke="#FF5C8D" stroke-width="7"/>
  <path class="jb-arc a2" d="M29 120V73c0-23 16-43 36-43s36 20 36 43v47" fill="none" stroke="#FFD447" stroke-width="7"/>
  <path class="jb-arc a3" d="M38 120V74c0-18 12-34 27-34s27 16 27 34v46" fill="none" stroke="#7CCFEA" stroke-width="7"/>
  <path d="M46 120V76c0-12 8-24 19-24s19 12 19 24v44z" fill="#3D2340"/>
  <g class="jb-disc"><circle cx="65" cy="88" r="14" fill="#2A1730" stroke="#6E5A7A" stroke-width="2"/><circle cx="65" cy="88" r="5" fill="#FF5C8D"/><path d="M56 82a11 11 0 0 1 8-5" stroke="#8E7A9A" stroke-width="2" fill="none"/></g>
  <rect x="18" y="124" width="94" height="44" rx="8" fill="#FFF1D6" stroke="${INK}" stroke-width="3.4"/>
  <path d="M28 134h74M28 144h74M28 154h74" stroke="#E8C9A0" stroke-width="4" stroke-linecap="round"/>
  <circle cx="34" cy="178" r="4" fill="#FF5C8D" stroke="${INK}" stroke-width="2"/><circle cx="50" cy="178" r="4" fill="#FFD447" stroke="${INK}" stroke-width="2"/><circle cx="66" cy="178" r="4" fill="#7CCFEA" stroke="${INK}" stroke-width="2"/><circle cx="82" cy="178" r="4" fill="#8EDB5A" stroke="${INK}" stroke-width="2"/><circle cx="98" cy="178" r="4" fill="#FF5C8D" stroke="${INK}" stroke-width="2"/>
  <path d="M22 60c4-16 14-30 30-36" fill="none" stroke="#DDD2FF" stroke-width="5" stroke-linecap="round"/>
</svg>`;

const HEART_PATH = 'M60 98C26 76 8 56 8 34 8 18 20 8 34 8c11 0 20 6 26 16 6-10 15-16 26-16 14 0 26 10 26 26 0 22-18 42-52 64z';
const NEON = `<svg viewBox="0 0 120 108" aria-hidden="true">
  <path d="M36 4v8M84 4v8" stroke="#8E7A9A" stroke-width="2.4"/>
  <rect x="2" y="10" width="116" height="96" rx="16" fill="#4A2D52" stroke="${INK}" stroke-width="3.4"/>
  <g class="neon-glow" transform="translate(18 18) scale(.7)">
    <path d="${HEART_PATH}" fill="none" stroke="#FF5C8D" stroke-width="18" opacity=".35" stroke-linejoin="round"/>
    <path d="${HEART_PATH}" fill="none" stroke="#FF8FB6" stroke-width="9" stroke-linejoin="round"/>
    <path d="${HEART_PATH}" fill="none" stroke="#FFE3EE" stroke-width="3.4" stroke-linejoin="round"/>
  </g>
  <circle cx="14" cy="22" r="3" fill="#8E7A9A"/><circle cx="106" cy="22" r="3" fill="#8E7A9A"/>
</svg>`;

const CAT = `<svg viewBox="0 0 140 80" aria-hidden="true">
  <path class="cat-tail" d="M112 64c18 2 24-8 20-18-3-8-12-8-14-2" fill="none" stroke="${INK}" stroke-width="13" stroke-linecap="round"/>
  <path class="cat-tail" d="M112 64c18 2 24-8 20-18-3-8-12-8-14-2" fill="none" stroke="#FFB765" stroke-width="7" stroke-linecap="round"/>
  <g class="cat-body">
    <path d="M20 76c-6-26 14-46 50-46s52 18 48 46z" fill="#FFB765" stroke="${INK}" stroke-width="3.4" stroke-linejoin="round"/>
    <path d="M58 36c6 8 6 16 2 22M76 34c6 8 6 18 2 24M94 40c5 8 5 16 1 22" fill="none" stroke="#E8893A" stroke-width="5" stroke-linecap="round"/>
  </g>
  <path d="M8 58c0-14 10-24 24-24 13 0 22 9 22 22 0 12-9 20-23 20C17 76 8 70 8 58z" fill="#FFB765" stroke="${INK}" stroke-width="3.4"/>
  <path d="M12 44l-2-16 14 8zM46 38l6-14 4 16z" fill="#FFB765" stroke="${INK}" stroke-width="3.2" stroke-linejoin="round"/>
  <path d="M14 42l-1-9 7 5zM48 36l3-8 2 9z" fill="#FF9EC4"/>
  <path d="M18 56q5 4 10 0M36 56q5 4 10 0" fill="none" stroke="${INK}" stroke-width="2.8" stroke-linecap="round"/>
  <path d="M30 63l2 2 2-2" fill="#FF7A9C" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M6 62h8M6 67l8-2M50 62h8M50 65l8 2" stroke="${INK}" stroke-width="1.6" stroke-linecap="round" opacity=".55"/>
  <path d="M28 76c0-4 3-6 8-6s8 2 8 6" fill="#FFB765" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
</svg>`;

const CHANDELIER = `<svg viewBox="0 0 180 150" aria-hidden="true">
  <path d="M90 0v34" stroke="#C99A2E" stroke-width="4" stroke-dasharray="6 3"/>
  <g class="ch-arms">
    <path d="M28 70c0 18 26 24 62 24s62-6 62-24" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>
    <path d="M28 70c0 18 26 24 62 24s62-6 62-24" fill="none" stroke="#FFC83D" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M58 70c0 12 14 16 32 16s32-4 32-16" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
    <path d="M58 70c0 12 14 16 32 16s32-4 32-16" fill="none" stroke="#FFC83D" stroke-width="3.6" stroke-linecap="round"/>
    <path d="M76 34h28l6 70c0 10-9 16-20 16s-20-6-20-16z" fill="#FFC83D" stroke="${INK}" stroke-width="3.4" stroke-linejoin="round"/>
    <path d="M82 46l2 50" stroke="#FFE9A3" stroke-width="4" stroke-linecap="round"/>
    ${[28, 58, 122, 152].map((x) => `
      <rect x="${x - 6}" y="56" width="12" height="16" rx="2" fill="#fff" stroke="${INK}" stroke-width="2.6"/>
      <path class="flame" d="M${x} 38c5 6 6 10 6 13a6 6 0 0 1-12 0c0-3 1-7 6-13z" fill="#FFB43D" stroke="${INK}" stroke-width="2.2"/>
      <circle class="glow" cx="${x}" cy="48" r="14" fill="#FFE27A" opacity=".35"/>`).join('')}
    ${[[40, 96], [70, 104], [110, 104], [140, 96], [90, 132]].map(([x, y]) => `
      <path d="M${x} ${y - 10}v6" stroke="#C99A2E" stroke-width="2"/>
      <path class="crystal" d="M${x} ${y - 4}l6 8-6 10-6-10z" fill="#DDF4FF" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>`).join('')}
  </g>
</svg>`;

export const DECOR = [
  { id: 'balloons', name: 'Balloons', price: 10, svg: BALLOONS },
  { id: 'plant', name: 'Plant', price: 15, svg: PLANT },
  { id: 'lights', name: 'Fairy lights', price: 20, svg: lightsStrip(2), wide: true },
  { id: 'cake', name: 'Cake stand', price: 30, svg: CAKE },
  { id: 'fish', name: 'Fish bowl', price: 40, svg: FISH },
  { id: 'jukebox', name: 'Jukebox', price: 50, svg: JUKEBOX },
  { id: 'neon', name: 'Neon heart', price: 60, svg: NEON },
  { id: 'cat', name: 'Sleepy cat', price: 80, svg: CAT },
  { id: 'chandelier', name: 'Chandelier', price: 100, svg: CHANDELIER },
];

export const DECOR_IDS = DECOR.map((d) => d.id);

// Height for each width, from each picture's viewBox.
export const ASPECT = { balloons: 210 / 120, plant: 140 / 110, cake: 120 / 110, fish: 104 / 110, jukebox: 190 / 130, neon: 108 / 120, cat: 80 / 140, chandelier: 150 / 180 };
