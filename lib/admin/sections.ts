/*
 * The admin's sections (ADMIN-DESIGN-SPEC §6, [S] `NAV` and `SCHEMAS`): what each one is
 * called, how it is grouped and routed, and where it lives on the site. Shared by the
 * sidebar, the Sections sheet, the routes and the list pages.
 */

export type SingleSlug = 'hero' | 'about' | 'contact' | 'settings';
export type CollectionSlug = 'experience' | 'projects' | 'writing' | 'skills' | 'quotes';
export type SectionSlug = SingleSlug | CollectionSlug;

export type ListFilter = 'All' | 'Published' | 'Hidden' | 'Draft';

interface SectionBase {
  slug: SectionSlug;
  label: string;
  /** Where the section lives on the site ("View on site ↗"). */
  view: string;
}

export interface SingleSection extends SectionBase {
  kind: 'single';
  slug: SingleSlug;
}

export interface CollectionSection extends SectionBase {
  kind: 'collection';
  slug: CollectionSlug;
  singular: string;
  /** Owner-ordered ("shown on the site in this order"); Writing is by date instead. */
  ordered: boolean;
  filters?: readonly ListFilter[];
  /** The skills grid holds four columns (§7.1). */
  max?: number;
}

export type Section = SingleSection | CollectionSection;

export const SECTIONS = {
  hero: { kind: 'single', slug: 'hero', label: 'Hero', view: '/#hero' },
  about: { kind: 'single', slug: 'about', label: 'About', view: '/#about' },
  contact: { kind: 'single', slug: 'contact', label: 'Contact', view: '/#contact' },
  experience: {
    kind: 'collection',
    slug: 'experience',
    label: 'Experience',
    singular: 'role',
    ordered: true,
    view: '/#experience',
  },
  projects: {
    kind: 'collection',
    slug: 'projects',
    label: 'Projects',
    singular: 'project',
    ordered: true,
    filters: ['All', 'Published', 'Hidden'],
    view: '/#projects',
  },
  writing: {
    kind: 'collection',
    slug: 'writing',
    label: 'Writing',
    singular: 'article',
    ordered: false,
    filters: ['All', 'Published', 'Draft'],
    view: '/#writing',
  },
  skills: {
    kind: 'collection',
    slug: 'skills',
    label: 'Skills',
    singular: 'group',
    ordered: true,
    max: 4,
    view: '/#skills',
  },
  quotes: {
    kind: 'collection',
    slug: 'quotes',
    label: 'Quotes',
    singular: 'quote',
    ordered: true,
    view: '/#quotes',
  },
  settings: { kind: 'single', slug: 'settings', label: 'Settings', view: '/' },
} as const satisfies Record<SectionSlug, Section>;

export const NAV: readonly { group: string; items: readonly SectionSlug[] }[] = [
  { group: 'Page', items: ['hero', 'about', 'contact'] },
  { group: 'Content', items: ['experience', 'projects', 'writing', 'skills', 'quotes'] },
  { group: 'Site', items: ['settings'] },
];

/** `/admin` opens on Writing, as the mockup does (Q-A5). */
export const ADMIN_START = '/admin/writing';

export const adminHref = (slug: SectionSlug, id?: string) =>
  id === undefined ? `/admin/${slug}` : `/admin/${slug}/${encodeURIComponent(id)}`;

export function findSection(slug: string): Section | null {
  return Object.hasOwn(SECTIONS, slug) ? SECTIONS[slug as SectionSlug] : null;
}

/** The section a pathname belongs to (`/admin/projects/abc` → projects), for the nav. */
export function sectionFromPath(pathname: string): Section | null {
  const slug = /^\/admin\/([^/]+)/.exec(pathname)?.[1];
  return slug ? findSection(slug) : null;
}

/** Item counts beside each collection in the nav. */
export type SectionCounts = Record<CollectionSlug, number>;
