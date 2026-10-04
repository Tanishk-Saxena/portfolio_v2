import type { FixtureDataset } from '../dataset';
import { defaultDataset } from '.';

/*
 * Deliberately awkward content (brief §3 "Content robustness", Phase 2 checklist).
 * Run the site against it with DATA_SOURCE=fixtures-stress. Every layout must survive:
 * long names, empty optional fields, missing media, and many more items than the mockup.
 */

const LONG =
  'Rebuilt the order-entry blotter around a virtualised grid, cut steady-state CPU by a third on the desks that run it all day, wrote the migration guide the other teams actually used, and ran the brown-bag series on change detection that turned into the house style.';

export const stressDataset: FixtureDataset = {
  profile: {
    ...defaultDataset.profile,
    name: 'Tanishk Saxena',
    eyebrow: 'Tanishk Saxena — Senior Software Development Engineer, Frontend Platform, New Delhi',
    headline:
      'I build quiet, careful, uncommonly well-behaved software for people who spend all day inside it.',
    headlineHighlight: null, // no highlighted word
    standfirst: `${LONG} ${LONG}`,
    aboutParagraphs: [LONG, LONG, 'Short one.', LONG],
    portrait: null,
    resumeUrl: null,
    email: 'a.very.long.address.for.layout.testing@example-long-domain-name.com',
  },
  experience: [
    {
      id: 'current-long-title',
      role: 'Senior Software Engineer II, Frontend Platform & Developer Experience (Trading Systems)',
      org: 'A Company With An Unreasonably Long Legal Name Private Limited',
      startDate: '2025-04',
      endDate: null,
      summary: `${LONG} ${LONG}`,
      sortOrder: 1,
    },
    {
      id: 'empty-summary',
      role: 'Engineer',
      org: 'ION',
      startDate: '2024-07',
      endDate: '2025-03',
      summary: '', // empty optional content
      sortOrder: 2,
    },
    ...Array.from({ length: 4 }, (_, i) => ({
      id: `filler-${i}`,
      role: 'Software Engineering Intern',
      org: `Company ${i + 1}`,
      startDate: `202${3 - i}-01`,
      endDate: `202${3 - i}-06`,
      summary: 'A short note.',
      sortOrder: 3 + i,
    })),
  ],
  projects: Array.from({ length: 8 }, (_, i) => ({
    id: `stress-project-${i}`,
    title:
      i === 0 ? 'An Exceptionally Long Project Name That Wraps Onto Two Lines At Least' : `P${i}`,
    kind: (['open-source', 'side-project', 'client-work'] as const)[i % 3],
    year: 2026 - i,
    summary: i === 1 ? '' : 'Summary.',
    description: i === 2 ? `${LONG} ${LONG} ${LONG}` : 'Short description.',
    tags:
      i === 3 ? ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven'] : i === 4 ? [] : ['Tag'],
    image: null,
    repoUrl: i === 5 ? null : 'https://github.com/Tanishk-Saxena',
    liveUrl: i % 2 === 0 ? 'https://example.com' : null,
    published: i !== 7, // the last one is hidden
    sortOrder: i + 1,
  })),
  articles: [
    ...defaultDataset.articles,
    {
      slug: 'external-only',
      title: 'An article that only lives on Medium, so the row links out',
      excerpt: '',
      publishedAt: '2026-09-01',
      readMinutes: 45,
      status: 'published',
      listen: true,
      externalUrl: 'https://medium.com/',
      body: null,
    },
    {
      slug: 'very-long-title',
      title:
        'A very long article title that keeps going well past the point where any sensible editor would have cut it, just to see what the row does',
      excerpt: '',
      publishedAt: '2023-01-15',
      readMinutes: null, // estimated from the body
      externalUrl: null,
      body: 'Short.',
      status: 'published',
      listen: false, // no Listen button
    },
    {
      slug: 'draft-only',
      title: 'A draft that must never reach the site',
      excerpt: '',
      publishedAt: '2026-09-30',
      readMinutes: null,
      externalUrl: null,
      body: 'Not ready yet.',
      status: 'draft',
      listen: true,
    },
  ],
  skillGroups: [
    // The admin's limits hold here too: four groups, four to six items each.
    ...defaultDataset.skillGroups.slice(0, 3),
    {
      id: 'many',
      title: 'A group with a long title and as many items as one holds',
      items: [
        'Item one',
        'A considerably longer skill name that wraps',
        ...Array.from({ length: 4 }, (_, i) => `Item ${i + 3}`),
      ],
      sortOrder: 4,
    },
  ],
  quotes: [
    { id: 'short', text: 'Ship it.', author: 'Anon', active: true, sortOrder: 1 },
    {
      id: 'long',
      text: `${LONG} ${LONG}`,
      author: 'Someone With A Very Long Attribution Line, Author Of Several Books',
      active: true,
      sortOrder: 2,
    },
    { id: 'skipped', text: 'Out of rotation.', author: 'Anon', active: false, sortOrder: 3 },
  ],
  socialLinks: Array.from({ length: 6 }, (_, i) => ({
    id: `social-${i}`,
    label: ['GitHub', 'LinkedIn', 'Read.cv', 'X', 'Mastodon', 'A long label'][i],
    url: i === 5 ? '' : 'https://example.com', // an empty URL hides the link
    sortOrder: i + 1,
  })),
  settings: defaultDataset.settings,
};
