// The launcher (P13): Who's playing? → the child's home screen → a game.
// Shows what this device remembers straight away, then refreshes from the Sheet.

import { CONFIG } from './config.js';
import * as api from './api.js';
import { ANIMALS, COLOURS, injectAvatars, avatarSVG } from './avatars.js';
import { injectIcons, icon, stars } from './icons.js';
import {
  ACHIEVEMENTS, ACHIEVEMENT_BY_ID, CELEBRATE_KEY, playerStats, earnedIds, newlyEarned,
} from './achievements.js';
import { DEFAULT_SKIN, FALLBACK_SKINS, skinList, isUnlocked, applySkin } from './skins.js';
import * as sound from './sound.js';
import { startSkinEffects } from './skin-effects.js';

const app = document.getElementById('app');
const TILT = [-8, 5, -3, 7, -6, 4, -5, 6];
const LOCAL_SKIN = (pid) => 'fg.skin.' + pid; // a skin choice the Sheet hasn't saved yet

const state = {
  games: [],
  profiles: api.getCachedProfiles(),
  skins: skinList(api.getCachedSkins()),
  debugSkin: null, // set by the debug button; never saved
  screen: 'who',
  playerId: null,
};

// ---------- Small helpers ----------

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const colourOf = (p) => (/^#[0-9a-f]{6}$/i.test(String(p && p.colour)) ? p.colour : '#F07A2A');
const face = (p) => `<span class="face"><span class="disc">${avatarSVG(p && p.avatar)}</span></span>`;
const atLeast = (v, min) => {
  const a = String(v || '0').split('.').map(Number), b = min.split('.').map(Number);
  for (let i = 0; i < 3; i++) if ((a[i] || 0) !== b[i]) return (a[i] || 0) > b[i];
  return true;
};
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const readyIds = () => state.games.filter((g) => g.status === 'ready').map((g) => g.id);
const gameById = (id) => state.games.find((g) => g.id === id);

function profileById(id) {
  return state.profiles.find((p) => p.profile_id === id) || null;
}

function replay(el, cls) {
  if (!el) return;
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
  el.addEventListener('animationend', () => el.classList.remove(cls), { once: true });
}

function say(el, text) {
  if (!el) return;
  el.querySelectorAll(':scope > .hello').forEach((x) => x.remove());
  const bubble = document.createElement('span');
  bubble.className = 'hello';
  bubble.textContent = text;
  // Near the right edge, the bubble opens to the left so it stays on screen.
  if (el.getBoundingClientRect().left > window.innerWidth / 2) bubble.classList.add('left');
  el.appendChild(bubble);
  setTimeout(() => bubble.remove(), 2000);
}

let toastTimer = null;
function toast(text) {
  document.querySelectorAll('.toast').forEach((t) => t.remove());
  const t = document.createElement('div');
  t.className = 'toast';
  t.setAttribute('role', 'status');
  t.textContent = text;
  document.body.appendChild(t);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.remove(), 4500);
}

function setSkin(id) {
  applySkin(state.debugSkin || id);
}

// ---------- Skins per child ----------

function chosenSkin(p) {
  const local = api.loadLocal(LOCAL_SKIN(p.profile_id), null);
  return (local && local.skin) || p.skin || DEFAULT_SKIN;
}

// A chosen skin only shows if the child still has enough stars for it.
function skinToShow(p, starsTotal) {
  const id = chosenSkin(p);
  const skin = state.skins.find((s) => s.skin_id === id);
  return skin && isUnlocked(skin, starsTotal) ? id : DEFAULT_SKIN;
}

async function chooseSkin(pid, skinId) {
  api.saveLocal(LOCAL_SKIN(pid), { skin: skinId, at: Date.now() });
  try {
    const profile = await api.updateProfile(pid, { skin: skinId });
    state.profiles = api.getCachedProfiles();
    if (profile.skin === skinId) api.saveLocal(LOCAL_SKIN(pid), null); // the Sheet has it now
  } catch {
    // Older script, offline, or stars not synced yet: keep the choice on this device.
  }
}

// ---------- Screens ----------

