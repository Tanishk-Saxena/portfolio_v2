import { describe, expect, it } from 'vitest';
import { defaultDataset } from '@/lib/repositories/fixtures/data';
import { stressDataset } from '@/lib/repositories/fixtures/data/stress';
import { createFixtureRepositories } from '@/lib/repositories/fixtures/fixture-repositories';
import { resolveSiteUrl } from './site';
import { personJsonLd, profilePageJsonLd, serializeJsonLd } from './structured-data';

// What search engines and share cards read: the canonical origin and the JSON-LD.

async function load(dataset = defaultDataset) {
  const repos = createFixtureRepositories(dataset);
  return Promise.all([repos.profile.get(), repos.experience.list(), repos.socialLinks.list()]);
}

describe('seo', () => {
  it('site URL: NEXT_PUBLIC_SITE_URL, then the Vercel production domain, then localhost', () => {
    const both = {
      NEXT_PUBLIC_SITE_URL: 'https://example.dev',
      VERCEL_PROJECT_PRODUCTION_URL: 'app.vercel.app',
    };
    expect(resolveSiteUrl(both).origin).toBe('https://example.dev');
    expect(resolveSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: 'app.vercel.app' }).origin).toBe(
      'https://app.vercel.app',
    );
    expect(resolveSiteUrl({}).origin).toBe('http://localhost:3000');
  });

  it('person JSON-LD: job title from the current role, only real profile links, any content', async () => {
    const [profile, experience, links] = await load();
    const person = personJsonLd(profile, experience, links);
    expect(person).toMatchObject({ '@type': 'Person', name: profile.name });
    expect(person.jobTitle).toBe(experience.find((e) => e.endDate === null)?.role);

    const filtered = personJsonLd(profile, experience, [
      { id: 'a', label: 'GitHub', url: 'https://github.com/', sortOrder: 1 },
      { id: 'b', label: 'GitHub', url: 'https://github.com/someone', sortOrder: 2 },
    ]);
    expect(filtered.sameAs).toEqual(['https://github.com/someone']);

    const stress = await load(stressDataset);
    expect(() => serializeJsonLd(profilePageJsonLd(personJsonLd(...stress)))).not.toThrow();
  });

  it('JSON-LD cannot close its script tag', () => {
    expect(serializeJsonLd({ name: '</script><script>alert(1)</script>' })).not.toContain('<');
  });
});
