/** Words per minute behind the estimate (ADMIN-DESIGN-SPEC §8.6). */
export const WORDS_PER_MINUTE = 220;

/** Words in a Markdown body: whitespace-separated runs that contain a letter or digit. */
export function countWords(markdown: string): number {
  return markdown.split(/\s+/).filter((token) => /[\p{L}\p{N}]/u.test(token)).length;
}

/** `max(1, round(words / 220))`: the read time shown when none is stored. */
export function estimateReadMinutes(markdown: string | null): number {
  return Math.max(1, Math.round(countWords(markdown ?? '') / WORDS_PER_MINUTE));
}
