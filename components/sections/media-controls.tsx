import { type RefObject, useEffect, useRef } from 'react';
import { ArrowLeftIcon } from '@/components/ui/icons';

const ARROW =
  'absolute top-1/2 z-1 hidden size-9.5 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-border-close bg-paper text-ink opacity-0 transition-opacity duration-200 group-focus-within/media:opacity-100 group-hover/media:opacity-100 hover:border-accent @wide/page:grid';

/**
 * The modal media's controls (owner, spec §10): ‹ › on wide screens while hovered or focused,
 * and a dot per item that jumps to it (44px tall to press; the row lets a swipe through
 * between them; a solid paper ring so it reads on any media).
 */
export function MediaControls({
  count,
  index,
  go,
}: {
  count: number;
  index: number;
  go: (to: number) => void;
}) {
  return (
    <>
      <button
        type="button"
        data-ripple="paper"
        aria-label="Previous"
        onClick={() => go(index - 1)}
        className={`${ARROW} left-3`}
      >
        <ArrowLeftIcon />
      </button>
      <button
        type="button"
        data-ripple="paper"
        aria-label="Next"
        onClick={() => go(index + 1)}
        className={`${ARROW} right-3 rotate-180`}
      >
        <ArrowLeftIcon />
      </button>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center">
        <span className="sr-only" aria-live="polite">
          {index + 1} of {count}
        </span>
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Show ${i + 1} of ${count}`}
            aria-current={i === index ? 'true' : undefined}
            onClick={() => go(i)}
            className="pointer-events-auto grid h-11 w-6 cursor-pointer place-items-center"
          >
            <span
              className={`size-2.5 rounded-full border-2 border-paper shadow-float transition-colors duration-200 ${i === index ? 'bg-paper' : 'bg-ink/45'}`}
            />
          </button>
        ))}
      </div>
    </>
  );
}

/**
 * The rotation's time left (owner, spec §10): a thin paper bar on a dark track along the top
 * of the media, readable on any image.
 * For a still image or a GIF it is the timer itself, a CSS run of the item's turn that ends
 * in `onDone`; pausing the run pauses the rotation, which resumes where it stopped. For a
 * video it follows the playback (the video's own `ended` moves on). Remounted per item.
 */
export function RotationBar({
  strip,
  index,
  video,
  ms,
  paused,
  onDone,
}: {
  strip: RefObject<HTMLDivElement | null>;
  index: number;
  video: boolean;
  ms: number;
  paused: boolean;
  onDone: () => void;
}) {
  const bar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = video
      ? strip.current?.querySelector<HTMLVideoElement>(`video[data-slide="${index}"]`)
      : null;
    if (!el) return;
    const tick = () => {
      if (bar.current && el.duration) {
        bar.current.style.transform = `scaleX(${el.currentTime / el.duration})`;
      }
    };
    el.addEventListener('timeupdate', tick);
    return () => el.removeEventListener('timeupdate', tick);
  }, [strip, index, video]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-1 h-1 bg-ink/30"
    >
      <span
        ref={bar}
        onAnimationEnd={onDone}
        className={`block h-full origin-left bg-paper ${video ? 'transition-transform duration-300 ease-linear' : 'animate-media-turn'}`}
        // A video's bar starts empty; `tick` sets its transform as the video plays.
        style={
          video
            ? { transform: 'scaleX(0)' }
            : { animationDuration: `${ms}ms`, animationPlayState: paused ? 'paused' : 'running' }
        }
      />
    </div>
  );
}
