import { describe, expect, it } from 'vitest';
import { createRepositories, resolveDataSource } from './container';

describe('composition root', () => {
  it('defaults to fixtures when DATA_SOURCE is unset or empty', () => {
    expect(resolveDataSource(undefined)).toBe('fixtures');
    expect(resolveDataSource('')).toBe('fixtures');
  });

  it('rejects an unknown data source loudly', () => {
    expect(() => resolveDataSource('mongo')).toThrow(/Unknown DATA_SOURCE/);
  });

  it('serves different content for the stress set', async () => {
    const normal = await createRepositories('fixtures').experience.list();
    const stress = await createRepositories('fixtures-stress').experience.list();
    expect(stress.length).toBeGreaterThan(normal.length);
  });

  it('refuses Supabase until Phase 6 instead of silently falling back', () => {
    expect(() => createRepositories('supabase')).toThrow(/Phase 6/);
  });
});
