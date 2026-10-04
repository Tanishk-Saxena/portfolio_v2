'use client';

import { useId, useState, type ReactNode } from 'react';
import { CaretIcon } from '@/components/ui/icons';

interface Props {
  role: string;
  org: string;
  years: string;
  /** The summary as rendered HTML (simple Markdown); empty when there is none. */
  summaryHtml: string;
}

// The summary's markup comes from Markdown, so it is styled with child variants.
const SUMMARY =
  'flex max-w-[62ch] flex-col gap-3 pb-6.5 text-body-sm text-muted [&_li]:pl-0.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-medium [&_strong]:text-ink [&_u]:underline-offset-3 [&_ul]:list-disc [&_ul]:pl-5';

/**
 * One experience row (spec §6 ExperienceRow). Title, company and dates always visible; the
 * summary expands on click. The body uses a 0fr → 1fr grid row so Phase 4 can animate its
 * measured height; collapsed content is `inert` so it leaves the a11y tree and tab order.
 */
export function ExperienceRow({ role, org, years, summaryHtml }: Props) {
  const [open, setOpen] = useState(false);
  const bodyId = useId();
  const expandable = summaryHtml !== '';

  /**
   * Dates and caret travel as one group, centred on each other, and the row aligns that
   * group's baseline (the dates) with the role's first line. So on mobile, where the company
   * drops below the role, the caret stays on the title line instead of the block's middle.
   */
  const meta = (caret: ReactNode) => (
    <>
      <span className="flex min-w-0 flex-1 flex-col items-start gap-1 @wide/page:flex-row @wide/page:flex-wrap @wide/page:items-baseline @wide/page:gap-x-5 @wide/page:gap-y-1.5">
        <span className="font-serif text-h3-role text-ink">{role}</span>
        <span className="text-meta text-muted">{org}</span>
      </span>
      <span className="flex flex-none items-center gap-x-5">
        <span className="text-small tracking-years whitespace-nowrap text-accent tabular-nums">
          {years}
        </span>
        {caret}
      </span>
    </>
  );

  const rowLayout =
    'flex w-full items-baseline gap-x-5 rounded-row px-1.5 py-5 text-left @wide/page:py-6 @wide/page:pl-0';

  if (!expandable) {
    return (
      <div className="border-t border-border-row">
        {/* The empty slot keeps the dates aligned with rows that have a caret. */}
        <div className={rowLayout}>
          {meta(<span aria-hidden="true" className="size-5.5 flex-none" />)}
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
        data-ripple="press-row"
        className={`${rowLayout} cursor-pointer transition-colors duration-200 focus-visible:outline-offset-[-2px]`}
      >
        {meta(
          <span
            aria-hidden="true"
            className={`grid size-5.5 flex-none place-items-center text-muted transition-transform duration-340 ease-out-soft motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}
          >
            <CaretIcon />
          </span>,
        )}
      </button>
      <div
        id={bodyId}
        inert={!open}
        className={`grid [transition:grid-template-rows_.5s_var(--ease-expand),opacity_.38s_ease] motion-reduce:[transition:opacity_.38s_ease] ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="min-h-0 overflow-hidden">
          {/* The renderer drops raw HTML, so only its own tags reach here. */}
          <div className={SUMMARY} dangerouslySetInnerHTML={{ __html: summaryHtml }} />
        </div>
      </div>
    </div>
  );
}
