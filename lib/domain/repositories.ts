import type {
  AdminArticleSummary,
  Article,
  ArticleStatus,
  ArticleValues,
  ArticleSummary,
  ContributionCalendar,
  Experience,
  Profile,
  Project,
  Quote,
  Settings,
  SkillGroup,
  SocialLink,
  Stamped,
  EntryValues,
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

/** The GitHub contribution calendar. `null` when there is none to show (no username, no data). */
export interface ContributionRepository {
  get(username: string): Promise<ContributionCalendar | null>;
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
  contributions: ContributionRepository;
}

/**
 * An owner-ordered collection as the admin sees it: every entry, hidden ones included, in
 * `sortOrder`. `create` appends at the end; `update` returns null when no live entry has
 * that id.
 */
export interface AdminCollection<T extends { id: string; sortOrder: number }> {
  list(): Promise<Stamped<T>[]>;
  create(values: EntryValues<T>): Promise<Stamped<T>>;
  update(id: string, values: EntryValues<T>): Promise<Stamped<T> | null>;
  /** Changes some fields only (the list's quick toggle). */
  patch(id: string, values: Partial<EntryValues<T>>): Promise<Stamped<T> | null>;
  /** Soft delete: the entry leaves the site and the lists until `restore`. */
  remove(id: string): Promise<boolean>;
  restore(id: string): Promise<boolean>;
  /** The new order, every live id once: positions become 1…n. */
  reorder(ids: string[]): Promise<void>;
}

/** Articles, by an id that survives slug edits. Not owner-ordered: newest first. */
export interface AdminArticles {
  list(): Promise<Stamped<AdminArticleSummary>[]>;
  get(id: string): Promise<Stamped<ArticleValues & { id: string }> | null>;
  create(values: ArticleValues): Promise<Stamped<ArticleValues & { id: string }>>;
  update(
    id: string,
    values: ArticleValues,
  ): Promise<Stamped<ArticleValues & { id: string }> | null>;
  setStatus(id: string, status: ArticleStatus): Promise<boolean>;
  remove(id: string): Promise<boolean>;
  restore(id: string): Promise<boolean>;
}

/**
 * The admin's reads and writes (ADMIN-DESIGN-SPEC §7–§9): every collection with its hidden
 * rows (hidden projects, drafts, skipped quotes), soft-deleted rows excluded, in the same
 * order as above. Over Supabase these run as the signed-in admin, so RLS is what lets the
 * hidden rows through and the writes in.
 */
export interface AdminRepositories {
  profile: {
    get(): Promise<Stamped<Profile>>;
    update(profile: Profile): Promise<Stamped<Profile>>;
  };
  settings: {
    get(): Promise<Stamped<Settings>>;
    update(settings: Settings): Promise<Stamped<Settings>>;
  };
  /**
   * Every link, empty URLs included (an empty URL hides the link, Q-A10). `replace` makes
   * the list exactly what it is given, in that order: new ids are added, missing ones removed.
   */
  socialLinks: {
    list(): Promise<SocialLink[]>;
    replace(links: Omit<SocialLink, 'sortOrder'>[]): Promise<void>;
  };
  /**
   * Uploaded files (the storage bucket). `references` is every file URL a record points at,
   * deleted entries included (Undo restores them, files and all). `remove` deletes the files
   * it is given from storage and ignores any URL that is not one of the app's own uploads.
   */
  files: {
    references(): Promise<string[]>;
    remove(urls: string[]): Promise<void>;
  };
  experience: AdminCollection<Experience>;
  projects: AdminCollection<Project>;
  articles: AdminArticles;
  skills: AdminCollection<SkillGroup>;
  quotes: AdminCollection<Quote>;
}
