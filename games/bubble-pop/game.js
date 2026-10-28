// Bubble pop: tap the bubbles before they float off the top.
// 20 bubbles a round; stars for how many were popped. Saved through the game kit.

import { homeButton, record, goHome } from '../../shared/game-kit.js';
import { play as sfx } from '../../shared/sound.js';

const TOTAL = 20;
const EVERY_MS = 1100;
const TINTS = ['#6CCBFF', '#FF9CCB', '#9BE38A', '#FFD95A', '#B9A2FF'];
const $ = (id) => document.getElementById(id);
const stage = $('stage');

let popped = 0, spawned = 0, started = 0, last = 0, spawnTimer = 0, frame = 0;
const live = new Set();

$('total').textContent = TOTAL;
homeButton();
$('play').addEventListener('click', startRound);
$('again').addEventListener('click', startRound);
$('done').addEventListener('click', () => goHome());

function starsFor(count) {
  if (count >= 17) return 3;
  if (count >= 11) return 2;
  return 1;
}

function startRound() {
  popped = 0;
  spawned = 0;
  $('count').textContent = '0';
  $('start').hidden = true;
  $('end').hidden = true;
  sfx('tap');
  started = last = performance.now();
  spawn();
  spawnTimer = setInterval(spawn, EVERY_MS);
  frame = requestAnimationFrame(step);
}

function spawn() {
  if (spawned >= TOTAL) { clearInterval(spawnTimer); return; }
  spawned += 1;
  const size = 72 + Math.random() * 46;
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'bubble';
  el.setAttribute('aria-label', 'Bubble');
  el.style.width = el.style.height = `${size}px`;
  el.style.setProperty('--tint', TINTS[spawned % TINTS.length]);
  const bubble = {
    el, size,
    x: size / 2 + Math.random() * Math.max(1, stage.clientWidth - size),
    y: stage.clientHeight + size / 2,
    speed: 45 + Math.random() * 35, // pixels a second: slow enough for little fingers
    wobble: Math.random() * Math.PI * 2,
  };
  place(bubble);
  el.addEventListener('pointerdown', (e) => { e.preventDefault(); pop(bubble); });
  el.addEventListener('click', () => pop(bubble)); // keyboard
  stage.appendChild(el);
  live.add(bubble);
}

function place(b) {
  const x = b.x - b.size / 2 + Math.sin(b.wobble) * 12;
  b.el.style.transform = `translate(${x}px, ${b.y - b.size / 2}px)`;
}

function step(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  live.forEach((b) => {
    b.y -= b.speed * dt;
    b.wobble += dt * 2;
    place(b);
    if (b.y < -b.size) { live.delete(b); b.el.remove(); }
  });
  if (spawned >= TOTAL && live.size === 0) { endRound(); return; }
  frame = requestAnimationFrame(step);
}

function pop(b) {
  if (!live.has(b)) return;
  live.delete(b);
  popped += 1;
  $('count').textContent = popped;
  sfx('pop');
  b.el.classList.add('popped');
  setTimeout(() => b.el.remove(), 260);
}

async function endRound() {
  cancelAnimationFrame(frame);
  clearInterval(spawnTimer);
  const stars = starsFor(popped);
  const seconds = Math.round((performance.now() - started) / 1000);
  $('end-h').textContent = stars === 3 ? 'Amazing!' : stars === 2 ? 'Great popping!' : 'Nice try!';
  $('end-p').textContent = `You popped ${popped} bubble${popped === 1 ? '' : 's'}!`;
  $('end-stars').innerHTML = [0, 1, 2].map((i) =>
    `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 16.9 6.3 20l1.2-6.4L2.8 9.2l6.4-.8z" fill="${i < stars ? '#F5B700' : '#E3EEF5'}" stroke="#14324A" stroke-width="1.4" stroke-linejoin="round"/></svg>`).join('');
  $('end-stars').setAttribute('aria-label', `${stars} of 3 stars`);
  $('end').hidden = false;
  sfx('yay');
  await record({ score: popped, stars, seconds, level: 1 });
}
