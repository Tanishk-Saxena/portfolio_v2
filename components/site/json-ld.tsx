import { serializeJsonLd } from '@/lib/structured-data';

/** Structured data for search engines: data, not code, so a plain script tag (Next JSON-LD guide). */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
