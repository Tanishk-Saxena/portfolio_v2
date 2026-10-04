import { handleAction, readJson } from '@/lib/admin/handle-save';
import { setDeleted } from '@/lib/admin/list-actions';
import { isFull } from '@/lib/admin/save';
import { findSection } from '@/lib/admin/sections';

/**
 * Undo a delete: `{ section, id }` (ADMIN-DESIGN-SPEC §9, Q-A16). A toggle is undone by
 * toggling back, so restore only ever clears a soft delete.
 */
export async function POST(request: Request) {
  return handleAction(async () => {
    const body = (await readJson(request)) as { section?: unknown; id?: unknown } | null;
    const section = findSection(String(body?.section ?? ''));
    if (section?.kind !== 'collection' || typeof body?.id !== 'string') {
      return Response.json({ error: 'Expected { section, id }' }, { status: 400 });
    }
    // A full list has no room for it back (four skill groups, §7.1).
    if (await isFull(section.slug)) {
      return Response.json({ error: 'Full', full: true }, { status: 409 });
    }
    return (await setDeleted(section.slug, body.id, false))
      ? Response.json({ ok: true })
      : Response.json({ error: 'Nothing to restore' }, { status: 404 });
  });
}
