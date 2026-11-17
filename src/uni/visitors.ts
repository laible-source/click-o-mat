import type { ActorPose, ActorVariant } from '../engine/types';
import {
  ANKLE_Y,
  POSES as BASE_POSES,
  drawHumanFront,
  drawHumanSide,
  frontRig,
  humanDraw,
  mouthFront,
  mouthSide,
  sideRig,
  type HumanLook,
  type Rig,
} from '../game/art/characters';
import { blob, circle, curve, ellipse, path } from '../game/art/toon';

const HIP_Y = ANKLE_Y + 5 - 26 - 3.75;

export const VISITOR_POSES = {
  ...BASE_POSES,
  sit: { frames: 8, frameRate: 4 },
  sittalk: { frames: 4, frameRate: 8 },
};

const EXHAUSTED_STUDENT: HumanLook = {
  skin: '#e4b79a',
  skinShade: '#b67e68',
  hair: '#3a302d',
  hairShade: '#25201f',
  top: '#68756d',
  topShade: '#45544b',
  legs: '#424754',
  legsShade: '#2c303a',
  shoes: '#d8d1c5',
  shoeTrim: '#62584d',
  style: 'custom',
  head: { front: tiredHeadFront, side: tiredHeadSide },
  torso: {
    front: (top) =>
      path(`M26 ${top + 2}L32 ${top + 9}L38 ${top + 2}M29 ${top + 7}L30 ${top + 16}M35 ${top + 7}L34 ${top + 16}`, {
        stroke: '#c4b8a0',
        sw: 1.7,
      }),
    side: (top) =>
      path(`M29 ${top + 4}Q34 ${top + 10} 31 ${top + 17}`, {
        stroke: '#c4b8a0',
        sw: 1.7,
      }),
  },
};

const RED_HAIRED_TEACHER: HumanLook = {
  skin: '#efc3a7',
  skinShade: '#c68e73',
  hair: '#b7472e',
  hairShade: '#772b25',
  top: '#35465b',
  topShade: '#263344',
  legs: '#3b3541',
  legsShade: '#29252e',
  shoes: '#302b32',
  shoeTrim: '#a96745',
  style: 'custom',
  head: { front: teacherHeadFront, side: teacherHeadSide },
  torso: {
    front: (top) =>
      path(`M25 ${top + 1}L32 ${top + 8}L39 ${top + 1}M25 ${top + 4}L29 ${top + 15}L32 ${top + 10}L35 ${top + 15}L39 ${top + 4}`, {
        fill: '#e8dfd1',
        stroke: '#202435',
        sw: 1.8,
      }),
    side: (top) =>
      path(`M27 ${top + 3}L32 ${top + 9}L30 ${top + 16}`, {
        stroke: '#e8dfd1',
        sw: 2,
      }),
  },
};

function tiredMouthFront(r: Rig): string {
  if (r.mouth !== 'shut') return mouthFront(r.mouth, 12, 3.5);
  return [
    path('M-3.5 12.5L4 12.5', { stroke: '#503632', sw: 1.5 }),
    path('M-1 14.1Q1 13.8 3 14', { stroke: '#bd897a', sw: 0.8 }),
  ].join('');
}

function tiredMouthSide(r: Rig): string {
  if (r.mouth !== 'shut') return mouthSide(r.mouth, 4.3, 11);
  return [
    path('M2.5 12.5L8.2 12.5', { stroke: '#503632', sw: 1.5 }),
    path('M4.2 14.5Q5.7 14.2 6.8 14.4', { stroke: '#bd897a', sw: 0.8 }),
  ].join('');
}

