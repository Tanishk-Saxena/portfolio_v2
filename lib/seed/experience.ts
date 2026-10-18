import type { Experience } from '@/lib/domain/types';

// PLACEHOLDER — the mockup's three roles (Portfolio.dc.html ROLES). Year-only ranges in the
// mockup ("2023 — now") are stored as January of that year.
export const experience: Experience[] = [
  {
    id: 'northwind-labs',
    role: 'Senior Frontend Engineer',
    org: 'Northwind Labs',
    startDate: '2023-01',
    endDate: null,
    summary:
      'Own the design system and the editor surface.\n\n- Cut first-paint **by half**.\n- Made the component API something designers can *read*.',
    sortOrder: 1,
  },
  {
    id: 'kettle',
    role: 'Product Engineer',
    org: 'Kettle',
    startDate: '2021-01',
    endDate: '2023-01',
    summary:
      'Second engineering hire. Built the billing flow, the onboarding, and most of the internal tooling that replaced it.',
    sortOrder: 2,
  },
  {
    id: 'gravel-logistics',
    role: 'Software Engineer',
    org: 'Gravel Logistics',
    startDate: '2019-01',
    endDate: '2021-01',
    summary:
      'Django and a lot of spreadsheets. Learned to ask what the operations team actually does before shipping anything.',
    sortOrder: 3,
  },
];
