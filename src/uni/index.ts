import type { GameContent } from '../engine/Engine';
import { Layer, type RoomDef } from '../engine/types';
import { humanDraw, POSES, type HumanLook } from '../game/art/characters';
import { path } from '../game/art/toon';
import { UI_IMAGES, UI_THEME } from '../game/art/ui';
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

const cafeteria: RoomDef = {
  id: 'cafeteria',
  name: 'Cafeteria',
  assets: { images: [{ key: 'uni-cafeteria', url: `${import.meta.env.BASE_URL}img/uni-cafeteria.png` }] },
  layers: [{ id: 'background', depth: Layer.BEHIND, image: 'uni-cafeteria', x: 0, y: -95, w: 960, h: 640 }],
  walkArea: [
    { x: 0, y: 450 },
    { x: 0, y: 395 },
    { x: 185, y: 315 },
    { x: 740, y: 315 },
    { x: 960, y: 385 },
    { x: 960, y: 450 },
  ],
  scaling: { yTop: 315, scaleTop: 0.55, yBottom: 445, scaleBottom: 0.85 },
  hotspots: [],
  entries: { start: { x: 470, y: 375, facing: 'down' } },
};

export const CONTENT: GameContent = {
  id: 'uni',
  rooms: { cafeteria },
  items: {},
  actors: {
    student: { id: 'student', name: 'Student', talkColor: '#f5e1b5', textureSet: 'uni-student', speed: 240 },
  },
  dialogs: {},
  assets: {
    svgActors: [{ key: 'uni-student', width: 64, height: 120, poses: POSES, draw: humanDraw(STUDENT) }],
    svgImages: UI_IMAGES,
  },
  theme: UI_THEME,
  playerId: 'student',
  startRoom: 'cafeteria',
  startEntry: 'start',
};