function tiredHeadFront(r: Rig, back: boolean): string {
  if (back) {
    return path(blob([[-15, 2], [-15, -12], [-9, -19], [0, -21], [10, -17], [15, -9], [13, 4], [8, 8], [-9, 7]]), {
      fill: EXHAUSTED_STUDENT.hair,
      stroke: '#211d1c',
      sw: 2,
    });
  }
  const s: string[] = [
    ellipse(0, 0, 14, 18, { fill: EXHAUSTED_STUDENT.skin, stroke: '#211d1c', sw: 2 }),
    path('M-10 -2Q-6 -5 -2 -2M3 -2Q7 -5 11 -1', { stroke: '#211d1c', sw: 1.8 }),
    ellipse(-6, 0, 2.2, 1.2, { fill: '#fff8ec' }),
    ellipse(6, 0, 2.2, 1.2, { fill: '#fff8ec' }),
    circle(-5, 0.5, 0.8, { fill: '#302524' }),
    circle(6.7, 0.5, 0.8, { fill: '#302524' }),
    path('M-9 3Q-6 5 -3 3M4 3Q7 5 10 3', { stroke: '#785d58', sw: 1.2, opacity: 0.8 }),
    path('M-1 1L-2 7L1 8', { stroke: '#a87461', sw: 1.4 }),
    tiredMouthFront(r),
    path(blob([[-15, -3], [-16, -12], [-10, -19], [-4, -17], [0, -22], [5, -17], [11, -19], [16, -10], [14, -3], [9, -7], [5, -5], [1, -9], [-4, -5], [-8, -8]]), {
      fill: EXHAUSTED_STUDENT.hair,
      stroke: '#211d1c',
      sw: 2,
    }),
    path(curve([[-11, -14], [-6, -17], [-2, -15]]), { stroke: '#79645b', sw: 1.4 }),
  ];
  return s.join('');
}

function tiredHeadSide(r: Rig): string {
  return [
    ellipse(-1, 0, 14, 18, { fill: EXHAUSTED_STUDENT.skin, stroke: '#211d1c', sw: 2 }),
    ellipse(-8, 2, 3, 4, { fill: EXHAUSTED_STUDENT.skin, stroke: '#211d1c', sw: 1.5 }),
    path('M5 -3Q9 -5 12 -2', { stroke: '#211d1c', sw: 1.8 }),
    ellipse(8, 0, 2.1, 1.2, { fill: '#fff8ec' }),
    circle(9, 0.5, 0.8, { fill: '#302524' }),
    path('M6 3Q9 4.5 12 3', { stroke: '#785d58', sw: 1.1 }),
    path('M11 1Q15 3 17 6L14 8L10 7', { fill: EXHAUSTED_STUDENT.skin, stroke: '#211d1c', sw: 1.4 }),
    tiredMouthSide(r),
    path(blob([[-15, 4], [-16, -9], [-11, -18], [-5, -20], [3, -18], [10, -12], [13, -7], [9, -6], [4, -9], [0, -6], [-5, -8], [-10, -2], [-12, 8]]), {
      fill: EXHAUSTED_STUDENT.hair,
      stroke: '#211d1c',
      sw: 2,
    }),
    path(curve([[-10, -14], [-5, -17], [0, -16]]), { stroke: '#79645b', sw: 1.4 }),
  ].join('');
}

function teacherMouthFront(r: Rig): string {
  if (r.mouth !== 'shut') return mouthFront(r.mouth, 12, 4);
  return [
    path('M-3.5 11.5Q1 14.8 6 10.4Q3 13.5 -1 12.1Z', { fill: '#773439', stroke: '#55231f', sw: 1.2 }),
    path('M0 14Q3 14.6 5 12.8', { stroke: '#d58a7b', sw: 1 }),
  ].join('');
}

function teacherMouthSide(r: Rig): string {
  if (r.mouth !== 'shut') return mouthSide(r.mouth, 4.5, 11);
  return [
    path('M1.5 11.5Q4.5 14.2 7.5 11.6Q5.4 13.8 2.2 12.2Z', { fill: '#773439', stroke: '#55231f', sw: 1.2 }),
    path('M3.3 13.9Q5.3 14.1 6.7 12.9', { stroke: '#d58a7b', sw: 0.9 }),
  ].join('');
}