function renderSetup(message = '') {
  state.screen = 'setup';
  setSkin(DEFAULT_SKIN);
  app.innerHTML = `
    <main class="screen">
      <div class="corner static"><div class="pad">
        <h2>Family games</h2>
        <p>A grown-up needs to set up this device once. Type the family code (the one saved as FAMILY_CODE in the Apps Script).</p>
        <form id="setup-form">
          <label for="setup-code">Family code</label>
          <input id="setup-code" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" required>
          <div class="row"><button class="btn primary" type="submit">Save and continue</button></div>
          <p class="msg ${message ? 'bad' : ''}" role="status">${esc(message)}</p>
        </form>
      </div></div>
    </main>`;
  document.getElementById('setup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = app.querySelector('.msg');
    api.setFamilyCode(document.getElementById('setup-code').value);
    msg.className = 'msg';
    msg.textContent = 'Checking…';
    try {
      state.profiles = await api.fetchProfiles();
      state.skins = skinList(api.getCachedSkins());
      route();
    } catch (err) {
      const wrong = String(err.message).includes('wrong_code');
      api.setFamilyCode('');
      renderSetup(wrong ? "That code doesn't match the one in the Apps Script." : "Couldn't reach the Sheet. Check the connection and try again.");
    }
  });
}

function renderWho() {
  state.screen = 'who';
  state.playerId = null;
  setSkin(DEFAULT_SKIN);
  document.title = 'Family games';
  const list = state.profiles;
  app.innerHTML = `
    <main class="screen who">
      <h1 class="title">Who's playing?</h1>
      ${list.length
        ? `<div class="players">${list.map((p) => `
            <button class="player" data-p="${esc(p.profile_id)}" style="--c:${colourOf(p)}">
              ${face(p)}<span class="pname">${esc(p.nickname)}</span>
            </button>`).join('')}</div>`
        : '<p class="empty">No players yet. Grown-ups: press and hold the gear in the corner to add one.</p>'}
    </main>`;
}

function renderHome(pid) {
  const p = profileById(pid);
  if (!p) return renderWho();
  state.screen = 'home';
  state.playerId = pid;
  document.title = `${p.nickname}'s games`;

  const data = api.getCachedProfile(pid);
  const outbox = api.getOutbox();
  const st = playerStats(data, outbox, pid, readyIds());
  const earned = earnedIds(data, outbox, pid);
  const skin = skinToShow(p, st.starsTotal);
  setSkin(skin);
  const waiting = outbox.results.some((r) => r.profile_id === pid);
  const shown = state.debugSkin || skin;

  app.innerHTML = `
    <main class="screen home" style="--c:${colourOf(p)}">
      <header class="head">
        <button class="back" data-back aria-label="Back to Who's playing">${icon('i-back')}</button>
        ${face(p)}
        <div class="me">
          <h1 class="hi">Hi ${esc(p.nickname)}!</h1>
          <span class="total" role="img" aria-label="${plural(st.starsTotal, 'star')}">${icon('s-star', 'st on')}<span>${st.starsTotal}</span></span>
        </div>
        ${waiting ? `<span class="sync" role="img" aria-label="Saved on this device, will sync" title="Saved here, will sync">${icon('i-cloud')}</span>` : ''}
      </header>

      <section class="games" aria-labelledby="h-games">
        <h2 id="h-games">Games</h2>
        <div class="tiles">${state.games.map((g) => tile(g, pid, st)).join('')}</div>
      </section>

      <section class="side">
        <div>
          <h2>${shown === 'sticker' ? 'My stickers' : 'My badges'}</h2>
          <div class="slots">${badgeSlots(earned)}</div>
        </div>
        <div>
          <h2>Last played</h2>
          ${lastPlayed(data, outbox, pid)}
        </div>
        <div>
          <h2>My skins</h2>
          <div class="skins">${skinChoices(st.starsTotal, skin)}</div>
          ${skinProgress(st.starsTotal)}
        </div>
      </section>
    </main>`;
}

function tile(g, pid, st) {
  const style = `--g:${esc(g.colour || '#2E8FD0')}`;
  const pic = `<span class="tile-ic">${icon(esc(g.icon || 'g-star'))}</span><span class="tile-t">${esc(g.title)}</span>`;
  if (g.status !== 'ready') {
    return `<button class="tile soon" data-soon style="${style}" aria-label="${esc(g.title)}: coming soon"><span class="soon-tape" aria-hidden="true">Soon</span>${pic}</button>`;
  }
  const href = `${g.folder}index.html?player=${encodeURIComponent(pid)}`;
  return `<a class="tile" href="${esc(href)}" data-g="${esc(g.id)}" style="${style}">${pic}${stars(st.bestStars[g.id] || 0)}</a>`;
}

