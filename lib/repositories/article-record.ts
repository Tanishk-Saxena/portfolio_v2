import type { Article, ArticleSummary } from '@/lib/domain/types';
import { estimateReadMinutes } from '@/lib/utils/read-time';

/**
 * An article as stored: `hasBody` is derived, never authored, and `readMinutes` is an
 * optional override (`null` = estimate from the body, ADMIN-DESIGN-SPEC Q-A11).
 * Shared by every implementation, so derivation is identical whatever the source.
 */
export type ArticleRecord = Omit<Article, 'hasBody' | 'readMinutes'> & {
  readMinutes: number | null;
};

export function toArticle(record: ArticleRecord): Article {
  return {
    ...structuredClone(record),
    readMinutes: record.readMinutes ?? estimateReadMinutes(record.body),
    hasBody: record.body !== null && record.body.trim() !== '',
  };
}

export function toSummary(record: ArticleRecord): ArticleSummary {
  const { body: _body, ...summary } = toArticle(record);
  return summary;
}
