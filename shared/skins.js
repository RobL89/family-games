// Theme skins for the launcher and profile screens only (P21, P22).
// Each skin is one CSS file in shared/skins/ that overrides the tokens in theme.css.
// The star counts here are only used until the Sheet's Skins tab has been read;
// the Sheet's numbers always win, so change them there.

export const DEFAULT_SKIN = 'sticker';

export const FALLBACK_SKINS = [
  { skin_id: 'sticker', name: 'Sticker book', stars_needed: 0 },
  { skin_id: 'fairy', name: 'Fairy', stars_needed: 10 },
  { skin_id: 'blocks', name: 'Blocks', stars_needed: 20 },
  { skin_id: 'unicorn', name: 'Unicorn', stars_needed: 30 },
];

// Skins that have a CSS file. A row in the Sheet with any other id is ignored.
const HAS_CSS = new Set(FALLBACK_SKINS.map((s) => s.skin_id));

export function skinList(fromSheet) {
  const list = Array.isArray(fromSheet) && fromSheet.length
    ? fromSheet.filter((s) => HAS_CSS.has(s.skin_id))
    : FALLBACK_SKINS.slice();
  if (!list.some((s) => s.skin_id === DEFAULT_SKIN)) list.unshift(FALLBACK_SKINS[0]);
  return list
    .map((s) => ({ ...s, stars_needed: s.skin_id === DEFAULT_SKIN ? 0 : Number(s.stars_needed) || 0 }))
    .sort((a, b) => a.stars_needed - b.stars_needed);
}

export function isUnlocked(skin, starsTotal) {
  return !!skin && starsTotal >= skin.stars_needed;
}

export function applySkin(skinId) {
  const id = HAS_CSS.has(skinId) ? skinId : DEFAULT_SKIN;
  if (id !== DEFAULT_SKIN && !document.getElementById('skin-css-' + id)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.id = 'skin-css-' + id;
    link.href = new URL(`./skins/${id}.css`, import.meta.url).href;
    document.head.appendChild(link);
  }
  document.documentElement.dataset.skin = id;
  return id;
}
