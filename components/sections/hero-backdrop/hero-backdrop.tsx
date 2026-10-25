'use client';

import { useEffect, useRef, useState } from 'react';
import type { Backdrop } from '@/lib/style-lab';
import { constellation, flow, halftone } from './scenes';
import { ascii, beams, life, truchet } from './scenes-2';
import { Aurora, Contours, Mesh } from './shapes';
import { useCanvasLoop, type Setup } from './use-canvas-loop';

/*
 * [EXPERIMENT] The hero's background (owner, 2026-10-20), picked in the style lab
 * (`data-backdrop` on <html>, lib/style-lab.ts). Full bleed behind the hero's words, faded out
 * before the About band, never interactive, hidden from assistive tech. Drawn ones run on
 * use-canvas-loop.ts; the rest are markup moved by CSS (styles/hero-backdrop.css). Both
 * follow the palette and stand still under reduced motion.
 */

const SCENES: Partial<Record<Backdrop, Setup>> = {
  ascii,
  life,
  beams,
  truchet,
  constellation,
  halftone,
  flow,
};
const SHAPES: Partial<Record<Backdrop, () => React.JSX.Element>> = {
  mesh: Mesh,
  aurora: Aurora,
  contours: Contours,
};

function useBackdrop() {
  const [backdrop, setBackdrop] = useState<Backdrop>('');
  useEffect(() => {
    const root = document.documentElement;
    const read = () => setBackdrop((root.getAttribute('data-backdrop') ?? '') as Backdrop);
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ['data-backdrop'] });
    return () => observer.disconnect();
  }, []);
  return backdrop;
}

function Scene({ setup }: { setup: Setup }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const probe = useRef<HTMLSpanElement>(null);
  useCanvasLoop(canvas, probe, setup);
  return (
    <>
      <span ref={probe} hidden />
      <canvas ref={canvas} className="bd-canvas" />
    </>
  );
}

export function HeroBackdrop() {
  const backdrop = useBackdrop();
  if (!backdrop) return null;
  const setup = SCENES[backdrop];
  const Shape = SHAPES[backdrop];
  return (
    <div aria-hidden="true" className="hero-backdrop" data-variant={backdrop}>
      {setup ? <Scene key={backdrop} setup={setup} /> : Shape ? <Shape /> : null}
    </div>
  );
}
