'use client';

import { useEffect, useState } from 'react';
import type { Quote } from '@/lib/domain/types';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';

const INTERVAL_MS = 7000; // spec §5.3

/**
 * One quote at a time (spec §6 QuoteRotator), exactly as mocked: no visible controls.
 * All quotes share one grid cell, so the box is always as tall as the tallest quote and
 * nothing below it shifts. Auto-advance pauses while hovered or focused and while the tab is
 * hidden; under reduced motion it doesn't auto-advance at all. The change travels (owner,
 * spec §10): the old quote slides off to the left as it fades, then the new one arrives from
 * the right.
 */
export function QuoteRotator({ quotes }: { quotes: Quote[] }) {
  const reducedMotion = useReducedMotion();
  // The quote showing, and the one it replaced (null until the first change).
  const [{ index, previous }, setShown] = useState<{ index: number; previous: number | null }>({
    index: 0,
    previous: null,
  });
  const [held, setHeld] = useState(false); // hover or focus inside
  const rotating = quotes.length > 1 && !reducedMotion && !held;

  useEffect(() => {
    if (!rotating) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      setShown((s) => ({ index: (s.index + 1) % quotes.length, previous: s.index }));
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [rotating, quotes.length]);

  return (
    <div
      className="mx-auto max-w-[44ch] text-center"
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setHeld(false);
      }}
    >
      <div aria-hidden="true" className="h-[.42em] font-serif text-quote-mark text-accent">
        “
      </div>

      <div aria-live="off" className="grid min-h-[clamp(215px,24vw,240px)]">
        {quotes.map((quote, i) => {
          const active = i === index;
          // Keyframes, so each trip starts from its own side whatever came before.
          const motion = active
            ? previous !== null && 'animate-quote-in'
            : i === previous && 'animate-quote-out';
          return (
            <figure
              key={quote.id}
              aria-hidden={!active}
              inert={!active}
              className={`m-0 grid content-center [grid-area:1/1] ${active ? 'opacity-100' : 'opacity-0'} ${motion || ''}`}
            >
              <blockquote className="font-serif text-quote font-light text-pretty">
                {quote.text}
              </blockquote>
              <figcaption className="mt-5.5 text-label tracking-eyebrow text-accent uppercase">
                {quote.author}
              </figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}
