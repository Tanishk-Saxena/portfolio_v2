import type { SkillGroup } from '@/lib/domain/types';

// PLACEHOLDER — verbatim from the mockup (Portfolio.dc.html skills).
export const skillGroups: SkillGroup[] = [
  {
    id: 'languages',
    title: 'Languages',
    items: ['TypeScript', 'Python', 'Go', 'SQL'],
    sortOrder: 1,
  },
  {
    id: 'frontend',
    title: 'Frontend',
    items: ['React', 'Angular', 'Svelte', 'CSS architecture'],
    sortOrder: 2,
  },
  { id: 'backend', title: 'Backend', items: ['Node', 'Django', 'Postgres', 'Redis'], sortOrder: 3 },
  {
    id: 'practice',
    title: 'Practice',
    items: ['Design systems', 'Accessibility', 'Performance', 'Technical writing'],
    sortOrder: 4,
  },
];
