import { getAdmin } from '@/lib/auth/server';

/**
 * Who is signed in. The first `/api/admin/*` handler, and the pattern for the rest
 * (ADMIN-DESIGN-SPEC §9): check the session again here, whatever the proxy decided.
 */
export async function GET() {
  const admin = await getAdmin();
  if (!admin) return Response.json({ error: 'Not signed in' }, { status: 401 });
  return Response.json({ email: admin.email });
}
