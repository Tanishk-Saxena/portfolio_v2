import type {
  Accent,
  ArticleStatus,
  Experience,
  Image,
  MenuLayout,
  NavPosition,
  PressFeedback,
  ProjectMedia,
  Profile,
  Project,
  ProjectKind,
  Quote,
  Settings,
  SkillGroup,
  SocialLink,
} from '@/lib/domain/types';
import type { ArticleRecord } from '../article-record';

/*
 * Table rows (supabase/migrations) and their mapping to domain types. Row shapes never leave
 * this folder (brief §4 rule 2). The same mappers run in reverse to write the seed, so the
 * seed and the reads can't drift apart.
 */

export interface ProfileRow {
  name: string;
  eyebrow: string;
  headline: string;
  headline_highlight: string | null;
  standfirst: string;
  cta_label: string;
  about_lead: string;
  about_paragraphs: string[];
  portrait: Image | null;
  resume_url: string | null;
  email: string;
  contact_statement: string;
  location: string;
  footer_note: string;
}

export interface SettingsRow {
  accent: Accent;
  grain: number;
  nav_position: NavPosition;
  menu_layout: MenuLayout;
  press_feedback: PressFeedback;
  media_auto_rotate: boolean;
  site_title: string;
  github_username: string;
  site_description: string;
}

export interface ExperienceRow {
  id: string;
  role: string;
  org: string;
  start_date: string;
  end_date: string | null;
  summary: string;
  sort_order: number;
}

export interface ProjectRow {
  id: string;
  title: string;
  kind: ProjectKind;
  year: number;
  description: string;
  tags: string[];
  image: Image | null;
  media: ProjectMedia[];
  repo_url: string | null;
  live_url: string | null;
  published: boolean;
  sort_order: number;
}

export interface ArticleRow {
  slug: string;
  title: string;
  excerpt: string;
  published_at: string;
  read_minutes: number | null;
  body: string | null;
  external_url: string | null;
  status: ArticleStatus;
  listen: boolean;
}

export interface SkillGroupRow {
  id: string;
  title: string;
  items: string[];
  sort_order: number;
}

export interface QuoteRow {
  id: string;
  text: string;
  author: string;
  active: boolean;
  sort_order: number;
}

export interface SocialLinkRow {
  id: string;
  label: string;
  url: string;
  sort_order: number;
}

// ── Row → domain ──────────────────────────────────────────────────────────────────────────

export const toProfile = (r: ProfileRow): Profile => ({
  name: r.name,
  eyebrow: r.eyebrow,
  headline: r.headline,
  headlineHighlight: r.headline_highlight,
  standfirst: r.standfirst,
  ctaLabel: r.cta_label,
  aboutLead: r.about_lead,
  aboutParagraphs: r.about_paragraphs,
  portrait: r.portrait,
  resumeUrl: r.resume_url,
  email: r.email,
  contactStatement: r.contact_statement,
  location: r.location,
  footerNote: r.footer_note,
});

export const toSettings = (r: SettingsRow): Settings => ({
  accent: r.accent,
  grain: Number(r.grain), // numeric arrives as a number or a string, depending on the driver
  navPosition: r.nav_position,
  menuLayout: r.menu_layout,
  pressFeedback: r.press_feedback,
  mediaAutoRotate: r.media_auto_rotate,
  siteTitle: r.site_title,
  githubUsername: r.github_username ?? '',
  siteDescription: r.site_description,
});

export const toExperience = (r: ExperienceRow): Experience => ({
  id: r.id,
  role: r.role,
  org: r.org,
  startDate: r.start_date,
  endDate: r.end_date,
  summary: r.summary,
  sortOrder: r.sort_order,
});

export const toProject = (r: ProjectRow): Project => ({
  id: r.id,
  title: r.title,
  kind: r.kind,
  year: r.year,
  description: r.description,
  tags: r.tags,
  image: r.image,
  media: r.media ?? [],
  repoUrl: r.repo_url,
  liveUrl: r.live_url,
  published: r.published,
  sortOrder: r.sort_order,
});

/** The stored article, before `hasBody` and the read-time estimate are derived. */
export const toArticleRecord = (r: ArticleRow): ArticleRecord => ({
  slug: r.slug,
  title: r.title,
  excerpt: r.excerpt,
  publishedAt: r.published_at,
  readMinutes: r.read_minutes,
  body: r.body,
  externalUrl: r.external_url,
  status: r.status,
  listen: r.listen,
});

export const toSkillGroup = (r: SkillGroupRow): SkillGroup => ({
  id: r.id,
  title: r.title,
  items: r.items,
  sortOrder: r.sort_order,
});

export const toQuote = (r: QuoteRow): Quote => ({
  id: r.id,
  text: r.text,
  author: r.author,
  active: r.active,
  sortOrder: r.sort_order,
});

export const toSocialLink = (r: SocialLinkRow): SocialLink => ({
  id: r.id,
  label: r.label,
  url: r.url,
  sortOrder: r.sort_order,
});

// ── Domain → row (the seed) ───────────────────────────────────────────────────────────────

export const fromProfile = (p: Profile): ProfileRow => ({
  name: p.name,
  eyebrow: p.eyebrow,
  headline: p.headline,
  headline_highlight: p.headlineHighlight,
  standfirst: p.standfirst,
  cta_label: p.ctaLabel,
  about_lead: p.aboutLead,
  about_paragraphs: p.aboutParagraphs,
  portrait: p.portrait,
  resume_url: p.resumeUrl,
  email: p.email,
  contact_statement: p.contactStatement,
  location: p.location,
  footer_note: p.footerNote,
});

export const fromSettings = (s: Settings): SettingsRow => ({
  accent: s.accent,
  grain: s.grain,
  nav_position: s.navPosition,
  menu_layout: s.menuLayout,
  press_feedback: s.pressFeedback,
  media_auto_rotate: s.mediaAutoRotate,
  site_title: s.siteTitle,
  github_username: s.githubUsername,
  site_description: s.siteDescription,
});

export const fromExperience = (e: Experience): ExperienceRow => ({
  id: e.id,
  role: e.role,
  org: e.org,
  start_date: e.startDate,
  end_date: e.endDate,
  summary: e.summary,
  sort_order: e.sortOrder,
});

export const fromProject = (p: Project): ProjectRow => ({
  id: p.id,
  title: p.title,
  kind: p.kind,
  year: p.year,
  description: p.description,
  tags: p.tags,
  image: p.image,
  media: p.media,
  repo_url: p.repoUrl,
  live_url: p.liveUrl,
  published: p.published,
  sort_order: p.sortOrder,
});

export const fromArticleRecord = (a: ArticleRecord): ArticleRow => ({
  slug: a.slug,
  title: a.title,
  excerpt: a.excerpt,
  published_at: a.publishedAt,
  read_minutes: a.readMinutes,
  body: a.body,
  external_url: a.externalUrl,
  status: a.status,
  listen: a.listen,
});

export const fromSkillGroup = (g: SkillGroup): SkillGroupRow => ({
  id: g.id,
  title: g.title,
  items: g.items,
  sort_order: g.sortOrder,
});

export const fromQuote = (q: Quote): QuoteRow => ({
  id: q.id,
  text: q.text,
  author: q.author,
  active: q.active,
  sort_order: q.sortOrder,
});

export const fromSocialLink = (l: SocialLink): SocialLinkRow => ({
  id: l.id,
  label: l.label,
  url: l.url,
  sort_order: l.sortOrder,
});
