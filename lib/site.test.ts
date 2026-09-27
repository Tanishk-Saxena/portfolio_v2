import { describe, expect, it } from 'vitest';
import { resolveSiteUrl } from './site';

describe('resolveSiteUrl', () => {
  it('prefers NEXT_PUBLIC_SITE_URL', () => {
    const url = resolveSiteUrl({
      NEXT_PUBLIC_SITE_URL: 'https://example.dev',
      VERCEL_PROJECT_PRODUCTION_URL: 'app.vercel.app',
    });
    expect(url.origin).toBe('https://example.dev');
  });

  it('falls back to the Vercel production domain over https', () => {
    expect(resolveSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: 'app.vercel.app' }).origin).toBe(
      'https://app.vercel.app',
    );
  });

  it('defaults to localhost', () => {
    expect(resolveSiteUrl({}).origin).toBe('http://localhost:3000');
  });
});
