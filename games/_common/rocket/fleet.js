// The rocket games' ships: the one table of names, tiers, prices and touchdown sounds, and the
// rules for buying and picking a ship. Version 1.0 (step 2a-4b, D-053). Pure: no page, storage,
// clock or randomness, so test_rocket_fleet_core.py can run it in Node.
//
// Prices are D-046's starting values, to tune after the trial week (Q-025). The touchdown sounds
// are the ones played on the accepted mock-up page (D-049), made in code in sound.js. `flies`
// is false for the three ships drawn in the showroom but not yet brought into play: they show
// locked, with their prices, and can't be bought until step 2a-4c (D-051).
//
// A tile's progress (D-042, D-053) holds `ship`, the ship flown, and `ships`, the ships owned.
// Each tile has its own (D-046). Everything here takes a progress object and, where it changes
// anything, returns a new one, leaving the one handed in as it was.

export const FLEET = [
  { id: 'classic', name: 'Classic', tier: 'starter', price: 0, sound: 'thud', flies: true },
  { id: 'box', name: 'Cardboard Box', tier: 'fun', price: 20, sound: 'boing', flies: true },
  { id: 'teapot', name: 'Teapot', tier: 'fun', price: 30, sound: 'toot', flies: true },
  { id: 'pod', name: 'Bubble Pod', tier: 'cool', price: 50, sound: 'clunkLock', flies: true },
  { id: 'saucer', name: 'Saucer', tier: 'cool', price: 70, sound: 'hum', flies: true },
  { id: 'crystal', name: 'Crystal Comet', tier: 'premium', price: 100, sound: 'chime', flies: false },
  { id: 'phoenix', name: 'Golden Phoenix', tier: 'premium', price: 140, sound: 'harp', flies: false },
  { id: 'aurora', name: 'Aurora Cruiser', tier: 'legendary', price: 200, sound: 'aurora', flies: false },
];
export const FLEET_BY_ID = Object.fromEntries(FLEET.map((s) => [s.id, s]));
export const STARTER = 'classic';

const rocksOf = (p) => Math.max(0, Math.round(Number(p && p.rocks) || 0));

// What a progress object owns and flies, whatever it holds: Classic always; only known ships
// that fly, once each, in the table's order; and the ship flown only if it's owned.
export function hangarOf(p) {
  const listed = p && Array.isArray(p.ships) ? p.ships : [];
  const ships = FLEET.filter((s) => s.flies && (s.id === STARTER || listed.includes(s.id))).map((s) => s.id);
  const ship = p && ships.includes(p.ship) ? p.ship : STARTER;
  return { ship, ships };
}

// What the showroom's big button offers for a ship:
//   'flying'  owned and flown now;      'fly'  owned: fly this one;
//   'buy'     enough rocks to buy it;   'need' not enough rocks yet;
//   'soon'    not on sale yet (D-051);  'unknown' no such ship.
export function verdict(p, id) {
  const s = FLEET_BY_ID[id];
  if (!s) return 'unknown';
  if (!s.flies) return 'soon';
  const h = hangarOf(p);
  if (h.ships.includes(id)) return h.ship === id ? 'flying' : 'fly';
  return rocksOf(p) >= s.price ? 'buy' : 'need';
}

// Moon rocks still needed to buy a ship: 0 when there are enough, or it isn't on sale.
export function shortOf(p, id) {
  const s = FLEET_BY_ID[id];
  if (!s || !s.flies) return 0;
  return Math.max(0, s.price - rocksOf(p));
}

// Buying: the price comes off the rocks and the ship is owned. The ship flown doesn't change
// here (Bip runs over to it first, then pick()). null if it can't be bought.
export function buy(p, id) {
  if (verdict(p, id) !== 'buy') return null;
  const h = hangarOf(p);
  return { ...p, rocks: rocksOf(p) - FLEET_BY_ID[id].price, ship: h.ship, ships: hangarOf({ ships: [...h.ships, id] }).ships };
}

// Picking an owned ship to fly. null if it isn't owned or doesn't fly yet.
export function pick(p, id) {
  const h = hangarOf(p);
  if (!h.ships.includes(id)) return null;
  return { ...p, ship: id, ships: h.ships };
}
