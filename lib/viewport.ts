/** Narrow = below the site's one breakpoint (760px, `@wide/page`): the phone layout. */
export const isNarrow = () => window.matchMedia('(width < 760px)').matches;
