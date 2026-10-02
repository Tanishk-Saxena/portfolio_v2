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

/** How long the last item takes to unwind on close (the menu hides after it). */
export const closeDuration = (count: number) => 1.02 + (count - 1) * 0.07;

/**
 * The spiral (spec §5.3): each item rides a rotating arm from the button to its place:
 * rotate(θ + 200° → θ), arm length 0 → r, counter-rotated so the icon stays upright, scaling
 * .35 → 1. It opens on a soft overshoot-free curve with a 62ms stagger, and unwinds in reverse
 * order on close. Reduced motion: items fade in place.
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
  const delay = open ? i * 0.062 : (count - 1 - i) * 0.07;
  return {
    transform: open || reducedMotion ? place : tucked,
    opacity: open ? 1 : 0,
    transition: reducedMotion
      ? 'opacity .3s ease'
      : open
        ? `transform .82s var(--ease-spiral-out) ${delay}s, opacity .34s ease ${delay}s`
        : `transform 1.02s var(--ease-spiral-in) ${delay}s, opacity .5s ease ${delay}s`,
  };
}
