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
        onClick={onClick}
        className="h-11.5 cursor-pointer rounded-pill border border-border-control px-6 text-label tracking-button text-ink uppercase transition-colors duration-200 hover:border-accent active:border-accent-fill active:bg-accent-fill active:text-on-accent"
      >
        {label}
      </button>
    </div>
  );
}
