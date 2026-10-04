import { describe, expect, it } from 'vitest';
import { arcAngles, navAngles } from './arc';
import { formatLongDate, formatMonthYear, formatProjectKind, formatYearRange } from './format';
import { plainExcerpt, renderMarkdown, renderSimpleMarkdown } from './markdown';
import { countWords, estimateReadMinutes } from './read-time';
import { splitHighlight } from './split-highlight';

// The small pure helpers the site and admin share, one test each (two for markdown: its
// sanitising is a security property).

describe('utils', () => {
  it('arcAngles / navAngles: the mockup geometry for both positions and both layouts', () => {
    const angles = arcAngles(6);
    expect(angles[0]).toBe(-177);
    expect(angles[5]).toBe(-93);
    expect(angles[1] - angles[0]).toBeCloseTo(16.8);
    expect(arcAngles(1)).toEqual([-135]);
    expect(arcAngles(0)).toEqual([]);
    // Settings (ADMIN-DESIGN-SPEC §8.9): the bottom-centre arc, and the wheel from straight up.
    expect(navAngles(6, 'right', 'arc')).toEqual(angles);
    const centre = navAngles(6, 'centre', 'arc');
    expect([centre[0], centre[5]]).toEqual([-158, -22]);
    expect(navAngles(6, 'right', 'wheel')).toEqual([-90, -30, 30, 90, 150, 210]);
    expect(navAngles(6, 'centre', 'wheel')).toEqual(navAngles(6, 'right', 'wheel'));
  });

  it('format: dates, year ranges and project kinds as mocked', () => {
    expect(formatMonthYear('2026-08-14')).toBe('Aug 2026');
    expect(formatMonthYear('2024-07')).toBe('Jul 2024');
    expect(formatLongDate('2026-08-14')).toBe('14 August 2026');
    expect(formatYearRange('2023-01', null)).toBe('2023 — now');
    expect(formatYearRange('2021-01', '2023-01')).toBe('2021 — 2023');
    expect(formatYearRange('2024-02', '2024-09')).toBe('2024');
    expect(formatProjectKind('open-source')).toBe('Open source');
    expect(formatProjectKind('client-work')).toBe('Client work');
  });

  it('markdown: renders the styled blocks; excerpts are plain and cut on a word', () => {
    const html = renderMarkdown('Lead.\n\n## Heading\n\n> Pull quote.\n\nUse `memo()` here.');
    expect(html).toContain('<p>Lead.</p>');
    expect(html).toContain('<h2>Heading</h2>');
    expect(html).toMatch(/<blockquote>\s*<p>Pull quote.<\/p>\s*<\/blockquote>/);
    expect(html).toContain('<code>memo()</code>');
    expect(plainExcerpt('## Heading\n\nSome *emphasis* and a [link](/x).\n\nMore.')).toBe(
      'Some emphasis and a link.',
    );
    const cut = plainExcerpt('word '.repeat(60), 40);
    expect(cut.length).toBeLessThanOrEqual(40);
    expect(cut.endsWith('word…')).toBe(true);
  });

  it('markdown: drops raw HTML so content can never inject script', () => {
    const html = renderMarkdown('Hello\n\n<script>alert(1)</script>\n\n<b>bold</b> text');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('<b>');
    // Underline is the one tag let through, only as a bare, matched pair.
    expect(renderMarkdown('An <u>underlined **word**</u>.')).toContain(
      '<u>underlined <strong>word</strong></u>',
    );
    const stray = renderMarkdown('<u onclick="x()">a</u> and <u>open');
    expect(stray).not.toContain('<u');
    expect(stray).not.toContain('</u>');
  });

  it('simple markdown: paragraphs, lists, bold, italic, underline; the rest stays text', () => {
    const html = renderSimpleMarkdown(
      'One **b** *i* <u>u</u>.\n\n- first\n- second\n\n# Not a heading\n\n[link](https://a.b) `code`',
    );
    expect(html).toContain('<p>One <strong>b</strong> <em>i</em> <u>u</u>.</p>');
    expect(html).toMatch(/<ul>\s*<li>first<\/li>\s*<li>second<\/li>\s*<\/ul>/);
    expect(html).toContain('<p># Not a heading</p>');
    expect(html).toContain('[link](https://a.b) `code`');
    expect(html).not.toMatch(/<(h1|a|code|script)/);
  });

  it('read time: words not syntax, 220 wpm, never under a minute', () => {
    expect(countWords('## A heading\n\n> quoted - text\n\n- one\n- two')).toBe(6);
    expect(estimateReadMinutes('word '.repeat(220 * 3))).toBe(3);
    expect(estimateReadMinutes('word '.repeat(220 * 3 + 120))).toBe(4);
    expect(estimateReadMinutes('Short.')).toBe(1);
    expect(estimateReadMinutes(null)).toBe(1);
  });

  it('splitHighlight: whole words, literal characters, no match keeps the text', () => {
    expect(splitHighlight('I build quiet, careful software for the web.', 'web')).toEqual({
      before: 'I build quiet, careful software for the ',
      word: 'web',
      after: '.',
    });
    expect(splitHighlight('The website on the web', 'web').before).toBe('The website on the ');
    expect(splitHighlight('I like C++ a lot', 'C++').word).toBe('C++');
    expect(splitHighlight('Hello there', null)).toEqual({
      before: 'Hello there',
      word: null,
      after: '',
    });
    expect(splitHighlight('Hello there', 'web').word).toBeNull();
  });
});