function badgeSlots(earned) {
  return ACHIEVEMENTS.map((a, i) => {
    const style = `--bc:${a.colour};--r:${TILT[i]}deg`;
    return earned.has(a.id)
      ? `<button class="slot got" data-badge="${a.id}" style="${style}" aria-label="${esc(a.name)}">${icon(a.icon)}</button>`
      : `<button class="slot lock" data-badge="${a.id}" style="${style}" aria-label="${esc(a.name)}: not yet">${icon(a.icon)}<span class="q" aria-hidden="true">?</span></button>`;
  }).join('');
}

function lastPlayed(data, outbox, pid) {
  const pending = outbox.results.filter((r) => r.profile_id === pid).slice().reverse();
  const items = [...pending, ...((data && data.recent) || [])].slice(0, 5);
  if (!items.length) return '<p class="note">Play a game to fill this up!</p>';
  return `<div class="minis">${items.map((r) => {
    const g = gameById(r.game_id) || { colour: '#8A8F96', icon: 'g-star', title: r.game_id };
    return `<span class="mini" style="--g:${esc(g.colour)}" title="${esc(g.title)}"><span class="mini-ic">${icon(esc(g.icon))}</span>${stars(r.stars)}</span>`;
  }).join('')}</div>`;
}

function skinChoices(total, current) {
  return state.skins.map((s) => {
    const open = isUnlocked(s, total);
    const on = s.skin_id === current;
    const label = open ? s.name : `${s.name}: needs ${s.stars_needed} stars`;
    return `
      <button class="skin${open ? '' : ' locked'}${on ? ' on' : ''}" data-skin="${esc(s.skin_id)}" aria-pressed="${on}" aria-label="${esc(label)}">
        <span class="swatch" data-s="${esc(s.skin_id)}"><span class="sw"></span>${open ? '' : `<span class="lockmark">${icon('i-lock')}<span>${s.stars_needed}${icon('s-star', 'st on')}</span></span>`}</span>
        ${on ? `<span class="tick">${icon('i-check')}</span>` : ''}
        <span>${esc(s.name)}</span>
      </button>`;
  }).join('');
}

function skinProgress(total) {
  const next = state.skins.find((s) => s.stars_needed > total);
  if (!next) return '<p class="progress">You have every skin!</p>';
  return `<p class="progress">${plural(next.stars_needed - total, 'more star')} for ${esc(next.name)}!</p>`;
}

// ---------- Celebrations ----------

function partyCheck(pid) {
  if (document.querySelector('.party') || state.playerId !== pid) return;
  const data = api.getCachedProfile(pid);
  const outbox = api.getOutbox();
  const st = playerStats(data, outbox, pid, readyIds());

  // Badges earned some other way (another device, a new day) are caught here.
  const fresh = newlyEarned(st, earnedIds(data, outbox, pid));
  fresh.forEach((a) => api.queueAchievement({ profile_id: pid, achievement_id: a.id }));
  if (fresh.length) api.flush().catch(() => {});

  let news = api.loadLocal(CELEBRATE_KEY, null);
  if (news && (news.profile_id !== pid || Date.now() - news.at > 15 * 60 * 1000)) news = null;
  if (news) api.saveLocal(CELEBRATE_KEY, null);

  const badges = [...new Set([...(news ? news.achievements : []), ...fresh.map((a) => a.id)])]
    .map((id) => ACHIEVEMENT_BY_ID[id]).filter(Boolean);
  const before = news ? news.stars_before : st.starsTotal;
  const unlocked = state.skins.filter((s) => s.stars_needed > before && s.stars_needed <= st.starsTotal);
  if (!news && !badges.length) return;
  showParty({ stars: news ? news.stars : 0, total: st.starsTotal, badges, unlocked, pid });
}

