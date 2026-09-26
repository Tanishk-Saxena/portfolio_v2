import type { ArticleSummary } from '@/lib/domain/types';
import { Section } from './section';
import { WritingList } from './writing-list';

/** Writing (spec §7): hairline rows linking to the article route (or out, for external posts). */
export function Writing({ articles }: { articles: ArticleSummary[] }) {
  if (articles.length === 0) return null;

  return (
    <Section id="writing" label="Writing">
      <WritingList articles={articles} />
    </Section>
  );
}
