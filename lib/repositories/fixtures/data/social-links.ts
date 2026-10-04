import type { SocialLink } from '@/lib/domain/types';

// PLACEHOLDER — the mockup's four links; URLs point at each service's home page until real
// ones are entered through the admin portal, where the list can grow, shrink and reorder.
export const socialLinks: SocialLink[] = [
  { id: 'github', label: 'GitHub', url: 'https://github.com/', sortOrder: 1 },
  { id: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/', sortOrder: 2 },
  { id: 'read-cv', label: 'Read.cv', url: 'https://read.cv/', sortOrder: 3 },
  { id: 'x', label: 'X', url: 'https://x.com/', sortOrder: 4 },
];
