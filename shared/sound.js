// Little sounds made in the browser (no sound files to download), and words said out
// loud with the device's own voice. Mute lives in the grown-ups' corner and is
// remembered on this device (P19); muting also stops the spoken words.
//
//   import { play, speak } from '../../shared/sound.js';
//   play('chomp');            // names are the keys of SOUNDS below
//   speak('ship');            // returns false if the device can't speak or sound is off

import { loadLocal, saveLocal } from './api.js';

const KEY = 'fg.muted';
let ctx = null;
let noiseBuffer = null;

export const isMuted = () => !!loadLocal(KEY, false);
export const setMuted = (muted) => saveLocal(KEY, !!muted);

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
  filter.frequency.exponentialRampToValueAtTime(to, start + length);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
  src.connect(filter).connect(gain).connect(ctx.destination);
  src.start(start);
  src.stop(start + length + 0.05);
}

const SOUNDS = {
  // Launcher
  tap: (t) => tone(660, t, 0.09, 'triangle'),
  hello: (t) => { tone(523, t, 0.12); tone(784, t + 0.1, 0.16); },
  soon: (t) => { tone(392, t, 0.12, 'triangle'); tone(330, t + 0.11, 0.16, 'triangle'); },
  peel: (t) => { tone(700, t, 0.08, 'triangle'); tone(1050, t + 0.07, 0.12, 'triangle'); },
  yay: (t) => [523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.09, 0.22, 'triangle')),

  // Games
  pop: (t) => { tone(900, t, 0.06); tone(1300, t + 0.03, 0.05, 'sine', 0.08); },
  chomp: (t) => { noise(t, 0.07, { from: 2500, to: 900, volume: 0.22 }); tone(420, t + 0.02, 0.1, 'square', 0.05, 260); },
  ding: (t) => { tone(1047, t, 0.25, 'sine', 0.14); tone(1568, t + 0.06, 0.3, 'sine', 0.08); },
  oops: (t) => tone(420, t, 0.32, 'triangle', 0.16, 160),
  hiccup: (t) => { tone(500, t, 0.07, 'square', 0.06, 900); tone(600, t + 0.12, 0.07, 'square', 0.06, 1100); },
  coin: (t) => { tone(988, t, 0.08, 'square', 0.07); tone(1319, t + 0.08, 0.22, 'square', 0.07); },
  whoosh: (t) => noise(t, 0.35, { from: 400, to: 2400, volume: 0.16 }),
  puff: (t) => noise(t, 0.4, { from: 900, to: 200, type: 'lowpass', volume: 0.25 }),
  thud: (t) => { tone(140, t, 0.22, 'sine', 0.3, 60); noise(t, 0.18, { from: 600, to: 150, type: 'lowpass', volume: 0.18 }); },
  sparkle: (t) => [1319, 1568, 1976, 2637].forEach((f, i) => tone(f, t + i * 0.05, 0.18, 'sine', 0.07)),
  levelup: (t) => [392, 523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, t + i * 0.07, 0.25, 'triangle', 0.12)),
  unlock: (t) => { [784, 988, 1175, 1568].forEach((f, i) => tone(f, t + i * 0.08, 0.35, 'sine', 0.1)); noise(t + 0.3, 0.5, { from: 3000, to: 6000, type: 'highpass', volume: 0.05 }); },
  boop: (t) => tone(330, t, 0.1, 'sine', 0.14, 520),
  slurp: (t) => tone(300, t, 0.25, 'sawtooth', 0.04, 900),
};

export const SOUND_NAMES = Object.keys(SOUNDS);

export function play(name) {
  if (isMuted() || !SOUNDS[name]) return;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    SOUNDS[name](ctx.currentTime + 0.01);
  } catch {
    // No sound on this device; carry on silently.
  }
}

// ---------- Spoken words (speechSynthesis, Baseline "widely available") ----------
// Voices differ between devices and some have none; games must still work without it.

let voice = null;

function pickVoice() {
  try {
    const voices = window.speechSynthesis.getVoices();
    voice = voices.find((v) => v.lang === 'en-GB' && /female|serena|kate|martha|libby|sonia/i.test(v.name))
      || voices.find((v) => v.lang === 'en-GB')
      || voices.find((v) => /^en/i.test(v.lang))
      || null;
  } catch {
    voice = null;
  }
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  pickVoice();
  try { window.speechSynthesis.addEventListener('voiceschanged', pickVoice); } catch { /* older browsers */ }
}

export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

// Says text out loud. Interrupts anything still being said. Slightly slow and bright for children.
export function speak(text, { rate = 0.85, pitch = 1.1 } = {}) {
  if (isMuted() || !canSpeak() || !text) return false;
  try {
    const u = new SpeechSynthesisUtterance(String(text));
    u.lang = 'en-GB';
    if (voice) u.voice = voice;
    u.rate = rate;
    u.pitch = pitch;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    return true;
  } catch {
    return false;
  }
}

export function stopSpeaking() {
  try { if (canSpeak()) window.speechSynthesis.cancel(); } catch { /* ignore */ }
}
