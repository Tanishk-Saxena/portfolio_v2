import type {
  Experience,
  Profile,
  Project,
  Quote,
  Settings,
  SkillGroup,
  SocialLink,
} from '@/lib/domain/types';
import type { ArticleRecord } from '../article-record';

export type { ArticleRecord };

/** Everything one fixture set holds. Shapes mirror the Supabase tables (spec §7). */
export interface FixtureDataset {
  profile: Profile;
  experience: Experience[];
  projects: Project[];
  articles: ArticleRecord[];
  skillGroups: SkillGroup[];
  quotes: Quote[];
  socialLinks: SocialLink[];
  settings: Settings;
  /**
   * The admin's bookkeeping over a working copy (never in the shipped data): when each record
   * was last saved, and soft-deleted entries kept for Undo, by 'collection:id'.
   */
  admin?: { stamps: Record<string, string>; trash: Record<string, unknown> };
}
