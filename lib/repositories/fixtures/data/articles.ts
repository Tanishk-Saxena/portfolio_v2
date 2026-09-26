import type { ArticleRecord } from '../dataset';

// PLACEHOLDER — titles, dates and read times are mockup copy (Portfolio.dc.html POSTS,
// Article.dc.html ARTICLES). The first body is the mockup's article text; the rest are stubs.

const SECOND_RENDER_BODY = `Every performance conversation starts at the first paint, because that is the number the tooling hands you. The moment users actually judge, though, is the second render: the one that happens after they touch something.

A cold load has a story around it. People expect a pause when they arrive somewhere new, and a skeleton screen buys more patience than it has any right to. Tap a filter and wait two hundred milliseconds, though, and the interface feels broken in a way no loading bar repairs. The contract changed: you promised a response, not an arrival.

## What the second render costs

On the last product I worked on, the initial load was a respectable 1.2 seconds. Switching a tab took 240 milliseconds, most of it spent re-deriving a list that had not changed. Nobody filed a bug about the cold start. Three people filed bugs about the tabs.

> Users forgive a slow arrival. They do not forgive a slow answer.

The fix was unglamorous. Memoise the derivation, move the filter state out of the tree that owned the layout, and stop recreating the row components on every keystroke. None of it showed up in the lighthouse score. All of it showed up in how the product felt.

## Measuring the thing you care about

Record an interaction trace instead of a page load. Pick the three actions people take most, put a mark at the event and another at the committed frame, and watch that number in CI the way you watch bundle size. It is a less impressive metric to put in a deck, and a much better one to design against.

The rest is discipline: keep the work small, keep it off the main thread when you can, and treat a re-render as something you have to justify rather than something that happens to you.`;

const stub = (title: string) =>
  `This is a placeholder for “${title}”. The full article is still being written.`;

type Row = [slug: string, title: string, readMinutes: number, publishedAt: string];

const ROWS: Row[] = [
  ['second-render', 'The second render is the one users feel', 6, '2026-08-14'],
  ['error-copy', 'Notes on writing error copy that helps', 4, '2026-05-02'],
  ['spacing-scale', 'A spacing scale you can defend in review', 9, '2026-02-19'],
  ['design-systems', 'Design systems die in the gap between the two teams', 7, '2025-11-01'],
  ['code-review', 'What I look for first in a code review', 5, '2025-09-01'],
  ['side-projects', 'Finishing things: a short defence of the small project', 3, '2025-06-01'],
  ['empty-states', 'The empty state is the first screen most people see', 6, '2025-03-01'],
  ['estimates', 'Why my estimates got better when they got vaguer', 4, '2024-12-01'],
  ['typography-ui', 'Reading the interface: type choices that carry weight', 8, '2024-10-01'],
  ['first-90-days', 'Notes from ninety days on an unfamiliar codebase', 5, '2024-07-01'],
];

export const articles: ArticleRecord[] = ROWS.map(([slug, title, readMinutes, publishedAt]) => ({
  slug,
  title,
  excerpt: '',
  publishedAt,
  readMinutes,
  externalUrl: null,
  body: slug === 'second-render' ? SECOND_RENDER_BODY : stub(title),
}));
