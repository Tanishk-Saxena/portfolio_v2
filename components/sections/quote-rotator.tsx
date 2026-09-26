'use client';

import { useEffect, useState } from 'react';
import type { Quote } from '@/lib/domain/types';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';

const INTERVAL_MS = 7000; // spec §5.3

/**
 * One quote at a time (spec §6 QuoteRotator, Q13). All quotes share one grid cell, so the
 * box is always as tall as the tallest quote: nothing below it shifts, nothing overflows.
 * Auto-advance pauses on hover, on focus, while the tab is hidden, and via an explicit
 * pause control (WCAG 2.2.2). Under reduced motion it starts paused.
 */
export function QuoteRotator({ quotes }: { quotes: Quote[] }) {
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const [held, setHeld] = useState(false); // hover or focus inside
  const paused = userPaused ?? reducedMotion;
  const rotating = quotes.length > 1 && !paused && !held;

  useEffect(() => {
    if (!rotating) return;
    const id = window.setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % quotes.length);
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

      <div aria-live={rotating ? 'off' : 'polite'} className="grid min-h-[clamp(215px,24vw,240px)]">
        {quotes.map((quote, i) => {
          const active = i === index;
          return (
            <figure
              key={quote.id}
              aria-hidden={!active}
              inert={!active}
              className={`m-0 grid content-center [grid-area:1/1] ${active ? 'opacity-100' : 'opacity-0'}`}
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

      {quotes.length > 1 && (
        <div className="mt-2 flex items-center justify-center">
          {quotes.map((quote, i) => (
            <button
              key={quote.id}
              type="button"
              aria-label={`Quote ${i + 1} of ${quotes.length}`}
              aria-current={i === index ? 'true' : undefined}
              onClick={() => setIndex(i)}
              className="group grid size-11 cursor-pointer place-items-center"
            >
              <span
                className={`block h-0.5 w-5.5 rounded-xs ${i === index ? 'scale-x-100 bg-accent' : 'scale-x-[.4545] bg-muted group-hover:bg-accent'}`}
              />
            </button>
          ))}
          <button
            type="button"
            aria-label={paused ? 'Play quotes' : 'Pause quotes'}
            onClick={() => setUserPaused(!paused)}
            className="grid size-11 cursor-pointer place-items-center text-muted hover:text-accent"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d={paused ? 'M8 6.5v11l9-5.5z' : 'M9 6.5h2.2v11H9zM12.8 6.5H15v11h-2.2z'}
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