function teacherHeadFront(r: Rig, back: boolean): string {
  if (back) {
    return [
      path(blob([[-16, 1], [-16, -12], [-10, -20], [0, -22], [11, -18], [16, -8], [14, 10], [9, 14], [-10, 12]]), {
        fill: RED_HAIRED_TEACHER.hair,
        stroke: '#55231f',
        sw: 2,
      }),
      path(curve([[-11, -13], [-3, -18], [7, -15]]), { stroke: '#e88455', sw: 1.5 }),
    ].join('');
  }
  return [
    path(blob([[-16, 3], [-17, -8], [-12, -18], [-3, -21], [9, -18], [16, -9], [16, 12], [10, 16], [-12, 13]]), {
      fill: RED_HAIRED_TEACHER.hair,
      stroke: '#55231f',
      sw: 2,
    }),
    ellipse(0, 0, 13, 17, { fill: RED_HAIRED_TEACHER.skin, stroke: '#55231f', sw: 2 }),
    path('M-10 -2Q-6 -4 -2 -2M4 -2Q8 -5 11 -2', { stroke: '#3b2927', sw: 1.7 }),
    ellipse(-6, 0, 2, 2.5, { fill: '#fff8ed' }),
    ellipse(6.5, 0, 2, 2.5, { fill: '#fff8ed' }),
    circle(-5, 0.2, 1, { fill: '#39302e' }),
    circle(7, 0.2, 1, { fill: '#39302e' }),
    ellipse(-6, 0, 4.5, 4, { stroke: '#35313b', sw: 1.5 }),
    ellipse(6.5, 0, 4.5, 4, { stroke: '#35313b', sw: 1.5 }),
    path('M-1.5 -0.5Q0.25 -2 2 -0.5M-10.5 -1L-13 -2M11 -1L13 -2', { stroke: '#35313b', sw: 1.4 }),
    path('M0 1L-1 7L2 8', { stroke: '#b47a68', sw: 1.4 }),
    teacherMouthFront(r),
    path(blob([[-16, -5], [-16, -14], [-9, -21], [0, -23], [10, -20], [16, -12], [13, -8], [8, -12], [3, -10], [-2, -14], [-7, -9], [-12, -11]]), {
      fill: RED_HAIRED_TEACHER.hair,
      stroke: '#55231f',
      sw: 2,
    }),
    path(curve([[-12, -15], [-5, -19], [2, -17], [8, -14]]), { stroke: '#e88455', sw: 1.5 }),
    path(blob([[11, -10], [16, -6], [16, 7], [12, 13], [9, 8], [11, 0]]), { fill: RED_HAIRED_TEACHER.hair, stroke: '#55231f', sw: 1.7 }),
  ].join('');
}

function teacherHeadSide(r: Rig): string {
  return [
    path(blob([[-16, 4], [-17, -9], [-11, -19], [-2, -22], [9, -18], [15, -8], [13, 12], [8, 16], [-12, 12]]), {
      fill: RED_HAIRED_TEACHER.hair,
      stroke: '#55231f',
      sw: 2,
    }),
    ellipse(-1, 0, 13, 17, { fill: RED_HAIRED_TEACHER.skin, stroke: '#55231f', sw: 2 }),
    ellipse(-8, 2, 3, 4, { fill: RED_HAIRED_TEACHER.skin, stroke: '#55231f', sw: 1.5 }),
    path('M5 -3Q9 -5 12 -2', { stroke: '#3b2927', sw: 1.8 }),
    ellipse(8, 0, 2, 2.5, { fill: '#fff8ed' }),
    circle(9, 0.2, 1, { fill: '#39302e' }),
    ellipse(8, 0, 4, 4, { stroke: '#35313b', sw: 1.5 }),
    path('M4 -1L-6 0', { stroke: '#35313b', sw: 1.4 }),
    path('M11 1Q15 3 18 5L14 8L10 7', { fill: RED_HAIRED_TEACHER.skin, stroke: '#55231f', sw: 1.5 }),
    teacherMouthSide(r),
    path(blob([[-16, -5], [-16, -14], [-9, -21], [0, -23], [10, -19], [16, -11], [11, -9], [5, -12], [0, -9], [-6, -10], [-12, -5]]), {
      fill: RED_HAIRED_TEACHER.hair,
      stroke: '#55231f',
      sw: 2,
    }),
    path(curve([[-11, -15], [-4, -19], [5, -16]]), { stroke: '#e88455', sw: 1.5 }),
    path(blob([[-14, -4], [-18, 3], [-16, 12], [-10, 15], [-11, 5]]), { fill: RED_HAIRED_TEACHER.hair, stroke: '#55231f', sw: 1.7 }),
  ].join('');
}

