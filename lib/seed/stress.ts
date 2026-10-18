import type { Experience, Project, Quote, SkillGroup, SocialLink } from '@/lib/domain/types';
import type { ArticleRecord } from './content';

/*
 * The awkward cases every layout must survive (brief §3 "Content robustness"), added to the
 * shipped placeholders in the one seed (`./index.ts`). Each sits at a real limit (the database
 * checks and the admin's validation), never past it: the worst content the admin can save.
 */

/** Exactly `length` characters of plausible prose, ending on a full stop. */
const prose = (length: number) => {
  const words =
    'Rebuilt the order-entry blotter around a virtualised grid and cut steady-state CPU by a third on the desks that run it all day, then wrote the migration guide the other teams actually used. ';
  return `${words.repeat(Math.ceil(length / words.length)).slice(0, length - 1)}.`;
};

export const stressExperience: Omit<Experience, 'sortOrder'>[] = [
  {
    id: 'stress-long-role',
    role: 'Senior Software Engineer II, Frontend Platform & Developer Experience (Trading Systems)',
    org: 'A Company With An Unreasonably Long Legal Name Private Limited',
    startDate: '2019-04',
    endDate: '2019-12',
    summary: `${prose(400)}\n\n${prose(300)}`,
  },
  {
    id: 'stress-empty-summary',
    role: 'Engineer',
    org: 'ION',
    startDate: '2018-07',
    endDate: '2019-03',
    summary: '',
  },
];

export const stressProjects: Omit<Project, 'sortOrder'>[] = [
  {
    id: 'stress-long-name',
    title: 'An Exceptionally Long Project Name That Wraps Onto Two Lines At Least',
    kind: 'open-source',
    year: 2019,
    description: prose(320), // the limit
    tags: ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven'],
    image: null,
    media: [1, 2, 3].map((n) => ({ kind: 'image' as const, src: `/placeholder/media-${n}.svg` })),
    repoUrl: null,
    liveUrl: null, // no links at all
    published: true,
  },
  {
    id: 'stress-empty',
    title: 'P',
    kind: 'client-work',
    year: 2018,
    description: '',
    tags: [],
    image: null,
    media: [],
    repoUrl: 'https://example.com/source/stress-empty',
    liveUrl: null,
    published: true,
  },
  {
    id: 'stress-hidden',
    title: 'A hidden project that must never reach the site',
    kind: 'side-project',
    year: 2018,
    description: 'Hidden.',
    tags: ['Tag'],
    image: null,
    media: [],
    repoUrl: null,
    liveUrl: null,
    published: false,
  },
];

export const stressArticles: ArticleRecord[] = [
  {
    slug: 'external-only',
    title: 'An article that only lives on Medium, so the row links out',
    excerpt: '',
    publishedAt: '2024-05-01',
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
];

/** Replaces the last shipped group: four groups at most, six items at most. */
export const stressSkillGroup: Omit<SkillGroup, 'sortOrder'> = {
  id: 'stress-many',
  title: 'A group with a long title and as many items as one holds',
  items: [
    'Item one',
    'A considerably longer skill name that wraps',
    'Three',
    'Four',
    'Five',
    'Six',
  ],
};

export const stressQuotes: Omit<Quote, 'sortOrder'>[] = [
  { id: 'stress-short', text: 'Ship it.', author: 'Anon', active: true },
  {
    id: 'stress-long',
    text: prose(140), // the limit
    author: 'Someone With A Very Long Attribution Line, Author Of Several Books',
    active: true,
  },
  { id: 'stress-skipped', text: 'Out of rotation.', author: 'Anon', active: false },
];

export const stressSocialLinks: Omit<SocialLink, 'sortOrder'>[] = [
  { id: 'stress-mastodon', label: 'Mastodon', url: 'https://example.com/mastodon' },
  // At the 40-character label limit. Every link has a URL: an empty one is refused (§14).
  {
    id: 'stress-long-link',
    label: 'A long label for a link, at the limit ok',
    url: 'https://example.com/long-label',
  },
];
