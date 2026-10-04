import type {
  ArticleValues,
  EntryValues,
  Experience,
  Image,
  Profile,
  Project,
  ProjectKind,
  Quote,
  Settings,
  SkillGroup,
  SocialLink,
} from '@/lib/domain/types';
import type { Draft, FormSlug, ImageValue } from './schema';

/*
 * Domain records ↔ editor drafts (ADMIN-DESIGN-SPEC §8). Drafts hold exactly what the form
 * shows; these turn them back into what the domain stores.
 */

const str = (draft: Draft, key: string) => String(draft[key] ?? '').trim();
const list = (draft: Draft, key: string) => (draft[key] as string[] | undefined) ?? [];
const orNull = (text: string) => text || null;

/** A form as the editor opens it: the draft and when the record was last saved. */
export interface LoadedForm {
  draft: Draft;
  updatedAt: string | null;
}

/** The fixed social links the Contact form edits, in order (Q-A10). */
export const SOCIAL_IDS = ['github', 'linkedin', 'read-cv', 'x'] as const;

const toImageValue = (image: Image | null): ImageValue | null =>
  image && { src: image.src, width: image.width, height: image.height };

/** The stored image from the form's; an unchanged image keeps its focal point (Q28). */
function fromImageValue(value: unknown, alt: string, stored: Image | null): Image | null {
  const v = value as ImageValue | null;
  if (!v) return null;
  const focalPoint = stored?.src === v.src ? stored.focalPoint : undefined;
  return { src: v.src, width: v.width, height: v.height, alt, ...(focalPoint && { focalPoint }) };
}

// ── Single records ────────────────────────────────────────────────────────────────────────

export function singleDraft(
  slug: 'hero' | 'about' | 'contact',
  p: Profile,
  links: SocialLink[],
): Draft {
  switch (slug) {
    case 'hero':
      return {
        eyebrow: p.eyebrow,
        headline: p.headline,
        headlineHighlight: p.headlineHighlight ?? '',
        standfirst: p.standfirst,
        resumeUrl: p.resumeUrl ?? '',
        ctaLabel: p.ctaLabel,
        name: p.name,
        location: p.location,
      };
    case 'about':
      // §8.2: paragraphs are joined with a blank line for editing and split on them again.
      return {
        aboutLead: p.aboutLead,
        aboutBody: p.aboutParagraphs.join('\n\n'),
        portrait: toImageValue(p.portrait),
      };
    case 'contact': {
      const url = (id: string) => links.find((l) => l.id === id)?.url ?? '';
      return {
        contactStatement: p.contactStatement,
        email: p.email,
        ...Object.fromEntries(SOCIAL_IDS.map((id) => [id, url(id)])),
        footerNote: p.footerNote,
      };
    }
  }
}

/** The profile with this section's fields replaced from the draft. */
export function applySingle(slug: 'hero' | 'about' | 'contact', p: Profile, d: Draft): Profile {
  switch (slug) {
    case 'hero':
      return {
        ...p,
        eyebrow: str(d, 'eyebrow'),
        headline: str(d, 'headline'),
        headlineHighlight: orNull(str(d, 'headlineHighlight')),
        standfirst: str(d, 'standfirst'),
        resumeUrl: orNull(str(d, 'resumeUrl')),
        ctaLabel: str(d, 'ctaLabel'),
        name: str(d, 'name'),
        location: str(d, 'location'),
      };
    case 'about':
      return {
        ...p,
        aboutLead: str(d, 'aboutLead'),
        aboutParagraphs: str(d, 'aboutBody')
          .split(/\n\s*\n/)
          .map((para) => para.trim())
          .filter(Boolean),
        // Q-A9: the mockup has no alt field; a portrait's alt is predictable.
        portrait: fromImageValue(d.portrait, `Portrait of ${p.name}`, p.portrait),
      };
    case 'contact':
      return {
        ...p,
        contactStatement: str(d, 'contactStatement'),
        email: str(d, 'email'),
        footerNote: str(d, 'footerNote'),
      };
  }
}

export const socialUrls = (d: Draft) =>
  Object.fromEntries(SOCIAL_IDS.map((id) => [id, str(d, id)]));

/** Settings (§8.9): the range edits the grain as text, the store keeps a number. */
export const settingsDraft = (s: Settings): Draft => ({
  accent: s.accent,
  grain: String(s.grain),
  navPosition: s.navPosition,
  menuLayout: s.menuLayout,
});

export const settingsValues = (d: Draft): Settings => ({
  accent: d.accent as Settings['accent'],
  grain: Number(str(d, 'grain')),
  navPosition: d.navPosition as Settings['navPosition'],
  menuLayout: d.menuLayout as Settings['menuLayout'],
});

// ── Collections ───────────────────────────────────────────────────────────────────────────

export type EntrySlug = Extract<
  FormSlug,
  'experience' | 'projects' | 'writing' | 'skills' | 'quotes'
>;
export interface EntryTypes {
  experience: Experience;
  projects: Project;
  writing: ArticleValues & { id: string };
  skills: SkillGroup;
  quotes: Quote;
}

const today = () => new Date().toISOString().slice(0, 10);

