import { describe, expect, it } from 'vitest';
import {
  checkAdminRepositories,
  checkAdminWrites,
  runRepositoryContract,
} from '../repository-contract';
import { defaultDataset } from './data';
import { stressDataset } from './data/stress';
import { createFixtureAdminRepositories } from './fixture-admin-repositories';
import { createFixtureRepositories } from './fixture-repositories';

runRepositoryContract('fixtures (default)', () => createFixtureRepositories(defaultDataset));
runRepositoryContract('fixtures (stress)', () => createFixtureRepositories(stressDataset));

describe('stress dataset', () => {
  const s = stressDataset;
  const r = createFixtureRepositories(s);

  it('covers the awkward cases the layouts must survive', () => {
    expect(s.experience.some((e) => e.role.length > 60)).toBe(true);
    expect(s.experience.some((e) => e.summary === '')).toBe(true);
    expect(s.experience.length).toBeGreaterThan(3);
    expect(s.projects.some((p) => p.liveUrl === null)).toBe(true);
    expect(s.projects.some((p) => p.repoUrl === null)).toBe(true);
    expect(s.projects.some((p) => p.tags.length === 0)).toBe(true);
    expect(s.projects.some((p) => p.tags.length > 3)).toBe(true);
    expect(s.articles.some((a) => a.body === null && a.externalUrl)).toBe(true);
    expect(s.profile.headlineHighlight).toBeNull();
  });

  it('keeps hidden content off the site; read time is stored or estimated', async () => {
    expect((await r.projects.list()).length).toBe(s.projects.filter((p) => p.published).length);
    expect((await r.quotes.list()).map((q) => q.id)).not.toContain('skipped');
    expect((await r.socialLinks.list()).length).toBe(s.socialLinks.length - 1);
    expect((await r.articles.list()).map((a) => a.slug)).not.toContain('draft-only');
    expect(await r.articles.getBySlug('draft-only')).toBeNull();
    expect((await r.articles.getBySlug('external-only'))?.readMinutes).toBe(45);
    expect((await r.articles.getBySlug('very-long-title'))?.readMinutes).toBe(1);
  });

  it('the admin reads every row, hidden ones included, in display order', async () => {
    const admin = await checkAdminRepositories(createFixtureAdminRepositories(s), r);
    expect(admin.projects).toHaveLength(s.projects.length);
    expect(admin.quotes.map((q) => q.id)).toContain('skipped');
    expect(admin.articles.find((a) => a.slug === 'draft-only')?.status).toBe('draft');
    const shipped = createFixtureAdminRepositories(defaultDataset);
    await checkAdminRepositories(shipped, createFixtureRepositories(defaultDataset));
  });

  it('the admin writes: on a copy of the data, which the site then reads', async () => {
    const data = structuredClone(stressDataset);
    const id = await checkAdminWrites(createFixtureAdminRepositories(data), 'tag');
    expect(data.quotes.find((q) => q.id === id)?.text).toBe('Edited.');
    expect(stressDataset.quotes.some((q) => q.id === id)).toBe(false);
  });
});
