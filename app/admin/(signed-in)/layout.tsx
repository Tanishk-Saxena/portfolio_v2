import { redirect } from 'next/navigation';
import { SIGN_IN_PATH } from '@/lib/auth/gate';
import { getAdmin } from '@/lib/auth/server';

/**
 * Every admin page but sign-in. The proxy only checks for a session; this checks it with
 * Supabase Auth and the allowlist. RLS still guards every query underneath.
 */
export default async function SignedInLayout({ children }: LayoutProps<'/admin'>) {
  if (!(await getAdmin())) redirect(SIGN_IN_PATH);
  return children;
}