/** An entry's draft, or a blank one for a new entry ([S] `blank()`). */
export function entryDraft<S extends EntrySlug>(slug: S, entry?: EntryTypes[S]): Draft {
  switch (slug) {
    case 'experience': {
      const e = entry as Experience | undefined;
      return {
        role: e?.role ?? '',
        org: e?.org ?? '',
        summary: e?.summary ?? '',
        startYear: e?.startDate.slice(0, 4) ?? '',
        current: e ? e.endDate === null : false,
        endYear: e?.endDate?.slice(0, 4) ?? '',
      };
    }
    case 'projects': {
      const p = entry as Project | undefined;
      return {
        title: p?.title ?? '',
        kind: p?.kind ?? 'side-project',
        description: p?.description ?? '',
        tags: [...(p?.tags ?? [])],
        liveUrl: p?.liveUrl ?? '',
        repoUrl: p?.repoUrl ?? '',
        published: p?.published ?? false,
        year: String(p?.year ?? new Date().getFullYear()),
        image: toImageValue(p?.image ?? null),
      };
    }
    case 'writing': {
      const a = entry as ArticleValues | undefined;
      return {
        title: a?.title ?? '',
        body: a?.body ?? '',
        status: a?.status ?? 'draft',
        slug: a?.slug ?? '',
        publishedAt: a?.publishedAt ?? today(),
        readMinutes: a?.readMinutes ? String(a.readMinutes) : '',
        listen: a?.listen ?? true,
        externalUrl: a?.externalUrl ?? '',
      };
    }
    case 'skills': {
      const g = entry as SkillGroup | undefined;
      return { title: g?.title ?? '', items: [...(g?.items ?? [])] };
    }
    case 'quotes': {
      const q = entry as Quote | undefined;
      return { text: q?.text ?? '', author: q?.author ?? '', active: q?.active ?? true };
    }
  }
  throw new Error(`No form for ${slug satisfies never}`);
}

/**
 * Stored dates are `YYYY-MM`; the form edits years. An unchanged year keeps its stored
 * month, a changed one starts in January (as the fixtures do).
 */
const yearToDate = (year: string, stored?: string | null) =>
  stored?.startsWith(`${year}-`) ? stored : `${year}-01`;

function values(slug: EntrySlug, d: Draft, original?: EntryTypes[EntrySlug]): object {
  switch (slug) {
    case 'experience': {
      const e = original as Experience | undefined;
      return {
        role: str(d, 'role'),
        org: str(d, 'org'),
        summary: str(d, 'summary'),
        startDate: yearToDate(str(d, 'startYear'), e?.startDate),
        endDate: d.current ? null : yearToDate(str(d, 'endYear'), e?.endDate),
      } satisfies EntryValues<Experience>;
    }
    case 'projects': {
      const p = original as Project | undefined;
      return {
        title: str(d, 'title'),
        kind: str(d, 'kind') as ProjectKind,
        description: str(d, 'description'),
        tags: list(d, 'tags'),
        liveUrl: orNull(str(d, 'liveUrl')),
        repoUrl: orNull(str(d, 'repoUrl')),
        published: d.published === true,
        year: Number(str(d, 'year')),
        // §8.5: the card image is decorative today, so its alt stays empty.
        image: fromImageValue(d.image, '', p?.image ?? null),
      } satisfies EntryValues<Project>;
    }
    case 'writing': {
      const body = str(d, 'body');
      const minutes = str(d, 'readMinutes');
      return {
        title: str(d, 'title'),
        body: orNull(body),
        status: d.status === 'published' ? 'published' : 'draft',
        slug: str(d, 'slug'),
        publishedAt: str(d, 'publishedAt') || today(),
        readMinutes: minutes ? Number(minutes) : null, // blank = the estimate (Q-A11)
        listen: d.listen === true,
        externalUrl: orNull(str(d, 'externalUrl')),
      } satisfies ArticleValues;
    }
    case 'skills':
      return { title: str(d, 'title'), items: list(d, 'items') } satisfies EntryValues<SkillGroup>;
    case 'quotes':
      return {
        text: str(d, 'text'),
        author: str(d, 'author'),
        active: d.active === true,
      } satisfies EntryValues<Quote>;
  }
}

export const entryValues = <S extends EntrySlug>(slug: S, d: Draft, original?: EntryTypes[S]) =>
  values(slug, d, original) as EntryValues<EntryTypes[S]>;

/** "On shipping less!" → "on-shipping-less": the slug while it follows the title (§7.2). */
export function slugify(title: string): string {
  return title
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
    .replace(/-+$/, '');
}

/**
 * An unsaved copy of an entry (§7.2): "(copy)" on its name, title or role, `-copy` on an
 * article's slug, and set to Hidden / Draft. Quotes are copied as they are.
 */
export function duplicateDraft(slug: EntrySlug, d: Draft): Draft {
  const key = { experience: 'role', projects: 'title', writing: 'title', skills: 'title' }[
    slug as Exclude<EntrySlug, 'quotes'>
  ];
  const copy: Draft = key ? { ...d, [key]: `${str(d, key)} (copy)` } : { ...d };
  if (slug === 'projects') copy.published = false;
  if (slug === 'writing') Object.assign(copy, { slug: `${str(d, 'slug')}-copy`, status: 'draft' });
  return copy;
}

/** The editor's title and crumb for an entry (the row title, without a quote's marks). */
export function entryTitle(slug: EntrySlug, d: Draft): string {
  const key = { experience: 'role', projects: 'title', writing: 'title', skills: 'title' };
  return str(d, slug === 'quotes' ? 'text' : key[slug]);
}

/** The toast once the database has the write (§7.3). */
export function liveText(slug: FormSlug, d: Draft): string {
  if (slug === 'writing') {
    return d.status === 'published'
      ? `Live at /articles/${str(d, 'slug')}`
      : 'Saved as draft, not on the site';
  }
  if (slug === 'projects' && d.published === false) return 'Saved, hidden from the site';
  if (slug === 'quotes' && d.active === false) return 'Saved, out of rotation';
  return 'Saved, live on the site';
}
