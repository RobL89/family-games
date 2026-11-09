// Rocket Lander's test panel for previews. Version 1.2.
//
// Changes at v1.2: the level picker plays Number mode's real levels (levels.js, D-038)
// through begin({ level }), in place of the design notes' proposed table; the line
// settings left empty follow the level (contract v0.3 GC3).
// Changes at v1.1: the bundle's names for the shared engine's modules, now in games/_common/rocket/ (D-027).
//
// Added only by `build_preview.py rocket-lander --debug`, appended inside the bundle's
// module script; it is never in the game's own files, so game screens stay child-only
// (D-009) and trial-week previews are built without it (D-020).
//
// A cog in the top-right corner of the start screen opens a sheet with the level to play
// (Number mode's eight, from levels.js), the settings built from the game's own schema (so
// new settings show up by themselves; empty means "as the level says") and the game's
// progress (planets unlocked, moon rocks).
// Apply hands them to the game through its begin() seam, the same way the shell will.
// The values are kept in sessionStorage for this tab only, so they survive "home"
// (which reloads the preview); if storage is refused they are simply not kept.
(() => {
  const { SETTINGS: SHARED, resolveSettings } = __m_games__common_rocket_settings;
  const { PLANETS } = __m_games__common_rocket_planets;
  const { LEVELS } = __m_games_rocket_lander_levels;
  const { followLevel } = __m_games_rocket_lander_rules;
  const SETTINGS = followLevel(SHARED, ['from', 'to', 'label_every']); // as game.js does
  const T = window.__test;
  const KEY = 'rocket-lander-preview-test-panel';
  const NAMES = { any: 'any number', parity: 'even or odd', dice: 'dice faces' };
  const levelName = (r) => `${r.level} · ${r.from} to ${r.to}, ${r.label_every === 1 ? 'every number' : r.label_every === 0 ? 'ends only' : `every ${r.label_every}`}`
    + `${r.labels === 'plain' ? '' : `, ${r.labels.replace('-', ' ')}`} · ${Object.keys(r.mix).map((k) => NAMES[k]).join(', ')}`;

  const css = `
.pv-cog{position:fixed;top:max(12px,env(safe-area-inset-top));right:max(12px,env(safe-area-inset-right));z-index:1001;
  width:56px;height:56px;display:grid;place-items:center;border-radius:50%;border:4px solid #1B1446;background:#fff;
  color:#1B1446;box-shadow:0 4px 0 rgba(10,6,40,.55);cursor:pointer;padding:0}
.pv-cog svg{width:62%;height:62%}
body:has(#start[hidden]) .pv-cog{display:none}
.pv-back{position:fixed;inset:0;z-index:2000;background:rgba(10,6,40,.55);display:flex;justify-content:flex-end}
.pv-back[hidden]{display:none}
.pv-sheet{width:min(100%,420px);height:100%;overflow:auto;background:#fff;color:#1B1446;font:16px/1.35 system-ui,sans-serif;
  padding:max(14px,env(safe-area-inset-top)) max(16px,env(safe-area-inset-right)) max(20px,env(safe-area-inset-bottom)) 16px;box-sizing:border-box}
.pv-sheet h2{font-size:19px;margin:0 0 2px}
.pv-sheet .pv-sub{font-size:13px;opacity:.75;margin:0 0 12px}
.pv-sheet fieldset{border:2px solid #E3E0F2;border-radius:12px;margin:0 0 12px;padding:8px 12px 10px}
.pv-sheet legend{font-weight:700;padding:0 4px}
.pv-row{display:grid;grid-template-columns:1fr 112px;gap:2px 10px;align-items:center;padding:7px 0;border-top:1px solid #F0EEF8}
.pv-row:first-of-type{border-top:0}
.pv-row label{font-weight:600}
.pv-row small{grid-column:1/-1;font-size:12.5px;opacity:.72}
.pv-row input,.pv-row select{font:inherit;width:100%;box-sizing:border-box;padding:6px 8px;border:2px solid #C9C4E6;border-radius:8px;background:#fff;color:inherit}
.pv-row input[type=checkbox]{width:26px;height:26px;justify-self:end}
.pv-level{width:100%;font:inherit;padding:8px;border:2px solid #C9C4E6;border-radius:8px;margin:2px 0 6px}
.pv-btns{display:flex;gap:8px;flex-wrap:wrap;position:sticky;bottom:0;background:#fff;padding-top:8px}
.pv-btns button{font:700 16px system-ui,sans-serif;padding:11px 16px;border-radius:10px;border:2px solid #1B1446;background:#fff;color:#1B1446;cursor:pointer}
.pv-btns .pv-apply{background:#1B1446;color:#fff;flex:1}
.pv-msg{flex-basis:100%;font-size:13.5px;min-height:1.3em;margin:2px 0 0}`;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const el = (tag, props = {}, kids = []) => {
    const e = Object.assign(document.createElement(tag), props);
    for (const k of kids) e.append(k);
    return e;
  };

  const cog = el('button', { type: 'button', className: 'pv-cog', title: 'Test settings (preview only)' });
  cog.setAttribute('aria-label', 'Test settings (preview only)');
  cog.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19.4 13a7.5 7.5 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.6 7.6 0 0 0-1.7-1L14.9 3h-4l-.4 2.9a7.6 7.6 0 0 0-1.7 1l-2.5-1-2 3.5L6.4 11a7.5 7.5 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1a7.6 7.6 0 0 0 1.7 1l.4 2.9h4l.4-2.9a7.6 7.6 0 0 0 1.7-1l2.5 1 2-3.5zM12.9 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"/></svg>';

  const inputs = {};
  const settingsBox = el('fieldset', {}, [el('legend', { textContent: 'Settings' })]);
  for (const [key, spec] of Object.entries(SETTINGS)) {
    let input;
    if (typeof spec.default === 'boolean') input = el('input', { type: 'checkbox' });
    else if (spec.options) input = el('select', {}, spec.options.map((o) => el('option', { value: o, textContent: o })));
    else input = el('input', { type: 'number', min: spec.min, max: spec.max, step: 'any', inputMode: 'decimal', placeholder: spec.default === null ? 'level' : '' });
    input.id = `pv-${key}`;
    inputs[key] = input;
    settingsBox.append(el('div', { className: 'pv-row' }, [
      el('label', { htmlFor: input.id, textContent: key }), input,
      el('small', { textContent: spec.about + (spec.options ? '' : spec.type === 'number' || typeof spec.default === 'number' ? ` (${spec.min} to ${spec.max}; default ${spec.default === null ? 'the level\'s' : spec.default})` : ` (default ${spec.default ? 'on' : 'off'})`) }),
    ]));
  }

  const level = el('select', { className: 'pv-level' }, LEVELS.map((r) => el('option', { value: String(r.level), textContent: levelName(r) })));
  level.addEventListener('change', () => { msg.textContent = 'Press Apply to play this level.'; });
  const levelBox = el('fieldset', {}, [el('legend', { textContent: 'Level' }), level,
    el('small', { textContent: 'Number mode\'s eight levels (D-038), as the launcher will hand them over. Settings below left empty follow the level; a value overrides it for that one thing.' })]);

  const unlocked = el('input', { type: 'number', min: 1, max: PLANETS.length, step: 1, id: 'pv-unlocked', inputMode: 'numeric' });
  const rocks = el('input', { type: 'number', min: 0, max: 9999, step: 1, id: 'pv-rocks', inputMode: 'numeric' });
  const progressBox = el('fieldset', {}, [el('legend', { textContent: 'Progress' }),
    el('div', { className: 'pv-row' }, [el('label', { htmlFor: 'pv-unlocked', textContent: 'planets unlocked' }), unlocked,
      el('small', { textContent: `1 to ${PLANETS.length}: ${PLANETS.map((p) => p.name).join(', ')}` })]),
    el('div', { className: 'pv-row' }, [el('label', { htmlFor: 'pv-rocks', textContent: 'moon rocks' }), rocks])]);

  const msg = el('p', { className: 'pv-msg', role: 'status' });
  const apply = el('button', { type: 'button', className: 'pv-apply', textContent: 'Apply' });
  const defaults = el('button', { type: 'button', textContent: 'Defaults' });
  const close = el('button', { type: 'button', textContent: 'Close' });
  const sheet = el('div', { className: 'pv-sheet', role: 'dialog' }, [
    el('h2', { textContent: 'Test settings' }),
    el('p', { className: 'pv-sub', textContent: 'Preview only, for testing: never on the real site or the children\'s preview. Kept for this tab until it closes.' }),
    levelBox, settingsBox, progressBox, el('div', { className: 'pv-btns' }, [apply, defaults, close, msg])]);
  sheet.setAttribute('aria-label', 'Test settings');
  const back = el('div', { className: 'pv-back', hidden: true }, [sheet]);
  back.addEventListener('click', (e) => { if (e.target === back) back.hidden = true; });
  document.body.append(cog, back);

  function show() {
    const s = T.state();
    for (const [key, spec] of Object.entries(SETTINGS)) {
      if (typeof spec.default === 'boolean') inputs[key].checked = !!s.settings[key];
      else inputs[key].value = s.settings[key] === null ? '' : String(s.settings[key]);
    }
    unlocked.value = String(s.progress.unlocked);
    rocks.value = String(s.progress.rocks);
    level.value = String(s.level);
  }
  function read() {
    const settings = {};
    for (const [key, spec] of Object.entries(SETTINGS)) {
      settings[key] = typeof spec.default === 'boolean' ? inputs[key].checked : inputs[key].value;
    }
    const progress = T.state().progress;
    return { level: Number(level.value), settings, state: { ...progress, unlocked: Number(unlocked.value) || 1, rocks: Number(rocks.value) || 0 } };
  }
  function use(given, quiet) {
    const notes = resolveSettings(SETTINGS, given.settings).notes;
    const ok = T.begin(given);
    if (ok) { try { sessionStorage.setItem(KEY, JSON.stringify(given)); } catch (e) { /* not kept */ } }
    if (!quiet) msg.textContent = ok ? `Applied.${notes.length ? ' ' + notes.join('; ') + '.' : ''}` : 'Go back to the start screen first.';
    return ok;
  }

  cog.addEventListener('click', () => { show(); msg.textContent = ''; back.hidden = false; });
  close.addEventListener('click', () => { back.hidden = true; });
  apply.addEventListener('click', () => { if (use(read())) { show(); } });
  defaults.addEventListener('click', () => {
    for (const [key, spec] of Object.entries(SETTINGS)) {
      if (typeof spec.default === 'boolean') inputs[key].checked = spec.default;
      else inputs[key].value = spec.default === null ? '' : String(spec.default);
    }
    level.value = '1';
    msg.textContent = 'Level 1 and the defaults filled. Press Apply to use them.';
  });

  try {
    const kept = JSON.parse(sessionStorage.getItem(KEY) || 'null');
    if (kept && typeof kept === 'object') use(kept, true);
  } catch (e) { /* nothing kept */ }
})();
