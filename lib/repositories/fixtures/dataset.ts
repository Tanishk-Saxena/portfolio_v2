import type {
  Article,
  Experience,
  Profile,
  Project,
  Quote,
  SkillGroup,
  SocialLink,
} from '@/lib/domain/types';

/** An article as stored — `hasBody` is derived, never authored. */
export type ArticleRecord = Omit<Article, 'hasBody'>;

/** Everything one fixture set holds. Shapes mirror the future Supabase tables (spec §7). */
export interface FixtureDataset {
  profile: Profile;
  experience: Experience[];
  projects: Project[];
  articles: ArticleRecord[];
  skillGroups: SkillGroup[];
  quotes: Quote[];
  socialLinks: SocialLink[];
}
