import type { CSSProperties } from 'react';
import type { NavPosition } from '@/lib/domain/types';

/*
 * The floating nav's motion values (spec §5.3), kept beside the component that uses them.
 */

/** From the dock's resting place to the viewport's centre (29px = half the 58px button). */
export const WHEEL_DOCK: Record<NavPosition, string> = {
  right:
    'translate(calc(-50vw + var(--spacing-float) + 29px), calc(-50dvh + var(--spacing-float) + 29px))',
  centre: 'translate(0px, calc(-50dvh + var(--spacing-float) + 29px))',
};

/*
 * The opening's timings (spec §5.3). The close is the opening's motion in reverse (owner,
 * spec §10): the same paths, the last thing to arrive the first to leave. It starts quick and
 * settles slowly like the opening, on a gentler curve and a slightly longer span, so the
 * start isn't abrupt.
 */
const TRAVEL = 0.82;
const STAGGER = 0.062;
const FADE = 0.34;
const DOCK = 0.72;
const CURTAIN = 0.5;
/** The close: a softer start than `--ease-spiral-out`, over a little longer. */
const CLOSE_TRAVEL = 0.96;
const CLOSE_EASE = 'cubic-bezier(0.32, 0.5, 0.3, 1)';

/** How long the close takes (the menu hides after it). */
export const closeDuration = (count: number) => CLOSE_TRAVEL + (count - 1) * STAGGER;

/** The wheel's dock going home: its slide to the centre in reverse, ending with the close. */
export const dockRewind = (count: number): CSSProperties => ({
  transitionDelay: `${closeDuration(count) - DOCK}s`,
  transitionTimingFunction: CLOSE_EASE,
});

/** The curtain, in and out (it lifts over the close's last half second). */
export const curtain = (open: boolean, total: number, reducedMotion: boolean) =>
  open
    ? `opacity ${CURTAIN}s ease, visibility 0s`
    : reducedMotion
      ? `opacity ${total}s ease, visibility 0s linear ${total}s`
      : `opacity ${CURTAIN}s ease ${total - CURTAIN}s, visibility 0s linear ${total}s`;

/**
 * The spiral (spec §5.3): each item rides a rotating arm from the button to its place:
 * rotate(θ + 200° → θ), arm length 0 → r, counter-rotated so the icon stays upright, scaling
 * .35 → 1. It opens on a soft overshoot-free curve with a 62ms stagger, each item fading in
 * as it sets off. The close reverses it: the last item out leaves first, each winds back
 * along its arm, quick at first and settling, and fades as it reaches the button. Reduced
 * motion: items fade in place.
 */
export function spiral(
  th: number,
  i: number,
  count: number,
  open: boolean,
  reducedMotion: boolean,
): CSSProperties {
  const place = `rotate(${th}deg) translateX(var(--r)) rotate(${-th}deg) scale(1)`;
  const tucked = `rotate(${th + 200}deg) translateX(0px) rotate(${-(th + 200)}deg) scale(.35)`;
  const out = i * STAGGER;
  const back = (count - 1 - i) * STAGGER;
  return {
    transform: open || reducedMotion ? place : tucked,
    opacity: open ? 1 : 0,
    transition: reducedMotion
      ? 'opacity .3s ease'
      : open
        ? `transform ${TRAVEL}s var(--ease-spiral-out) ${out}s, opacity ${FADE}s ease ${out}s`
        : `transform ${CLOSE_TRAVEL}s ${CLOSE_EASE} ${back}s, opacity ${FADE}s ease ${back + CLOSE_TRAVEL - FADE}s`,
  };
}
