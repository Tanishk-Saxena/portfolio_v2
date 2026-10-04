'use client';

import { useState } from 'react';
import { renderMarkdown, renderSimpleMarkdown } from '@/lib/utils/markdown';

const TAB =
  'h-8 cursor-pointer rounded-sm px-3 text-small text-muted aria-pressed:bg-surface aria-pressed:font-medium aria-pressed:text-ink';

/**
 * The article body (ADMIN-DESIGN-SPEC §5): a bordered well with Write / Preview. Preview runs
 * the site's own Markdown renderer (raw HTML dropped), styled after the article page.
 * `simple` is the short-copy variant (an experience description): the limited renderer and a
 * shorter well.
 */
export function MarkdownField({
  value,
  placeholder,
  simple = false,
  onChange,
  ...control
}: {
  id: string;
  value: string;
  placeholder?: string;
  simple?: boolean;
  onChange: (value: string) => void;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}) {
  const [preview, setPreview] = useState(false);
  const minHeight = simple ? 'min-h-admin-md-simple' : 'min-h-admin-md';
  return (
    <div className="overflow-hidden rounded-row border border-line-input bg-field focus-within:border-accent focus-within:ring-3 focus-within:ring-halo">
      <div className="flex items-center gap-1 border-b border-line p-1.5">
        <button
          type="button"
          aria-pressed={!preview}
          onClick={() => setPreview(false)}
          className={TAB}
        >
          Write
        </button>
        <button
          type="button"
          aria-pressed={preview}
          onClick={() => setPreview(true)}
          className={TAB}
        >
          Preview
        </button>
        <span className="ml-auto hidden pr-2 text-label text-muted @wide:inline">
          {simple ? 'Simple Markdown' : 'Markdown supported'}
        </span>
      </div>
      {preview ? (
        value.trim() ? (
          <div
            className={`${minHeight} flex max-w-admin-md-measure flex-col gap-4.5 p-admin-md-pad text-body text-muted [&_a]:text-accent [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-accent [&_blockquote]:pl-4.5 [&_blockquote]:font-serif [&_blockquote]:text-admin-md-quote [&_blockquote]:text-ink [&_h2]:mt-2 [&_h2]:font-serif [&_h2]:text-admin-md-heading [&_h2]:text-ink [&_h3]:font-serif [&_h3]:text-admin-md-heading [&_h3]:text-ink [&_li]:ml-5 [&_ol]:list-decimal [&_p]:text-pretty [&_strong]:font-medium [&_strong]:text-ink [&_ul]:list-disc`}
            // The site's renderer drops raw HTML, so only Markdown's own tags reach here.
            dangerouslySetInnerHTML={{
              __html: simple ? renderSimpleMarkdown(value) : renderMarkdown(value),
            }}
          />
        ) : (
          <p className={`${minHeight} p-admin-md-pad text-meta text-muted`}>
            Nothing to preview yet.
          </p>
        )
      ) : (
        <textarea
          {...control}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`${minHeight} block w-full resize-y bg-transparent p-4 text-body leading-7 text-ink outline-none placeholder:text-muted`}
        />
      )}
    </div>
  );
}
