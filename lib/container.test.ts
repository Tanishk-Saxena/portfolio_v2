import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRepositories, resolveDataSource } from './container';

describe('composition root', () => {
  afterEach(() => vi.unstubAllEnvs());

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

  it('refuses Supabase without keys instead of silently falling back', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', '');
    expect(() => createRepositories('supabase')).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });

  it('builds the Supabase repositories when the keys are set', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test');
    expect(typeof createRepositories('supabase').profile.get).toBe('function');
  });
});
