import type {
  Article,
  ArticleSummary,
  Experience,
  Profile,
  Project,
  Quote,
  SkillGroup,
  SocialLink,
} from './types';

/*
 * Repository interfaces — the only way data reaches the UI (brief §4).
 * Every method is async, even over synchronous fixtures, so swapping in Supabase
 * later changes nothing above this line.
 *
 * Ordering contract — list methods return items already sorted for display:
 *   experience: current role first, then by start date, newest first
 *   articles:   by publish date, newest first
 *   everything else: by `sortOrder` ascending
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

export interface Repositories {
  profile: ProfileRepository;
  experience: ExperienceRepository;
  projects: ProjectRepository;
  articles: ArticleRepository;
  skills: SkillRepository;
  quotes: QuoteRepository;
  socialLinks: SocialLinkRepository;
}
