import { savedAccent } from '@/lib/og/accent';
import { renderMonogram } from '@/lib/og/monogram';

/**
 * `/favicon.ico` for browsers and crawlers that ask for it by name: the same monogram as
 * `app/icon.tsx`, in the saved accent, as a PNG (every current browser reads a PNG here).
 * Prerendered at build, so a deploy picks up the setting (owner, ADMIN-DESIGN-SPEC §14).
 */
export const dynamic = 'force-static';

export async function GET() {
  return renderMonogram(48, await savedAccent());
}
