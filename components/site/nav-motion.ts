import type { CSSProperties } from 'react';

/*
 * The floating nav's motion values (spec §5.3), kept beside the component that uses them.
 */

/** From the dock's resting place to the viewport's centre (29px = half the 58px button). */
export const WHEEL_DOCK =
  'translate(calc(-50vw + var(--spacing-float) + 29px), calc(-50dvh + var(--spacing-float) + 29px))';

/*
 * The timings (spec §5.3). Open and close mirror each other (owner, spec §10): the same
 * paths and span, the last thing to arrive the first to leave. The close settles slowly into
 * the button, so its curl there shows; the opening starts slowly out of it for the same
 * reason (2026-10-18: on `--ease-spiral-out` it left the centre too fast to read as a
 * spiral), then lands softly instead of the abrupt stop an exact time-reversal would make.
 */
const TRAVEL = 0.96;
const OPEN_EASE = 'cubic-bezier(0.55, 0, 0.3, 1)';
const STAGGER = 0.062;
const FADE = 0.34;
const DOCK = 0.72;
const CURTAIN = 0.5;
const CLOSE_TRAVEL = TRAVEL;
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
 * .35 → 1. It opens with a 62ms stagger, each item easing out of the button (so the curl
 * shows) and fading in as it sets off. The close reverses it: the last item out leaves
 * first, each winds back along its arm, quick at first and settling, and fades as it reaches
 * the button. Reduced motion: items fade in place.
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
        ? `transform ${TRAVEL}s ${OPEN_EASE} ${out}s, opacity ${FADE}s ease ${out}s`
        : `transform ${CLOSE_TRAVEL}s ${CLOSE_EASE} ${back}s, opacity ${FADE}s ease ${back + CLOSE_TRAVEL - FADE}s`,
  };
}
