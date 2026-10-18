import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { seedContent } from '@/lib/seed';
import { ACCENT_BASE } from './og/accent';
import { resolveSiteUrl } from './site';
import { personJsonLd, profilePageJsonLd, serializeJsonLd } from './structured-data';

// What search engines and share cards read: the canonical origin and the JSON-LD.

/** What the public repositories hand the page: hidden links (empty URLs) left out. */
const load = () =>
  [
    seedContent.profile,
    seedContent.experience,
    seedContent.socialLinks.filter((l) => l.url !== ''),
  ] as const;

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

  it('person JSON-LD: job title from the current role, only real profile links, any content', () => {
    const [profile, experience, links] = load();
    const person = personJsonLd(profile, experience, links);
    expect(person).toMatchObject({ '@type': 'Person', name: profile.name });
    expect(person.jobTitle).toBe(experience.find((e) => e.endDate === null)?.role);

    const filtered = personJsonLd(profile, experience, [
      { id: 'a', label: 'GitHub', url: 'https://github.com/', sortOrder: 1 },
      { id: 'b', label: 'GitHub', url: 'https://github.com/someone', sortOrder: 2 },
    ]);
    expect(filtered.sameAs).toEqual(['https://github.com/someone']);

    // The seed's stress cases (long roles, empty summaries, a hidden link) serialise too.
    expect(() => serializeJsonLd(profilePageJsonLd(person))).not.toThrow();
  });

  it('JSON-LD cannot close its script tag', () => {
    expect(serializeJsonLd({ name: '</script><script>alert(1)</script>' })).not.toContain('<');
  });

  it('share cards and icons use the same accent colours as the site', async () => {
    // next/og can't read CSS, so lib/og keeps its own copy of each accent's base.
    const css = await readFile(join(process.cwd(), 'styles/tokens.css'), 'utf8');
    const base = (block: RegExp) =>
      block.exec(css)?.[1]?.match(/--accent-base:\s*(#[0-9a-f]{6})/i)?.[1];
    expect(base(/:root,\s*\[data-theme='light'\]\s*\{([^}]*)\}/)).toBe(ACCENT_BASE.terracotta);
    expect(base(/\[data-accent='slate'\]\s*\{([^}]*)\}/)).toBe(ACCENT_BASE.slate);
  });
});
