import type {
  AdminArticleSummary,
  Article,
  ArticleSummary,
  Experience,
  Profile,
  Project,
  Quote,
  Settings,
  SkillGroup,
  SocialLink,
} from './types';

/*
 * Repository interfaces — the only way data reaches the UI (brief §4).
 * Every method is async, even over synchronous fixtures, so swapping in Supabase
 * later changes nothing above this line.
 *
 * Ordering contract — list methods return items already sorted for display:
 *   articles:   by publish date, newest first
 *   everything else, experience included: by `sortOrder` ascending
 * Visibility contract — public reads return only what the site shows: published projects,
 * published articles (a draft's `getBySlug` is `null`), active quotes, and social links that
 * have a URL.
 * Returned objects are the caller's to keep: mutating them never affects later calls.
 */

export interface ProfileRepository {
  get(): Promise<Profile>;
}

export interface ExperienceRepository {
  list(): Promise<Experience[]>;
}

export interface ProjectRepository {
  list(): Promise<Project[]>;
}

export interface ArticleRepository {
  list(): Promise<ArticleSummary[]>;
  /** `null` when no article has this slug. */
  getBySlug(slug: string): Promise<Article | null>;
}

export interface SkillRepository {
  listGroups(): Promise<SkillGroup[]>;
}

export interface QuoteRepository {
  list(): Promise<Quote[]>;
}

export interface SocialLinkRepository {
  list(): Promise<SocialLink[]>;
}

export interface SettingsRepository {
  get(): Promise<Settings>;
}

export interface Repositories {
  profile: ProfileRepository;
  experience: ExperienceRepository;
  projects: ProjectRepository;
  articles: ArticleRepository;
  skills: SkillRepository;
  quotes: QuoteRepository;
  socialLinks: SocialLinkRepository;
  settings: SettingsRepository;
}

/**
 * The admin's reads (ADMIN-DESIGN-SPEC §7.1): every collection with its hidden rows (hidden
 * projects, drafts, skipped quotes), soft-deleted rows excluded, in the same order as above.
 * Over Supabase these run as the signed-in admin, so RLS is what lets the hidden rows through.
 */
export interface AdminRepositories {
  experience: ExperienceRepository;
  projects: ProjectRepository;
  articles: { list(): Promise<AdminArticleSummary[]> };
  skills: SkillRepository;
  quotes: QuoteRepository;
}