function seatedRig(variant: ActorVariant, pose: 'idle' | 'talk', frame: number, tiredPosture: boolean): Rig {
  const side = variant === 'side';
  const base = side ? sideRig(pose, frame) : frontRig(pose, frame);
  const dy = HIP_Y - base.hipY;
  const arms = base.arms.map((arm) => ({
    shoulder: [arm.shoulder[0], arm.shoulder[1] + dy] as [number, number],
    elbow: [arm.elbow[0], arm.elbow[1] + dy] as [number, number],
    hand: [arm.hand[0], arm.hand[1] + dy] as [number, number],
  }));
  if (tiredPosture && pose === 'idle') {
    if (side) {
      arms[0] = { shoulder: [30, HIP_Y - 26], elbow: [25, HIP_Y - 13], hand: [24, HIP_Y - 3] };
      arms[1] = { shoulder: [33, HIP_Y - 26], elbow: [37, HIP_Y - 14], hand: [38, HIP_Y - 4] };
    } else {
      arms[0] = { shoulder: [21, HIP_Y - 26], elbow: [24, HIP_Y - 12], hand: [26, HIP_Y - 3] };
      arms[1] = { shoulder: [43, HIP_Y - 26], elbow: [40, HIP_Y - 12], hand: [38, HIP_Y - 3] };
    }
  } else if (!tiredPosture && pose === 'idle') {
    arms.forEach((arm, i) => {
      const x = side ? (i === 0 ? 31 : 34) : i === 0 ? 21 : 43;
      arm.shoulder = [x, HIP_Y - 26];
      arm.elbow = [x + (side ? 1 : i === 0 ? 3 : -3), HIP_Y - 13];
      arm.hand = [side ? 39 : x + (i === 0 ? 4 : -4), HIP_Y - 3];
    });
  }

  const legs = side
    ? [
        { hip: [31, HIP_Y] as [number, number], th: 0.8 },
        { hip: [33, HIP_Y] as [number, number], th: 0.86 },
      ].map(({ hip, th }) => {
        const knee = { x: hip[0] + Math.sin(th) * 15, y: hip[1] + Math.cos(th) * 15 };
        const ankle = { x: knee.x + Math.sin(0.12) * 15, y: knee.y + Math.cos(0.12) * 15 };
        return { hip, knee: [knee.x, knee.y] as [number, number], ankle: [ankle.x, ankle.y] as [number, number], footRot: 0, lift: 0 };
      })
    : [-1, 1].map((s) => ({
        hip: [32 + s * 5, HIP_Y] as [number, number],
        knee: [32 + s * 9, HIP_Y + 7] as [number, number],
        ankle: [32 + s * 8, ANKLE_Y] as [number, number],
        footRot: 0,
        lift: 0,
      }));

  return {
    ...base,
    hipY: HIP_Y,
    arms,
    legs,
    headDy: tiredPosture ? 1.6 : base.headDy,
    tilt: tiredPosture ? 3 : base.tilt,
  };
}

function drawSeated(look: HumanLook, tiredPosture: boolean) {
  const standing = humanDraw(look);
  return (variant: ActorVariant, pose: ActorPose | string, frame: number): string => {
    if (pose !== 'sit' && pose !== 'sittalk') {
      if (pose === 'idle' || pose === 'walk' || pose === 'talk') return standing(variant, pose, frame);
      return '';
    }
    const rig = seatedRig(variant, pose === 'sit' ? 'idle' : 'talk', frame, tiredPosture);
    return variant === 'side' ? drawHumanSide(look, rig) : drawHumanFront(look, rig, variant === 'back');
  };
}

export const exhaustedStudentDraw = drawSeated(EXHAUSTED_STUDENT, true);
export const teacherDraw = drawSeated(RED_HAIRED_TEACHER, false);
