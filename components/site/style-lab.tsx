'use client';

import { useEffect, useRef, useState } from 'react';
import { BACKDROPS, LAB_KEYS, PALETTES } from '@/lib/style-lab';

type Kind = keyof typeof LAB_KEYS;

const ATTR: Record<Kind, string> = { palette: 'data-palette', backdrop: 'data-backdrop' };

/** The palette as shipped, picked when nothing else is. */
const SHIPPED = PALETTES[0][0];

/** Sets one choice on <html> and remembers it in this browser ('' clears it). */
function apply(kind: Kind, value: string) {
  const root = document.documentElement;
  if (value) root.setAttribute(ATTR[kind], value);
  else root.removeAttribute(ATTR[kind]);
  try {
    if (value) localStorage.setItem(LAB_KEYS[kind], value);
    else localStorage.removeItem(LAB_KEYS[kind]);
  } catch {}
}

/**
 * [EXPERIMENT] The style lab (lib/style-lab.ts): a button beside the theme toggle that opens
 * two pickers, palette and hero background. Shown only while Settings → Style lab is on
 * (styles/tokens.css hides it otherwise). A click outside or Escape closes it. Temporary.
 */
export function StyleLab() {
  const [choice, setChoice] = useState<Record<Kind, string>>({
    palette: SHIPPED,
    backdrop: '',
  });
  const ref = useRef<HTMLDetailsElement>(null);

  // What the head script set before paint (the URL or this browser), read once on mount.
  useEffect(() => {
    const root = document.documentElement;
    setChoice({
      palette: root.getAttribute(ATTR.palette) ?? SHIPPED,
      backdrop: root.getAttribute(ATTR.backdrop) ?? '',
    });
  }, []);

  // A press outside or Escape closes it. Listening all along (each a no-op while closed), so a
  // key pressed the instant it opens is never missed.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onDown = (e: PointerEvent) => {
      if (el.open && !el.contains(e.target as Node)) el.open = false;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !el.open) return;
      el.open = false;
      el.querySelector('summary')?.focus();
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const pick = (kind: Kind, value: string) => {
    apply(kind, value);
    setChoice((c) => ({ ...c, [kind]: value }));
  };

  const select = (kind: Kind, label: string, options: readonly (readonly [string, string])[]) => (
    <label className="flex flex-col gap-1 text-label tracking-label text-muted uppercase">
      {label}
      <span className="relative">
        <select
          value={choice[kind]}
          onChange={(e) => pick(kind, e.target.value)}
          className="h-11 w-full cursor-pointer appearance-none rounded-sm border border-border-control bg-paper pr-10 pl-3 text-body-sm tracking-normal text-ink normal-case"
        >
          {options.map(([value, name]) => (
            <option key={value} value={value}>
              {name}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 12 12"
          className="pointer-events-none absolute top-1/2 right-3.5 size-3 -translate-y-1/2 text-muted"
        >
          <path d="M2 4.5 6 8.5 10 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </span>
    </label>
  );

  return (
    <details ref={ref} data-lab-button className="relative">
      <summary
        aria-label="Style lab"
        className="grid size-11.5 cursor-pointer list-none place-items-center rounded-full border border-border-control text-label font-medium tracking-label text-accent uppercase transition-colors duration-300 hover:border-accent [&::-webkit-details-marker]:hidden"
      >
        Lab
      </summary>
      <div className="absolute top-[calc(100%+10px)] right-0 z-10 flex w-64 flex-col gap-3 rounded-card border border-border-card bg-paper p-4 shadow-float">
        {select('palette', 'Palette', PALETTES)}
        {select('backdrop', 'Hero background', BACKDROPS)}
      </div>
    </details>
  );
}
