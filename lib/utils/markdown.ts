import { Marked } from 'marked';

/*
 * Article bodies are Markdown authored by the site owner (fixtures now, the admin portal
 * later), rendered on the server to static HTML. Raw HTML inside Markdown is dropped, so a
 * pasted <script> can never reach the page. [ASSUMED] Owner-only authoring; if others ever
 * write content, add a sanitiser here.
 */
const marked = new Marked({
  gfm: true,
  breaks: false,
  renderer: {
    html: () => '', // no raw HTML passthrough
  },
});

export function renderMarkdown(source: string): string {
  return marked.parse(source, { async: false });
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
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,.;:]$/, '')}…`;
}
