import type { SVGProps } from 'react';

// Admin icon paths verbatim from the admin mockup (Admin.dc.html). Decorative: the control
// that holds the icon carries the accessible name.

type IconProps = SVGProps<SVGSVGElement>;

const base = (width: number, height: number): IconProps => ({
  width,
  height,
  viewBox: `0 0 ${width} ${height}`,
  fill: 'none',
  'aria-hidden': true,
  focusable: false,
});

const stroke = { stroke: 'currentColor', strokeLinecap: 'round' } as const;

/** ≡ — opens the Sections sheet. */
export function MenuIcon(props: IconProps) {
  return (
    <svg {...base(14, 10)} {...props}>
      <path d="M1 1h12M1 5h12M1 9h12" strokeWidth="1.4" {...stroke} />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg {...base(7, 11)} {...props}>
      <path d="M1.2 1 5.6 5.5 1.2 10" strokeWidth="1.5" {...stroke} />
    </svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg {...base(7, 11)} {...props}>
      <path d="M5.8 1 1.4 5.5 5.8 10" strokeWidth="1.5" {...stroke} />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...base(15, 15)} viewBox="0 0 16 16" {...props}>
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
      <path d="m11 11 3.5 3.5" strokeWidth="1.4" {...stroke} />
    </svg>
  );
}

export function SmallCloseIcon(props: IconProps) {
  return (
    <svg {...base(12, 12)} viewBox="0 0 10 10" {...props}>
      <path d="m2 2 6 6M8 2 2 8" strokeWidth="1.3" {...stroke} />
    </svg>
  );
}
