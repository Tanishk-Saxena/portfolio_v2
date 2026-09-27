'use client';

import { useEffect, useRef, useState } from 'react';
import { MouseIcon } from '@/components/ui/icons';

const LOOP_MS = 1900; // --animate-cue
// The wheel's dot is gone at 68% of each loop (keyframes `wheel`); the rest is idle.
const DOT_GONE_MS = 0.68 * LOOP_MS;
// Reduced motion has no wheel animation, so the cue leaves after the same span.
const HIDE_AFTER_MS = 2 * LOOP_MS + DOT_GONE_MS;

/**
 * Hero scroll cue (spec §5.3): fades in after the first frame, and out on the first
 * scroll past 40px or after the wheel's three loops, whichever comes first. One passive
 * listener, removed as soon as it has done its job.
 */
export function ScrollCue() {
  const [state, setState] = useState<'waiting' | 'shown' | 'gone'>('waiting');
  const loops = useRef(0);

  useEffect(() => {
    let hideTimer = 0;
    const onScroll = () => {
      if (window.scrollY > 40) {
        setState('gone');
        window.removeEventListener('scroll', onScroll);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    const raf = requestAnimationFrame(() => {
      setState((s) => (s === 'waiting' ? 'shown' : s));
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        hideTimer = window.setTimeout(() => setState('gone'), HIDE_AFTER_MS);
      }
    });
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(hideTimer);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const visible = state === 'shown';
  return (
    <div
      aria-hidden="true"
      // Third loop begun (second iteration event): fade out the moment its dot is gone,
      // not after the loop's idle tail.
      onAnimationIteration={() => {
        loops.current += 1;
        if (loops.current === 2) window.setTimeout(() => setState('gone'), DOT_GONE_MS);
      }}
      className={`pointer-events-none absolute bottom-[clamp(22px,4vh,38px)] left-1/2 flex w-15 -translate-x-1/2 flex-col items-center gap-2.5 text-muted transition-[opacity,translate] duration-600 ease-out-soft ${visible ? 'opacity-100' : 'opacity-0 motion-safe:translate-y-3'}`}
    >
      <MouseIcon />
      <span className="text-cue tracking-cue uppercase">Scroll</span>
    </div>
  );
}
