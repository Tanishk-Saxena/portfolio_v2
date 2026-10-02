import { describe, expect, it } from 'vitest';
import { defaultDataset } from '@/lib/repositories/fixtures/data';
import { applySingle, entryDraft, entryValues, singleDraft, socialUrls } from './forms';
import { parseDraft, validate } from './schema';

const experience = (over: Record<string, unknown> = {}) => ({
  ...entryDraft('experience'),
  role: 'Engineer',
  org: 'Acme',
  startYear: '2021',
  endYear: '2023',
  ...over,
});

describe('admin schema', () => {
  it('validates every rule with the mockup copy; hidden fields are skipped', () => {
    expect(validate('quotes', { text: '', author: 'A', active: true })).toEqual({
      text: 'Quote is required.',
    });
    expect(validate('quotes', { text: 'x'.repeat(141), author: 'A', active: true }).text).toBe(
      'Too long: 141 of 140 characters.',
    );
    const contact = singleDraft('contact', defaultDataset.profile, defaultDataset.socialLinks);
    expect(validate('contact', { ...contact, email: 'nope', github: 'github.com/me' })).toEqual({
      email: 'Enter a valid email address.',
      github: 'Enter a full address starting with https://',
    });
    const hero = singleDraft('hero', defaultDataset.profile, []);
    expect(validate('hero', { ...hero, headlineHighlight: 'zebra' }).headlineHighlight).toBe(
      '“zebra” does not appear in the headline.',
    );

    expect(validate('experience', experience())).toEqual({});
    expect(validate('experience', experience({ endYear: '' })).endYear).toBe(
      'Add an end year or mark this as the current role.',
    );
    expect(validate('experience', experience({ endYear: '2019' })).endYear).toMatch(/before/);
    expect(validate('experience', experience({ startYear: '21' })).startYear).toBe(
      'Enter a four-digit year.',
    );
    expect(validate('experience', experience({ current: true, endYear: '' }))).toEqual({});
  });

  it('parses only well-formed drafts: known fields, each of its own type', () => {
    expect(parseDraft('quotes', { text: 'a', author: 'b', active: true, extra: 1 })).toEqual({
      text: 'a',
      author: 'b',
      active: true,
    });
    expect(parseDraft('quotes', { text: 'a', author: 'b', active: 'yes' })).toBeNull();
    expect(parseDraft('skills', { title: 't', items: ['a', 2] })).toBeNull();
    expect(parseDraft('skills', null)).toBeNull();
  });

  it('drafts round-trip to the domain', () => {
    const p = defaultDataset.profile;
    const about = applySingle('about', p, { aboutLead: ' Lead ', aboutBody: 'One.\n\n\nTwo.\n' });
    expect(about.aboutLead).toBe('Lead');
    expect(about.aboutParagraphs).toEqual(['One.', 'Two.']);
    expect(
      applySingle('hero', p, { ...singleDraft('hero', p, []), headlineHighlight: ' ' }),
    ).toMatchObject({ headlineHighlight: null, name: p.name });
    expect(socialUrls({ github: ' https://github.com/me ', x: '' })).toMatchObject({
      github: 'https://github.com/me',
      x: '',
      linkedin: '',
    });

    // An unchanged year keeps its stored month; a new year starts in January.
    const stored = { ...defaultDataset.experience[0], startDate: '2021-06', endDate: '2023-03' };
    const draft = entryDraft('experience', stored);
    expect(entryValues('experience', draft, stored)).toMatchObject({
      startDate: '2021-06',
      endDate: '2023-03',
    });
    expect(entryValues('experience', { ...draft, endYear: '2024' }, stored).endDate).toBe(
      '2024-01',
    );
    expect(entryValues('experience', { ...draft, current: true }, stored).endDate).toBeNull();
  });
});
