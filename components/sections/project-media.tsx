'use client';

import Image from 'next/image';
import { type FocusEvent, useEffect, useRef, useState } from 'react';
import type { ProjectMedia as Media } from '@/lib/domain/types';
import { useReducedMotion } from '@/lib/hooks/use-reduced-motion';
import { GifSlide } from './gif-slide';
import { MediaControls } from './media-controls';

const ROTATE_MS = 5000; // a still image's turn when Settings has rotation on (spec §10)

const isGif = (src: string) => /\.gif$/i.test(src);

/**
 * A project's modal media (owner, spec §10): images, GIFs and videos side by side in a native
 * scroll-snap strip with no scrollbar, so a swipe moves between them on a phone with no
 * script; on wide screens ‹ › always show; ← → move it with focus; a dot jumps to its item.
 * Videos play muted.
 *
 * Rotation (Settings): each item gets exactly one play and nothing repeats: a still image
 * stays 5s, a GIF one run of its frames from the first, a video until it ends. It pauses only
 * under a mouse or a finger (and while the keyboard is inside it); a video that ends meanwhile
 * moves on once let go. Without rotation it is manual, and videos and GIFs loop. Under
 * reduced motion nothing rotates or autoplays; videos show their controls.
 *
 * Accessible whatever is uploaded: every item is named from the project's title and its place
 * ("Ledger, video 2 of 3"), and videos stay muted even with controls showing, so there is
 * never audio without captions (WCAG 1.2.2); the modal's description is their text.
 */
export function ProjectMedia({
  items,
  title,
  autoRotate,
}: {
  items: Media[];
  title: string;
  autoRotate: boolean;
}) {
  const strip = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [held, setHeld] = useState(false);
  const [ended, setEnded] = useState<number | null>(null); // a video that ended while held
  const [gifMs, setGifMs] = useState<Record<number, number>>({});
  const reducedMotion = useReducedMotion();
  const many = items.length > 1;
  const rotate = autoRotate && many && !reducedMotion;
  const rotating = rotate && !held;

  function go(to: number) {
    const el = strip.current;
    if (!el) return;
    const next = (to + items.length) % items.length;
    el.scrollTo({ left: next * el.clientWidth, behavior: reducedMotion ? 'auto' : 'smooth' });
  }

  // Only the slide in view plays, from its start; the others rest at their first frame.
  useEffect(() => {
    strip.current?.querySelectorAll('video').forEach((video) => {
      const slide = Number(video.dataset.slide);
      if (slide === index && !reducedMotion) void video.play().catch(() => {});
      else {
        video.pause();
        if (slide !== index) video.currentTime = 0;
      }
    });
  }, [index, reducedMotion]);

  // A still image or a GIF moves on after its turn; a video when it ends (below).
  const current = items[index];
  const turn =
    current?.kind === 'image' ? (isGif(current.src) ? (gifMs[index] ?? ROTATE_MS) : ROTATE_MS) : 0;
  useEffect(() => {
    if (!rotating) return;
    if (ended === index) {
      go(index + 1); // it finished while held
      return;
    }
    if (!turn) return;
    const timer = window.setTimeout(() => go(index + 1), turn);
    return () => window.clearTimeout(timer);
    // `go` reads refs and props only; the timer restarts with the slide.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rotating, index, turn, ended]);

  // Held by a mouse over it, a finger on it, or keyboard focus inside (not a click's focus).
  const onFocus = (e: FocusEvent) => e.target.matches(':focus-visible') && setHeld(true);

  return (
    <div
      className="group/media absolute inset-0"
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onPointerDown={(e) => e.pointerType === 'touch' && setHeld(true)}
      onPointerUp={(e) => e.pointerType === 'touch' && setHeld(false)}
      onPointerCancel={(e) => e.pointerType === 'touch' && setHeld(false)}
      onFocus={onFocus}
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
          if (at !== index) {
            setIndex(at);
            setEnded(null);
          }
        }}
        className="flex size-full snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto overscroll-x-contain [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, i) => {
          const name = `${title}, ${item.kind === 'video' ? 'video' : 'image'}${many ? ` ${i + 1} of ${items.length}` : ''}`;
          return (
            <div
              key={`${item.src}:${i}`}
              aria-hidden={many && i !== index ? true : undefined}
              className="relative size-full flex-none snap-center"
            >
              {item.kind === 'video' ? (
                <video
                  data-slide={i}
                  src={item.src}
                  aria-label={name}
                  muted
                  onVolumeChange={(e) => {
                    e.currentTarget.muted = true;
                  }}
                  playsInline
                  loop={!rotate}
                  controls={reducedMotion}
                  preload={i === 0 ? 'auto' : 'metadata'}
                  onEnded={() => (rotating ? go(i + 1) : setEnded(i))}
                  className="size-full object-cover"
                />
              ) : isGif(item.src) ? (
                <GifSlide
                  src={item.src}
                  alt={name}
                  active={i === index}
                  measure={rotate}
                  onDuration={(ms) => setGifMs((d) => ({ ...d, [i]: ms }))}
                />
              ) : (
                <Image
                  src={item.src}
                  alt={name}
                  fill
                  sizes="(min-width: 760px) 392px, 420px"
                  unoptimized={/\.svg$/i.test(item.src)} // local placeholders keep their format
                  className="object-cover"
                />
              )}
            </div>
          );
        })}
      </div>

      {many && <MediaControls count={items.length} index={index} go={go} />}
    </div>
  );
}