function showParty({ stars: won, total, badges, unlocked, pid }) {
  const headline = won >= 3 ? 'Amazing!' : won === 2 ? 'Great job!' : won === 1 ? 'Well done!' : 'New sticker!';
  const colours = ['#E5533D', '#F5B700', '#2E8FD0', '#2FA34A', '#E0457B', '#7E4FC9'];
  const confetti = Array.from({ length: 44 }, (_, i) =>
    `<i style="left:${(i * 37) % 100}%;background:${colours[i % colours.length]};--x:${((i * 53) % 21) - 10}vw;--d:${2.2 + (i % 5) * .3}s;--delay:${(i % 9) * .08}s;--rot:${360 + (i % 4) * 180}deg"></i>`).join('');

  const party = document.createElement('div');
  party.className = 'party';
  party.setAttribute('role', 'dialog');
  party.setAttribute('aria-modal', 'true');
  party.setAttribute('aria-labelledby', 'party-h');
  party.innerHTML = `
    <div class="confetti" aria-hidden="true">${confetti}</div>
    <div class="party-card">
      <h2 id="party-h">${headline}</h2>
      ${won ? `${stars(won)}<p>+${plural(won, 'star')}! You have ${total} now.</p>` : ''}
      ${badges.length ? `
        <p>${badges.length === 1 ? 'You got a new sticker!' : 'You got new stickers!'}</p>
        <div class="earned">${badges.map((a, i) => `
          <figure><span class="slot got peel" style="--bc:${a.colour};--r:${TILT[i % TILT.length]}deg;animation-delay:${.35 + i * .35}s">${icon(a.icon)}</span>
          <figcaption>${esc(a.name)}</figcaption></figure>`).join('')}</div>` : ''}
      ${unlocked.length ? `
        <p>${unlocked.length === 1 ? 'New skin unlocked!' : 'New skins unlocked!'}</p>
        <div class="earned">${unlocked.map((s) => `
          <figure><button class="swatch" data-s="${esc(s.skin_id)}" data-try="${esc(s.skin_id)}" aria-label="Use the ${esc(s.name)} skin"><span class="sw"></span></button>
          <figcaption>${esc(s.name)}</figcaption></figure>`).join('')}</div>
        <p style="font-size:1.1rem">Tap it to try it on!</p>` : ''}
      <button class="big-btn" data-yay>Yay!</button>
    </div>`;
  document.body.appendChild(party);
  sound.play('yay');
  badges.forEach((_, i) => setTimeout(() => sound.play('peel'), 400 + i * 350));
  party.querySelector('[data-yay]').focus();

  party.addEventListener('click', async (e) => {
    const tryOn = e.target.closest('[data-try]');
    if (tryOn) {
      sound.play('tap');
      party.remove();
      await chooseSkin(pid, tryOn.dataset.try);
      renderHome(pid);
      return;
    }
    if (e.target.closest('[data-yay]')) {
      sound.play('tap');
      party.remove();
      renderHome(pid);
    }
  });
}

// ---------- Taps on the screens ----------

app.addEventListener('click', async (e) => {
  const t = e.target;

  const playerBtn = t.closest('[data-p]');
  if (playerBtn) {
    const p = profileById(playerBtn.dataset.p);
    if (!p) return;
    sound.play('hello');
    replay(playerBtn.querySelector('.face'), 'wiggle');
    say(playerBtn, `Hi ${p.nickname}!`);
    setTimeout(() => go(p.profile_id), 650);
    return;
  }
  if (t.closest('[data-back]')) {
    sound.play('tap');
    go(null);
    return;
  }
  const soon = t.closest('[data-soon]');
  if (soon) {
    sound.play('soon');
    replay(soon, 'wiggle');
    say(soon, 'Coming soon!');
    return;
  }
  if (t.closest('[data-g]')) {
    sound.play('tap');
    return; // the link opens the game
  }
  const badge = t.closest('[data-badge]');
  if (badge) {
    const a = ACHIEVEMENT_BY_ID[badge.dataset.badge];
    sound.play('tap');
    replay(badge, 'wiggle');
    say(badge, badge.classList.contains('got') ? a.name : `Not yet: ${a.name}`);
    return;
  }
  const skinBtn = t.closest('[data-skin]');
  if (skinBtn && state.playerId) {
    const pid = state.playerId;
    const skin = state.skins.find((s) => s.skin_id === skinBtn.dataset.skin);
    const st = playerStats(api.getCachedProfile(pid), api.getOutbox(), pid, readyIds());
    if (!isUnlocked(skin, st.starsTotal)) {
      sound.play('soon');
      replay(skinBtn, 'wiggle');
      say(skinBtn, `Needs ${skin.stars_needed} stars`);
      return;
    }
    sound.play('peel');
    api.saveLocal(LOCAL_SKIN(pid), { skin: skin.skin_id, at: Date.now() });
    renderHome(pid);
    chooseSkin(pid, skin.skin_id).then(() => {
      if (state.playerId === pid) renderHome(pid);
    });
  }
});

