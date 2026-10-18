import { ArrowLeftIcon } from '@/components/ui/icons';

const ARROW =
  'absolute top-1/2 z-1 hidden size-9.5 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-border-close bg-paper text-ink hover:border-accent @wide/page:grid';

/**
 * The modal media's controls (owner, spec §10): ‹ › always on wide screens, and a dot per
 * item that jumps to it (44px tall to press; the row lets a swipe through between them).
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
              className={`size-1.5 rounded-full border border-paper/70 transition-colors duration-200 ${i === index ? 'bg-accent-fill' : 'bg-ink/45'}`}
            />
          </button>
        ))}
      </div>
    </>
  );
}
