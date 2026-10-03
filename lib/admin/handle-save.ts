import { getAdmin } from '@/lib/auth/server';
import { Conflict, Rejected } from './save';
import { type Draft, type FormSlug, isFormSlug, parseDraft, validate } from './schema';

/** 401 unless signed in as an admin, 403 for a read-only viewer, else null (go ahead). */
async function refuseNonEditor(): Promise<Response | null> {
  const admin = await getAdmin();
  if (!admin) return Response.json({ error: 'Not signed in' }, { status: 401 });
  if (admin.role !== 'editor') return Response.json({ error: 'Read-only' }, { status: 403 });
  return null;
}

/**
 * The shape every `/api/admin/*` save follows (ADMIN-DESIGN-SPEC §9): check the admin → read
 * and validate the draft with the shared schema → write → respond. The write marks the site
 * stale itself (`save.ts`). Responses:
 *   401 not the admin · 403 a read-only viewer · 404 no such form or entry · 400 not a draft
 *   422 `{ errors }` · 409 the record changed since the editor opened it (the body's
 *   `updatedAt`) · 200 `{ id?, updatedAt }` · 500 the write failed (the editor keeps the draft)
 */
export async function handleSave(
  request: Request,
  section: string,
  allowed: (slug: FormSlug) => boolean,
  write: (slug: FormSlug, draft: Draft, expectedUpdatedAt: string | null) => Promise<object | null>,
): Promise<Response> {
  const refused = await refuseNonEditor();
  if (refused) return refused;
  if (!isFormSlug(section) || !allowed(section)) {
    return Response.json({ error: 'No such form' }, { status: 404 });
  }

  let draft: Draft | null = null;
  let expected: string | null = null;
  try {
    const body: unknown = await request.json();
    draft = parseDraft(section, body);
    const stamp = (body as { updatedAt?: unknown } | null)?.updatedAt;
    expected = typeof stamp === 'string' ? stamp : null;
  } catch {
    // not JSON: falls through to 400
  }
  if (!draft) return Response.json({ error: 'Not a valid draft' }, { status: 400 });

  const errors = validate(section, draft);
  if (Object.keys(errors).length) return Response.json({ errors }, { status: 422 });

  try {
    const saved = await write(section, draft, expected);
    if (!saved) return Response.json({ error: 'No such entry' }, { status: 404 });
    return Response.json(saved);
  } catch (error) {
    if (error instanceof Rejected) return Response.json({ errors: error.errors }, { status: 422 });
    if (error instanceof Conflict) {
      return Response.json({ error: 'Changed elsewhere' }, { status: 409 });
    }
    console.error(error);
    return Response.json({ error: 'The write failed' }, { status: 500 });
  }
}

/**
 * The list actions' shape: 401 unless the admin, 403 for a viewer, then `run`, and 500 if it
 * throws. `run` answers everything else (404 / 400 / 409 / 422 / 200).
 */
export async function handleAction(run: () => Promise<Response>): Promise<Response> {
  const refused = await refuseNonEditor();
  if (refused) return refused;
  try {
    return await run();
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'The write failed' }, { status: 500 });
  }
}

/** The request's JSON body, or null when it isn't JSON. */
export const readJson = (request: Request): Promise<unknown> => request.json().catch(() => null);
