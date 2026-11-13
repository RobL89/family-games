// The rocket games' ships: the one table of names, tiers, prices and touchdown sounds, and the
// rules for buying and picking a ship. Version 1.3. Pure: no page, storage, clock or randomness, so
// test_rocket_fleet_core.py can run it in Node.
//
// Changes at v1.3 (D-109, Rob, 11 Nov 2026): every price halved and rounded to 5 (10 to 100 rocks,
// 425 for all twelve), so about half the ships can be bought in one school year.
// Changes at v1.2 (step 2d-2, D-077, D-079): five new ships in the Fun and Cool tiers (Splash Tub 25,
// Jack-in-the-Box 35, Sunflower Copter 40, Spin Cycle 60, Christmas Tree 80; 850 rocks for all twelve
// to buy), each with its own landing sound; the table is cheapest first within each tier (D-079).
// Changes at v1.1 (step 2a-4c, D-047, D-051): Crystal Comet, Golden Phoenix and Aurora Cruiser fly,
// so all eight ships are on sale. Version 1.0 was step 2a-4b's (D-053).
//
// Prices are D-109's (D-046's and D-077's halved), still to tune after the trial week (Q-025). The touchdown sounds
// are the ones played on the accepted mock-up pages (D-049, D-078), made in code in sound.js. `flies`
// is false for a ship drawn in the showroom but not yet brought into play: it shows locked, with
// its price, and can't be bought (D-051). Since step 2a-4c every ship flies.
//
// A tile's progress (D-042, D-053) holds `ship`, the ship flown, and `ships`, the ships owned.
// Each tile has its own (D-046). Everything here takes a progress object and, where it changes
// anything, returns a new one, leaving the one handed in as it was.

export const FLEET = [
  { id: 'classic', name: 'Classic', tier: 'starter', price: 0, sound: 'thud', flies: true },
  { id: 'box', name: 'Cardboard Box', tier: 'fun', price: 10, sound: 'boing', flies: true },
  { id: 'tub', name: 'Splash Tub', tier: 'fun', price: 10, sound: 'splosh', flies: true },
  { id: 'teapot', name: 'Teapot', tier: 'fun', price: 15, sound: 'toot', flies: true },
  { id: 'jack', name: 'Jack-in-the-Box', tier: 'fun', price: 20, sound: 'jackPop', flies: true },
  { id: 'sunflower', name: 'Sunflower Copter', tier: 'fun', price: 20, sound: 'bzzz', flies: true },
  { id: 'pod', name: 'Bubble Pod', tier: 'cool', price: 25, sound: 'clunkLock', flies: true },
  { id: 'spin', name: 'Spin Cycle', tier: 'cool', price: 30, sound: 'spinClunk', flies: true },
  { id: 'saucer', name: 'Saucer', tier: 'cool', price: 35, sound: 'hum', flies: true },
  { id: 'tree', name: 'Christmas Tree', tier: 'cool', price: 40, sound: 'tada', flies: true },
  { id: 'crystal', name: 'Crystal Comet', tier: 'premium', price: 50, sound: 'chime', flies: true },
  { id: 'phoenix', name: 'Golden Phoenix', tier: 'premium', price: 70, sound: 'harp', flies: true },
  { id: 'aurora', name: 'Aurora Cruiser', tier: 'legendary', price: 100, sound: 'aurora', flies: true },
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
