import { Layer, type LayerDef } from '../engine/types';
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
const CHAIR_DX = 102;
/** Half the seat's visible depth, and its height: low enough that the
 *  student's cartoon legs reach the floor when sitting. */
const CHAIR_D = 4.5;
const SEAT_H = 38;
/** A seated student's hips sit slightly behind the chair's centre. */
const SIT_BACK = 2;

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
  const d = CHAIR_D;
  const seatH = SEAT_H;
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
  const top = -seatH - 42;
  s.push(inked(poly([[-21, b], [-16, b], [-21, top + d], [-26, top + d]]), WOOD.edge, 2.2));
  s.push(inked(poly([[-26, top + d], [-21, top + d], [-21, top - d], [-26, top - d]]), WOOD.top, 2.2));
  return group(s, dir === 1 ? undefined : 'scale(-1 1)');
}

type Side = 'left' | 'right';
const chairX = (side: Side): number => (side === 'left' ? -CHAIR_DX : CHAIR_DX);

/** A layer for art drawn in cm around (cx, floor), `box` = its extent in cm
 *  relative to that point. */
function part(id: string, depth: number | LayerDef['depth'], cx: number, floor: number, k: number, art: string, box: [number, number, number, number]): LayerDef {
  const x = Math.floor(cx + box[0] * k);
  const y = Math.floor(floor + box[1] * k);
  const w = Math.ceil((box[2] - box[0]) * k) + 1;
  const h = Math.ceil((box[3] - box[1]) * k) + 1;
  return { id, depth, x, y, w, h, svg: group(group(art, `translate(${cx} ${floor}) scale(${k})`), `translate(${-x} ${-y})`) };
}

/**
 * The layers of one set: its floor shadow, the table, and a chair on each
 * side. `floor` is the y under the table's front edge, `k` the px per cm.
 * Chairs are layers of their own, just behind a seated student (whose feet
 * stand at `floor - k`) but in front of the room behind them.
 */
export function cafeSetLayers(id: string, cx: number, floor: number, k: number): LayerDef[] {
  const p = TABLE_DEPTH;
  const shadow = ellipse(0, -p / 2, CHAIR_DX + 26, p * 0.8, { fill: '#000000', opacity: 0.28 });
  const chairArt = (side: Side) => group(chair(side === 'left' ? 1 : -1), `translate(${chairX(side)} ${-CHAIR_D * 2})`);
  const chairBox = (side: Side): [number, number, number, number] => [chairX(side) - 30, -CHAIR_D * 2 - SEAT_H - 50, chairX(side) + 30, -CHAIR_D * 2 + 10];
  return [
    part(`${id}-shadow`, Layer.BEHIND, cx, floor, k, shadow, [-CHAIR_DX - 28, -p / 2 - p, CHAIR_DX + 28, p / 2]),
    part(`${id}-table`, floor, cx, floor, k, table(), [-TABLE_W / 2 - 4, -TABLE_H - TABLE_DEPTH - 4, TABLE_W / 2 + 4, 6]),
    part(`${id}-chair-left`, floor - 6 * k, cx, floor, k, chairArt('left'), chairBox('left')),
    part(`${id}-chair-right`, floor - 6 * k, cx, floor, k, chairArt('right'), chairBox('right')),
  ];
}

/** Where the table and each chair actually appear on screen, for hotspots,
 *  plus where a student stands to use a chair and where they sit. */
export function cafeSetRects(cx: number, floor: number, k: number) {
  const box = (x0: number, x1: number, y0: number, y1: number) => ({
    x: Math.round(cx + x0 * k),
    y: Math.round(floor + y0 * k),
    w: Math.round((x1 - x0) * k),
    h: Math.round((y1 - y0) * k),
  });
  const front = Math.round(floor + 14 * k);
  const chairRect = (side: Side) => {
    const x = chairX(side);
    const top = -CHAIR_D * 2 - SEAT_H - 42 - CHAIR_D;
    return side === 'left' ? box(x - 26, x + 22, top, -3) : box(x - 22, x + 26, top, -3);
  };
  const chairSpot = (side: Side) => {
    const dir = side === 'left' ? 1 : -1; // the way a student on it looks
    return {
      rect: chairRect(side),
      walkTo: { x: Math.round(cx + chairX(side) * k), y: front },
      seat: { x: Math.round(cx + (chairX(side) - dir * SIT_BACK) * k), y: Math.round(floor - k), facing: (dir === 1 ? 'right' : 'left') as 'left' | 'right' },
    };
  };
  return {
    table: { rect: box(-TABLE_W / 2, TABLE_W / 2, -TABLE_H - TABLE_DEPTH, 2), walkTo: { x: Math.round(cx), y: front } },
    chairLeft: chairSpot('left'),
    chairRight: chairSpot('right'),
  };
}

/** The floor footprint a walking student must not enter. */
export function cafeSetHole(cx: number, floor: number, k: number) {
  const halfW = (CHAIR_DX + 24) * k;
  return { x0: cx - halfW, x1: cx + halfW, y0: floor - (TABLE_DEPTH + 6) * k, y1: floor + 2 };
}
