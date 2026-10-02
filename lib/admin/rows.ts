import type {
  AdminArticleSummary,
  Experience,
  Project,
  Quote,
  SkillGroup,
} from '@/lib/domain/types';
import { formatMonthYear, formatProjectKind, formatYearRange } from '@/lib/utils/format';
import { type CollectionSection, type CollectionSlug, type ListFilter } from './sections';

/** Everything the admin lists, as read for one request. */
export interface AdminContent {
  experience: Experience[];
  projects: Project[];
  writing: AdminArticleSummary[];
  skills: SkillGroup[];
  quotes: Quote[];
}

/** One list row, ready to render ([S] `row()`). Plain data: it crosses to the client. */
export interface ListRow {
  id: string;
  title: string;
  sub: string;
  meta: string;
  /** The status pill: `live` takes the accent wash. */
  status?: { label: string; live: boolean };
  /** Text the search box matches ([S] `search()`), lower-cased. */
  search: string;
}

const row = (r: Omit<ListRow, 'search'>, ...searchable: string[]): ListRow => ({
  ...r,
  title: r.title.trim() || 'Untitled',
  search: searchable.join(' ').toLowerCase(),
});

export function toRows(slug: CollectionSlug, content: AdminContent): ListRow[] {
  switch (slug) {
    case 'experience':
      return content.experience.map((e) =>
        row(
          {
            id: e.id,
            title: e.role,
            sub: e.org,
            meta: formatYearRange(e.startDate, e.endDate),
          },
          e.role,
          e.org,
        ),
      );
    case 'projects':
      return content.projects.map((p) =>
        row(
          {
            id: p.id,
            title: p.title,
            sub: formatProjectKind(p.kind),
            meta: String(p.year),
            status: p.published
              ? { label: 'Published', live: true }
              : { label: 'Hidden', live: false },
          },
          p.title,
          formatProjectKind(p.kind),
          ...p.tags,
        ),
      );
    case 'writing':
      return content.writing.map((a) =>
        row(
          {
            id: a.id,
            title: a.title,
            sub: `/articles/${a.slug}`,
            meta: `${formatMonthYear(a.publishedAt)} · ${a.readMinutes} min`,
            status:
              a.status === 'published'
                ? { label: 'Published', live: true }
                : { label: 'Draft', live: false },
          },
          a.title,
          a.slug,
        ),
      );
    case 'skills':
      return content.skills.map((g) =>
        row(
          {
            id: g.id,
            title: g.title,
            sub: g.items.join(', '),
            meta: `${g.items.length} ${g.items.length === 1 ? 'item' : 'items'}`,
          },
          g.title,
          ...g.items,
        ),
      );
    case 'quotes':
      return content.quotes.map((q) =>
        row(
          {
            id: q.id,
            title: `“${q.text}”`,
            sub: q.author,
            meta: '',
            status: q.active ? { label: 'Shown', live: true } : { label: 'Skipped', live: false },
          },
          q.text,
          q.author,
        ),
      );
  }
}

/** Search as you type, then the status filter (§7.1). */
export function filterRows(rows: ListRow[], query: string, filter: ListFilter): ListRow[] {
  const q = query.trim().toLowerCase();
  return rows.filter(
    (r) => (!q || r.search.includes(q)) && (filter === 'All' || r.status?.label === filter),
  );
}

/** "4 roles · shown on the site in this order" / "3 articles · newest first". */
export function countLine(section: CollectionSection, count: number) {
  const noun = count === 1 ? section.singular : `${section.singular}s`;
  return `${count} ${noun} · ${section.ordered ? 'shown on the site in this order' : 'newest first'}`;
}