// ---------- Routing ----------

function go(pid) {
  const url = new URL(location.href);
  if (pid) url.searchParams.set('player', pid); else url.searchParams.delete('player');
  history.pushState({}, '', url);
  route();
}

function route() {
  if (!api.getFamilyCode()) return renderSetup();
  const pid = new URLSearchParams(location.search).get('player');
  if (pid && profileById(pid)) {
    renderHome(pid);
    partyCheck(pid);
  } else {
    renderWho();
  }
}

window.addEventListener('popstate', route);

// ---------- Keeping up to date with the Sheet ----------

async function refresh() {
  if (!api.getFamilyCode()) return;
  try {
    await api.flush();
  } catch (err) {
    return handleError(err);
  }
  try {
    const before = JSON.stringify([state.profiles, state.skins]);
    state.profiles = await api.fetchProfiles();
    state.skins = skinList(api.getCachedSkins());
    const pid = new URLSearchParams(location.search).get('player');
    let changed = before !== JSON.stringify([state.profiles, state.skins]);
    if (pid && profileById(pid)) {
      const old = JSON.stringify(api.getCachedProfile(pid));
      await api.fetchProfile(pid);
      changed = changed || old !== JSON.stringify(api.getCachedProfile(pid));
    }
    if (changed && state.screen !== 'setup') route();
  } catch (err) {
    handleError(err);
  }
  // Game settings and word lists, kept on the device so games open with them straight away.
  // Quietly skipped if the Apps Script is older than 0.3.0.
  api.fetchSettings().catch(() => {});
}

function handleError(err) {
  const m = String((err && err.message) || err);
  if (m.includes('wrong_code')) toast("Grown-ups: this device's family code doesn't match. Open the gear.");
  else if (m.includes('not_configured')) toast('Grown-ups: the Apps Script link is missing from shared/config.js.');
  else toast("Can't reach the Sheet right now. Stars are saved on this device.");
}

window.addEventListener('online', () => refresh());

// ---------- Grown-ups' corner (P18): press and hold the gear, then a sum ----------

function addGear() {
  const gear = document.createElement('button');
  gear.className = 'gear';
  gear.type = 'button';
  gear.setAttribute('aria-label', "Grown-ups' corner: press and hold");
  gear.innerHTML = `<span class="ring"></span>${icon('i-gear')}`;
  document.body.appendChild(gear);

  let start = 0, frame = 0;
  const stop = () => {
    cancelAnimationFrame(frame);
    gear.classList.remove('holding');
    gear.style.setProperty('--p', 0);
  };
  const tick = () => {
    const p = Math.min(1, (performance.now() - start) / 1000);
    gear.style.setProperty('--p', p);
    if (p >= 1) { stop(); openCorner(); return; }
    frame = requestAnimationFrame(tick);
  };
  const begin = (e) => {
    e.preventDefault();
    start = performance.now();
    gear.classList.add('holding');
    frame = requestAnimationFrame(tick);
  };
  gear.addEventListener('pointerdown', begin);
  ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => gear.addEventListener(ev, stop));
  gear.addEventListener('contextmenu', (e) => e.preventDefault());
  gear.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) begin(e); });
  gear.addEventListener('keyup', stop);
}

const corner = document.createElement('dialog');
corner.className = 'corner';
corner.setAttribute('aria-labelledby', 'corner-h');

function openCorner() {
  if (corner.open) return;
  if (!corner.isConnected) document.body.appendChild(corner);
  cornerQuiz();
  corner.showModal();
}

corner.addEventListener('close', () => route());

