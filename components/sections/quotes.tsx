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
      data-reveal-group
      className="measure-page -scroll-mt-px border-t border-border-section py-section @wide/page:scroll-mt-[calc(var(--spacing-header)-1px)]"
    >
      <QuoteRotator quotes={quotes} />
    </section>
  );
}
