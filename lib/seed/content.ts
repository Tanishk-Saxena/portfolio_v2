import type {
  Experience,
  Profile,
  Project,
  Quote,
  Settings,
  SkillGroup,
  SocialLink,
} from '@/lib/domain/types';
import type { ArticleRecord } from '@/lib/repositories/article-record';

export type { ArticleRecord };

/** Everything the seed holds, in domain shapes; they mirror the Supabase tables (spec §7). */
export interface SeedContent {
  profile: Profile;
  experience: Experience[];
  projects: Project[];
  articles: ArticleRecord[];
  skillGroups: SkillGroup[];
  quotes: Quote[];
  socialLinks: SocialLink[];
  settings: Settings;
}
