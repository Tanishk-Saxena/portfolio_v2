import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SignInForm } from '@/components/admin/sign-in-form';
import { siteName } from '@/lib/admin/content';
import { ADMIN_HOME_PATH } from '@/lib/auth/gate';
import { getAdmin } from '@/lib/auth/server';

export const metadata: Metadata = { title: 'Sign in' };

export default async function SignInPage() {
  if (await getAdmin()) redirect(ADMIN_HOME_PATH);
  return (
    <main className="grid min-h-svh place-items-center p-6">
      <SignInForm name={await siteName()} />
    </main>
  );
}
