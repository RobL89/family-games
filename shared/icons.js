// Shared drawings: score star, badge pictures, game pictures and buttons.
// All single-colour (currentColor) except the score star, so skins can recolour them.

const NUM = (n, size) =>
  `<text x="12" y="${size > 11 ? 17 : 16.2}" text-anchor="middle" font-size="${size}" font-weight="700" font-family="Fredoka, Arial, sans-serif">${n}</text>`;

const SYMBOLS = `
<symbol id="s-star" viewBox="0 0 24 24"><path d="M12 2.5l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 16.9 6.3 20l1.2-6.4L2.8 9.2l6.4-.8z" style="fill:var(--sf,#F5B700);stroke:var(--so,none);stroke-width:var(--sw,0);stroke-linejoin:round"/></symbol>

<symbol id="b-flag" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="3" width="2.4" height="18" rx="1.2"/><path d="M7.4 4h11.2l-3.2 4.2 3.2 4.3H7.4z"/></symbol>
<symbol id="b-star" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 16.9 6.3 20l1.2-6.4L2.8 9.2l6.4-.8z"/></symbol>
<symbol id="b-grid" viewBox="0 0 24 24" fill="currentColor"><rect x="3.5" y="3.5" width="7.5" height="7.5" rx="2"/><rect x="13" y="3.5" width="7.5" height="7.5" rx="2"/><rect x="3.5" y="13" width="7.5" height="7.5" rx="2"/><rect x="13" y="13" width="7.5" height="7.5" rx="2"/></symbol>
<symbol id="b-cal" viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="2.5" width="2.2" height="5" rx="1.1"/><rect x="14.8" y="2.5" width="2.2" height="5" rx="1.1"/><path fill-rule="evenodd" d="M5 5h14a2.5 2.5 0 0 1 2.5 2.5v11A2.5 2.5 0 0 1 19 21H5a2.5 2.5 0 0 1-2.5-2.5v-11A2.5 2.5 0 0 1 5 5zM6.3 14.5a1.7 1.7 0 1 0 3.4 0a1.7 1.7 0 1 0-3.4 0zM10.3 14.5a1.7 1.7 0 1 0 3.4 0a1.7 1.7 0 1 0-3.4 0zM14.3 14.5a1.7 1.7 0 1 0 3.4 0a1.7 1.7 0 1 0-3.4 0z"/></symbol>
<symbol id="b-up" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l8.5 9H15v9H9v-9H3.5z"/></symbol>
<symbol id="b-10" viewBox="0 0 24 24" fill="currentColor">${NUM(10, 12.5)}</symbol>
<symbol id="b-50" viewBox="0 0 24 24" fill="currentColor">${NUM(50, 12.5)}</symbol>
<symbol id="b-100" viewBox="0 0 24 24" fill="currentColor">${NUM(100, 9.5)}</symbol>

<symbol id="g-bubbles" viewBox="0 0 48 48" fill="currentColor"><circle cx="18" cy="28" r="12"/><circle cx="35" cy="15" r="8" opacity=".7"/><circle cx="37" cy="35" r="5" opacity=".55"/><circle cx="14" cy="23" r="3.2" fill="#fff" opacity=".85"/></symbol>
<symbol id="g-memory" viewBox="0 0 48 48" fill="currentColor"><rect x="5" y="10" width="18" height="26" rx="4" transform="rotate(-9 14 23)"/><rect x="25" y="12" width="18" height="26" rx="4" transform="rotate(9 34 25)" opacity=".55"/></symbol>
<symbol id="g-count" viewBox="0 0 48 48" fill="currentColor"><circle cx="13" cy="32" r="8.5"/><circle cx="35" cy="32" r="8.5"/><circle cx="24" cy="17" r="8.5" opacity=".7"/><path d="M24 8.5c1-3 4-4.5 7-4-1 3-4 4.5-7 4z"/></symbol>
<symbol id="g-shapes" viewBox="0 0 48 48" fill="currentColor"><path d="M24 4l11 18H13z"/><circle cx="13" cy="34" r="9" opacity=".75"/><rect x="27" y="26" width="17" height="17" rx="3" opacity=".55"/></symbol>
<symbol id="g-spot" viewBox="0 0 48 48"><circle cx="20" cy="20" r="12" fill="none" stroke="currentColor" stroke-width="5"/><path d="M29 29l11 11" stroke="currentColor" stroke-width="6" stroke-linecap="round"/></symbol>
<symbol id="g-cross" viewBox="0 0 48 48" fill="currentColor"><rect x="4" y="17" width="40" height="11" rx="2.5"/><rect x="17" y="4" width="11" height="40" rx="2.5" opacity=".7"/><rect x="33" y="28" width="11" height="16" rx="2.5" opacity=".5"/><rect x="20" y="20" width="5" height="5" rx="1" fill="#fff" opacity=".9"/></symbol>
<symbol id="g-planet" viewBox="0 0 48 48"><circle cx="9" cy="10" r="2" fill="currentColor" opacity=".6"/><circle cx="40" cy="38" r="1.6" fill="currentColor" opacity=".6"/><circle cx="24" cy="24" r="11.5" fill="currentColor"/><path d="M8.6 33.4c-3-3.6 5-10.6 17.7-15.6S46.4 11 46.4 15" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" opacity=".75"/></symbol>
<symbol id="g-town" viewBox="0 0 48 48" fill="currentColor"><path fill-rule="evenodd" d="M24 6 4 24h6v18h28V24h6zM20 42V31h8v11zM14 26h6v5h-6zm14 0h6v5h-6z"/></symbol>
<symbol id="g-crossing" viewBox="0 0 48 48" fill="currentColor"><path d="M10 27Q17 13 24 27" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="1 5"/><rect x="33" y="5" width="4" height="14" rx="2"/><rect x="28" y="10" width="14" height="4" rx="2"/><ellipse cx="10" cy="32" rx="7" ry="3.6"/><ellipse cx="24" cy="32" rx="7" ry="3.6" opacity=".8"/><ellipse cx="38" cy="32" rx="7" ry="3.6" opacity=".6"/><path d="M3 41.5c3.5-2.7 7-2.7 10.5 0s7 2.7 10.5 0 7-2.7 10.5 0 7 2.7 10.5 0" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity=".55"/></symbol>
<symbol id="g-fairy" viewBox="0 0 48 48" fill="currentColor"><path d="M4 25C4 14 13 7 24 7s20 7 20 18z"/><circle cx="15" cy="17" r="3" fill="#fff" opacity=".85"/><circle cx="27" cy="13" r="2.4" fill="#fff" opacity=".85"/><circle cx="34" cy="20" r="2.6" fill="#fff" opacity=".85"/><path fill-rule="evenodd" opacity=".7" d="M14 25h20v16a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 14 41zM20.5 43.5V37a3.5 3.5 0 0 1 7 0v6.5z"/><path d="M42 2l1.3 3.2 3.2 1.3-3.2 1.3L42 11l-1.3-3.2-3.2-1.3 3.2-1.3z"/></symbol>
<symbol id="g-target" viewBox="0 0 48 48"><circle cx="22" cy="26" r="17" fill="none" stroke="currentColor" stroke-width="4.5"/><circle cx="22" cy="26" r="9" fill="none" stroke="currentColor" stroke-width="4.5" opacity=".7"/><circle cx="22" cy="26" r="3.2" fill="currentColor"/><path d="M23.5 24.5 40 8" stroke="currentColor" stroke-width="3.4" stroke-linecap="round"/><path d="M38 4v6h6l-3.5 3.5h-6v-6z" fill="currentColor" opacity=".8"/></symbol>
<symbol id="g-rocket" viewBox="0 0 48 48" fill="currentColor"><path fill-rule="evenodd" d="M24.0 3.6C31.5 6.2 35.9 15.0 35.7 25.6C35.4 33.1 34.3 38.4 31.9 41.0L16.1 41.0C13.7 38.4 12.6 33.1 12.3 25.6C12.1 15.0 16.5 6.2 24.0 3.6ZM30.2 23.6A6.2 6.2 0 1 0 17.8 23.6A6.2 6.2 0 1 0 30.2 23.6Z"/><path d="M15.2 25.6Q5.5 31.8 6.8 43.6Q10.8 41.9 17.4 40.1ZM32.8 25.6Q42.5 31.8 41.2 43.6Q37.2 41.9 30.6 40.1ZM19.6 40.1L28.4 40.1L29.9 43.9L18.1 43.9Z"/><circle cx="24.0" cy="24.9" r="3.6"/></symbol>
<symbol id="g-star" viewBox="0 0 48 48" fill="currentColor"><path d="M24 4l5.6 11.8 12.8 1.6-9.4 8.8 2.4 12.8L24 32.8 12.6 39l2.4-12.8-9.4-8.8 12.8-1.6z"/></symbol>

<symbol id="i-back" viewBox="0 0 24 24"><path d="M15 4.5L7.5 12 15 19.5" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="i-home" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3.2l9 7.6c.6.5.2 1.4-.6 1.4H19v7.3c0 .8-.7 1.5-1.5 1.5H14v-5.5h-4V21H6.5c-.8 0-1.5-.7-1.5-1.5v-7.3H3.6c-.8 0-1.2-.9-.6-1.4z"/></symbol>
<symbol id="i-gear" viewBox="0 0 24 24" fill="currentColor">
  <rect x="10.4" y="1.5" width="3.2" height="5" rx="1"/><rect x="10.4" y="17.5" width="3.2" height="5" rx="1"/><rect x="1.5" y="10.4" width="5" height="3.2" rx="1"/><rect x="17.5" y="10.4" width="5" height="3.2" rx="1"/>
  <g transform="rotate(45 12 12)"><rect x="10.4" y="1.5" width="3.2" height="5" rx="1"/><rect x="10.4" y="17.5" width="3.2" height="5" rx="1"/><rect x="1.5" y="10.4" width="5" height="3.2" rx="1"/><rect x="17.5" y="10.4" width="5" height="3.2" rx="1"/></g>
  <circle cx="12" cy="12" r="6.2" fill="none" stroke="currentColor" stroke-width="3.6"/>
</symbol>
<symbol id="i-lock" viewBox="0 0 24 24" fill="currentColor"><path d="M7.5 10V7.5a4.5 4.5 0 0 1 9 0V10" fill="none" stroke="currentColor" stroke-width="2.6"/><rect x="4.5" y="10" width="15" height="11" rx="2.5"/></symbol>
<symbol id="i-brush" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M12 2.5C6.6 2.5 2.5 6.6 2.5 11.8c0 5 4 9.7 9.3 9.7 1.3 0 2.1-.8 2.1-1.9 0-.6-.3-1-.6-1.4-.3-.3-.5-.7-.5-1.2 0-1 .8-1.8 1.8-1.8h2.2c2.9 0 4.7-2 4.7-4.6 0-4.6-4.3-8.1-9.5-8.1zM7.2 12.6a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2zM10.2 8.2a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2zM15 8.2a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2zM17.6 12a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2z"/></symbol>
<symbol id="i-check" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="i-cloud" viewBox="0 0 24 24" fill="currentColor"><path d="M7 19a5 5 0 0 1-.6-10A6.5 6.5 0 0 1 19 9.6 4.7 4.7 0 0 1 18 19z"/></symbol>
`;

export function injectIcons() {
  if (document.getElementById('icon-sprite')) return;
  const holder = document.createElement('div');
  holder.innerHTML = `<svg id="icon-sprite" width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">${SYMBOLS}</svg>`;
  document.body.prepend(holder.firstElementChild);
}

export function icon(id, cls = '') {
  return `<svg class="${cls}" aria-hidden="true" focusable="false"><use href="#${id}"></use></svg>`;
}

export function stars(n, label = true) {
  const count = Math.max(0, Math.min(3, Number(n) || 0));
  const aria = label ? ` role="img" aria-label="${count} of 3 stars"` : ' aria-hidden="true"';
  return `<span class="stars"${aria}>${[0, 1, 2].map((i) => icon('s-star', 'st ' + (i < count ? 'on' : 'off'))).join('')}</span>`;
}
