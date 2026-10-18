import { afterEach, describe, expect, it, vi } from 'vitest';

describe('composition root', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('builds Supabase only with its keys, never silently falling back', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', '');
    const empty = await import('./container');
    expect(() => empty.getRepositories()).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);

    vi.resetModules();
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'sb_publishable_test');
    const keyed = await import('./container');
    expect(typeof keyed.getRepositories().profile.get).toBe('function');
  });
});
