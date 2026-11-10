// Rocket Lander's test panel for previews. Version 1.10.
//
// Changes at v1.10 (step 2c-3a, D-089): the track. A Track box at the top picks the lower track
// (Reception, then Year 1) or the higher (Year 2, then Year 3; the stand-in levels until step 2c-3b);
// Apply with another track changes to it, keeping the moon rocks and ships, and the page reloads on
// that track's map. The level list is the track's own map. What Apply and Reset keep on the device is
// the game's own format 4 (state().kept), so the other track's map is kept too.
// Changes at v1.9 (Rob, 10 Nov): "3 stars on this system" gives every level of the picked level's
// system 3 stars (rocks found stay) and sends the rocket to its last level, so hyperspace can be
// tried without playing the whole system; applied at once and kept on the device.
// Changes at v1.8 (step 2c-build): the cog moves to the map's bottom-left corner, above the stamp,
// since in the top-right it covered the hangar's moon rocks count on the map bar.
// Changes at v1.7 (step 2c-build, D-058, D-068): the map. The level picked is where Apply sends the
// rocket (any system and level, the map opening up to it); its best stars (0: not played) and the
// rocks found there can be set; the moon rocks stay. Planets unlocked go (the map's progress is format
// 3). Reset clears the one game's entry and the old Rocket Sums one, and the cog shows on the map only.
// Only the settings are kept for the tab now: the level is the rocket's place on the map, part of the
// progress the game keeps on the device, so a reload no longer sends the rocket back (as ER-004).
// Changes at v1.6 (step 2c-build, D-058): one game. The level picker lists the map's levels in
// play order (Moon's eight number levels, then Red Dust's eight sums levels: the stand-in map),
// and the settings are the game's own schema (game.js's SCHEMA), the sums' operations included.
// Changes at v1.5 (step 2a-4c, ER-004): only the level and settings are kept for the tab; the
// progress applied is kept on the device, as the game keeps it, so "home" (a reload) no longer
// puts back the rocks, planets and ships from when Apply was pressed.
// Changes at v1.4 (step 2a-4b+): the panel opens only with the code 1234, asked each time, and
// its Progress box has Reset, which clears both rocket tiles' progress on this device on a
// second tap (D-055).
// Changes at v1.3: followLevel comes from the shared ladder.js (step 2a-2).
// Changes at v1.2: the level picker plays Number mode's real levels (levels.js, D-038)
// through begin({ level }), in place of the design notes' proposed table; the line
// settings left empty follow the level (contract v0.3 GC3).
// Changes at v1.1: the bundle's names for the shared engine's modules, now in games/_common/rocket/ (D-027).
//
// Added only by `build_preview.py rocket-lander --debug`, appended inside the bundle's
// module script; it is never in the game's own files, so game screens stay child-only
// (D-009) and trial-week previews are built without it (D-020).
//
// A cog in the bottom-left corner of the map opens a sheet with the level to play
// (Number mode's eight, from levels.js), the settings built from the game's own schema (so
// new settings show up by themselves; empty means "as the level says") and the game's
// progress (the moon rocks, and the best stars and rocks found of the level picked).
// Apply hands them to the game through its begin() seam, the same way the shell will.
// The values are kept in sessionStorage for this tab only, so they survive "home"
// (which reloads the preview); if storage is refused they are simply not kept.
(() => {
  const { resolveSettings } = __m_games__common_rocket_settings;
  const { TRACKS, SCHEMA: SETTINGS } = __m_games_rocket_lander_game; // the game's own tracks and settings
  const T = window.__test;
  const TRACK = T.state().track; // the track this visit plays (D-089)
  const MAP = TRACKS[TRACK].map;
  // the map's levels in play order, numbered as begin({ level }) counts them
  const ROUTE = MAP.flatMap((sys) => sys.levels.map((lv, n) => ({ sys, lv, n })));
  const KEY = 'rocket-lander-preview-test-panel';
  const levelName = ({ sys, lv, n }, i) => `${i + 1} · ${sys.name} ${n + 1} · ${lv.about}`;

  const css = `
.pv-cog{position:fixed;bottom:max(44px,calc(env(safe-area-inset-bottom) + 38px));left:max(12px,env(safe-area-inset-left));z-index:1001;
  width:56px;height:56px;display:grid;place-items:center;border-radius:50%;border:4px solid #1B1446;background:#fff;
  color:#1B1446;box-shadow:0 4px 0 rgba(10,6,40,.55);cursor:pointer;padding:0}
.pv-cog svg{width:62%;height:62%}
body:has(#map[hidden]) .pv-cog,body:has(#level-card:not([hidden])) .pv-cog{display:none}
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
.pv-level,.pv-track{width:100%;font:inherit;padding:8px;border:2px solid #C9C4E6;border-radius:8px;margin:2px 0 6px}
.pv-btns{display:flex;gap:8px;flex-wrap:wrap;position:sticky;bottom:0;background:#fff;padding-top:8px}
.pv-btns button{font:700 16px system-ui,sans-serif;padding:11px 16px;border-radius:10px;border:2px solid #1B1446;background:#fff;color:#1B1446;cursor:pointer}
.pv-btns .pv-apply{background:#1B1446;color:#fff;flex:1}
.pv-msg{flex-basis:100%;font-size:13.5px;min-height:1.3em;margin:2px 0 0}
.pv-sheet [hidden]{display:none!important}
.pv-lock{display:flex;gap:8px;flex-wrap:wrap;align-items:center;border:2px solid #E3E0F2;border-radius:12px;padding:12px}
.pv-lock label{flex-basis:100%;font-weight:700}
.pv-lock input{font:700 22px system-ui,sans-serif;width:7em;padding:8px 10px;border:2px solid #C9C4E6;border-radius:8px;letter-spacing:.2em}
.pv-lock button,.pv-reset{font:700 16px system-ui,sans-serif;padding:11px 16px;border-radius:10px;border:2px solid #1B1446;background:#fff;color:#1B1446;cursor:pointer}
.pv-lock .pv-open{background:#1B1446;color:#fff}
.pv-reset{width:100%;margin-top:8px;border-color:#C0283F;color:#C0283F}
.pv-reset.armed{background:#C0283F;color:#fff}
.pv-fill{font:700 16px system-ui,sans-serif;padding:11px 16px;border-radius:10px;border:2px solid #1B1446;background:#FFF6CF;color:#1B1446;cursor:pointer;width:100%;margin-top:8px}`;
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
    else if (spec.options) input = el('select', {}, [...(spec.default === null ? [el('option', { value: '', textContent: 'as the level says' })] : []),
      ...spec.options.map((o) => el('option', { value: o, textContent: o }))]);
    else input = el('input', { type: 'number', min: spec.min, max: spec.max, step: 'any', inputMode: 'decimal', placeholder: spec.default === null ? 'level' : '' });
    input.id = `pv-${key}`;
    inputs[key] = input;
    settingsBox.append(el('div', { className: 'pv-row' }, [
      el('label', { htmlFor: input.id, textContent: key }), input,
      el('small', { textContent: spec.about + (spec.options ? '' : spec.type === 'number' || typeof spec.default === 'number' ? ` (${spec.min} to ${spec.max}; default ${spec.default === null ? 'the level\'s' : spec.default})` : ` (default ${spec.default ? 'on' : 'off'})`) }),
    ]));
  }

  const track = el('select', { className: 'pv-track', id: 'pv-track' }, Object.entries(TRACKS).map(([id, t]) => el('option', { value: id, textContent: t.name })));
  track.addEventListener('change', () => { msg.textContent = track.value === TRACK ? '' : 'Press Apply to change track: the rocks and ships stay; each track keeps its own map.'; });
  const trackBox = el('fieldset', {}, [el('legend', { textContent: 'Track' }), track,
    el('small', { textContent: 'Which school years this device plays (D-089). Changing it keeps the moon rocks and ships; each track keeps its own map, and the game reloads on it.' })]);

  const level = el('select', { className: 'pv-level' }, ROUTE.map((r, i) => el('option', { value: String(i + 1), textContent: levelName(r, i) })));
  level.addEventListener('change', () => { showLevel(); msg.textContent = 'Press Apply to send the rocket to this level.'; });
  const levelBox = el('fieldset', {}, [el('legend', { textContent: 'Level' }), level,
    el('small', { textContent: 'This track\'s levels in play order, system by system; level 8 of each is its challenge round. Settings below left empty follow the level; a value overrides it for that one thing.' })]);

  const rocks = el('input', { type: 'number', min: 0, max: 9999, step: 1, id: 'pv-rocks', inputMode: 'numeric' });
  const stars = el('input', { type: 'number', min: 0, max: 3, step: 1, id: 'pv-stars', inputMode: 'numeric' });
  const found = el('input', { type: 'number', min: 0, max: 8, step: 1, id: 'pv-found', inputMode: 'numeric' });
  const progressBox = el('fieldset', {}, [el('legend', { textContent: 'Progress' }),
    el('div', { className: 'pv-row' }, [el('label', { htmlFor: 'pv-rocks', textContent: 'moon rocks' }), rocks,
      el('small', { textContent: 'To spend in the hangar.' })]),
    el('div', { className: 'pv-row' }, [el('label', { htmlFor: 'pv-stars', textContent: 'this level\'s best stars' }), stars,
      el('small', { textContent: '0 to 3, for the level picked above; 0: not played yet. 2 or more opens the next level.' })]),
    el('div', { className: 'pv-row' }, [el('label', { htmlFor: 'pv-found', textContent: 'rocks found here' }), found,
      el('small', { textContent: '0 to 8, for the level picked above: a replay finds only the rest.' })])]);
  // the best stars and rocks of the level picked, as the game holds them now
  const levelId = () => { const r = ROUTE[Number(level.value) - 1]; return r ? r.lv.id : null; };
  function showLevel() {
    const e = (T.state().progress.levels || {})[levelId()] || { stars: 0, rocks: 0 };
    stars.value = String(e.stars); found.value = String(e.rocks);
  }

  // 3 stars on every level of the picked level's system, the rocket at its last level (Rob, 10 Nov)
  const fill = el('button', { type: 'button', className: 'pv-fill', textContent: '3 stars on this system' });
  progressBox.append(fill, el('small', { textContent: 'Every level of the picked level\'s system, rocks found kept; the rocket goes to its last level. Pass that for hyperspace.' }));

  // Reset (D-055): clears the game's progress on this device, on a second tap: its entry, which held
  // Rocket Lander's own before the map, and the old Rocket Sums one.
  const TILES = ['rocket-lander', 'rocket-sums'];
  const reset = el('button', { type: 'button', className: 'pv-reset', textContent: 'Reset the game' });
  progressBox.append(reset, el('small', { textContent: 'Both tracks\' maps, the moon rocks, landings and ships on this device, and the old Rocket Sums entry. The track stays.' }));

  const msg = el('p', { className: 'pv-msg', role: 'status' });
  const apply = el('button', { type: 'button', className: 'pv-apply', textContent: 'Apply' });
  const defaults = el('button', { type: 'button', textContent: 'Defaults' });
  const close = el('button', { type: 'button', textContent: 'Close' });
  // The lock (D-055): the panel opens only with the code 1234, asked each time.
  const code = el('input', { type: 'password', id: 'pv-code', inputMode: 'numeric', autocomplete: 'off', maxLength: 8 });
  const open = el('button', { type: 'button', className: 'pv-open', textContent: 'Open' });
  const lockClose = el('button', { type: 'button', textContent: 'Close' });
  const lockMsg = el('p', { className: 'pv-msg', role: 'status' });
  const lock = el('div', { className: 'pv-lock' }, [el('label', { htmlFor: 'pv-code', textContent: 'Grown-ups: type the code' }), code, open, lockClose, lockMsg]);
  const body = el('div', { className: 'pv-body', hidden: true }, [trackBox, levelBox, settingsBox, progressBox, el('div', { className: 'pv-btns' }, [apply, defaults, close, msg])]);
  const sheet = el('div', { className: 'pv-sheet', role: 'dialog' }, [
    el('h2', { textContent: 'Test settings' }),
    el('p', { className: 'pv-sub', textContent: 'Preview only, for testing: never on the real site or the children\'s preview. Kept for this tab until it closes.' }),
    lock, body]);
  sheet.setAttribute('aria-label', 'Test settings');
  const back = el('div', { className: 'pv-back', hidden: true }, [sheet]);
  back.addEventListener('click', (e) => { if (e.target === back) back.hidden = true; });
  document.body.append(cog, back);

  function disarm() { reset.classList.remove('armed'); reset.textContent = 'Reset the game'; }
  function show() {
    disarm();
    const s = T.state();
    for (const [key, spec] of Object.entries(SETTINGS)) {
      if (typeof spec.default === 'boolean') inputs[key].checked = !!s.settings[key];
      else inputs[key].value = s.settings[key] === null ? '' : String(s.settings[key]);
    }
    rocks.value = String(s.progress.rocks);
    track.value = TRACK;
    level.value = String(s.level);
    showLevel();
  }
  function read() {
    const settings = {};
    for (const [key, spec] of Object.entries(SETTINGS)) {
      settings[key] = typeof spec.default === 'boolean' ? inputs[key].checked : inputs[key].value;
    }
    const progress = T.state().progress, id = levelId(), levels = { ...(progress.levels || {}) };
    const st = Math.max(0, Math.min(3, Math.round(Number(stars.value) || 0))), fd = Math.max(0, Math.min(8, Math.round(Number(found.value) || 0)));
    if (st > 0) levels[id] = { stars: st, rocks: fd }; else delete levels[id];
    return { level: Number(level.value), settings, state: { ...progress, levels, rocks: Number(rocks.value) || 0 } };
  }
  function use(given, quiet) {
    const notes = resolveSettings(SETTINGS, given.settings).notes;
    const ok = T.begin(given);
    if (ok) {
      // the settings for this tab; the place and progress on the device, as the game keeps them (ER-004)
      try { sessionStorage.setItem(KEY, JSON.stringify({ settings: given.settings })); } catch (e) { /* not kept */ }
      __m_games__common_rocket_kit.keepOnDevice('rocket-lander', T.state().kept); // format 4: both tracks' maps
    }
    if (!quiet) msg.textContent = ok ? `Applied.${notes.length ? ' ' + notes.join('; ') + '.' : ''}` : 'Go back to the map first.';
    return ok;
  }

  cog.addEventListener('click', () => {
    show(); msg.textContent = ''; lockMsg.textContent = ''; code.value = '';
    lock.hidden = false; body.hidden = true; back.hidden = false; code.focus();
  });
  const tryCode = () => {
    if (code.value === '1234') { lock.hidden = true; body.hidden = false; return; }
    code.value = ''; lockMsg.textContent = 'That isn\'t the code.';
  };
  open.addEventListener('click', tryCode);
  code.addEventListener('keydown', (e) => { if (e.key === 'Enter') tryCode(); });
  lockClose.addEventListener('click', () => { back.hidden = true; });
  reset.addEventListener('click', () => {
    if (!reset.classList.contains('armed')) {
      reset.classList.add('armed'); reset.textContent = 'Tap again to reset both games';
      return;
    }
    disarm();
    for (const t of TILES) { try { localStorage.removeItem(`family-games:${t}:progress`); } catch (e) { /* nothing kept */ } }
    // state null: the game reads the device again, now empty, so it starts afresh
    if (use({ ...read(), level: undefined, state: null }, true)) { show(); msg.textContent = 'Reset: Classic, 0 moon rocks, the map from the Moon\'s level 1.'; }
    else msg.textContent = 'Go back to the map first.';
  });
  close.addEventListener('click', () => { back.hidden = true; });
  fill.addEventListener('click', () => {
    const r = ROUTE[Number(level.value) - 1];
    if (!r) return;
    const given = read(), levels = given.state.levels;
    for (const lv of r.sys.levels) levels[lv.id] = { stars: 3, rocks: levels[lv.id] ? levels[lv.id].rocks : 0 };
    const last = r.sys.levels[r.sys.levels.length - 1];
    given.level = ROUTE.findIndex((x) => x.lv.id === last.id) + 1;
    if (use(given, true)) { show(); msg.textContent = `${r.sys.name}: 3 stars on all ${r.sys.levels.length} levels; the rocket waits at level ${r.sys.levels.length}. Pass it for hyperspace.`; }
    else msg.textContent = 'Go back to the map first.';
  });
  apply.addEventListener('click', () => {
    if (track.value !== TRACK) { // another track: the game keeps everything and reloads on it
      msg.textContent = 'Changing track…';
      if (T.begin({ track: track.value }) !== 'reload') msg.textContent = 'Go back to the map first.';
      return;
    }
    if (use(read())) { show(); }
  });
  defaults.addEventListener('click', () => {
    for (const [key, spec] of Object.entries(SETTINGS)) {
      if (typeof spec.default === 'boolean') inputs[key].checked = spec.default;
      else inputs[key].value = spec.default === null ? '' : String(spec.default);
    }
    level.value = '1'; showLevel();
    msg.textContent = 'Level 1 and the defaults filled. Press Apply to use them.';
  });

  try {
    const kept = JSON.parse(sessionStorage.getItem(KEY) || 'null');
    if (kept && typeof kept === 'object') use({ settings: kept.settings, state: null }, true); // the place and progress: the device's
  } catch (e) { /* nothing kept */ }
})();
