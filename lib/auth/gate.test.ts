import { describe, expect, it } from 'vitest';
import { gate, isPlausibleEmail, SIGN_IN_PATH } from './gate';

describe('admin gate', () => {
  it('signed out: pages go to sign-in, the API gets 401, sign-in and look-alikes stay open', () => {
    for (const path of ['/admin', '/admin/', '/admin/writing', '/admin/projects/new']) {
      expect(gate(path, false)).toEqual({ kind: 'redirect', to: SIGN_IN_PATH });
    }
    expect(gate('/api/admin', false)).toEqual({ kind: 'unauthorized' });
    expect(gate('/api/admin/session', false)).toEqual({ kind: 'unauthorized' });
    expect(gate(SIGN_IN_PATH, false)).toEqual({ kind: 'next' });
    expect(gate('/administrator', false)).toEqual({ kind: 'next' });
    expect(gate('/api/administer', false)).toEqual({ kind: 'next' });
  });

  it('signed in: everything passes (pages and RLS check the allowlist)', () => {
    for (const path of [SIGN_IN_PATH, '/admin/writing', '/api/admin/session']) {
      expect(gate(path, true)).toEqual({ kind: 'next' });
    }
  });

  it('email check matches the mockup', () => {
    expect(isPlausibleEmail('me@example.com')).toBe(true);
    expect(isPlausibleEmail('me@example')).toBe(false);
    expect(isPlausibleEmail('')).toBe(false);
  });
});
