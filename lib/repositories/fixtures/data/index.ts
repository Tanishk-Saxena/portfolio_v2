import type { FixtureDataset } from '../dataset';
import { articles } from './articles';
import { experience } from './experience';
import { profile } from './profile';
import { projects } from './projects';
import { settings } from './settings';
import { quotes } from './quotes';
import { skillGroups } from './skills';
import { socialLinks } from './social-links';

/** The content the site ships with until Supabase takes over (Phase 6). */
export const defaultDataset: FixtureDataset = {
  profile,
  experience,
  projects,
  articles,
  skillGroups,
  quotes,
  socialLinks,
  settings,
};
