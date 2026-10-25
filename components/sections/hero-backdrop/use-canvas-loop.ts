'use client';

import { useEffect, type RefObject } from 'react';

/*
 * [EXPERIMENT] The drawn hero backgrounds' shared loop (hero-backdrop.tsx). Cheap by design:
 * at most 30 frames a second and 1.5× pixel density; paused off screen, in a hidden tab and
 * while the signature intro plays; one still frame under reduced motion. Colours come from the
 * palette's tokens and are read again when the theme or palette changes.
 */

export type Colors = { accent: string; word: string; glow: string; ink: string };
export type Pointer = { x: number; y: number; active: boolean };
export type Scene = { frame: (t: number, pointer: Pointer) => void };
export type Setup = (ctx: CanvasRenderingContext2D, w: number, h: number, c: Colors) => Scene;

const FRAME_MS = 1000 / 30;
const MAX_DPR = 1.5;

/** A token resolved to a colour the canvas understands (color-mix included). */
function resolve(probe: HTMLElement, name: string) {
  probe.style.color = `var(${name})`;
  return getComputedStyle(probe).color;
}

export function readColors(probe: HTMLElement): Colors {
  return {
    accent: resolve(probe, '--accent'),
    word: resolve(probe, '--word'),
    glow: resolve(probe, '--glow-base'),
    ink: resolve(probe, '--ink'),
  };
}

/** Calls `onChange` when the theme or palette on <html> changes. */
export function watchRoot(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme', 'data-palette', 'data-accent'],
  });
  return () => observer.disconnect();
}

export function useCanvasLoop(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  probeRef: RefObject<HTMLElement | null>,
  setup: Setup,
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const probe = probeRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !probe || !ctx) return;

    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pointer: Pointer = { x: 0, y: 0, active: false };
    let scene: Scene | null = null;
    let visible = true;
    let raf = 0;
    let last = 0;

    const build = () => {
      const dpr = Math.min(devicePixelRatio || 1, MAX_DPR);
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scene = setup(ctx, width, height, readColors(probe));
      if (still) scene.frame(0, pointer);
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < FRAME_MS) return;
      last = now;
      const paused =
        !visible || document.hidden || document.documentElement.hasAttribute('data-intro');
      if (!paused) scene?.frame(now / 1000, pointer);
    };

    const onPointer = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.active = pointer.y >= 0 && pointer.y <= r.height;
    };
    const fine = matchMedia('(pointer: fine)').matches;
    if (fine && !still) addEventListener('pointermove', onPointer, { passive: true });

    const resize = new ResizeObserver(build);
    resize.observe(canvas);
    const seen = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    seen.observe(canvas);
    const unwatch = watchRoot(build);

    build();
    if (!still) raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener('pointermove', onPointer);
      resize.disconnect();
      seen.disconnect();
      unwatch();
    };
  }, [canvasRef, probeRef, setup]);
}
