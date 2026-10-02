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
  /** False for an article with nothing to show yet: it can't be published from the list. */
  canGoLive?: boolean;
  /** Text the search box matches ([S] `search()`), lower-cased. */
  search: string;
}

/** The status pill, the quick toggle's label and its toast, per section (§7.1, §7.3). */
const STATUS = {
  projects: { on: 'Published', off: 'Hidden', show: 'Publish', hide: 'Hide from site' },
  writing: { on: 'Published', off: 'Draft', show: 'Publish', hide: 'Unpublish' },
  quotes: { on: 'Shown', off: 'Skipped', show: 'Put in rotation', hide: 'Take out of rotation' },
} as const;
export type StatusSlug = keyof typeof STATUS;
export const hasStatus = (slug: string): slug is StatusSlug => Object.hasOwn(STATUS, slug);

export const statusOf = (slug: StatusSlug, live: boolean) => ({
  label: live ? STATUS[slug].on : STATUS[slug].off,
  live,
});

/** What pressing the pill does: "Publish", "Hide from site", "Take out of rotation"… */
export const toggleLabel = (slug: StatusSlug, live: boolean) =>
  live ? STATUS[slug].hide : STATUS[slug].show;

/** The toast once a toggle is saved; `sub` is the article's path. */
export function toggleToast(slug: StatusSlug, live: boolean, sub: string) {
  if (slug === 'writing') return live ? `Live at ${sub}` : 'Saved as draft, not on the site';
  if (!live) return slug === 'projects' ? 'Saved, hidden from the site' : 'Saved, out of rotation';
  return 'Saved, live on the site';
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
            status: statusOf('projects', p.published),
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
            status: statusOf('writing', a.status === 'published'),
            canGoLive: a.hasBody || a.externalUrl !== null,
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
            status: statusOf('quotes', q.active),
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
