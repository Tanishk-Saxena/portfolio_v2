import { describe, expect, it } from 'vitest';
import { runRepositoryContract } from '../repository-contract';
import { defaultDataset } from './data';
import { stressDataset } from './data/stress';
import { createFixtureRepositories } from './fixture-repositories';

runRepositoryContract('fixtures (default)', () => createFixtureRepositories(defaultDataset));
runRepositoryContract('fixtures (stress)', () => createFixtureRepositories(stressDataset));

describe('stress dataset covers the awkward cases the layouts must survive', () => {
  const s = stressDataset;
  it('has a long role title, an empty summary, and more roles than the mockup', () => {
    expect(s.experience.some((e) => e.role.length > 60)).toBe(true);
    expect(s.experience.some((e) => e.summary === '')).toBe(true);
    expect(s.experience.length).toBeGreaterThan(3);
  });
  it('has projects without live or repo links, with no tags, and with many tags', () => {
    expect(s.projects.some((p) => p.liveUrl === null)).toBe(true);
    expect(s.projects.some((p) => p.repoUrl === null)).toBe(true);
    expect(s.projects.some((p) => p.tags.length === 0)).toBe(true);
    expect(s.projects.some((p) => p.tags.length > 3)).toBe(true);
  });
  it('has an external-only article and no headline highlight', () => {
    expect(s.articles.some((a) => a.body === null && a.externalUrl)).toBe(true);
    expect(s.profile.headlineHighlight).toBeNull();
  });
});
