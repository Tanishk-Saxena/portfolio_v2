import { createAuthClient } from '@/lib/auth/server';
import type { AdminRepositories, Repositories } from '@/lib/domain/repositories';
import { createPublicClient } from '@/lib/repositories/supabase/client';
import { createSupabaseAdminRepositories } from '@/lib/repositories/supabase/supabase-admin-repositories';
import { createSupabaseRepositories } from '@/lib/repositories/supabase/supabase-repositories';

/*
 * Composition root — the one place that builds the repositories (brief §4). There is one
 * data path, the one production runs: Supabase. Which project it reads is only a matter of
 * keys (`NEXT_PUBLIC_SUPABASE_*`): CI's throwaway local Supabase, dev, or prod.
 */

let instance: Repositories | undefined;

/** The app-wide repositories: public reads with the publishable key. Server-side only. */
export function getRepositories(): Repositories {
  instance ??= createSupabaseRepositories(createPublicClient());
  return instance;
}

/**
 * The admin's reads and writes, hidden rows included. They run with this request's session,
 * so make them per request; RLS returns hidden rows only to the admin, and pages render
 * nothing until `getAdmin()` has said yes.
 */
export async function getAdminRepositories(): Promise<AdminRepositories> {
  const db = await createAuthClient();
  if (!db) throw new Error('The admin needs NEXT_PUBLIC_SUPABASE_URL and its publishable key');
  return createSupabaseAdminRepositories(db);
}
