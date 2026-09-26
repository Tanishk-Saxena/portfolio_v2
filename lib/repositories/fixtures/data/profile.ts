import type { Profile } from '@/lib/domain/types';

// PLACEHOLDER — all copy is verbatim from the mockup (Portfolio.dc.html). It seeds Supabase in
// Phase 6 and is replaced by real content through the admin portal.
export const profile: Profile = {
  name: 'Tanishk Saxena',
  eyebrow: 'Tanishk Saxena — SDE, Delhi',
  headline: 'I build quiet, careful software for the web.',
  headlineHighlight: 'web',
  standfirst:
    'Six years turning tangled requirements into interfaces people can actually use. Currently working on developer tooling and design systems.',
  aboutLead:
    'I care about the unglamorous parts: the empty state, the error copy, the second render.',
  aboutParagraphs: [
    'I started out writing Django views for a logistics company and stayed because I liked watching people use the thing I made. Since then I have worked mostly at the seam between design and engineering — building component libraries, arguing about spacing scales, and shipping the boring infrastructure that makes a product feel fast.',
    'Away from the editor I read a lot of non-fiction, run slowly, and keep a notebook of interfaces I wish existed. If you are building something thoughtful, I would like to hear about it.',
  ],
  portrait: null, // renders the mockup's "Portrait" placeholder frame
  resumeUrl: '/placeholder/resume.pdf',
  email: 'hello@example.com',
  contactStatement: 'Tell me what you are building.',
  location: 'Delhi',
  footerNote: 'Designed and built in Delhi',
};
