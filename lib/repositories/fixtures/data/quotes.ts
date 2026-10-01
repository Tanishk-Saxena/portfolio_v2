import type { Quote } from '@/lib/domain/types';

// Verbatim from the mockup (Portfolio.dc.html QUOTES).
const QUOTES: [string, string][] = [
  ['Simplicity is prerequisite for reliability.', 'Edsger W. Dijkstra'],
  [
    'Programs must be written for people to read, and only incidentally for machines to execute.',
    'Harold Abelson',
  ],
  ['Premature optimization is the root of all evil.', 'Donald Knuth'],
  ['Design is not just what it looks like and feels like. Design is how it works.', 'Steve Jobs'],
  ['Talk is cheap. Show me the code.', 'Linus Torvalds'],
  [
    'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.',
    'Martin Fowler',
  ],
];

export const quotes: Quote[] = QUOTES.map(([text, author], i) => ({
  id: `quote-${i + 1}`,
  text,
  author,
  active: true,
  sortOrder: i + 1,
}));
