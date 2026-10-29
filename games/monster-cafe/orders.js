// Orders for Monster Café: little sums made from the settings.
// Every number in an order and its answer stays from 1 to max_number (answers are never 0,
// so a tray is never served empty on purpose). No pure module state: makeOrders() returns a maker.
//
// An order looks like:
//   { kind, food, answer, missing, eq: [3, '+', 2, '=', null], say: '3 cookies and 2 more, please!',
//     board: { groups: [[cell...], ...], seps: ['+'] }, steps: [{ cells: [[g, i]], badge, say }] }
// eq: numbers, operator strings, a word ('double') and null for the answer box.
// board: the food pictures (also what the helper counts along on). A cell is
//   { t: 'f' food | 'e' eaten | 'g' empty slot | 'm' the "more" part | 'bag' | 'gbag' | 'plate',
//     v: how much it counts for (1, 10 for a box of ten, or the bag size) }.

export const FOODS = ['cookie', 'cupcake', 'doughnut', 'strawberry'];
export const KINDS = ['add', 'take', 'bonds', 'double', 'half', 'times', 'share'];
const PLURAL = { cookie: 'cookies', cupcake: 'cupcakes', doughnut: 'doughnuts', strawberry: 'strawberries' };
export const foodWord = (food, n) => (n === 1 ? food : PLURAL[food]);

const SINGLES_UP_TO = 20; // pictures above this use boxes of ten

const rnd = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
const pick = (a) => a[Math.floor(Math.random() * a.length)];

export function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Picks the answer method for one order. Over 20 is always the number pad (too many to tap).
export function answerMode(setting, answer) {
  if (answer > 20) return 'pad';
  if (setting === 'tap') return 'tap';
  if (setting === 'pad') return 'pad';
  return answer <= 10 ? 'tap' : 'pad';
}

// Turns the resolved settings into what the generators need, dropping kinds that can't be
// made inside max_number (for example times with tables 10 and max_number 12).
export function cleanSettings(s) {
  const max = Math.max(3, Math.min(100, Math.round(Number(s.max_number) || 10)));
  const bondTo = Math.min(max, Math.max(2, Math.round(Number(s.bond_to) || 10)));
  const tables = [...new Set((Array.isArray(s.tables) ? s.tables : [])
    .map((n) => Math.round(Number(n))).filter((t) => t >= 1 && t <= 12 && t * 2 <= max))];
  let kinds = [...new Set((Array.isArray(s.sums) ? s.sums : []).filter((k) => KINDS.includes(k)))];
  if (!tables.length) kinds = kinds.filter((k) => k !== 'times' && k !== 'share');
  if (!kinds.length) kinds = ['add'];
  return { max, bondTo, tables, kinds, missing: !!s.missing_number };
}

// n cells of one type: single items, or boxes of ten plus singles for big numbers.
function qty(n, t, big) {
  const out = [];
  let left = n;
  if (big) while (left >= 10) { out.push({ t, v: 10 }); left -= 10; }
  while (left > 0) { out.push({ t, v: 1 }); left -= 1; }
  return out;
}

// Helper steps that light the chosen cells one by one with a running count.
function countSteps(groups, want) {
  const steps = [];
  let total = 0;
  groups.forEach((g, gi) => g.forEach((cell, ci) => {
    if (!want(cell, gi, ci)) return;
    total += cell.v;
    steps.push({ cells: [[gi, ci]], badge: total, say: String(total) });
  }));
  return steps;
}

const isA = (...types) => (cell) => types.includes(cell.t);

// ---- One generator per kind. Each returns the order without food words (added later). ----

