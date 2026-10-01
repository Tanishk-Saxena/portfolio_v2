import type {
  Article,
  Experience,
  Profile,
  Project,
  Quote,
  Settings,
  SkillGroup,
  SocialLink,
} from '@/lib/domain/types';

/**
 * An article as stored: `hasBody` is derived, never authored, and `readMinutes` is an
 * optional override (`null` = estimate from the body, ADMIN-DESIGN-SPEC Q-A11).
 */
export type ArticleRecord = Omit<Article, 'hasBody' | 'readMinutes'> & {
  readMinutes: number | null;
};

/** Everything one fixture set holds. Shapes mirror the future Supabase tables (spec §7). */
export interface FixtureDataset {
  profile: Profile;
  experience: Experience[];
  projects: Project[];
  articles: ArticleRecord[];
  skillGroups: SkillGroup[];
  quotes: Quote[];
  socialLinks: SocialLink[];
  settings: Settings;
}
