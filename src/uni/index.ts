import type { GameContent } from '../engine/Engine';
import { Layer, type HotspotDef, type LayerDef, type RoomDef } from '../engine/types';
import { humanDraw, POSES, type HumanLook } from '../game/art/characters';
import { group, path } from '../game/art/toon';
import { UI_IMAGES, UI_THEME } from '../game/art/ui';
import { cafeSet, cafeSetBounds, cafeSetRects } from './furniture';
import { DE_STRINGS } from './strings';
import '@fontsource/fredoka/500.css';
import '@fontsource/fredoka/700.css';

const STUDENT: HumanLook = {
  skin: '#e8b993',
  skinShade: '#c48968',
  hair: '#503529',
  hairShade: '#30201c',
  top: '#607f9b',
  topShade: '#405d76',
  legs: '#3e4959',
  legsShade: '#293442',
  shoes: '#e5e0d4',
  shoeTrim: '#775a48',
  style: 'norb',
  torso: {
    front: (top, back) => back
      ? path(`M23 ${top + 2}L25 ${top + 24}H39L41 ${top + 2}Z`, { fill: '#69584a', stroke: '#30201c', sw: 2 })
      : path(`M23 ${top + 1}L27 ${top + 23}M41 ${top + 1}L37 ${top + 23}`, { stroke: '#69584a', sw: 3 }),
    side: (top) => path(`M27 ${top + 1}L30 ${top + 23}`, { stroke: '#69584a', sw: 3 }),
  },
};

const SCALING = { yTop: 315, scaleTop: 0.55, yBottom: 445, scaleBottom: 0.85 };
const scaleAt = (y: number) => SCALING.scaleTop + ((SCALING.scaleBottom - SCALING.scaleTop) * (y - SCALING.yTop)) / (SCALING.yBottom - SCALING.yTop);

// Furniture is sized against the student (about 1.75 m tall on screen).
const STUDENT_PX = 120 * 1.8;
const pxPerCm = (y: number) => (STUDENT_PX * scaleAt(y)) / 175;

const TABLE_SPOTS = [
  { cx: 240, floor: 385 },
  { cx: 700, floor: 425 },
].map((t) => {
  const k = pxPerCm(t.floor);
  return { ...t, k, b: cafeSetBounds(t.cx, t.floor, k) };
});

const cafeteria: RoomDef = {
  id: 'cafeteria',
  name: 'Cafeteria',
  assets: { images: [{ key: 'uni-cafeteria', url: `${import.meta.env.BASE_URL}img/uni-cafeteria.png` }] },
  layers: [
    { id: 'background', depth: Layer.BEHIND, image: 'uni-cafeteria', x: 0, y: -95, w: 960, h: 640 },
    ...TABLE_SPOTS.map(({ cx, floor, k, b }, i): LayerDef => ({
      id: `table${i + 1}`,
      depth: floor,
      x: b.x,
      y: b.y,
      w: b.w,
      h: b.h,
      svg: group(cafeSet(cx, floor, k), `translate(${-b.x} ${-b.y})`),
    })),
  ],
  walkArea: [
    { x: 0, y: 450 },
    { x: 0, y: 395 },
    { x: 185, y: 315 },
    { x: 740, y: 315 },
    { x: 960, y: 385 },
    { x: 960, y: 450 },
  ],
  holes: TABLE_SPOTS.map(({ b: { hole } }) => [
    { x: hole.x0, y: hole.y0 },
    { x: hole.x1, y: hole.y0 },
    { x: hole.x1, y: hole.y1 },
    { x: hole.x0, y: hole.y1 },
  ]),
  scaling: SCALING,
  hotspots: TABLE_SPOTS.flatMap(({ cx, floor, k }, i) => {
    const r = cafeSetRects(cx, floor, k);
    const n = i + 1;
    const chair = (id: string, side: 'chairLeft' | 'chairRight', facing: 'left' | 'right'): HotspotDef => ({
      id,
      name: 'Stuhl',
      rect: r[side].rect,
      walkTo: r[side].walkTo,
      facing,
      on: {
        lookat: 'Ein Holzstuhl mit Stahlgestell. Sieht unbequem aus. Ist es wahrscheinlich auch.',
        push: 'Ich sollte die Möbel stehen lassen, wo sie sind.',
      },
    });
    return [
      {
        id: `table${n}`,
        name: 'Tisch',
        rect: r.table.rect,
        walkTo: r.table.walkTo,
        facing: 'up',
        on: {
          lookat: 'Ein Holztisch mit Stahlbeinen. Zwei Stühle, einer auf jeder Seite. Gut zum Lernen. Oder Essen.',
          push: 'Der Tisch ist stabil. Er bleibt, wo er ist.',
        },
      } satisfies HotspotDef,
      chair(`chair${n}a`, 'chairLeft', 'right'),
      chair(`chair${n}b`, 'chairRight', 'left'),
    ];
  }),
  entries: { start: { x: 470, y: 375, facing: 'down' } },
};

export const CONTENT: GameContent = {
  id: 'uni',
  rooms: { cafeteria },
  items: {},
  actors: {
    student: { id: 'student', name: 'Student', talkColor: '#f5e1b5', textureSet: 'uni-student', baseScale: 1.8, speed: 240 },
  },
  dialogs: {},
  assets: {
    svgActors: [{ key: 'uni-student', width: 64, height: 120, poses: POSES, draw: humanDraw(STUDENT) }],
    svgImages: UI_IMAGES,
  },
  theme: UI_THEME,
  strings: DE_STRINGS,
  playerId: 'student',
  startRoom: 'cafeteria',
  startEntry: 'start',
};
