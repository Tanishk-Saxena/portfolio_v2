import type { Repositories } from '@/lib/domain/repositories';
import { defaultDataset } from '@/lib/repositories/fixtures/data';
import { stressDataset } from '@/lib/repositories/fixtures/data/stress';
import { createFixtureRepositories } from '@/lib/repositories/fixtures/fixture-repositories';

/*
 * Composition root — the one place that decides where data comes from (brief §4).
 * Switching the whole app to Supabase in Phase 6 is a change here and nowhere else.
 *
 *   DATA_SOURCE=fixtures         (default) shipped content
 *   DATA_SOURCE=fixtures-stress  awkward content for layout testing
 *   DATA_SOURCE=supabase         Phase 6
 */

export type DataSource = 'fixtures' | 'fixtures-stress' | 'supabase';

export function resolveDataSource(value = process.env.DATA_SOURCE): DataSource {
  if (value === undefined || value === '') return 'fixtures';
  if (value === 'fixtures' || value === 'fixtures-stress' || value === 'supabase') return value;
  throw new Error(`Unknown DATA_SOURCE "${value}"`);
}

export function createRepositories(source: DataSource = resolveDataSource()): Repositories {
  switch (source) {
    case 'fixtures':
      return createFixtureRepositories(defaultDataset);
    case 'fixtures-stress':
      return createFixtureRepositories(stressDataset);
    case 'supabase':
      throw new Error('The Supabase repositories arrive in Phase 6.');
  }
}

let instance: Repositories | undefined;

/** The app-wide repositories. Server-side only. */
export function getRepositories(): Repositories {
  instance ??= createRepositories();
  return instance;
}
