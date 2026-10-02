import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { authEnv } from './env';

/**
 * A Supabase client bound to this request's session cookies. Create one per request, in
 * Server Components, Server Actions and Route Handlers. Null when Supabase isn't configured.
 */
export async function createAuthClient(): Promise<SupabaseClient | null> {
  const env = authEnv();
  if (!env) return null;
  const store = await cookies();
  return createServerClient(env.url, env.key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(list) {
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch {
          // A Server Component can't set cookies; the proxy refreshes the session instead.
        }
      },
    },
  });
}

/** Whether the signed-in user is on the allowlist (`public.is_admin()`, the RLS check). */
export async function isAdmin(supabase: SupabaseClient) {
  const { data, error } = await supabase.rpc('is_admin');
  return !error && data === true;
}

export type Admin = { id: string; email: string };

/**
 * The signed-in admin, or null. Verifies the session token's signature (`getClaims`, locally
 * with the project's asymmetric keys, as the proxy does) and asks the database's allowlist.
 * Every admin page and `/api/admin/*` handler calls this; RLS checks every query again.
 */
export async function getAdmin(): Promise<Admin | null> {
  const supabase = await createAuthClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims || !(await isAdmin(supabase))) return null;
  return { id: claims.sub, email: typeof claims.email === 'string' ? claims.email : '' };
}
