// Original cartoon-animal avatars drawn in code (P15), plus the colour choices.
// Outlines come from the CSS variables --ol (colour) and --olw (width), so each
// skin can draw them chunky, thin or not at all.

export const ANIMALS = [
  { id: 'fox', name: 'Fox' },
  { id: 'frog', name: 'Frog' },
  { id: 'owl', name: 'Owl' },
  { id: 'bear', name: 'Bear' },
  { id: 'bunny', name: 'Bunny' },
  { id: 'penguin', name: 'Penguin' },
];

export const COLOURS = ['#F07A2A', '#2FA34A', '#7E4FC9', '#2E8FD0', '#E0457B', '#E0A100'];

const OUTLINE = 'style="stroke:var(--ol,none);stroke-width:var(--olw,0);stroke-linejoin:round"';
const EYE = '#2B1E16';

const SYMBOLS = `
<symbol id="a-fox" viewBox="0 0 100 100">
  <g ${OUTLINE}>
    <path d="M18 46 L24 8 L46 28 Z" fill="#F07A2A"/>
    <path d="M82 46 L76 8 L54 28 Z" fill="#F07A2A"/>
    <ellipse cx="50" cy="56" rx="35" ry="31" fill="#F07A2A"/>
  </g>
  <path d="M19 60 Q50 100 81 60 Q66 70 50 65 Q34 70 19 60 Z" fill="#FFF4E8"/>
  <path d="M25 30 L27 16 L38 27 Z" fill="#FFD2AE"/><path d="M75 30 L73 16 L62 27 Z" fill="#FFD2AE"/>
  <circle cx="37" cy="52" r="5" fill="${EYE}"/><circle cx="63" cy="52" r="5" fill="${EYE}"/>
  <circle cx="38.6" cy="50.4" r="1.7" fill="#fff"/><circle cx="64.6" cy="50.4" r="1.7" fill="#fff"/>
  <ellipse cx="50" cy="72" rx="5.5" ry="4" fill="${EYE}"/>
  <path d="M44 77 Q50 82 56 77" fill="none" stroke="${EYE}" stroke-width="3" stroke-linecap="round"/>
</symbol>
<symbol id="a-frog" viewBox="0 0 100 100">
  <g ${OUTLINE}>
    <ellipse cx="50" cy="62" rx="40" ry="29" fill="#5CC15A"/>
    <circle cx="31" cy="33" r="15" fill="#5CC15A"/><circle cx="69" cy="33" r="15" fill="#5CC15A"/>
  </g>
  <circle cx="31" cy="33" r="9.5" fill="#fff"/><circle cx="69" cy="33" r="9.5" fill="#fff"/>
  <circle cx="32.5" cy="34.5" r="5" fill="#1F2A1E"/><circle cx="70.5" cy="34.5" r="5" fill="#1F2A1E"/>
  <path d="M30 64 Q50 82 70 64" fill="none" stroke="#1F2A1E" stroke-width="4" stroke-linecap="round"/>
  <circle cx="22" cy="66" r="5.5" fill="#FF9BAA" opacity=".8"/><circle cx="78" cy="66" r="5.5" fill="#FF9BAA" opacity=".8"/>
</symbol>
<symbol id="a-owl" viewBox="0 0 100 100">
  <g ${OUTLINE}>
    <path d="M20 34 L24 8 L42 24 Z" fill="#8A5CD1"/><path d="M80 34 L76 8 L58 24 Z" fill="#8A5CD1"/>
    <ellipse cx="50" cy="56" rx="36" ry="38" fill="#8A5CD1"/>
  </g>
  <ellipse cx="50" cy="76" rx="21" ry="15" fill="#CDB8F0"/>
  <circle cx="36" cy="47" r="13" fill="#fff"/><circle cx="64" cy="47" r="13" fill="#fff"/>
  <circle cx="37" cy="48" r="6" fill="#241A33"/><circle cx="65" cy="48" r="6" fill="#241A33"/>
  <circle cx="39" cy="46" r="2" fill="#fff"/><circle cx="67" cy="46" r="2" fill="#fff"/>
  <path d="M44.5 59 H55.5 L50 68 Z" fill="#FFB627"/>
</symbol>
<symbol id="a-bear" viewBox="0 0 100 100">
  <g ${OUTLINE}>
    <circle cx="24" cy="27" r="13" fill="#A8743E"/><circle cx="76" cy="27" r="13" fill="#A8743E"/>
    <ellipse cx="50" cy="57" rx="36" ry="33" fill="#A8743E"/>
  </g>
  <circle cx="24" cy="27" r="6.5" fill="#E8C29A"/><circle cx="76" cy="27" r="6.5" fill="#E8C29A"/>
  <ellipse cx="50" cy="69" rx="16" ry="12" fill="#E8C29A"/>
  <circle cx="37" cy="51" r="4.5" fill="${EYE}"/><circle cx="63" cy="51" r="4.5" fill="${EYE}"/>
  <circle cx="38.4" cy="49.6" r="1.5" fill="#fff"/><circle cx="64.4" cy="49.6" r="1.5" fill="#fff"/>
  <ellipse cx="50" cy="64" rx="5.5" ry="4" fill="${EYE}"/>
  <path d="M44 72 Q50 77 56 72" fill="none" stroke="${EYE}" stroke-width="3" stroke-linecap="round"/>
</symbol>
<symbol id="a-bunny" viewBox="0 0 100 100">
  <g ${OUTLINE}>
    <ellipse cx="37" cy="24" rx="8.5" ry="21" fill="#ECE7F2" transform="rotate(-10 37 24)"/>
    <ellipse cx="63" cy="24" rx="8.5" ry="21" fill="#ECE7F2" transform="rotate(10 63 24)"/>
    <ellipse cx="50" cy="62" rx="33" ry="30" fill="#ECE7F2"/>
  </g>
  <ellipse cx="37" cy="26" rx="4" ry="14" fill="#FFB8C8" transform="rotate(-10 37 26)"/>
  <ellipse cx="63" cy="26" rx="4" ry="14" fill="#FFB8C8" transform="rotate(10 63 26)"/>
  <circle cx="39" cy="57" r="4.5" fill="${EYE}"/><circle cx="61" cy="57" r="4.5" fill="${EYE}"/>
  <circle cx="40.4" cy="55.6" r="1.5" fill="#fff"/><circle cx="62.4" cy="55.6" r="1.5" fill="#fff"/>
  <path d="M46 66 H54 L50 70.5 Z" fill="#FF8FA8"/>
  <path d="M45 74 Q50 78 50 72 Q50 78 55 74" fill="none" stroke="${EYE}" stroke-width="2.6" stroke-linecap="round"/>
  <circle cx="29" cy="69" r="5" fill="#FFB8C8" opacity=".8"/><circle cx="71" cy="69" r="5" fill="#FFB8C8" opacity=".8"/>
</symbol>
<symbol id="a-penguin" viewBox="0 0 100 100">
  <g ${OUTLINE}>
    <ellipse cx="50" cy="55" rx="35" ry="37" fill="#2F3A4A"/>
  </g>
  <circle cx="40" cy="52" r="15" fill="#fff"/><circle cx="60" cy="52" r="15" fill="#fff"/>
  <ellipse cx="50" cy="68" rx="21" ry="18" fill="#fff"/>
  <circle cx="41" cy="50" r="4.5" fill="${EYE}"/><circle cx="59" cy="50" r="4.5" fill="${EYE}"/>
  <circle cx="42.4" cy="48.6" r="1.5" fill="#fff"/><circle cx="60.4" cy="48.6" r="1.5" fill="#fff"/>
  <path d="M43.5 59 H56.5 L50 67 Z" fill="#FFB627"/>
  <circle cx="31" cy="64" r="5" fill="#FF9BAA" opacity=".8"/><circle cx="69" cy="64" r="5" fill="#FF9BAA" opacity=".8"/>
</symbol>`;

const KNOWN = new Set(ANIMALS.map((a) => a.id));

export function injectAvatars() {
  if (document.getElementById('avatar-sprite')) return;
  const holder = document.createElement('div');
  holder.innerHTML = `<svg id="avatar-sprite" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">${SYMBOLS}</svg>`;
  document.body.prepend(holder.firstElementChild);
}

// Unknown avatar ids (like an old test player's) fall back to the fox.
export function avatarSVG(id) {
  const animal = KNOWN.has(id) ? id : 'fox';
  return `<svg class="av" aria-hidden="true" focusable="false"><use href="#a-${animal}"></use></svg>`;
}
