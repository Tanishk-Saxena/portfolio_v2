import { renderMarkdown } from '@/lib/utils/markdown';

/*
 * Article body (spec §6 Article — Body): the first paragraph is the serif lead; then Plex
 * body copy, serif h2s, an accent-ruled italic pull-quote, and mono code (Q19). Styled with
 * child variants, since the markup comes from Markdown.
 */
const BODY = [
  'flex flex-col gap-6.5',
  // paragraphs; the first one is the lead
  '[&>p]:text-body-article [&>p]:text-muted',
  '[&>p:first-child]:font-serif [&>p:first-child]:text-lead-article [&>p:first-child]:font-light [&>p:first-child]:text-pretty [&>p:first-child]:text-ink',
  // headings
  '[&>h2]:mt-article-h2-top [&>h2]:font-serif [&>h2]:text-h2-article [&>h2]:text-ink',
  '[&>h3]:mt-article-h2-top [&>h3]:font-serif [&>h3]:text-h3-post [&>h3]:text-ink',
  // pull-quote
  '[&>blockquote]:my-pullquote-block [&>blockquote]:border-l-2 [&>blockquote]:border-accent [&>blockquote]:pl-pullquote-inline',
  '[&_blockquote_p]:font-[family-name:var(--font-newsreader-italic),Georgia,serif] [&_blockquote_p]:text-pullquote [&_blockquote_p]:font-light [&_blockquote_p]:text-ink [&_blockquote_p]:italic',
  // lists and links
  '[&>ol]:list-decimal [&>ol]:pl-5 [&>ul]:list-disc [&>ul]:pl-5 [&_li]:text-body-article [&_li]:text-muted',
  '[&_a]:text-accent [&_a]:underline [&_a]:decoration-border-control [&_a]:underline-offset-4 [&_a:hover]:decoration-accent',
  // code (Dev notes style)
  '[&_code]:rounded-sm [&_code]:bg-surface [&_code]:px-1.25 [&_code]:py-px [&_code]:font-mono [&_code]:text-[.88em]',
  '[&>pre]:overflow-x-auto [&>pre]:rounded-sm [&>pre]:bg-surface [&>pre]:p-4 [&>pre]:leading-[1.6] [&_pre_code]:bg-transparent [&_pre_code]:p-0',
].join(' ');

export function ArticleBody({ markdown }: { markdown: string }) {
  return (
    <div
      className={`mt-article-body-top ${BODY}`}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(markdown) }}
    />
  );
}
