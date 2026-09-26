export interface HighlightParts {
  before: string;
  word: string | null;
  after: string;
}

/**
 * Splits a headline around the first whole-word occurrence of `word`, so the hero can set
 * that word in the handwriting face. Falls back to no highlight when the word is missing.
 */
export function splitHighlight(text: string, word: string | null): HighlightParts {
  if (!word) return { before: text, word: null, after: '' };
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = new RegExp(`(^|[^\\p{L}\\p{N}])(${escaped})(?=$|[^\\p{L}\\p{N}])`, 'u').exec(text);
  if (!match) return { before: text, word: null, after: '' };
  const start = match.index + match[1].length;
  return {
    before: text.slice(0, start),
    word: text.slice(start, start + word.length),
    after: text.slice(start + word.length),
  };
}
