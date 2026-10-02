import type {
  ArticleRepository,
  ExperienceRepository,
  ProfileRepository,
  ProjectRepository,
  QuoteRepository,
  Repositories,
  SettingsRepository,
  SkillRepository,
  SocialLinkRepository,
} from '@/lib/domain/repositories';
import { type ArticleRecord, toArticle, toSummary } from '../article-record';
import type { FixtureDataset } from './dataset';

/*
 * In-memory implementations over a FixtureDataset. Each call returns fresh copies, so
 * callers can't mutate the dataset, which matches what a database round-trip gives.
 * Hidden rows (unpublished, drafts, inactive, empty links) are filtered here, as the
 * public database reads will be.
 */

const copy = <T>(value: T): T => structuredClone(value);
const bySortOrder = <T extends { sortOrder: number }>(a: T, b: T) => a.sortOrder - b.sortOrder;
const isPublished = (record: ArticleRecord) => record.status === 'published';
const newestFirst = <T extends { publishedAt: string }>(a: T, b: T) =>
  b.publishedAt.localeCompare(a.publishedAt);

export function createFixtureRepositories(data: FixtureDataset): Repositories {
  const profile: ProfileRepository = {
    get: async () => copy(data.profile),
  };

  const experience: ExperienceRepository = {
    list: async () => copy(data.experience).sort(bySortOrder),
  };

  const projects: ProjectRepository = {
    list: async () => copy(data.projects.filter((p) => p.published)).sort(bySortOrder),
  };

  const articles: ArticleRepository = {
    list: async () => data.articles.filter(isPublished).map(toSummary).sort(newestFirst),
    getBySlug: async (slug) => {
      const record = data.articles.find((a) => a.slug === slug && isPublished(a));
      return record ? toArticle(record) : null;
    },
  };

  const skills: SkillRepository = {
    listGroups: async () => copy(data.skillGroups).sort(bySortOrder),
  };

  const quotes: QuoteRepository = {
    list: async () => copy(data.quotes.filter((q) => q.active)).sort(bySortOrder),
  };

  const socialLinks: SocialLinkRepository = {
    list: async () => copy(data.socialLinks.filter((l) => l.url.trim() !== '')).sort(bySortOrder),
  };

  const settings: SettingsRepository = {
    get: async () => copy(data.settings),
  };

  return { profile, experience, projects, articles, skills, quotes, socialLinks, settings };
}
