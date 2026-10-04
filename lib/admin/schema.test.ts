import { describe, expect, it } from 'vitest';
import { defaultDataset } from '@/lib/repositories/fixtures/data';
import {
  applySingle,
  duplicateDraft,
  entryDraft,
  entryValues,
  settingsDraft,
  settingsValues,
  singleDraft,
  slugify,
  socialUrls,
} from './forms';
import { parseDraft, validate } from './schema';
import { checkUpload } from './uploads';

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

  it('writing: slug rules, the publish rule, read time; slugs follow titles', () => {
    const article = { ...entryDraft('writing'), title: 'On shipping', slug: 'on-shipping' };
    expect(validate('writing', article)).toEqual({});
    expect(validate('writing', { ...article, slug: 'On Shipping!' }).slug).toBe(
      'Use lowercase letters, numbers and single hyphens.',
    );
    expect(validate('writing', article, { takenSlugs: ['on-shipping'] }).slug).toBe(
      'Another article already uses this slug.',
    );
    expect(validate('writing', { ...article, status: 'published' }).status).toBe(
      'Add a body before publishing',
    );
    expect(
      validate('writing', { ...article, status: 'published', externalUrl: 'https://medium.com/x' }),
    ).toEqual({});
    // A body or an External URL, never both.
    expect(
      validate('writing', { ...article, body: 'Text', externalUrl: 'https://medium.com/x' }),
    ).toEqual({ externalUrl: 'An article has a body or an External URL, not both. Clear one.' });
    // A skill group holds four to six items.
    const group = (n: number) => ({ title: 'Languages', items: Array.from({ length: n }, String) });
    expect(validate('skills', group(4))).toEqual({});
    expect(validate('skills', group(6))).toEqual({});
    expect(validate('skills', group(1)).items).toBe('Add 4 to 6 items: there is 1.');
    expect(validate('skills', group(7)).items).toBe('Add 4 to 6 items: there are 7.');
    expect(validate('writing', { ...article, readMinutes: '0' }).readMinutes).toMatch(
      /whole minutes/,
    );
    expect(entryValues('writing', { ...article, readMinutes: '' })).toMatchObject({
      readMinutes: null, // blank = the estimate
      body: null,
      status: 'draft',
    });
    expect(slugify('  Ça va? On shipping — less!  ')).toBe('ca-va-on-shipping-less');
    expect(slugify('x'.repeat(80))).toHaveLength(64);
    expect(duplicateDraft('writing', article)).toMatchObject({
      title: 'On shipping (copy)',
      slug: 'on-shipping-copy',
      status: 'draft',
    });
  });

  it('images and files: sizes kept, portrait alt, focal point, upload limits', () => {
    const p = { ...defaultDataset.profile, name: 'Ada' };
    const image = {
      src: 'https://x.supabase.co/storage/v1/object/public/media/a.jpg',
      width: 900,
      height: 1125,
    };
    expect(parseDraft('about', { aboutLead: 'L', aboutBody: '', portrait: image })).not.toBeNull();
    expect(
      parseDraft('about', { aboutLead: 'L', aboutBody: '', portrait: { src: 'x' } }),
    ).toBeNull();
    const withFocus = { ...p, portrait: { ...image, alt: '', focalPoint: '50% 20%' } };
    expect(
      applySingle('about', withFocus, { aboutLead: 'L', aboutBody: '', portrait: image }).portrait,
    ).toEqual({ ...image, alt: 'Portrait of Ada', focalPoint: '50% 20%' });
    const replaced = { ...image, src: image.src.replace('a.jpg', 'b.jpg') };
    expect(
      applySingle('about', withFocus, { aboutLead: 'L', aboutBody: '', portrait: replaced })
        .portrait,
    ).not.toHaveProperty('focalPoint');

    const project = entryDraft('projects');
    expect(project).toMatchObject({ kind: 'side-project', published: false, image: null });
    expect(validate('projects', { ...project, title: 'P', year: '20' }).year).toBe(
      'Enter a four-digit year.',
    );
    expect(parseDraft('projects', { ...project, kind: 'hobby' })).toBeNull();
    expect(duplicateDraft('projects', { ...project, title: 'P', published: true })).toMatchObject({
      title: 'P (copy)',
      published: false,
    });

    expect(checkUpload('image', 'image/webp', 4 * 1024 * 1024)).toBeNull();
    expect(checkUpload('image', 'image/gif', 1000)).toMatch(/JPG, PNG or WebP/);
    expect(checkUpload('image', 'image/png', 6 * 1024 * 1024)).toMatch(/5 MB/);
    expect(checkUpload('pdf', 'application/pdf', 9 * 1024 * 1024)).toBeNull();
    expect(checkUpload('pdf', 'image/png', 1000)).toMatch(/PDF/);

    // A project's modal media: six at most, no file twice, and the same rules on the server
    // (the route handlers run this validate() and parseDraft()).
    expect(checkUpload('media', 'image/gif', 9 * 1024 * 1024)).toBeNull();
    expect(checkUpload('media', 'video/mp4', 11 * 1024 * 1024)).toMatch(/10 MB/);
    expect(checkUpload('media', 'video/quicktime', 1000)).toMatch(/MP4 or WebM/);
    const bare = { ...entryDraft('projects'), title: 'P' };
    const media = (n: number) =>
      Array.from({ length: n }, (_, i) => ({ kind: 'image' as const, src: `/samples/${i}.jpg` }));
    expect(validate('projects', { ...bare, media: media(6) })).toEqual({});
    expect(validate('projects', { ...bare, media: media(7) }).media).toBe('6 items at most.');
    expect(validate('projects', { ...bare, media: [...media(1), ...media(1)] }).media).toBe(
      'The same file is listed twice.',
    );
    expect(parseDraft('projects', { ...bare, media: [{ kind: 'audio', src: 'x' }] })).toBeNull();
    expect(entryValues('projects', { ...bare, media: media(2) })).toMatchObject({
      media: media(2),
    });
  });

  it('settings: the shipped look round-trips; the grain stays on its 0.5 steps', () => {
    const shipped = defaultDataset.settings;
    const draft = settingsDraft(shipped);
    expect(validate('settings', draft)).toEqual({});
    expect(settingsValues(draft)).toEqual(shipped);
    for (const grain of ['0', '6.5', '24']) {
      expect(validate('settings', { ...draft, grain })).toEqual({});
    }
    for (const grain of ['6.3', '25', '-1', 'x']) {
      expect(validate('settings', { ...draft, grain }).grain).toBe('Choose a value from 0 to 24.');
    }
    expect(parseDraft('settings', { ...draft, accent: 'teal' })).toBeNull();
    expect(settingsValues({ ...draft, accent: 'slate', grain: '12.5' })).toMatchObject({
      accent: 'slate',
      grain: 12.5,
    });
  });
});
