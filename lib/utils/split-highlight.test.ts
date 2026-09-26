import { describe, expect, it } from 'vitest';
import { splitHighlight } from './split-highlight';

describe('splitHighlight', () => {
  it('splits around the highlighted word, keeping punctuation after it', () => {
    expect(splitHighlight('I build quiet, careful software for the web.', 'web')).toEqual({
      before: 'I build quiet, careful software for the ',
      word: 'web',
      after: '.',
    });
  });

  it('matches whole words only', () => {
    expect(splitHighlight('The website on the web', 'web').before).toBe('The website on the ');
  });

  it('returns the whole text when there is no highlight or no match', () => {
    expect(splitHighlight('Hello there', null)).toEqual({
      before: 'Hello there',
      word: null,
      after: '',
    });
    expect(splitHighlight('Hello there', 'web').word).toBeNull();
  });

  it('treats regex characters in the word literally', () => {
    expect(splitHighlight('I like C++ a lot', 'C++').word).toBe('C++');
  });
});
