import type { ISODate, ProjectKind } from '@/lib/domain/types';

// Display formatting (spec §7, Q27). Dates are formatted in UTC with a fixed locale so the
// server and client always render identical strings (no hydration mismatch).

const LOCALE = 'en-GB';

function toUTCDate(iso: ISODate): Date {
  const [y, m = '01', d = '01'] = iso.split('-');
  return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
}

const monthYear = new Intl.DateTimeFormat(LOCALE, {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});
const longDate = new Intl.DateTimeFormat(LOCALE, {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/** "Aug 2026" — the Writing list. */
export const formatMonthYear = (iso: ISODate) => monthYear.format(toUTCDate(iso));

/** "14 August 2026" — the article page. */
export const formatLongDate = (iso: ISODate) => longDate.format(toUTCDate(iso));

/** "2023 — now" / "2021 — 2023" — the Experience rows (spaced em dash, as mocked). */
export function formatYearRange(start: ISODate, end: ISODate | null): string {
  const from = start.slice(0, 4);
  if (end === null) return `${from} — now`;
  const to = end.slice(0, 4);
  return from === to ? from : `${from} — ${to}`;
}

const KIND_LABELS: Record<ProjectKind, string> = {
  'open-source': 'Open source',
  'side-project': 'Side project',
  'client-work': 'Client work',
};

export const formatProjectKind = (kind: ProjectKind) => KIND_LABELS[kind];
