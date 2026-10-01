import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * A stateless client for public reads: the publishable (anon) key, no session. Phase 7 adds
 * the cookie-bound client for the admin.
 */
export function createPublicClient(env: NodeJS.ProcessEnv = process.env): SupabaseClient {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      'DATA_SOURCE=supabase needs NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    );
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
