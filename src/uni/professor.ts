import { humanDraw, mouthFront, mouthSide, type HumanLook, type Rig } from '../game/art/characters';
import { circle, ellipse, path } from '../game/art/toon';

const INK = '#2c292b';
const HAIR = '#bab9b4';
const SKIN = '#e6bc9e';

function frontHead(r: Rig, back: boolean): string {
  if (back) {
    return [
      ellipse(0, 0, 14, 18, { fill: SKIN, stroke: INK, sw: 2 }),
      path('M-14 5Q-17 -3 -15 -12Q-14 -18 -9 -20L-12 -21Q-5 -24 0 -21Q6 -24 11 -20L9 -21Q17 -17 15 -7L14 8Q12 16 6 18L-6 18Q-13 15 -14 5Z', {
        fill: HAIR, stroke: INK, sw: 2,
      }),
      path('M-12 -11Q-9 -18 -3 -19M-5 -15Q0 -20 6 -19M2 -14Q8 -18 12 -13M-10 2Q-8 9 -5 12M9 -2Q10 5 7 11', {
        stroke: '#e0ded7', sw: 1.3,
      }),
    ].join('');
  }
  return [
    ellipse(0, 0, 14, 18, { fill: SKIN, stroke: INK, sw: 2 }),
    ellipse(-14, 2, 2.8, 4, { fill: SKIN, stroke: INK, sw: 1.5 }),
    ellipse(14, 2, 2.8, 4, { fill: SKIN, stroke: INK, sw: 1.5 }),
    path('M-14 3Q-17 -3 -16 -11Q-15 -18 -9 -20L-12 -21Q-6 -23 -1 -20Q6 -23 10 -19L9 -21Q17 -17 16 -9L14 -4Q12 -7 10 -8Q7 -11 2 -11Q-2 -13 -6 -11Q-10 -9 -12 -3Z', {
      fill: HAIR, stroke: INK, sw: 2,
    }),
    path('M-13 -10Q-11 -17 -5 -19M-9 -11Q-5 -17 1 -18M-2 -13Q4 -18 10 -15M4 -12Q9 -15 13 -11', {
      stroke: '#e0ded7', sw: 1.3,
    }),
    path('M-10 -8Q-6 -12 -2 -12M3 -12Q8 -13 11 -9', { stroke: '#85847f', sw: 1 }),
    path('M-10 -6Q-6 -8 -2 -6M2 -6Q6 -8 10 -6', { stroke: '#817c77', sw: 1.5 }),
    ...(r.blink
      ? [path('M-9 0L-3 0M3 0L9 0', { stroke: INK, sw: 1.4 })]
      : [
          ellipse(-6, 0, 2.7, 2.4, { fill: '#fffaf1' }),
          ellipse(6, 0, 2.7, 2.4, { fill: '#fffaf1' }),
          circle(-5.4, 0.3, 1.1, { fill: INK }),
          circle(6.6, 0.3, 1.1, { fill: INK }),
        ]),
    ellipse(-6, 0, 5, 4.2, { stroke: '#55565a', sw: 1.4 }),
    ellipse(6, 0, 5, 4.2, { stroke: '#55565a', sw: 1.4 }),
    path('M-1 -1Q0 -2 1 -1M-11 -1L-14 -1M11 -1L14 -1', { stroke: '#55565a', sw: 1.3 }),
    path('M0 1L-1.5 7L2 8', { stroke: '#a87664', sw: 1.4 }),
    mouthFront(r.mouth, 12, 3.2),
  ].join('');
}

function sideHead(r: Rig): string {
  return [
    ellipse(-1, 0, 13.5, 18, { fill: SKIN, stroke: INK, sw: 2 }),
    ellipse(-9, 2, 3, 4, { fill: SKIN, stroke: INK, sw: 1.5 }),
    path('M-14 7Q-17 1 -16 -9Q-16 -17 -10 -20L-13 -21Q-6 -23 -1 -20Q5 -23 10 -18L9 -20Q15 -16 14 -10L12 -7Q9 -10 6 -10Q2 -12 -3 -11Q-7 -9 -9 -5L-11 5Z', {
      fill: HAIR, stroke: INK, sw: 2,
    }),
    path('M-14 -10Q-11 -17 -5 -19M-10 -10Q-6 -17 1 -18M-4 -12Q2 -18 8 -16M1 -12Q7 -15 11 -11', {
      stroke: '#e0ded7', sw: 1.3,
    }),
    path('M-8 -7Q-5 -12 0 -12M3 -12Q8 -13 11 -9', { stroke: '#85847f', sw: 1 }),
    path('M4 -6Q8 -8 12 -5', { stroke: '#817c77', sw: 1.5 }),
    ...(r.blink
      ? [path('M5 0L10 0', { stroke: INK, sw: 1.4 })]
      : [ellipse(8, 0, 2.5, 2.5, { fill: '#fffaf1' }), circle(8.7, 0.3, 1.1, { fill: INK })]),
    ellipse(8, 0, 4.7, 4.2, { stroke: '#55565a', sw: 1.4 }),
    path('M3.3 -1L-6 0', { stroke: '#55565a', sw: 1.3 }),
    path('M11 1Q15 2 17 6L14 8L10 7', { fill: SKIN, stroke: INK, sw: 1.5 }),
    mouthSide(r.mouth, 4.5, 12),
  ].join('');
}

const PROFESSOR: HumanLook = {
  skin: SKIN,
  skinShade: '#b78470',
  hair: HAIR,
  hairShade: '#85847f',
  top: '#e5e3d8',
  topShade: '#b6b9b2',
  legs: '#4a4b4d',
  legsShade: '#303136',
  shoes: '#59483e',
  shoeTrim: '#302b29',
  style: 'custom',
  head: { front: frontHead, side: sideHead },
  torso: {
    front: (top, back) => back ? '' : [
      path(`M26 ${top + 1}L32 ${top + 6}L38 ${top + 1}`, { fill: '#faf8ed', stroke: '#8f948e', sw: 1.2 }),
      path(`M31 ${top + 5}L33 ${top + 5}L35 ${top + 19}L32 ${top + 22}L29 ${top + 19}Z`, { fill: '#675457', stroke: '#4a4144', sw: 1 }),
    ].join(''),
    side: (top) =>
      path(`M34 ${top + 3}L37 ${top + 7}L36 ${top + 20}`, { stroke: '#675457', sw: 2 }),
  },
};

export const professorDraw = humanDraw(PROFESSOR);
