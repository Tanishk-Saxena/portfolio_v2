import { describe, expect, it } from 'vitest';
import { defaultDataset } from '@/lib/repositories/fixtures/data';
import { stressDataset } from '@/lib/repositories/fixtures/data/stress';
import { createFixtureRepositories } from '@/lib/repositories/fixtures/fixture-repositories';
import { personJsonLd, profilePageJsonLd, serializeJsonLd } from './structured-data';

async function load(dataset = defaultDataset) {
  const repos = createFixtureRepositories(dataset);
  return Promise.all([repos.profile.get(), repos.experience.list(), repos.socialLinks.list()]);
}

describe('personJsonLd', () => {
  it('takes the job title from the current role', async () => {
    const [profile, experience, links] = await load();
    const person = personJsonLd(profile, experience, links);
    expect(person).toMatchObject({ '@type': 'Person', name: profile.name });
    expect(person.jobTitle).toBe(experience.find((e) => e.endDate === null)?.role);
  });

  it('leaves out links to a service home page rather than a profile', async () => {
    const [profile, experience] = await load();
    const person = personJsonLd(profile, experience, [
      { id: 'a', label: 'GitHub', url: 'https://github.com/', sortOrder: 1 },
      { id: 'b', label: 'GitHub', url: 'https://github.com/someone', sortOrder: 2 },
    ]);
    expect(person.sameAs).toEqual(['https://github.com/someone']);
  });

  it('survives the stress dataset', async () => {
    const [profile, experience, links] = await load(stressDataset);
    expect(() =>
      serializeJsonLd(profilePageJsonLd(personJsonLd(profile, experience, links))),
    ).not.toThrow();
  });
});

describe('serializeJsonLd', () => {
  it('cannot close its script tag', () => {
    expect(serializeJsonLd({ name: '</script><script>alert(1)</script>' })).not.toContain('<');
  });
});
