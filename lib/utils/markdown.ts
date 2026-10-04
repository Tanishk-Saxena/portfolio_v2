import { Marked, type MarkedExtension } from 'marked';

/*
 * Article bodies are Markdown authored by the site owner (fixtures now, the admin portal
 * later), rendered on the server to static HTML. Raw HTML inside Markdown is dropped, so a
 * pasted <script> can never reach the page. [ASSUMED] Owner-only authoring; if others ever
 * write content, add a sanitiser here.
 *
 * The one exception is underline (owner, Phase 9 item 30): Markdown has no syntax for it, so
 * a matched `<u>…</u>` pair inside a line is read as its own inline token and comes out as
 * a balanced `<u>` element. Anything else, a `<u>` with attributes or without its closing
 * tag included, is still dropped.
 */
const underline: MarkedExtension = {
  extensions: [
    {
      name: 'underline',
      level: 'inline',
      start: (src) => src.search(/<u>/i),
      tokenizer(src) {
        const match = /^<u>([\s\S]+?)<\/u>/i.exec(src);
        if (!match) return undefined;
        return {
          type: 'underline',
          raw: match[0],
          tokens: this.lexer.inlineTokens(match[1] ?? ''),
        };
      },
      renderer(token) {
        return `<u>${this.parser.parseInline(token.tokens ?? [])}</u>`;
      },
    },
  ],
};

const dropHtml = () => ''; // no raw HTML passthrough

const marked = new Marked(
  {
    gfm: true,
    breaks: false,
    renderer: { html: dropHtml },
  },
  underline,
);

export function renderMarkdown(source: string): string {
  return marked.parse(source, { async: false });
}

/*
 * Simple Markdown, for short copy like an experience description (item 30): paragraphs,
 * lists, bold, italic and underline. Every other construct is switched off in the tokenizer,
 * so a `#` or a link stays the text that was typed instead of becoming markup.
 */
const off = () => undefined;

const simple = new Marked(
  {
    gfm: true,
    breaks: false,
    renderer: { html: dropHtml },
  },
  underline,
  {
    tokenizer: {
      code: off,
      fences: off,
      heading: off,
      lheading: off,
      hr: off,
      blockquote: off,
      table: off,
      def: off,
      link: off,
      reflink: off,
      autolink: off,
      url: off,
      codespan: off,
      del: off,
    },
  },
);

export function renderSimpleMarkdown(source: string): string {
  return simple.parse(source, { async: false });
}

/**
 * A plain-text summary from the first paragraph: meta descriptions when an article has no
 * authored excerpt. Cut on a word boundary with an ellipsis.
 */
export function plainExcerpt(source: string, max = 155): string {
  const first =
    source
      .split(/\n\s*\n/)
      .map((block) => block.trim())
      .find((block) => block && !/^(#|>|```|[-*+] |\d+\. )/.test(block)) ?? '';
  const text = first
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1') // links and images → their text
    .replace(/<\/?u>/gi, '')
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,.;:]$/, '')}…`;
}
