import type { ContributionCalendar, SkillGroup } from '@/lib/domain/types';
import { Contributions } from './contributions';
import { Section } from './section';

/**
 * Skills (spec §10 "Skills layout"): each group's items as outlined chips, no bars or
 * percentages. Phones stack a group's label over its chips; wide screens set them as ruled
 * rows, the label in a fixed column beside its chips, like the experience rows. The GitHub
 * heat map, when there is one, closes the section (§10 "Contributions").
 */
export function Skills({
  groups,
  contributions,
  githubUsername,
}: {
  groups: SkillGroup[];
  contributions: ContributionCalendar | null;
  githubUsername: string;
}) {
  if (groups.length === 0) return null;

  return (
    <Section id="skills" label="Skills">
      <div className="flex flex-col gap-6.5 @wide/page:gap-0">
        {groups.map((group) => (
          <div
            key={group.id}
            className="flex flex-col gap-3 @wide/page:grid @wide/page:grid-cols-[var(--spacing-skills-label)_minmax(0,1fr)] @wide/page:items-center @wide/page:gap-x-6 @wide/page:border-t @wide/page:border-border-row @wide/page:py-5 @wide/page:first:border-t-0 @wide/page:first:pt-0 @wide/page:last:pb-0"
          >
            <h3 className="text-label font-medium tracking-label text-muted uppercase">
              {group.title}
            </h3>
            <ul className="flex flex-wrap gap-2">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="rounded-pill border border-border-control px-3.75 py-1.5 text-body-sm"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {contributions && <Contributions calendar={contributions} username={githubUsername} />}
    </Section>
  );
}
