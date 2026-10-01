/**
 * The Supabase project the admin signs in to: the same URL and publishable key the site
 * reads with. Auth always uses Supabase, whatever DATA_SOURCE says. Without keys (CI on
 * fixtures) there is no session, so the admin stays locked.
 */
export function authEnv(env: NodeJS.ProcessEnv = process.env) {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return url && key ? { url, key } : null;
}
