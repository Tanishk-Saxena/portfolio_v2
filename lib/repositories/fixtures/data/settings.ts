import type { Settings } from '@/lib/domain/types';

// The shipped look (ADMIN-DESIGN-SPEC §8.9): stored now, switched on by Phase 8.5.
export const settings: Settings = {
  accent: 'terracotta',
  grain: 6, // --grain-opacity: 0.06 (Q5)
  navPosition: 'right',
  menuLayout: 'arc',
};
