import type {
  EntryValues,
  Experience,
  Profile,
  Quote,
  SkillGroup,
  SocialLink,
} from '@/lib/domain/types';
import type { Draft, FormSlug } from './schema';

/*
 * Domain records ↔ editor drafts (ADMIN-DESIGN-SPEC §8). Drafts hold exactly what the form
 * shows; these turn them back into what the domain stores.
 */

const str = (draft: Draft, key: string) => String(draft[key] ?? '').trim();
const list = (draft: Draft, key: string) => (draft[key] as string[] | undefined) ?? [];

/** A form as the editor opens it: the draft and when the record was last saved. */
export interface LoadedForm {
  draft: Draft;
  updatedAt: string | null;
}

/** The fixed social links the Contact form edits, in order (Q-A10). */
export const SOCIAL_IDS = ['github', 'linkedin', 'read-cv', 'x'] as const;

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
        name: p.name,
        location: p.location,
        ctaLabel: p.ctaLabel,
      };
    case 'about':
      // §8.2: paragraphs are joined with a blank line for editing and split on them again.
      return { aboutLead: p.aboutLead, aboutBody: p.aboutParagraphs.join('\n\n') };
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
        headlineHighlight: str(d, 'headlineHighlight') || null,
        standfirst: str(d, 'standfirst'),
        name: str(d, 'name'),
        location: str(d, 'location'),
        ctaLabel: str(d, 'ctaLabel'),
      };
    case 'about':
      return {
        ...p,
        aboutLead: str(d, 'aboutLead'),
        aboutParagraphs: str(d, 'aboutBody')
          .split(/\n\s*\n/)
          .map((para) => para.trim())
          .filter(Boolean),
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

// ── Collections ───────────────────────────────────────────────────────────────────────────

export type EntrySlug = Extract<FormSlug, 'experience' | 'skills' | 'quotes'>;
export interface EntryTypes {
  experience: Experience;
  skills: SkillGroup;
  quotes: Quote;
}

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

export function entryValues<S extends EntrySlug>(
  slug: S,
  d: Draft,
  original?: EntryTypes[S],
): EntryValues<EntryTypes[S]> {
  switch (slug) {
    case 'experience': {
      const e = original as Experience | undefined;
      const values: EntryValues<Experience> = {
        role: str(d, 'role'),
        org: str(d, 'org'),
        summary: str(d, 'summary'),
        startDate: yearToDate(str(d, 'startYear'), e?.startDate),
        endDate: d.current ? null : yearToDate(str(d, 'endYear'), e?.endDate),
      };
      return values as unknown as EntryValues<EntryTypes[S]>;
    }
    case 'skills':
      return { title: str(d, 'title'), items: list(d, 'items') } as unknown as EntryValues<
        EntryTypes[S]
      >;
    case 'quotes':
      return {
        text: str(d, 'text'),
        author: str(d, 'author'),
        active: d.active === true,
      } as unknown as EntryValues<EntryTypes[S]>;
  }
  throw new Error(`No form for ${slug satisfies never}`);
}

/**
 * An unsaved copy of an entry (§7.2): "(copy)" on its name, title or role. Projects (8.4) are
 * also set to Hidden and articles to Draft; quotes are copied as they are.
 */
export function duplicateDraft(slug: EntrySlug, d: Draft): Draft {
  const key = { experience: 'role', skills: 'title', quotes: null }[slug];
  return key ? { ...d, [key]: `${str(d, key)} (copy)` } : { ...d };
}

/** The editor's title and crumb for an entry (the row title, without a quote's marks). */
export function entryTitle(slug: EntrySlug, d: Draft): string {
  const key = { experience: 'role', skills: 'title', quotes: 'text' }[slug];
  return str(d, key);
}

/** The toast once the database has the write (§7.3). */
export function liveText(slug: FormSlug, d: Draft): string {
  if (slug === 'quotes' && d.active === false) return 'Saved, out of rotation';
  return 'Saved, live on the site';
}
