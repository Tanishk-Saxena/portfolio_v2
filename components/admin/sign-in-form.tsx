'use client';

import { useActionState } from 'react';
import { signIn, type SignInState } from '@/app/admin/actions';

const INPUT =
  'h-11.5 rounded-md border border-line-input bg-field px-3 text-body font-normal text-ink outline-none transition-[border-color,box-shadow] duration-200 focus:border-accent focus:ring-3 focus:ring-halo';

const initial: SignInState = { error: '', email: '' };

/**
 * The designed sign-in (ADMIN-DESIGN-SPEC §4.3). `noValidate`: the mockup's own message
 * replaces the browser's bubbles. Works before hydration (a plain form post to the action).
 */
export function SignInForm() {
  const [state, action, pending] = useActionState(signIn, initial);
  const described = state.error ? 'sign-in-error' : undefined;

  return (
    <form action={action} noValidate className="flex w-[min(380px,100%)] flex-col gap-4.5">
      <div className="mb-3.5 flex flex-col items-start gap-1">
        <h1 className="font-script text-admin-mark font-semibold">Tanishk Saxena</h1>
        <p className="text-label tracking-eyebrow text-muted uppercase">Content admin</p>
      </div>
      <label className="flex flex-col gap-2 text-small font-medium">
        Email
        <input
          name="email"
          type="email"
          autoComplete="username"
          defaultValue={state.email}
          aria-describedby={described}
          className={INPUT}
        />
      </label>
      <label className="flex flex-col gap-2 text-small font-medium">
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          aria-describedby={described}
          className={INPUT}
        />
      </label>
      {state.error && (
        <p id="sign-in-error" role="alert" className="text-small font-medium text-accent">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        data-ripple="paper"
        className="mt-1.5 h-12 cursor-pointer rounded-full bg-accent-fill text-body-sm font-medium text-on-accent transition-opacity duration-200 hover:opacity-90 disabled:cursor-default disabled:opacity-70"
      >
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
      {/* A full page load, so the site's own theme key applies there. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/" className="hit-44 relative self-center text-small text-muted hover:text-accent">
        ← Back to the site
      </a>
    </form>
  );
}
