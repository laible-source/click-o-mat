import { Layer, type HotspotDef, type RoomDef, type Vec2 } from '../engine/types';
import { POSES } from '../game/art/characters';
import { professorDraw } from './professor';

// The lecture hall, from the supplied 1024×768 picture. It is shown 960 px
// wide and cropped to the bottom of the picture (ceiling lights and balcony
// are cut off at the top), so the floor and the front rows fill the viewport.
const IMG = { w: 1024, h: 768, key: 'uni-lecture-hall' };
const K = 960 / IMG.w;
const SHIFT_Y = -270;

/** Picture pixel → room coordinate. */
const S = (x: number, y: number): Vec2 => ({ x: Math.round(x * K), y: Math.round(y * K + SHIFT_Y) });

const SCALING = { yTop: 277, scaleTop: 0.5, yBottom: 450, scaleBottom: 0.85 };
const PROFESSOR_POSITION = S(740, 725);
const PROFESSOR_FACING = 'left';
const EXIT_TOP_LEFT = S(620, 300);
const EXIT_BOTTOM_RIGHT = S(670, 360);

const exit: HotspotDef = {
  id: 'exit',
  name: 'Tür',
  rect: {
    x: EXIT_TOP_LEFT.x,
    y: EXIT_TOP_LEFT.y,
    w: EXIT_BOTTOM_RIGHT.x - EXIT_TOP_LEFT.x,
    h: EXIT_BOTTOM_RIGHT.y - EXIT_TOP_LEFT.y,
  },
  defaultVerb: 'use',
  on: {
    lookat: 'Die Tür am hinteren Ende des Hörsaals.',
    use: (ctx) => ctx.goToRoom('cafeteria', 'passage'),
    open: (ctx) => ctx.goToRoom('cafeteria', 'passage'),
  },
};

export const lectureHall: RoomDef = {
  id: 'lecturehall',
  name: 'Hörsaal',
  assets: {
    images: [{ key: IMG.key, url: `${import.meta.env.BASE_URL}img/uni-lecture-hall.png` }],
    svgActors: [{ key: 'uni-professor', width: 64, height: 120, poses: POSES, draw: professorDraw }],
  },
  layers: [{ id: 'background', depth: Layer.BEHIND, image: IMG.key, x: 0, y: SHIFT_Y, w: Math.round(IMG.w * K), h: Math.round(IMG.h * K) }],
  // The floor in front of the first row, round the lectern at the bottom left.
  walkArea: [
    S(170, 562),
    S(235, 578),
    S(430, 612),
    S(700, 664),
    S(880, 700),
    S(975, 728),
    S(1024, 700),
    S(1024, 768),
    S(460, 768),
    S(460, 680),
    S(240, 615),
    S(170, 620),
  ],
  scaling: SCALING,
  actors: [{ id: 'otto-e', ...PROFESSOR_POSITION, facing: PROFESSOR_FACING }],
  hotspots: [
    exit,
    {
      id: 'otto-e',
      name: 'Otto E.',
      actor: 'otto-e',
      walkTo: S(670, 750),
      facing: 'right',
      defaultVerb: 'talkto',
      on: {
        lookat: 'Das ist Professor Otto E.',
        talkto: (ctx) => ctx.say('otto-e', 'Guten Tag! Schön, dass Sie da sind.'),
      },
    },
  ],
  entries: { passage: { ...S(205, 610), facing: 'right' } },
  onWalkStart: async (ctx) => { ctx.face('otto-e', PROFESSOR_FACING); },
};
