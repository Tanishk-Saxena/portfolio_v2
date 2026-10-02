/**
 * The schema's select, as pills (ADMIN-DESIGN-SPEC §5): `role="radiogroup"`, each pill a
 * `role="radio"` button, 38px; the chosen one takes the ink fill.
 */
export function SelectPills({
  options,
  value,
  onChange,
  ...control
}: {
  id: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  'aria-describedby'?: string;
  'aria-labelledby'?: string;
}) {
  return (
    <div {...control} role="radiogroup" className="flex flex-wrap gap-1.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          onClick={() => onChange(option.value)}
          data-ripple="press-row"
          className="h-9.5 flex-none cursor-pointer rounded-full border border-line px-4 text-admin-pill whitespace-nowrap text-ink transition-colors duration-150 hover:border-accent aria-checked:border-ink aria-checked:bg-ink aria-checked:text-paper"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
