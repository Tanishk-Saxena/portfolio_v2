'use client';

import { GuardedLink } from './guarded-link';
import { usePathname } from 'next/navigation';
import {
  adminHref,
  NAV,
  SECTIONS,
  sectionFromPath,
  type SectionCounts,
} from '@/lib/admin/sections';

const ROW = {
  sidebar:
    'flex h-9.5 items-center justify-between gap-2 rounded-row px-2.5 text-admin-nav text-muted hover:bg-hover-nav hover:text-ink aria-[current=page]:bg-surface aria-[current=page]:font-medium aria-[current=page]:text-ink',
  sheet:
    'flex h-14 items-center justify-between gap-2 rounded-lg px-3 font-serif text-admin-sheet text-ink hover:text-ink aria-[current=page]:bg-surface',
};

const COUNT = {
  sidebar: 'text-label text-muted tabular-nums',
  sheet: 'font-sans text-small text-muted tabular-nums',
};

/**
 * The section list, grouped as [S] `NAV`: in the sidebar (wide) and the Sections sheet
 * (phones). Group headings aren't links. Collections show their item count.
 */
export function AdminNav({
  counts,
  variant,
  onNavigate,
}: {
  counts: SectionCounts;
  variant: 'sidebar' | 'sheet';
  onNavigate?: () => void;
}) {
  const current = sectionFromPath(usePathname())?.slug;
  return (
    <nav
      aria-label="Sections"
      className={`flex flex-col ${variant === 'sheet' ? 'gap-5.5 px-2 py-4.5' : 'gap-5'}`}
    >
      {NAV.map(({ group, items }) => (
        <div key={group} role="group" aria-label={group} className="flex flex-col gap-0.5">
          <span
            aria-hidden="true"
            className={`flex items-center gap-2.5 pt-1 pb-2 text-admin-group font-medium tracking-group text-accent uppercase ${variant === 'sheet' ? 'px-3' : 'px-2.5'}`}
          >
            {group}
            <span className="h-px flex-1 bg-line" />
          </span>
          {items.map((slug) => {
            const section = SECTIONS[slug];
            return (
              <GuardedLink
                key={slug}
                href={adminHref(slug)}
                aria-current={slug === current ? 'page' : undefined}
                onClick={onNavigate}
                data-ripple="press-row"
                className={ROW[variant]}
              >
                <span>{section.label}</span>
                {section.kind === 'collection' && (
                  <span className={COUNT[variant]}>{counts[section.slug]}</span>
                )}
              </GuardedLink>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
