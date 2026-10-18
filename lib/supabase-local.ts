/**
 * Whether a Supabase URL is a local one (`npx supabase start`: CI's throwaway project). The
 * tests that write (the database suite, e2e) run only against such a URL, so they can never
 * touch dev or prod; `next.config.ts` uses it to allow images from 127.0.0.1.
 */
export function isLocalSupabase(url: string | undefined): boolean {
  if (!url) return false;
  try {
    return ['localhost', '127.0.0.1'].includes(new URL(url).hostname);
  } catch {
    return false;
  }
}
