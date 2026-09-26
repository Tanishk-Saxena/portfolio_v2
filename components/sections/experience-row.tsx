'use client';

import { useId, useState } from 'react';
import { CaretIcon } from '@/components/ui/icons';

interface Props {
  role: string;
  org: string;
  years: string;
  summary: string;
}

/**
 * One experience row (spec §6 ExperienceRow). Title, company and dates always visible; the
 * summary expands on click. The body uses a 0fr → 1fr grid row so Phase 4 can animate its
 * measured height; collapsed content is `inert` so it leaves the a11y tree and tab order.
 */
export function ExperienceRow({ role, org, years, summary }: Props) {
  const [open, setOpen] = useState(false);
  const bodyId = useId();
  const expandable = summary.trim() !== '';

  const meta = (
    <>
      <span className="flex min-w-0 flex-1 flex-col items-start gap-1 @wide/page:flex-row @wide/page:flex-wrap @wide/page:items-baseline @wide/page:gap-x-5 @wide/page:gap-y-1.5">
        <span className="font-serif text-h3-role text-ink">{role}</span>
        <span className="text-meta text-muted">{org}</span>
      </span>
      <span className="text-small tracking-years whitespace-nowrap text-accent tabular-nums">
        {years}
      </span>
    </>
  );

  const rowLayout =
    'flex w-full items-start gap-x-5 gap-y-3 rounded-row px-1.5 py-5 text-left @wide/page:items-baseline @wide/page:py-6 @wide/page:pl-0';

  if (!expandable) {
    return (
      <div className="border-t border-border-row">
        <div className={rowLayout}>
          {meta}
          {/* Keeps the dates column aligned with rows that have a caret. */}
          <span aria-hidden="true" className="size-5.5 flex-none" />
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-border-row">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={() => setOpen((o) => !o)}
        className={`${rowLayout} cursor-pointer focus-visible:outline-offset-[-2px] active:bg-press-row`}
      >
        {meta}
        <span
          aria-hidden="true"
          className={`grid size-5.5 flex-none place-items-center self-center text-muted ${open ? 'rotate-180' : ''}`}
        >
          <CaretIcon />
        </span>
      </button>
      <div
        id={bodyId}
        inert={!open}
        className={`grid ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="min-h-0 overflow-hidden">
          <p className="max-w-[62ch] pb-6.5 text-body-sm text-muted">{summary}</p>
        </div>
      </div>
    </div>
  );
}
