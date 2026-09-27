import { ViewTransition, type ReactNode } from 'react';

/** Transition types set by links: into an article, and back to the portfolio. */
export const TO_ARTICLE = ['to-article'];
export const TO_HOME = ['to-home'];

/**
 * The page as one sheet for page ↔ article navigation (CSS in styles/tokens.css). Wraps each
 * page's content, not the layout: the layout persists, so enter/exit would never fire there.
 * Untyped navigations (browser back/forward, refresh) don't animate.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition
      enter={{ 'to-article': 'page-in-forward', 'to-home': 'page-in-back', default: 'none' }}
      exit={{ 'to-article': 'page-out-forward', 'to-home': 'page-out-back', default: 'none' }}
      default="none"
    >
      {children}
    </ViewTransition>
  );
}
