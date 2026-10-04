import type { CSSProperties } from 'react';
import type { NavPosition } from '@/lib/domain/types';
import { RIPPLE_MS } from '@/lib/ripple';

/*
 * The floating nav's motion values (spec §5.3), kept beside the component that uses them.
 */

/** A just-picked item's fill snaps in once the ripple has nearly covered it (no flicker). */
export const PICKED_FILL: CSSProperties = {
  transitionDelay: `${Math.round(RIPPLE_MS * 0.63)}ms`,
  transitionDuration: '1ms', // with 0s the browser skips the delay and fills at once
};

/** From the dock's resting place to the viewport's centre (29px = half the 58px button). */
export const WHEEL_DOCK: Record<NavPosition, string> = {
  right:
    'translate(calc(-50vw + var(--spacing-float) + 29px), calc(-50dvh + var(--spacing-float) + 29px))',
  centre: 'translate(0px, calc(-50dvh + var(--spacing-float) + 29px))',
};

/** Closing: each item's trip back behind the button, and the gap between two items. */
const CLOSE_TRAVEL = 0.42;
const CLOSE_STAGGER = 0.11;

/** When the last item (the first in the list) sets off on close. */
export const lastItemDelay = (count: number) => (count - 1) * CLOSE_STAGGER;

/** How long the whole close takes (the menu hides after it). */
export const closeDuration = (count: number) => CLOSE_TRAVEL + lastItemDelay(count);

/**
 * The spiral (spec §5.3): each item rides a rotating arm from the button to its place:
 * rotate(θ + 200° → θ), arm length 0 → r, counter-rotated so the icon stays upright, scaling
 * .35 → 1. It opens on a soft overshoot-free curve with a 62ms stagger. On close the items
 * go back one at a time in reverse order (owner, spec §10): each stays solid until it is
 * behind the button, then is gone. Reduced motion: items fade in place.
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
  const delay = open ? i * 0.062 : (count - 1 - i) * CLOSE_STAGGER;
  const hidden = delay + CLOSE_TRAVEL - 0.08; // behind the button by now
  return {
    transform: open || reducedMotion ? place : tucked,
    opacity: open ? 1 : 0,
    transition: reducedMotion
      ? 'opacity .3s ease'
      : open
        ? `transform .82s var(--ease-spiral-out) ${delay}s, opacity .34s ease ${delay}s`
        : `transform ${CLOSE_TRAVEL}s var(--ease-spiral-in) ${delay}s, opacity .08s linear ${hidden}s`,
  };
}
