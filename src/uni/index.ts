import type { GameContent } from '../engine/Engine';
import type { ScriptContext } from '../engine/ScriptContext';
import { Layer, type HotspotDef, type RoomDef } from '../engine/types';
import { UI_IMAGES, UI_THEME } from '../game/art/ui';
import { cafeSetHole, cafeSetLayers, cafeSetRects } from './furniture';
import { lectureHall } from './lecturehall';
import { DE_STRINGS } from './strings';
import { STUDENT_POSES, studentDraw } from './student';
import { exhaustedStudentDraw, teacherDraw, VISITOR_POSES } from './visitors';
import '@fontsource/fredoka/500.css';
import '@fontsource/fredoka/700.css';

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
  return { ...t, k, rects: cafeSetRects(t.cx, t.floor, k), hole: cafeSetHole(t.cx, t.floor, k) };
});

const VISITORS = [
  { id: 'tired-student', ...TABLE_SPOTS[0].rects.chairLeft.seat },
  { id: 'student-teacher', ...TABLE_SPOTS[1].rects.chairRight.seat },
];

/** Where each chair stands and where a student sits on it. */
const CHAIRS: Record<string, { stand: { x: number; y: number }; seat: { x: number; y: number; facing: 'left' | 'right' } }> = {};
TABLE_SPOTS.forEach(({ rects }, i) => {
  CHAIRS[`chair${i + 1}a`] = { stand: rects.chairLeft.walkTo, seat: rects.chairLeft.seat };
  CHAIRS[`chair${i + 1}b`] = { stand: rects.chairRight.walkTo, seat: rects.chairRight.seat };
});

const SEAT_FLAG = 'seat';

/** Walk up to a chair (the verb already did) and sit on it. */
async function sitDown(ctx: ScriptContext, chairId: string): Promise<void> {
  const { seat } = CHAIRS[chairId];
  const p = ctx.player;
  p.setFacing(seat.facing);
  await ctx.tween(p.sprite, { x: seat.x, y: seat.y }, 280);
  ctx.setFlag(SEAT_FLAG, chairId);
  await ctx.repaint();
}

/** Step forward off the chair, back onto the floor. */
async function standUp(ctx: ScriptContext): Promise<void> {
  const chairId = ctx.flag<string>(SEAT_FLAG);
  if (!chairId) return;
  const { stand } = CHAIRS[chairId];
  await ctx.tween(ctx.player.sprite, { x: stand.x, y: stand.y }, 220);
  ctx.setFlag(SEAT_FLAG, false);
  ctx.player.setFacing('down');
  await ctx.repaint();
}

