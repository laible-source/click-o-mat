import type { ActorPose, ActorVariant } from '../engine/types';
import {
  ANKLE_Y,
  POSES,
  drawHumanFront,
  drawHumanSide,
  frontRig,
  humanDraw,
  sideRig,
  step,
  type HumanLook,
  type Rig,
} from '../game/art/characters';
import { path, type Pt } from '../game/art/toon';

export const STUDENT: HumanLook = {
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

/** Sitting ('sit' idles and breathes, 'sittalk' moves the mouth). */
export const STUDENT_POSES = {
  ...POSES,
  sit: { frames: 8, frameRate: 4 },
  sittalk: { frames: 4, frameRate: 8 },
};

// The seat of a cafeteria chair (see furniture.ts: 38 cm, and a frame pixel
// is 1.458 cm) with the hip joint half a thigh above it.
const SEAT_PX = 26;
const HIP_Y = ANKLE_Y + 5 - SEAT_PX - 3.75;

/** The standing rig lowered onto a seat: thighs forward and a bit down, the
 *  shins nearly straight down onto the floor, hands resting on the lap. */
function sitRig(variant: ActorVariant, pose: 'idle' | 'talk', f: number): Rig {
  const side = variant === 'side';
  const base = side ? sideRig(pose, f) : frontRig(pose, f);
  const hipY = HIP_Y;
  const dy = hipY - base.hipY;
  const shoulderY = hipY - 26 - base.breath * 0.7;

  let arms = base.arms.map((a) => ({
    shoulder: [a.shoulder[0], a.shoulder[1] + dy] as Pt,
    elbow: [a.elbow[0], a.elbow[1] + dy] as Pt,
    hand: [a.hand[0], a.hand[1] + dy] as Pt,
  }));
  if (pose === 'idle') {
    arms = side
      ? [
          { shoulder: [30, shoulderY] as Pt, elbow: [31, shoulderY + 11] as Pt, hand: [40, hipY - 6] as Pt },
          { shoulder: [33, shoulderY] as Pt, elbow: [34, shoulderY + 11.5] as Pt, hand: [43, hipY - 5] as Pt },
        ]
      : [-1, 1].map((s) => ({
          shoulder: [32 + s * 11, shoulderY] as Pt,
          elbow: [32 + s * 13.5, shoulderY + 12] as Pt,
          hand: [32 + s * 9, hipY - 2] as Pt,
        }));
  }

  const legs = side
    ? [
        { hip: [31, hipY] as Pt, th: 0.8 },
        { hip: [33, hipY] as Pt, th: 0.86 },
      ].map(({ hip, th }) => {
        const knee = step(hip, 15, th);
        return { hip, knee, ankle: step(knee, 15, 0.12), footRot: 0, lift: 0 };
      })
    : [-1, 1].map((s) => ({
        hip: [32 + s * 5, hipY] as Pt,
        knee: [32 + s * 9, hipY + 7] as Pt,
        ankle: [32 + s * 8, ANKLE_Y] as Pt,
        footRot: 0,
        lift: 0,
      }));

  return { ...base, hipY, arms, legs };
}

const standing = humanDraw(STUDENT);

export function studentDraw(variant: ActorVariant, pose: ActorPose | string, f: number): string {
  if (pose !== 'sit' && pose !== 'sittalk') return standing(variant, pose as ActorPose, f);
  const rig = sitRig(variant, pose === 'sit' ? 'idle' : 'talk', f);
  return variant === 'side' ? drawHumanSide(STUDENT, rig) : drawHumanFront(STUDENT, rig, variant === 'back');
}
