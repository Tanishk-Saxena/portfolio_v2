import { describe, expect, it } from 'vitest';
import { toSummary } from '@/lib/repositories/article-record';
import { seedContent as d } from '@/lib/seed';
import { type AdminContent, countLine, filterRows, toRows } from './rows';
import { findSection, SECTIONS, sectionFromPath } from './sections';

/** The admin's lists as the repositories return them: every row, in display order. */
async function content(): Promise<AdminContent> {
  return {
    experience: d.experience,
    projects: d.projects,
    writing: d.articles
      .map((a) => ({ id: a.slug, ...toSummary(a) }))
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)),
    skills: d.skillGroups,
    quotes: d.quotes,
  };
}

describe('admin lists', () => {
  it('rows carry the mockup copy: meta, status pills, quoted quotes', async () => {
    const c = await content();
    const experience = toRows('experience', c);
    expect(experience.some((r) => / — now$/.test(r.meta))).toBe(true);
    expect(experience.every((r) => /^\d{4}( — (\d{4}|now))?$/.test(r.meta))).toBe(true);

    const writing = toRows('writing', c);
    const draft = writing.find((r) => r.sub === '/articles/draft-only');
    expect(draft?.status).toEqual({ label: 'Draft', live: false });
    // The site's own date format, so the admin and the Writing list agree.
    expect(writing[0].meta).toMatch(/^[A-Z][a-z]+ \d{4} · \d+ min$/);

    const quotes = toRows('quotes', c);
    expect(quotes.find((r) => r.id === 'stress-skipped')?.status?.label).toBe('Skipped');
    expect(quotes.every((r) => r.title.startsWith('“') && r.title.endsWith('”'))).toBe(true);
    expect(toRows('projects', c).every((r) => r.status && r.meta.match(/^\d{4}$/))).toBe(true);
  });

  it('search and filter narrow the rows; the count line names the order', async () => {
    const rows = toRows('writing', await content());
    expect(filterRows(rows, '', 'All')).toHaveLength(rows.length);
    expect(filterRows(rows, '', 'Draft').every((r) => r.status?.label === 'Draft')).toBe(true);
    expect(filterRows(rows, '  DRAFT-ONLY ', 'All').map((r) => r.sub)).toEqual([
      '/articles/draft-only',
    ]);
    expect(filterRows(rows, 'draft-only', 'Published')).toEqual([]);

    expect(countLine(SECTIONS.experience, 1)).toBe('1 role · shown on the site in this order');
    expect(countLine(SECTIONS.writing, 3)).toBe('3 articles · newest first');
  });

  it('routes resolve to sections; anything else is unknown', () => {
    expect(findSection('projects')?.kind).toBe('collection');
    expect(findSection('hero')?.kind).toBe('single');
    expect(findSection('toString')).toBeNull();
    expect(sectionFromPath('/admin/skills/languages')?.slug).toBe('skills');
    expect(sectionFromPath('/admin')).toBeNull();
  });
});
