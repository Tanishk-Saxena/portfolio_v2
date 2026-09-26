import type { SkillGroup } from '@/lib/domain/types';
import { Section } from './section';

/** Skills (spec §7): labelled columns of serif items, no bars or percentages. */
export function Skills({ groups }: { groups: SkillGroup[] }) {
  if (groups.length === 0) return null;

  return (
    <Section id="skills" label="Skills">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(146px,1fr))] gap-x-grid-skills-col gap-y-grid-skills-row">
        {groups.map((group) => (
          <div key={group.id}>
            <h3 className="mb-4.5 text-label font-medium tracking-label text-muted uppercase">
              {group.title}
            </h3>
            <ul className="flex flex-col gap-2.75">
              {group.items.map((item) => (
                <li key={item} className="font-serif text-list-serif font-light">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
