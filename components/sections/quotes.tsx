import type { Quote } from '@/lib/domain/types';
import { QuoteRotator } from './quote-rotator';

/** Quotes (spec §7): no visible heading in the mockup, so it's named for assistive tech. */
export function Quotes({ quotes }: { quotes: Quote[] }) {
  if (quotes.length === 0) return null;

  return (
    <section
      id="quotes"
      aria-roledescription="carousel"
      aria-label="Quotes"
      className="measure-page scroll-mt-header border-t border-border-section py-section"
    >
      <QuoteRotator quotes={quotes} />
    </section>
  );
}
