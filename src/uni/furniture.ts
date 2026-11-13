import { INK, ellipse, group, inked, line, poly } from '../game/art/toon';

/**
 * Cafeteria furniture: wooden tops, steel tube legs. Everything is drawn in
 * centimetres around the floor point below the front edge of the table
 * (x lateral, y up is negative) and scaled into the room by `k` (px per cm).
 */

const WOOD = { top: '#c68a4e', hi: '#e0aa6c', edge: '#8a5a2e', dark: '#5e3a1c' };
const STEEL = { body: '#a9b3bf', hi: '#eef3f8', shade: '#667180' };

/** Depth of the table top, as it shows on screen (the table is seen from above). */
const TABLE_DEPTH = 18;
const TABLE_W = 120;
const TABLE_H = 75;
/** How far a chair's centre sits from the table's centre. */
const CHAIR_DX = 84;

/** A steel tube: inked sleeve, steel body, a thin highlight. */
function tube(a: [number, number], b: [number, number], w = 3.4): string {
  return line(a, b, INK, w + 2) + line(a, b, STEEL.body, w) + line([a[0] - w * 0.22, a[1]], [b[0] - w * 0.22, b[1]], STEEL.hi, w * 0.28, 0.9);
}

function foot(x: number, y: number): string {
  return ellipse(x, y, 3.2, 1.2, { fill: '#2a2430', stroke: INK, sw: 1 });
}

function table(): string {
  const p = TABLE_DEPTH;
  const h = TABLE_H;
  const s: string[] = [];
  // Legs: the far pair first, the top surface then covers their upper ends.
  for (const x of [-51, 51]) {
    s.push(tube([x, -h - p + 4], [x, -p]), foot(x, -p));
  }
  s.push(tube([-52, -18 - p], [52, -18 - p], 2.6));
  for (const x of [-54, 54]) s.push(tube([x, -18], [x * 0.944, -18 - p], 2.6));
  for (const x of [-54, 54]) s.push(tube([x, -h + 4], [x, 0]), foot(x, 0));
  s.push(tube([-54, -18], [54, -18], 2.6));
  // The top: surface, front edge, plank seams, a glint.
  const half = TABLE_W / 2;
  s.push(inked(poly([[-half, -h], [half, -h], [half - 4, -h - p], [-half + 4, -h - p]]), WOOD.top, 2.4));
  for (const k of [-0.5, 0, 0.5]) {
    s.push(line([half * k, -h - 1], [(half - 4) * k, -h - p + 1], WOOD.edge, 0.9, 0.55));
  }
  s.push(line([-half + 10, -h - p * 0.55], [half * 0.3, -h - p * 0.55], WOOD.hi, 1.6, 0.8));
  s.push(inked(poly([[-half, -h], [half, -h], [half, -h + 5], [-half, -h + 5]]), WOOD.edge, 2.4));
  s.push(line([-half + 3, -h + 1.4], [half - 3, -h + 1.4], WOOD.hi, 1, 0.6));
  return s.join('');
}

/** A side-on chair facing right (dir 1) or left (dir -1), origin at the
 *  centre of its footprint. */
function chair(dir: 1 | -1): string {
  const d = 4.5; // half the seat's visible depth
  const seatH = 46;
  const s: string[] = [];
  const legX = [-17, 17];
  // Far legs, then the near ones in front of them.
  for (const x of legX) s.push(tube([x, -seatH - d + 4], [x, -d], 3), foot(x, -d));
  s.push(tube([-17, -16 - d], [17, -16 - d], 2.2));
  for (const x of legX) s.push(tube([x, -seatH + d + 4], [x, d], 3), foot(x, d));
  s.push(tube([-17, -16 + d], [17, -16 + d], 2.2));
  // Seat.
  s.push(inked(poly([[-21, -seatH + d], [21, -seatH + d], [21, -seatH - d], [-21, -seatH - d]]), WOOD.top, 2.2));
  s.push(line([-14, -seatH - 1], [10, -seatH - 1], WOOD.hi, 1.4, 0.8));
  s.push(inked(poly([[-21, -seatH + d], [21, -seatH + d], [21, -seatH + d + 4], [-21, -seatH + d + 4]]), WOOD.edge, 2.2));
  // Backrest: a leaning slab, its top face showing.
  const b = -seatH + d;
  const top = -88;
  s.push(inked(poly([[-21, b], [-16, b], [-21, top + d], [-26, top + d]]), WOOD.edge, 2.2));
  s.push(inked(poly([[-26, top + d], [-21, top + d], [-21, top - d], [-26, top - d]]), WOOD.top, 2.2));
  return group(s, dir === 1 ? undefined : 'scale(-1 1)');
}

/** A table with a chair on each side. `floor` is the y under the table's
 *  front edge, `k` the px per cm. */
export function cafeSet(cx: number, floor: number, k: number): string {
  const p = TABLE_DEPTH;
  const shadow = ellipse(0, -p / 2, CHAIR_DX + 26, p * 0.8, { fill: '#000000', opacity: 0.28 });
  const chairs = [-CHAIR_DX, CHAIR_DX].map((x, i) => group(chair(i === 0 ? 1 : -1), `translate(${x} ${-p / 2})`));
  const body = shadow + chairs[0] + table() + chairs[1];
  return group(body, `translate(${cx} ${floor}) scale(${k})`);
}

/** Where the table and each chair actually appear on screen (the chairs
 *  stand left and right of the table, backrests outwards), for hotspots. */
export function cafeSetRects(cx: number, floor: number, k: number) {
  const box = (x0: number, x1: number, y0: number, y1: number) => ({
    x: Math.round(cx + x0 * k),
    y: Math.round(floor + y0 * k),
    w: Math.round((x1 - x0) * k),
    h: Math.round((y1 - y0) * k),
  });
  const front = Math.round(floor + 14 * k);
  return {
    table: { rect: box(-TABLE_W / 2, TABLE_W / 2, -TABLE_H - TABLE_DEPTH, 2), walkTo: { x: Math.round(cx), y: front } },
    chairLeft: { rect: box(-CHAIR_DX - 26, -CHAIR_DX + 22, -102, -3), walkTo: { x: Math.round(cx - CHAIR_DX * k), y: front } },
    chairRight: { rect: box(CHAIR_DX - 22, CHAIR_DX + 26, -102, -3), walkTo: { x: Math.round(cx + CHAIR_DX * k), y: front } },
  };
}

/** The bounding box of a set, for its layer and its walk-area hole. */
export function cafeSetBounds(cx: number, floor: number, k: number) {
  const halfW = (CHAIR_DX + 30) * k;
  return {
    x: Math.floor(cx - halfW),
    y: Math.floor(floor - (TABLE_H + TABLE_DEPTH + 12) * k),
    w: Math.ceil(halfW * 2),
    h: Math.ceil((TABLE_H + TABLE_DEPTH + 18) * k),
    /** Floor footprint: depth under the table, widened by a margin. */
    hole: { x0: cx - halfW + 8 * k, x1: cx + halfW - 8 * k, y0: floor - (TABLE_DEPTH + 6) * k, y1: floor + 2 },
  };
}
