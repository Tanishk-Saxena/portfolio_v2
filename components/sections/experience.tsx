import type { Experience as ExperienceItem } from '@/lib/domain/types';
import { formatYearRange } from '@/lib/utils/format';
import { renderSimpleMarkdown } from '@/lib/utils/markdown';
import { ExperienceRow } from './experience-row';
import { Section } from './section';

/**
 * Experience (spec §7): hairline rows, newest first, summary expands in place. The summary is
 * simple Markdown (§10, Phase 9 item 30), rendered here on the server so the row's client
 * bundle carries no parser.
 */
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
            summaryHtml={item.summary.trim() ? renderSimpleMarkdown(item.summary) : ''}
          />
        ))}
      </div>
    </Section>
  );
}
