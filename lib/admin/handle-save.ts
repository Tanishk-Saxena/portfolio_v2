import { getAdmin } from '@/lib/auth/server';
import { type Draft, type FormSlug, isFormSlug, parseDraft, validate } from './schema';

/**
 * The shape every `/api/admin/*` save follows (ADMIN-DESIGN-SPEC §9): check the admin → read
 * and validate the draft with the shared schema → write → respond. The write marks the site
 * stale itself (`save.ts`). Responses:
 *   401 not the admin · 404 no such form or entry · 400 not a draft · 422 `{ errors }`
 *   200 `{ id?, updatedAt }` · 500 the write failed (the editor keeps the draft)
 */
export async function handleSave(
  request: Request,
  section: string,
  allowed: (slug: FormSlug) => boolean,
  write: (slug: FormSlug, draft: Draft) => Promise<object | null>,
): Promise<Response> {
  if (!(await getAdmin())) return Response.json({ error: 'Not signed in' }, { status: 401 });
  if (!isFormSlug(section) || !allowed(section)) {
    return Response.json({ error: 'No such form' }, { status: 404 });
  }

  let draft: Draft | null = null;
  try {
    draft = parseDraft(section, await request.json());
  } catch {
    // not JSON: falls through to 400
  }
  if (!draft) return Response.json({ error: 'Not a valid draft' }, { status: 400 });

  const errors = validate(section, draft);
  if (Object.keys(errors).length) return Response.json({ errors }, { status: 422 });

  try {
    const saved = await write(section, draft);
    if (!saved) return Response.json({ error: 'No such entry' }, { status: 404 });
    return Response.json(saved);
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'The write failed' }, { status: 500 });
  }
}
