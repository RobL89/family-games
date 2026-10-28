// Scenery and effects for the bonus skins (P22, P31). Launcher and home screens only.
//
// - Each skin gets a background scene in the .deco layer, rebuilt whenever the skin changes.
// - Small pictures (fairy wings, unicorn horn, skin emblems) are set as CSS variables
//   (--art-*) so the skin CSS files can place them.
// - Taps make a burst in the skin's style; the fairy skin also leaves a trail of fairy dust.
// Colours, fonts and frames stay in shared/skins/*.css.

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const range = (n) => Array.from({ length: n }, (_, i) => i);
const svgUrl = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}")`;

// ---------- Small pictures used by the skin CSS ----------

const ART = {
  'fairy-wings': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 130">
      <defs>
        <linearGradient id="w" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#DDB8FF"/><stop offset=".5" stop-color="#A9E4FF"/><stop offset="1" stop-color="#FFB5DE"/>
        </linearGradient>
      </defs>
      <g fill="url(#w)" fill-opacity=".95" stroke="#B98BEA" stroke-width="3.5" stroke-linejoin="round">
        <path d="M110 62 C80 4 14 -2 8 36 C3 70 60 80 110 62 Z"/>
        <path d="M110 68 C78 74 34 100 46 122 C58 138 96 106 110 72 Z"/>
        <path d="M110 62 C140 4 206 -2 212 36 C217 70 160 80 110 62 Z"/>
        <path d="M110 68 C142 74 186 100 174 122 C162 138 124 106 110 72 Z"/>
      </g>
      <g fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".9">
        <path d="M108 60 C80 40 50 30 22 34"/><path d="M104 58 C84 50 60 52 38 62"/>
        <path d="M112 60 C140 40 170 30 198 34"/><path d="M116 58 C136 50 160 52 182 62"/>
        <path d="M106 72 C90 88 72 102 58 116"/><path d="M114 72 C130 88 148 102 162 116"/>
      </g>
      <g fill="#fff"><circle cx="40" cy="28" r="3"/><circle cx="182" cy="30" r="3"/><circle cx="64" cy="108" r="2.4"/><circle cx="158" cy="108" r="2.4"/></g>
    </svg>`,
  'fairy-flower': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
      <g fill="#FFB8DA" stroke="#fff" stroke-width="1.5">
        ${range(5).map((i) => `<ellipse cx="20" cy="9" rx="7" ry="9" transform="rotate(${i * 72} 20 20)"/>`).join('')}
      </g>
      <circle cx="20" cy="20" r="6" fill="#FFD95A" stroke="#fff" stroke-width="1.5"/>
    </svg>`,
  'unicorn-horn': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 80">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF3B0"/><stop offset=".55" stop-color="#FFC94D"/><stop offset="1" stop-color="#F29E2E"/></linearGradient></defs>
      <path d="M20 2 L35 72 Q20 82 5 72 Z" fill="url(#g)" stroke="#E08A1E" stroke-width="2" stroke-linejoin="round"/>
      <g stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".85">
        <path d="M14 30 L27 24"/><path d="M11 44 L30 36"/><path d="M8 58 L32 48"/><path d="M7 70 L33 62"/>
      </g>
      <circle cx="17" cy="16" r="2.4" fill="#fff"/>
    </svg>`,
  'emblem-sticker': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
      <path d="M24 3l6 13 14 2-10 9.6 2.4 14L24 35l-12.4 6.6L14 27.6 4 18l14-2z" fill="#FFC928" stroke="#2B2118" stroke-width="3" stroke-linejoin="round"/>
    </svg>`,
  'emblem-fairy': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
      <path d="M20 46 C21 38 21 32 22 26 L28 26 C29 32 29 38 30 46 Z" fill="#FFF4E6" stroke="#B07AD6" stroke-width="2"/>
      <path d="M6 28 C6 10 42 10 42 28 C34 31 14 31 6 28 Z" fill="#EF5B7A" stroke="#fff" stroke-width="2"/>
      <g fill="#fff"><circle cx="15" cy="21" r="3"/><circle cx="25" cy="16" r="3.6"/><circle cx="34" cy="22" r="2.6"/></g>
      <path d="M40 6l1.5 3.5L45 11l-3.5 1.5L40 16l-1.5-3.5L35 11l3.5-1.5z" fill="#FFF7B0"/>
    </svg>`,
  'emblem-unicorn': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
      <g fill="none" stroke-width="4">
        <path d="M4 44 A20 20 0 0 1 44 44" stroke="#FF9EC4"/><path d="M9 44 A15 15 0 0 1 39 44" stroke="#FFE28A"/>
        <path d="M14 44 A10 10 0 0 1 34 44" stroke="#9FD3FF"/>
      </g>
      <path d="M24 2 L30 32 Q24 36 18 32 Z" fill="#FFC94D" stroke="#E08A1E" stroke-width="1.5"/>
      <g stroke="#fff" stroke-width="2" stroke-linecap="round"><path d="M21 15 L27 12"/><path d="M19 23 L29 19"/><path d="M18 30 L30 26"/></g>
    </svg>`,
  'emblem-blocks': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" shape-rendering="crispEdges">
      <path d="M24 5 L42 14 L24 23 L6 14 Z" fill="#7DF2E4"/><path d="M6 14 L24 23 L24 44 L6 35 Z" fill="#2FB8C9"/>
      <path d="M42 14 L42 35 L24 44 L24 23 Z" fill="#1C7F9C"/>
      <path d="M24 5 L42 14 L42 35 L24 44 L6 35 L6 14 Z M6 14 L24 23 L42 14 M24 23 L24 44" fill="none" stroke="#1A1033" stroke-width="2.5" stroke-linejoin="round"/>
    </svg>`,
};

// ---------- Shapes the scenes and bursts reuse ----------

const SPRITE = `
<svg id="fx-sprite" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
  <symbol id="fx-sparkle" viewBox="0 0 24 24"><path d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0 Z" fill="currentColor"/></symbol>
  <symbol id="fx-heart" viewBox="0 0 24 22"><path d="M12 21 C5 15 0 11 0 6 C0 2.5 2.7 0 6 0 C8.5 0 10.6 1.4 12 3.6 C13.4 1.4 15.5 0 18 0 C21.3 0 24 2.5 24 6 C24 11 19 15 12 21 Z" fill="currentColor"/></symbol>
  <symbol id="fx-cube" viewBox="0 0 40 42" shape-rendering="crispEdges">
    <path d="M20 2 L38 11 L20 20 L2 11 Z" style="fill:var(--ct,#7DF2E4)"/>
    <path d="M2 11 L20 20 L20 40 L2 31 Z" style="fill:var(--cl,#2FB8C9)"/>
    <path d="M38 11 L38 31 L20 40 L20 20 Z" style="fill:var(--cr,#1C7F9C)"/>
    <path d="M20 2 L38 11 L38 31 L20 40 L2 31 L2 11 Z M2 11 L20 20 L38 11 M20 20 L20 40" fill="none" stroke="#1A1033" stroke-width="2" stroke-linejoin="round"/>
  </symbol>
</svg>`;

// ---------- Scenes ----------

function fairyScene() {
  const stars = range(18).map(() =>
    `<svg class="f-star" style="left:${rnd(2, 96)}%;top:${rnd(2, 42)}%;--s:${rnd(.5, 1.3)};--d:${rnd(2, 4.5)}s;--delay:${-rnd(0, 5)}s"><use href="#fx-sparkle"></use></svg>`).join('');
  const flies = range(14).map(() =>
    `<i class="f-fly" style="left:${rnd(4, 94)}%;top:${rnd(28, 90)}%;--dx:${rnd(-50, 50)}px;--dy:${rnd(-70, -15)}px;--d:${rnd(5, 10)}s;--delay:${-rnd(0, 10)}s"></i>`).join('');
  const daisy = (x, y, s) => `
    <g transform="translate(${x} ${y}) scale(${s})">
      <path d="M0 0 C2 20 -2 40 0 60" stroke="#6DBB7A" stroke-width="4" fill="none"/>
      <g fill="#fff">${range(8).map((i) => `<ellipse cx="0" cy="-11" rx="5" ry="10" transform="rotate(${i * 45})"/>`).join('')}</g>
      <circle r="6" fill="#FFD24A"/>
    </g>`;
  const bluebell = (x, y, s) => `
    <g transform="translate(${x} ${y}) scale(${s})">
      <path d="M0 70 C2 40 6 18 22 4" stroke="#6DBB7A" stroke-width="4" fill="none"/>
      ${[[20, 10], [12, 26], [6, 44]].map(([bx, by]) =>
        `<path d="M${bx - 8} ${by} Q${bx} ${by - 12} ${bx + 8} ${by} L${bx + 10} ${by + 12} Q${bx} ${by + 8} ${bx - 10} ${by + 12} Z" fill="#9C7BF2" stroke="#fff" stroke-width="1.5"/>`).join('')}
    </g>`;
  const toadstool = (x, s, cap) => `
    <g transform="translate(${x} 180) scale(${s})">
      <path d="M-18 0 C-16 -30 -14 -56 -10 -78 L10 -78 C14 -56 16 -30 18 0 Z" fill="#FFF4E6" stroke="#EAD3C0" stroke-width="3"/>
      <ellipse cx="0" cy="-78" rx="46" ry="9" fill="#F7CFC6"/>
      <path d="M-52 -78 C-52 -132 52 -132 52 -78 C30 -70 -30 -70 -52 -78 Z" fill="${cap}" stroke="#fff" stroke-width="3"/>
      <g fill="#fff"><circle cx="-26" cy="-96" r="8"/><circle cx="0" cy="-110" r="10"/><circle cx="26" cy="-94" r="7"/><circle cx="12" cy="-86" r="4"/><circle cx="-12" cy="-84" r="4"/></g>
    </g>`;
  const grass = range(16).map((i) => {
    const x = i * 15 + rnd(0, 6);
    const h = rnd(18, 34);
    return `<path d="M${x} 180 Q${x + 3} ${180 - h / 2} ${x + rnd(-4, 8)} ${180 - h} Q${x + 6} ${180 - h / 2} ${x + 9} 180 Z" fill="#7CC48A"/>`;
  }).join('');
  const cluster = (capA, capB) => `
    <svg class="f-mush" viewBox="0 0 240 180">
      ${grass}
      ${toadstool(86, 1, capA)}${toadstool(176, .55, capB)}
      ${daisy(150, 130, .7)}${daisy(28, 140, .55)}${bluebell(206, 112, .8)}
    </svg>`;
  return `
    <svg class="f-moon" viewBox="0 0 100 100"><path d="M60 8 A44 44 0 1 0 94 72 A36 36 0 1 1 60 8 Z" fill="#FFF3C7"/>
      <circle cx="40" cy="42" r="4" fill="#F4E2A6"/><circle cx="30" cy="62" r="6" fill="#F4E2A6"/></svg>
    ${stars}
    <svg class="f-vine" viewBox="0 0 220 200">
      <path d="M220 0 C176 26 196 70 156 92 C122 110 134 146 96 168" stroke="#6DBB7A" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M205 0 C190 40 214 60 200 100" stroke="#6DBB7A" stroke-width="4" fill="none" stroke-linecap="round"/>
      ${[[186, 30, -30], [172, 72, 20], [140, 100, -40], [120, 132, 30], [206, 70, 40]].map(([x, y, r]) =>
        `<ellipse cx="${x}" cy="${y}" rx="12" ry="6" fill="#8ED39A" transform="rotate(${r} ${x} ${y})"/>`).join('')}
      ${[[160, 90], [100, 166], [198, 100], [182, 40]].map(([x, y]) =>
        `<g transform="translate(${x} ${y})"><g fill="#FFB8DA">${range(5).map((i) => `<ellipse cx="0" cy="-6" rx="4" ry="6" transform="rotate(${i * 72})"/>`).join('')}</g><circle r="3.5" fill="#FFD95A"/></g>`).join('')}
    </svg>
    <svg class="f-hills" viewBox="0 0 1200 200" preserveAspectRatio="none">
      <path d="M0 110 C200 60 380 130 600 90 C820 50 1000 120 1200 80 L1200 200 L0 200 Z" fill="#C7E9C9"/>
      <path d="M0 150 C220 120 420 170 640 140 C860 112 1020 160 1200 132 L1200 200 L0 200 Z" fill="#9ED6A6"/>
    </svg>
    <div class="f-mush-l">${cluster('#EF5B7A', '#B987F2')}</div>
    <div class="f-mush-r">${cluster('#B987F2', '#EF5B7A')}</div>
    ${flies}`;
}

function unicornScene() {
  const bands = ['#FF9EC4', '#FFC48A', '#FFE58A', '#A8E6A3', '#9FD3FF', '#C7A6FF'];
  const cloud = (cls, style) => `
    <svg class="${cls}" style="${style}" viewBox="0 0 120 64"><g fill="#fff">
      <circle cx="34" cy="40" r="18"/><circle cx="58" cy="28" r="24"/><circle cx="86" cy="38" r="18"/><rect x="18" y="38" width="86" height="20" rx="10"/>
    </g></svg>`;
  const hearts = range(10).map(() =>
    `<svg class="u-heart" style="left:${rnd(3, 95)}%;color:${pick(bands)};--s:${rnd(.6, 1.3)};--d:${rnd(9, 16)}s;--delay:${-rnd(0, 16)}s;--sway:${rnd(-30, 30)}px"><use href="#fx-heart"></use></svg>`).join('');
  const sparkles = range(14).map(() =>
    `<svg class="u-spark" style="left:${rnd(2, 97)}%;top:${rnd(3, 60)}%;color:${pick(['#fff', '#FFE58A', '#FFC4E1'])};--s:${rnd(.5, 1.2)};--d:${rnd(2, 4)}s;--delay:${-rnd(0, 4)}s"><use href="#fx-sparkle"></use></svg>`).join('');
  const clouds = range(4).map((i) =>
    cloud('u-cloud', `top:${6 + i * 13}%;--w:${rnd(90, 170)}px;--d:${rnd(70, 110)}s;--delay:${-rnd(0, 110)}s;opacity:${rnd(.75, 1)}`)).join('');
  return `
    ${clouds}
    ${sparkles}
    <svg class="u-rainbow" viewBox="0 0 400 214">
      ${bands.map((c, i) => `<path d="M${20 + i * 14} 200 A${180 - i * 14} ${180 - i * 14} 0 0 1 ${380 - i * 14} 200" stroke="${c}" stroke-width="15" fill="none" pathLength="100" style="--i:${i}"/>`).join('')}
      <g fill="#fff"><circle cx="34" cy="200" r="22"/><circle cx="62" cy="206" r="16"/><circle cx="12" cy="208" r="14"/>
        <circle cx="366" cy="200" r="22"/><circle cx="338" cy="206" r="16"/><circle cx="388" cy="208" r="14"/></g>
    </svg>
    ${hearts}
    <svg class="u-mascot" viewBox="0 0 200 230">
      <defs><linearGradient id="u-horn" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF3B0"/><stop offset="1" stop-color="#F6A92E"/></linearGradient></defs>
      <path d="M58 230 C56 196 58 172 62 150 L138 150 C142 172 144 196 142 230 Z" fill="#fff" stroke="#E4D6F2" stroke-width="3"/>
      <g stroke="#fff" stroke-width="3">
        <circle cx="50" cy="96" r="30" fill="#FFB3D1"/><circle cx="150" cy="96" r="30" fill="#C7A6FF"/>
        <circle cx="62" cy="62" r="28" fill="#FFD59E"/><circle cx="138" cy="62" r="28" fill="#9FD3FF"/>
        <circle cx="44" cy="134" r="24" fill="#A8E6A3"/><circle cx="156" cy="134" r="24" fill="#FFE58A"/>
      </g>
      <path d="M58 70 L70 26 L92 60 Z" fill="#fff" stroke="#E4D6F2" stroke-width="3" stroke-linejoin="round"/>
      <path d="M142 70 L130 26 L108 60 Z" fill="#fff" stroke="#E4D6F2" stroke-width="3" stroke-linejoin="round"/>
      <path d="M66 60 L71 38 L82 56 Z" fill="#FFC4DD"/><path d="M134 60 L129 38 L118 56 Z" fill="#FFC4DD"/>
      <ellipse cx="100" cy="112" rx="58" ry="54" fill="#fff" stroke="#E4D6F2" stroke-width="3"/>
      <path d="M88 64 L100 4 L112 64 Z" fill="url(#u-horn)" stroke="#E08A1E" stroke-width="2.5" stroke-linejoin="round"/>
      <g stroke="#fff" stroke-width="3" stroke-linecap="round"><path d="M93 46 L106 40"/><path d="M91 56 L109 49"/><path d="M96 34 L104 30"/></g>
      <path d="M70 66 C82 52 100 56 104 70 C112 60 126 62 128 72 C112 70 96 80 82 78 C76 76 72 72 70 66 Z" fill="#FFB3D1" stroke="#fff" stroke-width="2.5"/>
      <ellipse cx="100" cy="142" rx="36" ry="24" fill="#FFE3EE"/>
      <ellipse cx="88" cy="140" rx="3.2" ry="4.6" fill="#E79BB8"/><ellipse cx="112" cy="140" rx="3.2" ry="4.6" fill="#E79BB8"/>
      <path d="M92 154 Q100 160 108 154" stroke="#B0749A" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M66 106 Q77 95 88 106" stroke="#4A3A6B" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <path d="M112 106 Q123 95 134 106" stroke="#4A3A6B" stroke-width="4.5" fill="none" stroke-linecap="round"/>
      <g stroke="#4A3A6B" stroke-width="2.5" stroke-linecap="round"><path d="M68 100 L63 95"/><path d="M132 100 L137 95"/></g>
      <circle cx="64" cy="124" r="9" fill="#FFB3D1" opacity=".85"/><circle cx="136" cy="124" r="9" fill="#FFB3D1" opacity=".85"/>
    </svg>`;
}

function blocksScene() {
  // Pixel sun: rows of a circle on a 16 x 16 grid, with retro gaps in the lower half.
  const sunRows = range(16).map((y) => {
    if ([10, 12, 14].includes(y)) return '';
    const half = Math.floor(Math.sqrt(Math.max(0, 64 - (y - 7.5) ** 2)));
    if (!half) return '';
    const shade = ['#FFF2A8', '#FFE477', '#FFD15C', '#FFB84D', '#FF9A45', '#FF7A4A'][Math.min(5, Math.floor(y / 2.7))];
    return `<rect x="${8 - half}" y="${y}" width="${half * 2}" height="1" fill="${shade}"/>`;
  }).join('');
  // Stepped hills: a little bit of sine, then snapped to the pixel grid.
  const hills = (seed, base, amp, colour) => {
    let d = 'M0 40';
    for (let x = 0; x <= 120; x += 4) {
      const y = Math.round(base - amp * (Math.sin(x / 9 + seed) * .6 + Math.sin(x / 4.3 + seed * 2) * .4));
      d += ` L${x} ${y} L${x + 4} ${y}`;
    }
    return `<path d="${d} L124 40 Z" fill="${colour}"/>`;
  };
  const palettes = [
    ['#7DF2E4', '#2FB8C9', '#1C7F9C'], ['#FF9FD2', '#FF4FA3', '#B8287A'],
    ['#FFE88A', '#FFC93D', '#D9921C'], ['#C8B2FF', '#8E6CF0', '#5A3CB8'], ['#9DF59A', '#4CCB66', '#2A8A45'],
  ];
  const cubes = range(7).map((i) => {
    const [t, l, r] = palettes[i % palettes.length];
    return `<svg class="b-cube" style="left:${rnd(3, 92)}%;top:${rnd(8, 62)}%;--w:${Math.round(rnd(26, 58))}px;--d:${rnd(2.4, 4)}s;--delay:${-rnd(0, 4)}s"><use href="#fx-cube" style="--ct:${t};--cl:${l};--cr:${r}"></use></svg>`;
  }).join('');
  const stars = range(26).map(() =>
    `<i class="b-star" style="left:${rnd(1, 99)}%;top:${rnd(1, 40)}%;--d:${rnd(1.2, 3)}s;--delay:${-rnd(0, 3)}s"></i>`).join('');
  return `
    ${stars}
    <svg class="b-sun" viewBox="0 0 16 16" shape-rendering="crispEdges">${sunRows}</svg>
    <i class="b-comet"></i>
    <svg class="b-hills" viewBox="0 0 120 40" preserveAspectRatio="none" shape-rendering="crispEdges">
      ${hills(1.3, 20, 9, '#5B2C8C')}${hills(4.1, 28, 6, '#3A1E6B')}${hills(2.2, 35, 3, '#241347')}
    </svg>
    ${cubes}`;
}

const SCENES = { fairy: fairyScene, unicorn: unicornScene, blocks: blocksScene };

// ---------- Tap bursts and the fairy-dust trail ----------

let fx = null;

function particle(html, x, y, size, { dx, dy, lift = 0, gravity = 0, t = 900, r = 0, s0 = 1, s1 = .3 }) {
  const holder = document.createElement('div');
  holder.innerHTML = html.trim();
  const el = holder.firstElementChild;
  const h = size / 2;
  el.style.cssText += `;width:${size}px;height:${size}px;--x0:${x - h}px;--y0:${y - h}px;` +
    `--xm:${x - h + dx * .6}px;--ym:${y - h + dy * .6 - lift}px;--x1:${x - h + dx}px;--y1:${y - h + dy + gravity}px;` +
    `--t:${t}ms;--r:${r}deg;--s0:${s0};--s1:${s1}`;
  el.addEventListener('animationend', () => el.remove(), { once: true });
  fx.appendChild(el);
}

const BURSTS = {
  fairy(x, y) {
    const colours = ['#FFF7B0', '#FFB8DA', '#D9C2FF', '#FFFFFF', '#BFF3FF'];
    range(12).forEach(() => {
      const a = rnd(0, Math.PI * 2), d = rnd(30, 95);
      particle(`<svg class="p-spark" style="color:${pick(colours)}"><use href="#fx-sparkle"></use></svg>`, x, y, rnd(12, 24),
        { dx: Math.cos(a) * d, dy: Math.sin(a) * d, gravity: 30, t: rnd(700, 1100), r: rnd(-180, 180), s0: .4, s1: .2 });
    });
  },
  unicorn(x, y) {
    const colours = ['#FF9EC4', '#FFC48A', '#FFE58A', '#A8E6A3', '#9FD3FF', '#C7A6FF'];
    particle('<i class="p-ring"></i>', x, y, 30, { dx: 0, dy: 0, t: 650, s0: .2, s1: 3.2 });
    range(9).forEach((i) => {
      const a = rnd(-Math.PI, 0), d = rnd(40, 100);
      const heart = i % 3 !== 2;
      particle(`<svg class="${heart ? 'p-heart' : 'p-spark'}" style="color:${pick(colours)}"><use href="#${heart ? 'fx-heart' : 'fx-sparkle'}"></use></svg>`,
        x, y, rnd(14, 26), { dx: Math.cos(a) * d, dy: Math.sin(a) * d, lift: 20, gravity: -30, t: rnd(800, 1200), r: rnd(-40, 40), s0: .5, s1: .5 });
    });
  },
  blocks(x, y) {
    const colours = ['#7DF2E4', '#FF4FA3', '#FFC93D', '#8E6CF0', '#4CCB66', '#FFFFFF'];
    range(14).forEach(() => {
      const a = rnd(-Math.PI, 0), d = rnd(40, 110);
      particle(`<i class="p-px" style="background:${pick(colours)}"></i>`, x, y, Math.round(rnd(6, 13)),
        { dx: Math.cos(a) * d, dy: Math.sin(a) * d, lift: 40, gravity: 140, t: rnd(650, 950), r: Math.round(rnd(-2, 2)) * 90, s0: 1, s1: .8 });
    });
  },
};

function currentSkin() {
  return document.documentElement.dataset.skin || 'sticker';
}

function ignore(target) {
  return !target || !target.closest || target.closest('.corner, .debug, .party, dialog');
}

let lastDust = 0;
function dust(e) {
  if (currentSkin() !== 'fairy' || reduceMotion() || ignore(e.target)) return;
  const now = performance.now();
  if (now - lastDust < 35) return;
  lastDust = now;
  particle(`<i class="p-dust" style="background:${pick(['#FFF7B0', '#FFD6EC', '#E6D6FF', '#fff'])}"></i>`,
    e.clientX + rnd(-4, 4), e.clientY + rnd(-4, 4), rnd(4, 8),
    { dx: rnd(-10, 10), dy: rnd(14, 34), t: rnd(600, 900), s0: 1, s1: .2 });
}

// ---------- Start ----------

function buildScene() {
  const deco = document.querySelector('.deco');
  if (!deco) return;
  const skin = currentSkin();
  if (deco.dataset.scene === skin) return;
  deco.dataset.scene = skin;
  deco.innerHTML = SCENES[skin] ? `<div class="scene ${skin}-scene">${SCENES[skin]()}</div>` : '';
}

export function startSkinEffects() {
  const root = document.documentElement.style;
  Object.entries(ART).forEach(([name, svg]) => root.setProperty(`--art-${name}`, svgUrl(svg)));
  if (!document.getElementById('fx-sprite')) document.body.insertAdjacentHTML('afterbegin', SPRITE);
  fx = document.createElement('div');
  fx.className = 'fx';
  fx.setAttribute('aria-hidden', 'true');
  document.body.appendChild(fx);

  buildScene();
  new MutationObserver(buildScene).observe(document.documentElement, { attributes: true, attributeFilter: ['data-skin'] });

  document.addEventListener('pointerdown', (e) => {
    const burst = BURSTS[currentSkin()];
    if (!burst || reduceMotion() || ignore(e.target)) return;
    burst(e.clientX, e.clientY);
  }, { passive: true });
  document.addEventListener('pointermove', dust, { passive: true });
}
