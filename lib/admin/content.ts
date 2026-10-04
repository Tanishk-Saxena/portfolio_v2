import { cache } from 'react';
import { getAdminRepositories, getRepositories } from '@/lib/container';
import type { AdminContent } from './rows';
import type { SectionCounts } from './sections';

/**
 * Every admin list, read once per request: the shell's counts and the page's rows share it.
 * Call only after `getAdmin()` has passed.
 */
export const loadAdminContent = cache(async (): Promise<AdminContent> => {
  const r = await getAdminRepositories();
  const [experience, projects, writing, skills, quotes] = await Promise.all([
    r.experience.list(),
    r.projects.list(),
    r.articles.list(),
    r.skills.list(),
    r.quotes.list(),
  ]);
  return { experience, projects, writing, skills, quotes };
});

/** The wordmark in the admin's shell and on sign-in: the profile's Name, as the site shows it. */
export const siteName = cache(async () => (await getRepositories().profile.get()).name);

export const countsOf = (c: AdminContent): SectionCounts => ({
  experience: c.experience.length,
  projects: c.projects.length,
  writing: c.writing.length,
  skills: c.skills.length,
  quotes: c.quotes.length,
});
