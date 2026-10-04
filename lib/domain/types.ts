/**
 * Domain models (spec §7, brief §5). Components only ever see these shapes —
 * never fixture- or database-row-shaped data.
 *
 * Dates are ISO-8601 strings (`YYYY-MM-DD`, or `YYYY-MM` for month precision) so the
 * same values serialise across the server/client boundary and into Postgres later.
 */

export type ISODate = string;

export interface Image {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** CSS `object-position`, e.g. `'50% 30%'` — lets one source serve every crop (Q28). */
  focalPoint?: string;
}

export interface Profile {
  name: string;
  eyebrow: string;
  headline: string;
  /** One word that appears in `headline`; rendered in the handwriting face. */
  headlineHighlight: string | null;
  standfirst: string;
  /** The hero's secondary button, linking to Contact. Empty hides the button. */
  ctaLabel: string;
  aboutLead: string;
  aboutParagraphs: string[];
  portrait: Image | null;
  resumeUrl: string | null;
  email: string;
  contactStatement: string;
  location: string;
  footerNote: string;
}

export interface Experience {
  id: string;
  role: string;
  org: string;
  startDate: ISODate;
  /** `null` = current role. */
  endDate: ISODate | null;
  summary: string;
  sortOrder: number;
}

export interface SkillGroup {
  id: string;
  title: string;
  items: string[];
  sortOrder: number;
}

export type ProjectKind = 'open-source' | 'side-project' | 'client-work';

export interface Project {
  id: string;
  title: string;
  kind: ProjectKind;
  year: number;
  /** Short line — card fallback copy. */
  summary: string;
  /** Modal copy. */
  description: string;
  tags: string[];
  image: Image | null;
  repoUrl: string | null;
  liveUrl: string | null;
  /** Hidden projects never reach the site. */
  published: boolean;
  sortOrder: number;
}

export type ArticleStatus = 'draft' | 'published';

/** What the Writing list needs — no body. */
export interface ArticleSummary {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: ISODate;
  /** The stored override, or the estimate from the body when none is stored. */
  readMinutes: number;
  /** Drafts never reach the site. */
  status: ArticleStatus;
  /** Shows the Listen (text-to-speech) button on the article page. */
  listen: boolean;
  /** When set, the row links out instead of to `/articles/[slug]`. */
  externalUrl: string | null;
  /** True when an on-site body exists. */
  hasBody: boolean;
}

/** The admin's view of an article: drafts included, keyed by an id that survives slug edits. */
export interface AdminArticleSummary extends ArticleSummary {
  id: string;
}

/**
 * What the admin edits on an article (ADMIN-DESIGN-SPEC §8.6). `readMinutes` is the stored
 * override (`null` = estimate from the body); the excerpt isn't edited (Q-A12).
 */
export interface ArticleValues {
  slug: string;
  title: string;
  body: string | null;
  externalUrl: string | null;
  status: ArticleStatus;
  publishedAt: ISODate;
  readMinutes: number | null;
  listen: boolean;
}

/** A record as the admin holds it: when it was last saved (`null` = never, or unknown). */
export type Stamped<T> = T & { updatedAt: string | null };

/** What the admin writes for a collection entry: everything but the id and the position. */
export type EntryValues<T> = Omit<T, 'id' | 'sortOrder'>;

export interface Article extends ArticleSummary {
  /** Markdown. `null` when the article only lives at `externalUrl`. */
  body: string | null;
}

export interface Quote {
  id: string;
  text: string;
  author: string;
  /** Inactive quotes are skipped by the rotation. */
  active: boolean;
  sortOrder: number;
}

export interface SocialLink {
  id: string;
  label: string;
  url: string;
  sortOrder: number;
}

export type Accent = 'terracotta' | 'slate';
export type NavPosition = 'right' | 'centre';
export type MenuLayout = 'arc' | 'wheel';

/** Site-wide style settings (ADMIN-DESIGN-SPEC §8.9). The defaults are the shipped look. */
/** The shipped look: what a new database holds and what Reset to defaults returns to. */
export const DEFAULT_SETTINGS: Settings = {
  accent: 'terracotta',
  grain: 6, // --grain-opacity: 0.06 (Q5)
  navPosition: 'right',
  menuLayout: 'arc',
};

export interface Settings {
  accent: Accent;
  /** Paper grain opacity, in percent (0–24, step 0.5). */
  grain: number;
  navPosition: NavPosition;
  menuLayout: MenuLayout;
}
