import type { Experience as ExperienceItem } from '@/lib/domain/types';
import { formatYearRange } from '@/lib/utils/format';
import { ExperienceRow } from './experience-row';
import { Section } from './section';

/** Experience (spec §7): hairline rows, newest first, summary expands in place. */
export function Experience({ items }: { items: ExperienceItem[] }) {
  if (items.length === 0) return null;

  return (
    <Section id="experience" label="Experience">
      <div className="flex flex-col">
        {items.map((item) => (
          <ExperienceRow
            key={item.id}
            role={item.role}
            org={item.org}
            years={formatYearRange(item.startDate, item.endDate)}
            summary={item.summary}
          />
        ))}
      </div>
    </Section>
  );
}
