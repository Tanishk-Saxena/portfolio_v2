import type {
  ArticleRepository,
  ExperienceRepository,
  ProfileRepository,
  ProjectRepository,
  QuoteRepository,
  Repositories,
  SkillRepository,
  SocialLinkRepository,
} from '@/lib/domain/repositories';
import type { Article, ArticleSummary, Experience } from '@/lib/domain/types';
import type { ArticleRecord, FixtureDataset } from './dataset';

/*
 * In-memory implementations over a FixtureDataset. Each call returns fresh copies, so
 * callers can't mutate the dataset, which matches what a database round-trip gives.
 */

const copy = <T>(value: T): T => structuredClone(value);
const bySortOrder = <T extends { sortOrder: number }>(a: T, b: T) => a.sortOrder - b.sortOrder;

/** Current role first, then newest start date first. */
function byRecency(a: Experience, b: Experience) {
  if ((a.endDate === null) !== (b.endDate === null)) return a.endDate === null ? -1 : 1;
  return b.startDate.localeCompare(a.startDate);
}

function toArticle(record: ArticleRecord): Article {
  return { ...copy(record), hasBody: record.body !== null && record.body.trim() !== '' };
}

function toSummary(record: ArticleRecord): ArticleSummary {
  const { body: _body, ...summary } = toArticle(record);
  return summary;
}

export function createFixtureRepositories(data: FixtureDataset): Repositories {
  const profile: ProfileRepository = {
    get: async () => copy(data.profile),
  };

  const experience: ExperienceRepository = {
    list: async () => copy(data.experience).sort(byRecency),
  };

  const projects: ProjectRepository = {
    list: async () => copy(data.projects).sort(bySortOrder),
  };

  const articles: ArticleRepository = {
    list: async () =>
      data.articles.map(toSummary).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)),
    getBySlug: async (slug) => {
      const record = data.articles.find((a) => a.slug === slug);
      return record ? toArticle(record) : null;
    },
  };

  const skills: SkillRepository = {
    listGroups: async () => copy(data.skillGroups).sort(bySortOrder),
  };

  const quotes: QuoteRepository = {
    list: async () => copy(data.quotes).sort(bySortOrder),
  };

  const socialLinks: SocialLinkRepository = {
    list: async () => copy(data.socialLinks).sort(bySortOrder),
  };

  return { profile, experience, projects, articles, skills, quotes, socialLinks };
}
