import { describe, expect, it } from 'vitest';
import { entryDraft, settingsDraft, singleDraft } from '@/lib/admin/forms';
import { validate } from '@/lib/admin/schema';
import { seedContent } from '@/lib/seed';
import { seedSql } from './seed';

describe('seed', () => {
  it('supabase/seed.sql is lib/seed, regenerated', async () => {
    await expect(seedSql(seedContent)).toMatchFileSnapshot('../../../supabase/seed.sql');
  });

  it('escapes quotes, and writes arrays, json and nulls as SQL literals', () => {
    const sql = seedSql({
      ...seedContent,
      profile: {
        ...seedContent.profile,
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

// The stress cases sit at the limits, never past them: everything in the seed is content the
// admin itself would save. So the tests always run on the worst content real use can produce.
describe('the seed is content the admin would save', () => {
  const d = seedContent;

  it('passes the admin’s validation, every record', () => {
    expect(validate('hero', singleDraft('hero', d.profile, d.socialLinks))).toEqual({});
    expect(validate('about', singleDraft('about', d.profile, d.socialLinks))).toEqual({});
    expect(validate('contact', singleDraft('contact', d.profile, d.socialLinks))).toEqual({});
    expect(validate('settings', settingsDraft(d.settings))).toEqual({});
    const failures = [
      ...d.experience.map((e) => [e.id, validate('experience', entryDraft('experience', e))]),
      ...d.projects.map((p) => [p.id, validate('projects', entryDraft('projects', p))]),
      ...d.articles.map((a) => [
        a.slug,
        validate('writing', entryDraft('writing', { ...a, id: a.slug })),
      ]),
      ...d.skillGroups.map((s) => [s.id, validate('skills', entryDraft('skills', s))]),
      ...d.quotes.map((q) => [q.id, validate('quotes', entryDraft('quotes', q))]),
    ].filter(([, errors]) => Object.keys(errors as object).length > 0);
    expect(failures).toEqual([]);
    expect(d.skillGroups.length).toBeLessThanOrEqual(4);
  });

  // Mirrors the CHECK constraints in supabase/migrations, so a database refusal fails here first.
  it('fits the database constraints', () => {
    for (const p of d.projects) expect(p.description.length).toBeLessThanOrEqual(320);
    for (const q of d.quotes) expect(q.text.length).toBeLessThanOrEqual(140);
    for (const a of d.articles) {
      expect(a.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      if (a.status === 'published') expect(a.body?.trim() || a.externalUrl).toBeTruthy();
    }
    for (const e of d.experience) {
      expect(e.startDate).toMatch(/^\d{4}-\d{2}$/);
      if (e.endDate) expect(e.endDate >= e.startDate).toBe(true);
    }
  });

  it('holds the awkward cases the layouts must survive, and the shipped ones', () => {
    expect(d.experience.some((e) => e.role.length > 60)).toBe(true);
    expect(d.experience.some((e) => e.summary === '')).toBe(true);
    expect(d.projects.some((p) => p.liveUrl === null && p.repoUrl === null)).toBe(true);
    expect(d.projects.some((p) => p.tags.length === 0)).toBe(true);
    expect(d.projects.some((p) => p.description.length === 320)).toBe(true);
    expect(d.projects.some((p) => !p.published)).toBe(true);
    expect(d.projects.some((p) => p.media.length > 1)).toBe(true);
    expect(d.projects.some((p) => p.media.length === 0 && p.image === null)).toBe(true);
    const kinds = d.projects.flatMap((p) => p.media.map((m) => m.src.split('.').pop()));
    expect(kinds).toEqual(expect.arrayContaining(['jpg', 'gif', 'mp4']));
    expect(d.articles.some((a) => a.body === null && a.externalUrl)).toBe(true);
    expect(d.articles.some((a) => a.status === 'draft')).toBe(true);
    expect(d.quotes.some((q) => q.text.length === 140)).toBe(true);
    expect(d.quotes.some((q) => !q.active)).toBe(true);
    expect(d.socialLinks.some((l) => l.label.length === 40)).toBe(true);
    expect(d.skillGroups.some((s) => s.items.length === 6)).toBe(true);
  });
});
