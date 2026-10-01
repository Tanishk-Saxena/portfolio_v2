'use server';

import { redirect } from 'next/navigation';
import { ADMIN_HOME_PATH, isPlausibleEmail, SIGN_IN_MESSAGES, SIGN_IN_PATH } from '@/lib/auth/gate';
import { createAuthClient, isAdmin } from '@/lib/auth/server';

export type SignInState = { error: string; email: string };

/**
 * Email + password against Supabase Auth, then the allowlist. A valid account that isn't
 * the admin is signed straight back out and gets the same message as a wrong password, so
 * the form never says which accounts exist.
 */
export async function signIn(_prev: SignInState, form: FormData): Promise<SignInState> {
  const email = String(form.get('email') ?? '').trim();
  const password = String(form.get('password') ?? '');
  const fail = (error: string) => ({ error, email });

  if (!isPlausibleEmail(email) || !password) return fail(SIGN_IN_MESSAGES.missing);

  const supabase = await createAuthClient();
  if (!supabase) return fail(SIGN_IN_MESSAGES.unavailable);

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const wrong = error.code === 'invalid_credentials' || error.status === 400;
    return fail(wrong ? SIGN_IN_MESSAGES.mismatch : SIGN_IN_MESSAGES.unavailable);
  }
  if (!(await isAdmin(supabase))) {
    await supabase.auth.signOut({ scope: 'local' });
    return fail(SIGN_IN_MESSAGES.mismatch);
  }
  redirect(ADMIN_HOME_PATH);
}

/** Ends this device's session only; another signed-in device stays signed in. */
export async function signOut() {
  const supabase = await createAuthClient();
  await supabase?.auth.signOut({ scope: 'local' });
  redirect(SIGN_IN_PATH);
}
