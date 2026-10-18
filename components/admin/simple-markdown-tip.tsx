'use client';

import { useId, useState } from 'react';

/**
 * "Simple Markdown" in the experience description's well, dotted-underlined: hovering,
 * focusing or tapping it shows what the set holds (owner, ADMIN-DESIGN-SPEC §14). The set is
 * this site's own, not a convention, so it is spelled out. Escape or leaving closes it.
 */
export function SimpleMarkdownTip() {
  const [open, setOpen] = useState(false);
  const tipId = useId();
  return (
    <span className="group/tip relative ml-auto">
      <button
        type="button"
        aria-describedby={tipId}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        className="h-8 cursor-help px-2 text-label text-muted underline decoration-dotted underline-offset-4 hover:text-ink"
      >
        Simple Markdown
      </button>
      <span
        id={tipId}
        role="tooltip"
        className={`pointer-events-none absolute top-full right-0 z-10 mt-1.5 w-64 rounded-row border border-line bg-paper p-3 text-left text-small text-ink shadow-float transition-opacity duration-150 group-focus-within/tip:visible group-focus-within/tip:opacity-100 group-hover/tip:visible group-hover/tip:opacity-100 ${open ? 'visible opacity-100' : 'invisible opacity-0'}`}
      >
        Paragraphs, “- ” and “1.” lists, **bold**, *italic* and &lt;u&gt;underline&lt;/u&gt;.
        Headings, links and images stay as typed.
      </span>
    </span>
  );
}