const GEN = {
  add(c) {
    const total = rnd(2, c.max);
    const a = rnd(1, total - 1), b = total - a;
    const big = total > SINGLES_UP_TO;
    const miss = c.missing && Math.random() < 0.4 ? pick(['a', 'b']) : null;
    if (miss === 'a') {
      const groups = [[...qty(a, 'f', big), ...qty(b, 'm', big)]];
      return { kind: 'add', missing: true, answer: a, eq: [null, '+', b, '=', total],
        board: { groups, seps: [] }, steps: countSteps(groups, isA('f')),
        words: (f) => `Some ${f(2)} and ${b} more make ${total}. How many at first?` };
    }
    if (miss === 'b') {
      const groups = [[...qty(a, 'f', big), ...qty(b, 'g', big)]];
      return { kind: 'add', missing: true, answer: b, eq: [a, '+', null, '=', total],
        board: { groups, seps: [] }, steps: countSteps(groups, isA('g')),
        words: (f) => `I've got ${a} ${f(a)}. How many more make ${total}?` };
    }
    const groups = [qty(a, 'f', big), qty(b, 'f', big)];
    return { kind: 'add', answer: total, eq: [a, '+', b, '=', null],
      board: { groups, seps: ['+'] }, steps: countSteps(groups, () => true),
      words: (f) => `${a} ${f(a)} and ${b} more, please!` };
  },

  take(c) {
    const a = rnd(2, c.max);
    const b = rnd(1, a - 1), left = a - b;
    const big = a > SINGLES_UP_TO;
    const groups = [[...qty(left, 'f', big), ...qty(b, 'e', big)]];
    const isAre = left === 1 ? 'is' : 'are';
    const miss = c.missing && Math.random() < 0.4 ? pick(['a', 'b']) : null;
    if (miss === 'a') {
      return { kind: 'take', missing: true, answer: a, eq: [null, '−', b, '=', left],
        board: { groups, seps: [] }, steps: countSteps(groups, () => true),
        words: (f) => `I ate ${b} ${f(b)} and ${left} ${isAre} left. How many did I have?` };
    }
    if (miss === 'b') {
      return { kind: 'take', missing: true, answer: b, eq: [a, '−', null, '=', left],
        board: { groups, seps: [] }, steps: countSteps(groups, isA('e')),
        words: (f) => `I had ${a} ${f(a)}. Now ${left} ${isAre} left. How many did I eat?` };
    }
    return { kind: 'take', answer: left, eq: [a, '−', b, '=', null],
      board: { groups, seps: [] }, steps: countSteps(groups, isA('f')),
      words: (f) => `I had ${a} ${f(a)} and ate ${b}. How many are left?` };
  },

  bonds(c) {
    const to = c.bondTo;
    if (to < 2) return null;
    const have = rnd(1, to - 1), need = to - have;
    const big = to > SINGLES_UP_TO;
    const groups = [[...qty(have, 'f', big), ...qty(need, 'g', big)]];
    return { kind: 'bonds', answer: need, eq: [have, '+', null, '=', to],
      board: { groups, seps: [] }, steps: countSteps(groups, isA('g')),
      words: (f) => `I've got ${have} ${f(have)}. Make it up to ${to}!` };
  },

  double(c) {
    const top = Math.floor(c.max / 2);
    const n = top >= 3 ? rnd(2, top) : rnd(1, top);
    const big = n * 2 > SINGLES_UP_TO;
    const groups = [qty(n, 'f', big), qty(n, 'f', big)];
    return { kind: 'double', answer: n * 2, eq: ['double', n, '=', null],
      board: { groups, seps: ['+'] }, steps: countSteps(groups, () => true),
      words: (f) => `Double ${n} ${f(n)}, please!` };
  },

  half(c) {
    const top = Math.floor(c.max / 2);
    const h = top >= 2 ? rnd(2, top) : 1;
    const n = h * 2;
    const big = n > SINGLES_UP_TO;
    const groups = [qty(h, 'f', big), qty(h, 'f', big)];
    return { kind: 'half', answer: h, eq: ['half of', n, '=', null],
      board: { groups, seps: ['cut'] }, steps: countSteps(groups, (cell, gi) => gi === 0),
      words: (f) => `Half of ${n} ${f(n)}, please!` };
  },

  times(c) {
    const t = pick(c.tables);
    const most = Math.min(12, Math.floor(c.max / t));
    if (most < 1) return null;
    const k = most >= 2 ? rnd(2, most) : 1;
    const total = k * t;
    const bag = (type) => Array.from({ length: k }, () => ({ t: type, v: t }));
    if (c.missing && Math.random() < 0.4) {
      const groups = [bag('gbag')];
      const steps = groups[0].map((_, i) => ({ cells: [[0, i]], badge: i + 1, say: String(i + 1) }));
      return { kind: 'times', missing: true, answer: k, eq: [null, '×', t, '=', total],
        board: { groups, seps: [] }, steps,
        words: () => `How many bags of ${t} make ${total}?` };
    }
    const groups = [bag('bag')];
    return { kind: 'times', answer: total, eq: [k, '×', t, '=', null],
      board: { groups, seps: [] }, steps: countSteps(groups, () => true),
      words: (f) => `${k} ${k === 1 ? 'bag' : 'bags'} of ${t} ${f(t)}, please!` };
  },

  share(c) {
    const t = pick(c.tables);
    const most = Math.min(12, Math.floor(c.max / t));
    if (most < 1) return null;
    const k = rnd(1, most);
    const total = t * k;
    // Share between t friends (k each) or between k friends (t each); never between 1.
    const ways = [[t, k], [k, t]].filter(([friends]) => friends >= 2);
    if (!ways.length) return null;
    const [friends, each] = pick(ways);
    const big = total > SINGLES_UP_TO;
    const groups = [qty(total, 'f', big), Array.from({ length: friends }, () => ({ t: 'plate', v: 0 }))];
    const steps = Array.from({ length: each }, (_, r) => ({
      cells: groups[1].map((_, i) => [1, i]), badge: r + 1, say: String(r + 1), plates: r + 1,
    }));
    return { kind: 'share', answer: each, eq: [total, '÷', friends, '=', null],
      board: { groups, seps: ['→'] }, steps,
      words: (f) => `Share ${total} ${f(total)} between ${friends} friends. How many each?` };
  },
};

// Makes a run of orders: kinds taken from a shuffled bag so they mix well, no order twice in
// a row, not the same answer twice running, and a different food from the order before.
export function makeOrders(settings) {
  const cfg = cleanSettings(settings);
  let bag = [];
  const recent = [];
  let lastAnswer = null, lastFood = null;

  function next() {
    let fallback = null;
    for (let tries = 0; tries < 80; tries++) {
      if (!bag.length) bag = shuffle(cfg.kinds);
      const kind = bag[bag.length - 1];
      const o = GEN[kind](cfg);
      if (!o) { bag.pop(); continue; }
      o.key = o.kind + ':' + o.eq.map((x) => (x === null ? '?' : x)).join(' ');
      fallback = fallback || o;
      if (o.key === recent[recent.length - 1] && tries < 79) continue;
      if (recent.includes(o.key) && tries < 40) continue;
      if (o.answer === lastAnswer && tries < 20) continue;
      bag.pop();
      return finish(o);
    }
    bag.pop();
    return finish(fallback || GEN.add(cfg));
  }

  function finish(o) {
    o.food = pick(FOODS.filter((f) => f !== lastFood));
    o.say = o.words((n) => foodWord(o.food, n));
    delete o.words;
    recent.push(o.key);
    if (recent.length > 5) recent.shift();
    lastAnswer = o.answer;
    lastFood = o.food;
    return o;
  }

  return { next, config: cfg };
}
