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
  sortOrder: number;
}

/** What the Writing list needs — no body. */
export interface ArticleSummary {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: ISODate;
  readMinutes: number;
  /** When set, the row links out instead of to `/articles/[slug]`. */
  externalUrl: string | null;
  /** True when an on-site body exists. */
  hasBody: boolean;
}

export interface Article extends ArticleSummary {
  /** Markdown. `null` when the article only lives at `externalUrl`. */
  body: string | null;
}

export interface Quote {
  id: string;
  text: string;
  author: string;
  sortOrder: number;
}

export interface SocialLink {
  id: string;
  label: string;
  url: string;
  sortOrder: number;
}
