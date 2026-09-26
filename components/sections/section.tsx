import type { ReactNode } from 'react';

/** A standard paper section: page measure, hairline rule above, section rhythm (spec §4.2). */
export function Section({
  id,
  label,
  children,
  className = '',
}: {
  id: string;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={`measure-page scroll-mt-header border-t border-border-section py-section ${className}`}
    >
      <SectionHeading id={`${id}-heading`}>{label}</SectionHeading>
      {children}
    </section>
  );
}

/** Section title: the word alone, in accent, one step up (spec §2.2 h2). */
export function SectionHeading({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="mb-10.5 font-serif text-h2 text-accent">
      {children}
    </h2>
  );
}
