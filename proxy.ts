import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { authEnv } from '@/lib/auth/env';
import { gate } from '@/lib/auth/gate';

/*
 * Optimistic guard for the admin (ADMIN-DESIGN-SPEC §12): refreshes the Supabase session
 * cookies, sends signed-out visitors of /admin/* to sign-in and answers /api/admin/* with
 * 401. Defence in depth only: pages and handlers check the allowlist, RLS enforces it.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  let signedIn = false;

  const env = authEnv();
  if (env) {
    const supabase = createServerClient(env.url, env.key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(list, headers) {
          for (const { name, value } of list) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of list) response.cookies.set(name, value, options);
          for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
        },
      },
    });
    try {
      // Verifies the JWT (locally with asymmetric keys) and refreshes an expired session.
      const { data } = await supabase.auth.getClaims();
      signedIn = Boolean(data?.claims.sub);
    } catch {
      // Auth unreachable: treat as signed out. The admin is unusable without it anyway.
    }
  }

  const decision = gate(request.nextUrl.pathname, signedIn);
  if (decision.kind === 'next') return response;

  const blocked =
    decision.kind === 'unauthorized'
      ? NextResponse.json({ error: 'Not signed in' }, { status: 401 })
      : NextResponse.redirect(new URL(decision.to, request.url));
  // Carry cleared or refreshed cookies over, so a dead session doesn't linger.
  for (const cookie of response.cookies.getAll()) blocked.cookies.set(cookie);
  return blocked;
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
