// The six planets: sky, ground, landing strip colours and distant things in the sky.
// Order matters: a good round unlocks the next one.

export const PLANETS = [
  {
    id: 'moon', name: 'Moon', seed: 11,
    sky: ['#0B0A26', '#1D1A52', '#40418C'],
    nebula: ['#6C5CE7', '#2E86DE', '#9B7BFF'],
    ground: ['#E6E8F2', '#B9BDD1', '#8D91AB'],
    back: ['#9A9EBC', '#7A7E9E'],
    rim: '#FFFFFF',
    strip: '#3B3C66', glow: '#8CF5FF', lights: '#FFE066',
    far: [
      { x: 0.82, y: 0.22, r: 0.11, c1: '#5FB4FF', c2: '#2456B8', kind: 'swirl', par: 0.03 },
      { x: 0.14, y: 0.36, r: 0.035, c1: '#FFB38A', c2: '#C2563A', kind: 'plain', par: 0.015 },
    ],
  },
  {
    id: 'dust', name: 'Red Dust', seed: 23,
    sky: ['#1A0B26', '#4E1C42', '#A3454A'],
    nebula: ['#FF7A59', '#B23A7A', '#FFB36B'],
    ground: ['#F59A5A', '#CF6534', '#9E4325'],
    back: ['#B6502E', '#843521'],
    rim: '#FFD2A6',
    strip: '#4A1F33', glow: '#FFD36E', lights: '#FFF3B0',
    far: [
      { x: 0.2, y: 0.2, r: 0.05, c1: '#F4E6D8', c2: '#A99583', kind: 'craters', par: 0.02 },
      { x: 0.74, y: 0.3, r: 0.028, c1: '#E8D2C0', c2: '#8F7563', kind: 'plain', par: 0.01 },
    ],
  },
  {
    id: 'candy', name: 'Candy', seed: 37,
    sky: ['#1B0F3D', '#5B2A7C', '#C85CA2'],
    nebula: ['#FF7EC8', '#8C7BFF', '#FFC1E3'],
    ground: ['#FF94CB', '#FFF2F8', '#E86AAE'],
    back: ['#B98CFF', '#7FE0C9', '#FFB86B'],
    rim: '#FFFFFF',
    strip: '#5A2350', glow: '#FFF0FA', lights: '#9BFFF0',
    far: [
      { x: 0.8, y: 0.22, r: 0.09, c1: '#FFD36E', c2: '#FF6FA8', kind: 'lolly', par: 0.03 },
      { x: 0.16, y: 0.3, r: 0.04, c1: '#9BFFF0', c2: '#3FB8C9', kind: 'plain', par: 0.015 },
    ],
  },
  {
    id: 'ice', name: 'Ice', seed: 41,
    sky: ['#06142E', '#123A6B', '#2F86B8'],
    nebula: ['#41E0FF', '#5A6CFF', '#B7F5FF'],
    ground: ['#F2FCFF', '#B2E8F8', '#73C2E6'],
    back: ['#8ADCF7', '#4FA9DE', '#D3F6FF'],
    rim: '#FFFFFF',
    strip: '#1C3B66', glow: '#C6F8FF', lights: '#FFFFFF',
    far: [
      { x: 0.24, y: 0.2, r: 0.08, c1: '#E9F6FF', c2: '#7DA7D9', kind: 'bands', par: 0.025 },
      { x: 0.84, y: 0.34, r: 0.03, c1: '#B5FFE1', c2: '#3AA889', kind: 'plain', par: 0.012 },
    ],
  },
  {
    id: 'jungle', name: 'Jungle', seed: 53,
    sky: ['#04161A', '#0E3B3A', '#2E8063'],
    nebula: ['#3FE0A0', '#2BB0D6', '#C8FF7A'],
    ground: ['#86DE70', '#4DAD55', '#2F7F40'],
    back: ['#2D7243', '#1E5531'],
    rim: '#C8FF8A',
    strip: '#1C3A28', glow: '#E9FF8A', lights: '#FFE066',
    far: [
      { x: 0.78, y: 0.2, r: 0.12, c1: '#FFB45E', c2: '#D2522B', kind: 'bands', par: 0.03 },
      { x: 0.18, y: 0.26, r: 0.03, c1: '#FFF1C9', c2: '#C2A46A', kind: 'craters', par: 0.012 },
    ],
  },
  {
    id: 'ringed', name: 'Ringed', seed: 67,
    sky: ['#0E0828', '#2E1660', '#6C40AA'],
    nebula: ['#B07CFF', '#FF7ED8', '#7FA8FF'],
    ground: ['#BE94F4', '#8F60D9', '#6237A8'],
    back: ['#7449C0', '#55309A'],
    rim: '#E8D6FF',
    strip: '#2E1A55', glow: '#FFDDB0', lights: '#FFB3D9',
    rings: ['#FFD9A8', '#FFB3D9', '#C9B3FF', '#FFF0D6'],
    far: [
      { x: 0.2, y: 0.18, r: 0.045, c1: '#FFE1B0', c2: '#C98B4E', kind: 'craters', par: 0.02 },
    ],
  },
];

export const planetIndex = (id) => Math.max(0, PLANETS.findIndex((p) => p.id === id));
