import { describe, expect, it } from 'vitest';
import { gate, isPlausibleEmail, SIGN_IN_PATH } from './gate';

describe('gate', () => {
  it('sends signed-out visitors of admin pages to sign-in', () => {
    for (const path of ['/admin', '/admin/', '/admin/writing', '/admin/projects/new']) {
      expect(gate(path, false)).toEqual({ kind: 'redirect', to: SIGN_IN_PATH });
    }
  });

  it('answers signed-out API calls with 401', () => {
    expect(gate('/api/admin', false)).toEqual({ kind: 'unauthorized' });
    expect(gate('/api/admin/session', false)).toEqual({ kind: 'unauthorized' });
  });

  it('keeps the sign-in page open, signed in or not', () => {
    expect(gate(SIGN_IN_PATH, false)).toEqual({ kind: 'next' });
    expect(gate(SIGN_IN_PATH, true)).toEqual({ kind: 'next' });
  });

  it('lets a session through (the page and RLS check the allowlist)', () => {
    expect(gate('/admin/writing', true)).toEqual({ kind: 'next' });
    expect(gate('/api/admin/session', true)).toEqual({ kind: 'next' });
  });

  it('ignores look-alike paths', () => {
    expect(gate('/administrator', false)).toEqual({ kind: 'next' });
    expect(gate('/api/administer', false)).toEqual({ kind: 'next' });
  });
});

describe('isPlausibleEmail', () => {
  it('matches the mockup check', () => {
    expect(isPlausibleEmail('me@example.com')).toBe(true);
    expect(isPlausibleEmail('me@example')).toBe(false);
    expect(isPlausibleEmail('')).toBe(false);
  });
});
