'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { ProjectMedia as Media } from '@/lib/domain/types';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { ArrowLeftIcon } from '@/components/ui/icons';

const ROTATE_MS = 5000; // an image's turn when Settings has rotation on (spec §10)

const ARROW =
  'absolute top-1/2 z-1 hidden size-9.5 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-border-close bg-paper text-ink opacity-0 transition-opacity duration-200 group-focus-within/media:opacity-100 group-hover/media:opacity-100 hover:border-accent disabled:invisible @wide/page:grid';

/**
 * A project's modal media (owner, spec §10): images, GIFs and videos side by side in a native
 * scroll-snap strip, so a swipe moves between them on a phone with no script; on wide
 * screens ‹ › appear on hover or focus. Dots under the strip say there is more than one.
 * Videos play muted. Nothing moves by itself unless Settings turns rotation on: then an
 * image stays 5s and a video until it ends, pausing while hovered or focused. Under reduced
 * motion nothing rotates or autoplays; videos show their controls.
 */
export function ProjectMedia({ items, autoRotate }: { items: Media[]; autoRotate: boolean }) {
  const strip = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false);
  const reducedMotion = useReducedMotion();
  const many = items.length > 1;
  const rotating = autoRotate && many && !reducedMotion && !held;

  function go(to: number) {
    const el = strip.current;
    if (!el) return;
    const next = (to + items.length) % items.length;
    el.scrollTo({ left: next * el.clientWidth, behavior: reducedMotion ? 'auto' : 'smooth' });
  }

  // Only the slide in view plays; the others rest at their first frame.
  useEffect(() => {
    strip.current?.querySelectorAll('video').forEach((video, i) => {
      const slide = Number(video.dataset.slide ?? i);
      if (slide === index && !reducedMotion) void video.play().catch(() => {});
      else {
        video.pause();
        if (slide !== index) video.currentTime = 0;
      }
    });
  }, [index, reducedMotion]);

  // Rotation (Settings): an image moves on after its turn; a video when it ends (onEnded).
  const current = items[index];
  useEffect(() => {
    if (!rotating || current?.kind !== 'image') return;
    const timer = window.setTimeout(() => go(index + 1), ROTATE_MS);
    return () => window.clearTimeout(timer);
    // `go` reads refs and props only; the timer restarts with the slide.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rotating, index, current?.kind]);

  return (
    <div
      className="group/media absolute inset-0"
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setHeld(false);
      }}
    >
      <div
        ref={strip}
        role={many ? 'group' : undefined}
        aria-roledescription={many ? 'carousel' : undefined}
        aria-label={many ? 'Project media' : undefined}
        // A scrolling region must be reachable by keyboard: focusable, and ← → move it.
        tabIndex={many ? 0 : undefined}
        onKeyDown={(e) => {
          if (!many || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
          e.preventDefault();
          go(index + (e.key === 'ArrowRight' ? 1 : -1));
        }}
        onScroll={(e) => {
          const el = e.currentTarget;
          const at = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
          if (at !== index) setIndex(at);
        }}
        className="flex size-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
      >
        {items.map((item, i) => (
          <div
            key={`${item.src}:${i}`}
            aria-hidden={many && i !== index ? true : undefined}
            className="relative size-full flex-none snap-center"
          >
            {item.kind === 'video' ? (
              <video
                data-slide={i}
                src={item.src}
                muted
                playsInline
                loop={!rotating}
                controls={reducedMotion}
                preload={i === 0 ? 'auto' : 'metadata'}
                onEnded={() => rotating && go(i + 1)}
                className="size-full object-cover"
              />
            ) : (
              <Image
                src={item.src}
                alt=""
                fill
                sizes="(min-width: 760px) 392px, 420px"
                // GIFs keep their frames, and local placeholders their format.
                unoptimized={/\.(gif|svg)$/i.test(item.src)}
                className="object-cover"
              />
            )}
          </div>
        ))}
      </div>

      {many && (
        <>
          <button
            type="button"
            aria-label="Previous"
            onClick={() => go(index - 1)}
            className={`${ARROW} left-3`}
          >
            <ArrowLeftIcon />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => go(index + 1)}
            className={`${ARROW} right-3 rotate-180`}
          >
            <ArrowLeftIcon />
          </button>
          <div className="pointer-events-none absolute inset-x-0 bottom-2.5 flex justify-center gap-1.5">
            <span className="sr-only" aria-live="polite">
              {index + 1} of {items.length}
            </span>
            {items.map((item, i) => (
              <span
                key={`${item.src}:${i}`}
                aria-hidden="true"
                className={`size-1.5 rounded-full border border-paper/70 transition-colors duration-200 ${i === index ? 'bg-accent-fill' : 'bg-ink/45'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
