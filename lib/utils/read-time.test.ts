import { describe, expect, it } from 'vitest';
import { countWords, estimateReadMinutes } from './read-time';

describe('read time', () => {
  it('counts words, not Markdown syntax', () => {
    expect(countWords('## A heading\n\n> quoted - text\n\n- one\n- two')).toBe(6);
  });

  it('rounds to the nearest minute at 220 words per minute', () => {
    expect(estimateReadMinutes('word '.repeat(220 * 3))).toBe(3);
    expect(estimateReadMinutes('word '.repeat(220 * 3 + 120))).toBe(4);
  });

  it('never estimates less than a minute, even with no body', () => {
    expect(estimateReadMinutes('Short.')).toBe(1);
    expect(estimateReadMinutes(null)).toBe(1);
  });
});
