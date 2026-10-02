/**
 * The schema's toggle (ADMIN-DESIGN-SPEC §5): a `role="switch"` button at least 44px high, a
 * 40×24 track (accent when on, the control boundary when off) and an 18px cream knob. The
 * text names the current state. Under reduced motion the knob moves without sliding.
 */
export function ToggleSwitch({
  on,
  text,
  onToggle,
  ...control
}: {
  id: string;
  on: boolean;
  text: string;
  onToggle: () => void;
  'aria-describedby'?: string;
}) {
  return (
    <button
      {...control}
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className="flex min-h-11 cursor-pointer items-center gap-3 self-start text-left"
    >
      <span
        aria-hidden="true"
        className={`relative h-6 w-10 flex-none rounded-full transition-colors duration-200 ${on ? 'bg-accent-fill' : 'bg-line-input'}`}
      >
        <span
          className={`absolute top-0.75 left-0.75 size-4.5 rounded-full bg-knob shadow-knob transition-transform duration-200 ease-admin motion-reduce:transition-none ${on ? 'translate-x-4' : ''}`}
        />
      </span>
      <span className="text-meta text-muted">{text}</span>
    </button>
  );
}
