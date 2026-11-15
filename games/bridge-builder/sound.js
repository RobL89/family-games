// Hamster Highway's sounds, made in the browser: nothing to download, all original (D-010). Version 1.0.
//
// tone(), noise() and play() are copied unchanged from Rocket Lander's games/_common/rocket/sound.js 1.4
// (the sibling's tooling, project rules); the sounds in SOUNDS are this game's own. Local changes: no
// speaking, and a tally of the sounds asked for (heard), so the browser test can see them without audio.
//
//   import { play } from './sound.js';
//   play('squeak');   // names are the keys of SOUNDS below

let ctx = null;
let noiseBuffer = null;
let muted = false;
export const heard = [];

export const isMuted = () => muted;
export const setMuted = (m) => { muted = !!m; };

function tone(freq, start, length, type = 'sine', volume = 0.16, slideTo = null) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + length);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + length + 0.02);
}

// A burst of filtered noise: whooshes, puffs and thuds.
function noise(start, length, { from = 1200, to = 300, type = 'bandpass', volume = 0.2, q = 0.8 } = {}) {
  if (!noiseBuffer) {
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.Q.value = q;
  filter.frequency.setValueAtTime(from, start);
  filter.frequency.exponentialRampToValueAtTime(Math.max(20, to), start + length);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  src.connect(filter).connect(gain).connect(ctx.destination);
  src.start(start);
  src.stop(start + length + 0.05);
}

const SOUNDS = {
  tap: (t) => tone(660, t, 0.08, 'triangle', 0.1),
  pick: (t) => { tone(520, t, 0.07, 'triangle', 0.1); tone(780, t + 0.05, 0.08, 'triangle', 0.1); },
  place: (t) => { noise(t, 0.08, { from: 900, to: 300, volume: 0.18 }); tone(300, t, 0.1, 'sine', 0.12, 520); },
  back: (t) => { tone(700, t, 0.07, 'triangle', 0.1, 400); },
  nope: (t) => { tone(220, t, 0.09, 'square', 0.05); tone(196, t + 0.1, 0.12, 'square', 0.05); },
  go: (t) => [392, 523, 659].forEach((f, i) => tone(f, t + i * 0.08, 0.14, 'triangle', 0.13)),
  squeak: (t) => { tone(1500, t, 0.07, 'sine', 0.1, 2300); tone(1900, t + 0.08, 0.06, 'sine', 0.08, 2600); },
  patter: (t) => noise(t, 0.03, { from: 3000, to: 2000, volume: 0.05 }),
  boing: (t) => { tone(180, t, 0.45, 'sine', 0.2, 620); tone(186, t, 0.45, 'triangle', 0.06, 640); },
  wheee: (t) => tone(700, t, 0.6, 'sine', 0.1, 1400),
  climb: (t) => [600, 700, 800].forEach((f, i) => tone(f, t + i * 0.06, 0.05, 'triangle', 0.06)),
  flump: (t) => { noise(t, 0.18, { from: 400, to: 80, type: 'lowpass', volume: 0.35 }); tone(140, t, 0.2, 'sine', 0.2, 60); },
  slide: (t) => tone(1400, t, 0.5, 'sine', 0.1, 300),
  dizzy: (t) => [900, 1100, 900, 1100].forEach((f, i) => tone(f, t + i * 0.09, 0.08, 'sine', 0.05)),
  splash: (t) => { noise(t, 0.35, { from: 3000, to: 500, volume: 0.25, q: 0.5 }); tone(500, t + 0.05, 0.12, 'sine', 0.06, 900); },
  huh: (t) => { tone(500, t, 0.1, 'triangle', 0.08); tone(700, t + 0.1, 0.12, 'triangle', 0.08); },
  snore: (t) => noise(t, 0.6, { from: 300, to: 200, type: 'lowpass', volume: 0.12 }),
  poof: (t) => noise(t, 0.25, { from: 2000, to: 600, volume: 0.12 }),
  home: (t) => { tone(784, t, 0.09, 'triangle', 0.12); tone(1047, t + 0.08, 0.12, 'triangle', 0.12); noise(t + 0.14, 0.05, { from: 2500, to: 900, volume: 0.1 }); },
  seed: (t) => [1319, 1568, 2093, 2637].forEach((f, i) => tone(f, t + i * 0.06, 0.12, 'sine', 0.08)),
  party: (t) => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, t + i * 0.1, 0.18, 'triangle', 0.12)),
  quack: (t) => { tone(420, t, 0.12, 'sawtooth', 0.06, 300); tone(400, t + 0.15, 0.1, 'sawtooth', 0.05, 290); },
  chirp: (t) => { tone(2200, t, 0.06, 'sine', 0.08, 3000); tone(2600, t + 0.08, 0.06, 'sine', 0.08, 3200); },
  ribbit: (t) => { tone(160, t, 0.08, 'square', 0.06, 220); tone(170, t + 0.12, 0.1, 'square', 0.06, 240); },
  clink: (t) => { tone(2400, t, 0.12, 'sine', 0.06); tone(3100, t + 0.03, 0.1, 'sine', 0.04); },
  soon: (t) => { tone(392, t, 0.12, 'triangle', 0.08); tone(330, t + 0.11, 0.16, 'triangle', 0.08); },
  hop: (t) => tone(400, t, 0.18, 'sine', 0.12, 900),
  whoosh: (t) => noise(t, 0.3, { from: 600, to: 2400, volume: 0.12 }),
};

export const SOUND_NAMES = Object.keys(SOUNDS);

export function play(name) {
  heard.push(name);
  if (heard.length > 200) heard.shift();
  if (isMuted() || !SOUNDS[name]) return;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    SOUNDS[name](ctx.currentTime + 0.01);
  } catch {
    // No sound on this device; carry on silently.
  }
}