const cafeteria: RoomDef = {
  id: 'cafeteria',
  name: 'Cafeteria',
  assets: { images: [{ key: 'uni-cafeteria', url: `${import.meta.env.BASE_URL}img/uni-cafeteria.png` }] },
  layers: [
    { id: 'background', depth: Layer.BEHIND, image: 'uni-cafeteria', x: 0, y: -95, w: 960, h: 640 },
    ...TABLE_SPOTS.flatMap(({ cx, floor, k }, i) => cafeSetLayers(`set${i + 1}`, cx, floor, k)),
  ],
  walkArea: [
    { x: 0, y: 450 },
    { x: 0, y: 395 },
    { x: 185, y: 315 },
    { x: 740, y: 315 },
    { x: 960, y: 385 },
    { x: 960, y: 450 },
  ],
  holes: TABLE_SPOTS.map(({ hole }) => [
    { x: hole.x0, y: hole.y0 },
    { x: hole.x1, y: hole.y0 },
    { x: hole.x1, y: hole.y1 },
    { x: hole.x0, y: hole.y1 },
  ]),
  scaling: SCALING,
  actors: VISITORS,
  hotspots: [
    {
      id: 'passage',
      name: 'Durchgang',
      rect: { x: 225, y: 100, w: 130, h: 200 },
      walkTo: { x: 355, y: 322 },
      facing: 'up',
      defaultVerb: 'use',
      on: {
        lookat: 'Ein Durchgang neben den Automaten. Dahinter brennt Licht. Und irgendwo wird gehustet.',
        open: (ctx) => ctx.goToRoom('lecturehall', 'passage'),
        use: (ctx) => ctx.goToRoom('lecturehall', 'passage'),
      },
    },
    ...TABLE_SPOTS.flatMap(({ rects: r }, i) => {
    const n = i + 1;
    const chair = (id: string, side: 'chairLeft' | 'chairRight'): HotspotDef => ({
      id,
      name: 'Stuhl',
      rect: r[side].rect,
      walkTo: r[side].walkTo,
      facing: 'down',
      defaultVerb: 'use',
      on: {
        lookat: 'Ein Holzstuhl mit Stahlgestell. Sieht unbequem aus. Ist es wahrscheinlich auch.',
        push: 'Ich sollte die Möbel stehen lassen, wo sie sind.',
        use: id === 'chair1a' || id === 'chair2b'
          ? 'Der Stuhl ist schon besetzt.'
          : (ctx) => sitDown(ctx, id),
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
          use: 'Ich habe nichts zu essen dabei. Und zum Lernen ist es mir zu früh.',
        },
      } satisfies HotspotDef,
      chair(`chair${n}a`, 'chairLeft'),
      chair(`chair${n}b`, 'chairRight'),
    ];
    }),
    {
      id: 'tired-student',
      name: 'Student',
      actor: 'tired-student',
      walkTo: TABLE_SPOTS[0].rects.chairLeft.walkTo,
      facing: 'up',
      defaultVerb: 'lookat',
      on: {
        lookat: 'Er sieht übermüdet und ziemlich gestresst aus.',
      },
    },
    {
      id: 'student-teacher',
      name: 'Tutorin',
      actor: 'student-teacher',
      walkTo: TABLE_SPOTS[1].rects.chairRight.walkTo,
      facing: 'up',
      defaultVerb: 'lookat',
      on: {
        lookat: 'Eine rothaarige Tutorin. Sie wirkt ziemlich von sich überzeugt.',
      },
    },
  ],
  entries: {
    start: { x: 470, y: 375, facing: 'down' },
    // Back from the lecture hall, out of the passage.
    passage: { x: 355, y: 330, facing: 'down' },
  },
  onWalkStart: async (ctx) => {
    for (const visitor of VISITORS) ctx.face(visitor.id, visitor.facing);
    await standUp(ctx);
  },
};

export const CONTENT: GameContent = {
  id: 'uni',
  rooms: { cafeteria, lecturehall: lectureHall },
  items: {},
  actors: {
    student: {
      id: 'student',
      name: 'Student',
      talkColor: '#f5e1b5',
      textureSet: 'uni-student',
      baseScale: 1.8,
      speed: 240,
      stance: (state) => (state.getFlag(SEAT_FLAG) ? 'sit' : undefined),
      talkStance: (state) => (state.getFlag(SEAT_FLAG) ? 'sittalk' : undefined),
    },
    'tired-student': {
      id: 'tired-student',
      name: 'Student',
      talkColor: '#f1d8c5',
      textureSet: 'uni-tired-student',
      baseScale: 1.8,
      stance: () => 'sit',
      talkStance: () => 'sittalk',
    },
    'student-teacher': {
      id: 'student-teacher',
      name: 'Tutorin',
      talkColor: '#f3d9bd',
      textureSet: 'uni-student-teacher',
      baseScale: 1.8,
      stance: () => 'sit',
      talkStance: () => 'sittalk',
    },
  },
  dialogs: {},
  assets: {
    svgActors: [
      { key: 'uni-student', width: 64, height: 120, poses: STUDENT_POSES, draw: studentDraw },
      { key: 'uni-tired-student', width: 64, height: 120, poses: VISITOR_POSES, draw: exhaustedStudentDraw },
      { key: 'uni-student-teacher', width: 64, height: 120, poses: VISITOR_POSES, draw: teacherDraw },
    ],
    svgImages: UI_IMAGES,
  },
  theme: UI_THEME,
  strings: DE_STRINGS,
  playerId: 'student',
  startRoom: 'cafeteria',
  startEntry: 'start',
};
