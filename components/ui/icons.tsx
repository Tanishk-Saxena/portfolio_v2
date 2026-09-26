import type { SVGProps } from 'react';

// Icon paths verbatim from the mockup (Portfolio.dc.html). Decorative by default:
// the control that holds the icon carries the accessible name.

type IconProps = SVGProps<SVGSVGElement>;

const base = (size: number): IconProps => ({
  width: size,
  height: size,
  fill: 'none',
  'aria-hidden': true,
  focusable: false,
});

export function DownloadIcon(props: IconProps) {
  return (
    <svg {...base(14)} viewBox="0 0 14 14" {...props}>
      <path
        d="M7 1v9m0 0 3.4-3.4M7 10 3.6 6.6M1.5 12.5h11"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function GlobeIcon(props: IconProps) {
  return (
    <svg {...base(16)} viewBox="0 0 24 24" {...props}>
      <circle cx="12" cy="12" r="8.4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M3.6 12h16.8M12 3.6c2.2 2.3 3.3 5.2 3.3 8.4S14.2 18.1 12 20.4c-2.2-2.3-3.3-5.2-3.3-8.4S9.8 5.9 12 3.6z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function GitHubIcon(props: IconProps) {
  return (
    <svg {...base(16)} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2.2a9.8 9.8 0 0 0-3.1 19.1c.5.1.7-.2.7-.5v-1.8c-2.7.6-3.3-1.3-3.3-1.3-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.2-4.5-1.1-4.5-4.9 0-1.1.4-1.9 1-2.6-.1-.3-.4-1.3.1-2.6 0 0 .8-.3 2.7 1a9.3 9.3 0 0 1 4.9 0c1.9-1.3 2.7-1 2.7-1 .5 1.3.2 2.3.1 2.6.6.7 1 1.5 1 2.6 0 3.8-2.3 4.6-4.5 4.9.4.3.7.9.7 1.8v2.7c0 .3.2.6.7.5A9.8 9.8 0 0 0 12 2.2z" />
    </svg>
  );
}

export function CaretIcon(props: IconProps) {
  return (
    <svg {...base(11)} height={7} viewBox="0 0 11 7" {...props}>
      <path
        d="M1 1.2 5.5 5.6 10 1.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base(16)} viewBox="0 0 24 24" {...props}>
      <path
        d="M6.6 6.6 17.4 17.4M17.4 6.6 6.6 17.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ArrowUpIcon(props: IconProps) {
  return (
    <svg {...base(18)} viewBox="0 0 24 24" {...props}>
      <path
        d="M12 19V6M6.2 11.6 12 5.8l5.8 5.8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg {...base(14)} height={10} viewBox="0 0 14 10" {...props}>
      <path
        d="M13 5H1m0 0 4-4M1 5l4 4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The mockup's scroll cue: a mouse outline with a wheel dot (animated in Phase 4). */
export function MouseIcon(props: IconProps) {
  return (
    <svg {...base(26)} height={42} viewBox="0 0 26 42" {...props}>
      <rect x="1" y="1" width="24" height="40" rx="12" stroke="currentColor" strokeWidth="1.4" />
      <rect
        x="11.6"
        y="8"
        width="2.8"
        height="7"
        rx="1.4"
        fill="currentColor"
        className="motion-loop animate-cue"
      />
    </svg>
  );
}