function cornerQuiz(note = '') {
  const a = 3 + Math.floor(Math.random() * 7);
  const b = 3 + Math.floor(Math.random() * 7);
  corner.innerHTML = `
    <div class="pad">
      <button class="x" type="button" data-close aria-label="Close">×</button>
      <h2 id="corner-h">Grown-ups only</h2>
      <form id="quiz">
        <label for="quiz-a">What's ${a} × ${b}?</label>
        <input id="quiz-a" type="number" inputmode="numeric" autocomplete="off" required>
        <div class="row"><button class="btn primary" type="submit">Open</button></div>
        <p class="msg bad" role="status">${esc(note)}</p>
      </form>
    </div>`;
  corner.querySelector('#quiz').addEventListener('submit', (e) => {
    e.preventDefault();
    if (Number(corner.querySelector('#quiz-a').value) === a * b) cornerMain();
    else cornerQuiz('Not quite. Try this one.');
  });
  setTimeout(() => corner.querySelector('#quiz-a').focus(), 30);
}

function cornerMain(message = '', good = true) {
  const outbox = api.getOutbox();
  const waiting = outbox.results.length || outbox.achievements.length
    ? `${plural(outbox.results.length, 'result')} and ${plural(outbox.achievements.length, 'badge')} are saved on this device, waiting to reach the Sheet.`
    : 'Nothing waiting. Everything has reached the Sheet.';
  corner.innerHTML = `
    <div class="pad">
      <button class="x" type="button" data-close aria-label="Close">×</button>
      <h2 id="corner-h">Grown-ups' corner</h2>
      <p class="msg ${good ? 'good' : 'bad'}" role="status">${esc(message)}</p>

      <h3>Players</h3>
      ${state.profiles.length
        ? `<ul class="plist">${state.profiles.map((p) => `
            <li style="--c:${colourOf(p)}"><span class="chip">${avatarSVG(p.avatar)}</span>
              <span class="grow">${esc(p.nickname)}</span>
              <button class="btn" type="button" data-edit="${esc(p.profile_id)}">Edit</button></li>`).join('')}</ul>`
        : '<p>No players yet.</p>'}
      <div class="row"><button class="btn" type="button" data-add>Add a player</button></div>
      <div id="pform"></div>

      <h3>Family code</h3>
      <p class="small">Saved on this device only. It must match FAMILY_CODE in the Apps Script.</p>
      <input id="fcode" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" value="${esc(api.getFamilyCode())}" aria-label="Family code">
      <div class="row">
        <button class="btn primary" type="button" data-code>Save code</button>
        <button class="btn" type="button" data-ping>Check connection</button>
      </div>

      <h3>Waiting to sync</h3>
      <p>${waiting}</p>
      <div class="row"><button class="btn" type="button" data-sync ${outbox.results.length || outbox.achievements.length ? '' : 'disabled'}>Send now</button></div>

      <h3>Sound</h3>
      <label class="row" style="margin:0;color:inherit;font-size:16px"><input type="checkbox" id="snd" ${sound.isMuted() ? '' : 'checked'}> Sounds on</label>

      <h3>More</h3>
      <p class="small"><a href="tools/sheet-check.html">Sheet check page</a></p>
      <p class="small">Skins and their star targets are in the Sheet's Skins tab: change stars_needed there.</p>
    </div>`;
}

