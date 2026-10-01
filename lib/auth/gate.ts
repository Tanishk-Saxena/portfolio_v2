/*
 * The admin's routes and the proxy's decision for each (ADMIN-DESIGN-SPEC §12). Optimistic:
 * the proxy only knows whether a session cookie verifies, not whether the user is on the
 * allowlist. Pages and route handlers check that again, and RLS is the real boundary.
 */

export const SIGN_IN_PATH = '/admin/sign-in';
export const ADMIN_HOME_PATH = '/admin';

export type Gate = { kind: 'next' } | { kind: 'redirect'; to: string } | { kind: 'unauthorized' };

const isUnder = (pathname: string, base: string) =>
  pathname === base || pathname.startsWith(`${base}/`);

export function gate(pathname: string, signedIn: boolean): Gate {
  if (signedIn) return { kind: 'next' };
  if (isUnder(pathname, '/api/admin')) return { kind: 'unauthorized' };
  // The sign-in page itself stays open. Signed-in visitors aren't bounced off it here: only
  // the page knows whether they're the admin, and bouncing a non-admin would loop.
  if (isUnder(pathname, SIGN_IN_PATH)) return { kind: 'next' };
  if (isUnder(pathname, '/admin')) return { kind: 'redirect', to: SIGN_IN_PATH };
  return { kind: 'next' };
}

/** Sign-in copy: [AD] for empty fields, Q-A18 for a mismatch, Q-A20 when the server fails. */
export const SIGN_IN_MESSAGES = {
  missing: 'Enter your email and password.',
  mismatch: "That email and password don't match.",
  unavailable: 'Could not sign in right now. Try again in a moment.',
} as const;

/** The mockup's check before anything is sent [AD `signIn`]. */
export function isPlausibleEmail(value: string) {
  return /^\S+@\S+\.\S+$/.test(value);
}
