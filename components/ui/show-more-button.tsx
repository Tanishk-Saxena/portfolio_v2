import { afterRipple } from '@/lib/ripple';

/** "Show more" pill (spec §6): appends a page; the list unmounts it when exhausted. */
export function ShowMoreButton({
  onClick,
  label = 'Show more',
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <div className="mt-more flex justify-center">
      <button
        type="button"
        onClick={(e) => afterRipple(e, onClick)} // the ripple shows before the list grows
        data-ripple="accent-fill"
        className="h-11.5 cursor-pointer rounded-pill border border-border-control px-6 text-label tracking-button text-ink uppercase transition-colors duration-200 hover:border-accent active:border-accent-fill active:text-on-accent"
      >
        {label}
      </button>
    </div>
  );
}
