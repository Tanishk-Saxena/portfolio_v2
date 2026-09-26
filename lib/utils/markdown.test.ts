import { describe, expect, it } from 'vitest';
import { plainExcerpt, renderMarkdown } from './markdown';

describe('plainExcerpt', () => {
  it('takes the first real paragraph as plain text', () => {
    expect(plainExcerpt('## Heading\n\nSome *emphasis* and a [link](/x).\n\nMore.')).toBe(
      'Some emphasis and a link.',
    );
  });

  it('cuts long text on a word boundary with an ellipsis', () => {
    const out = plainExcerpt('word '.repeat(60), 40);
    expect(out.length).toBeLessThanOrEqual(40);
    expect(out.endsWith('word…')).toBe(true);
  });
});

describe('renderMarkdown', () => {
  it('renders the blocks the article design styles: paragraphs, h2, pull-quote, code', () => {
    const html = renderMarkdown('Lead.\n\n## Heading\n\n> Pull quote.\n\nUse `memo()` here.');
    expect(html).toContain('<p>Lead.</p>');
    expect(html).toContain('<h2>Heading</h2>');
    expect(html).toMatch(/<blockquote>\s*<p>Pull quote.<\/p>\s*<\/blockquote>/);
    expect(html).toContain('<code>memo()</code>');
  });

  it('drops raw HTML so markup in content can never inject script', () => {
    const html = renderMarkdown('Hello\n\n<script>alert(1)</script>\n\n<b>bold</b> text');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('<b>');
  });
});
