import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRepositories, resolveDataSource } from './container';

describe('composition root', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('picks the data source: fixtures by default, stress on request, unknown fails loudly', async () => {
    expect(resolveDataSource(undefined)).toBe('fixtures');
    expect(resolveDataSource('')).toBe('fixtures');
    expect(() => resolveDataSource('mongo')).toThrow(/Unknown DATA_SOURCE/);
    const normal = await createRepositories('fixtures').experience.list();
    const stress = await createRepositories('fixtures-stress').experience.list();
    expect(stress.length).toBeGreaterThan(normal.length);
  });

  it('builds Supabase only with keys, never silently falling back', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', '');
    expect(() => createRepositories('supabase')).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test');
    expect(typeof createRepositories('supabase').profile.get).toBe('function');
  });
});
