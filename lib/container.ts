import { createAuthClient } from '@/lib/auth/server';
import type { AdminRepositories, Repositories } from '@/lib/domain/repositories';
import { defaultDataset } from '@/lib/repositories/fixtures/data';
import { stressDataset } from '@/lib/repositories/fixtures/data/stress';
import type { FixtureDataset } from '@/lib/repositories/fixtures/dataset';
import { createFixtureAdminRepositories } from '@/lib/repositories/fixtures/fixture-admin-repositories';
import { createFixtureRepositories } from '@/lib/repositories/fixtures/fixture-repositories';
import { createPublicClient } from '@/lib/repositories/supabase/client';
import { createSupabaseAdminRepositories } from '@/lib/repositories/supabase/supabase-admin-repositories';
import { createSupabaseRepositories } from '@/lib/repositories/supabase/supabase-repositories';

/*
 * Composition root — the one place that decides where data comes from (brief §4).
 * Switching the whole app to Supabase is a change of DATA_SOURCE and nowhere else.
 *
 *   DATA_SOURCE=fixtures         (default) shipped content
 *   DATA_SOURCE=fixtures-stress  awkward content for layout testing
 *   DATA_SOURCE=supabase         the database (needs NEXT_PUBLIC_SUPABASE_* keys)
 */

export type DataSource = 'fixtures' | 'fixtures-stress' | 'supabase';

export function resolveDataSource(value = process.env.DATA_SOURCE): DataSource {
  if (value === undefined || value === '') return 'fixtures';
  if (value === 'fixtures' || value === 'fixtures-stress' || value === 'supabase') return value;
  throw new Error(`Unknown DATA_SOURCE "${value}"`);
}

/**
 * One working copy of each fixture set per process, shared through `globalThis`: Next gives
 * pages and route handlers separate module instances, and the admin's saves (route handlers)
 * must be what the pages read. Edits last until the server restarts; the shipped data is
 * never touched.
 */
function fixtures(source: 'fixtures' | 'fixtures-stress'): FixtureDataset {
  const shared = globalThis as { __fixtureData?: Partial<Record<string, FixtureDataset>> };
  shared.__fixtureData ??= {};
  return (shared.__fixtureData[source] ??= structuredClone(
    source === 'fixtures' ? defaultDataset : stressDataset,
  ));
}

export function createRepositories(source: DataSource = resolveDataSource()): Repositories {
  switch (source) {
    case 'fixtures':
    case 'fixtures-stress':
      return createFixtureRepositories(fixtures(source));
    case 'supabase':
      return createSupabaseRepositories(createPublicClient());
  }
}

let instance: Repositories | undefined;

/** The app-wide repositories. Server-side only. */
export function getRepositories(): Repositories {
  instance ??= createRepositories();
  return instance;
}

/**
 * The admin's reads, hidden rows included, from the same DATA_SOURCE as the site (so
 * `fixtures-stress` exercises the admin's layouts too). Over Supabase they run with this
 * request's session, so make them per request; RLS returns hidden rows only to the admin,
 * and pages render nothing until `getAdmin()` has said yes.
 */
export async function getAdminRepositories(
  source: DataSource = resolveDataSource(),
): Promise<AdminRepositories> {
  switch (source) {
    case 'fixtures':
    case 'fixtures-stress':
      return createFixtureAdminRepositories(fixtures(source));
    case 'supabase': {
      const db = await createAuthClient();
      if (!db) throw new Error('DATA_SOURCE=supabase needs the Supabase keys for the admin');
      return createSupabaseAdminRepositories(db);
    }
  }
}
