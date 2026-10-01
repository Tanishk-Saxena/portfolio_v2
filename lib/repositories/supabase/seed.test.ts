import { describe, expect, it } from 'vitest';
import { defaultDataset } from '../fixtures/data';
import { seedSql } from './seed';

describe('seed', () => {
  it('supabase/seed.sql is the shipped fixtures, regenerated', async () => {
    await expect(seedSql(defaultDataset)).toMatchFileSnapshot('../../../supabase/seed.sql');
  });

  it('escapes quotes, and writes arrays, json and nulls as SQL literals', () => {
    const sql = seedSql({
      ...defaultDataset,
      profile: {
        ...defaultDataset.profile,
        name: "O'Brien",
        aboutParagraphs: [],
        portrait: { src: '/p.jpg', alt: "It's me", width: 1, height: 2 },
        resumeUrl: null,
      },
    });
    expect(sql).toContain("'O''Brien'");
    expect(sql).toContain("'{}'::text[]");
    expect(sql).toContain(`'{"src":"/p.jpg","alt":"It''s me","width":1,"height":2}'::jsonb`);
    expect(sql).toContain('::jsonb, null, '); // resume_url follows the portrait
  });
});

// Mirrors the CHECK constraints in supabase/migrations, so content the database would reject
// fails here first, without a database.
describe('the shipped content fits the database constraints', () => {
  const d = defaultDataset;
  it('projects, quotes and articles', () => {
    for (const p of d.projects) {
      expect(p.summary.length).toBeLessThanOrEqual(110);
      expect(p.description.length).toBeLessThanOrEqual(320);
    }
    for (const q of d.quotes) expect(q.text.length).toBeLessThanOrEqual(140);
    for (const a of d.articles) {
      expect(a.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      if (a.status === 'published') expect(a.body?.trim() || a.externalUrl).toBeTruthy();
    }
  });
  it('experience dates', () => {
    for (const e of d.experience) {
      expect(e.startDate).toMatch(/^\d{4}-\d{2}$/);
      if (e.endDate) expect(e.endDate >= e.startDate).toBe(true);
    }
  });
});