function playerForm(p) {
  const editing = !!p;
  let animal = (p && ANIMALS.some((a) => a.id === p.avatar)) ? p.avatar : 'fox';
  let colour = p ? colourOf(p) : COLOURS[state.profiles.length % COLOURS.length];
  const holder = corner.querySelector('#pform');
  holder.innerHTML = `
    <form id="pf">
      <h3>${editing ? `Edit ${esc(p.nickname)}` : 'Add a player'}</h3>
      <label for="pf-name">Name (first name or nickname)</label>
      <input id="pf-name" type="text" maxlength="20" required value="${esc(p ? p.nickname : '')}">
      <label>Animal</label>
      <div class="pick" role="group" aria-label="Animal">${ANIMALS.map((a) =>
        `<button type="button" data-animal="${a.id}" aria-label="${a.name}" aria-pressed="${a.id === animal}">${avatarSVG(a.id)}</button>`).join('')}</div>
      <label>Colour</label>
      <div class="pick" role="group" aria-label="Colour">${COLOURS.map((c) =>
        `<button type="button" data-colour="${c}" aria-label="Colour ${c}" aria-pressed="${c === colour}"><span class="dot" style="background:${c}"></span></button>`).join('')}</div>
      <div class="row">
        <button class="btn primary" type="submit">${editing ? 'Save' : 'Add player'}</button>
        <button class="btn" type="button" data-cancel>Cancel</button>
      </div>
    </form>`;
  const form = holder.querySelector('#pf');
  form.addEventListener('click', (e) => {
    const an = e.target.closest('[data-animal]');
    const co = e.target.closest('[data-colour]');
    if (an) { animal = an.dataset.animal; form.querySelectorAll('[data-animal]').forEach((b) => b.setAttribute('aria-pressed', b === an)); }
    if (co) { colour = co.dataset.colour; form.querySelectorAll('[data-colour]').forEach((b) => b.setAttribute('aria-pressed', b === co)); }
    if (e.target.closest('[data-cancel]')) holder.innerHTML = '';
  });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nickname = form.querySelector('#pf-name').value.trim();
    const submit = form.querySelector('[type=submit]');
    submit.disabled = true;
    try {
      if (editing) await api.updateProfile(p.profile_id, { nickname, avatar: animal, colour });
      else await api.addProfile({ nickname, avatar: animal, colour });
      state.profiles = await api.fetchProfiles();
      cornerMain(editing ? `Saved ${nickname}.` : `Added ${nickname}.`);
    } catch (err) {
      submit.disabled = false;
      const m = String(err.message);
      const text = m.includes('unknown_action')
        ? 'Editing needs the new Apps Script (version 0.2.0). See docs/setup-sheet.md.'
        : `Couldn't save: ${m}`;
      cornerMain(text, false);
    }
  });
  form.querySelector('#pf-name').focus();
}

corner.addEventListener('click', async (e) => {
  const t = e.target;
  if (t.closest('[data-close]')) return corner.close();
  if (t.closest('[data-add]')) return playerForm(null);
  const edit = t.closest('[data-edit]');
  if (edit) return playerForm(profileById(edit.dataset.edit));
  if (t.closest('[data-code]')) {
    api.setFamilyCode(corner.querySelector('#fcode').value);
    return cornerMain('Family code saved on this device.');
  }
  if (t.closest('[data-ping]')) {
    api.setFamilyCode(corner.querySelector('#fcode').value);
    try {
      const r = await api.call('ping');
      const current = atLeast(r.version, '0.2.0');
      return cornerMain(current
        ? `Connected. Apps Script version ${r.version}.`
        : `Connected, but the Apps Script is version ${r.version}. Paste the new Code.gs and redeploy to save skins.`, current);
    } catch (err) {
      return cornerMain(`Couldn't connect: ${err.message}`, false);
    }
  }
  if (t.closest('[data-sync]')) {
    try {
      const r = await api.flush();
      return cornerMain(r.waiting ? 'Set the family code first.' : `Sent ${plural(r.sent || 0, 'result')}.`, !r.waiting);
    } catch (err) {
      return cornerMain(`Couldn't send: ${err.message}`, false);
    }
  }
});

corner.addEventListener('change', (e) => {
  if (e.target.id === 'snd') {
    sound.setMuted(!e.target.checked);
    if (e.target.checked) sound.play('tap');
  }
});

// ---------- Debug skin button (CONFIG.debug) ----------

function addDebug() {
  const order = [null, ...FALLBACK_SKINS.map((s) => s.skin_id)];
  const name = (id) => (id ? (FALLBACK_SKINS.find((s) => s.skin_id === id) || {}).name : 'off');
  const btn = document.createElement('button');
  btn.className = 'debug';
  btn.type = 'button';
  btn.title = 'Grown-ups: switches skins without unlocking or saving them';
  const label = () => { btn.textContent = `Debug skin: ${name(state.debugSkin)}`; };
  label();
  btn.addEventListener('click', () => {
    state.debugSkin = order[(order.indexOf(state.debugSkin) + 1) % order.length];
    label();
    route();
  });
  document.body.appendChild(btn);
}

// ---------- Start ----------

async function loadGames() {
  try {
    const list = await (await fetch('games.json', { cache: 'no-cache' })).json();
    return Array.isArray(list.games) ? list.games : [];
  } catch {
    return [];
  }
}

async function start() {
  injectIcons();
  injectAvatars();
  document.body.insertAdjacentHTML('afterbegin', '<div class="deco" aria-hidden="true"></div>');
  startSkinEffects();
  addGear();
  if (CONFIG.debug) addDebug();
  state.games = await loadGames();
  route();
  refresh();
}

start();
