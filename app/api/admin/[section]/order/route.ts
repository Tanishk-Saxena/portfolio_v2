import { handleAction, readJson } from '@/lib/admin/handle-save';
import { reorder } from '@/lib/admin/list-actions';
import { findSection } from '@/lib/admin/sections';

/**
 * Reorder an owner-ordered collection: `{ ids }`, every live entry once (ADMIN-DESIGN-SPEC
 * §7.1). 409 when the ids no longer match the list (it changed elsewhere).
 */
export async function PATCH(request: Request, ctx: RouteContext<'/api/admin/[section]/order'>) {
  return handleAction(async () => {
    const section = findSection((await ctx.params).section);
    if (section?.kind !== 'collection' || !section.ordered || section.slug === 'writing') {
      return Response.json({ error: 'No such list' }, { status: 404 });
    }
    const ids = ((await readJson(request)) as { ids?: unknown } | null)?.ids;
    if (!Array.isArray(ids) || !ids.every((id) => typeof id === 'string')) {
      return Response.json({ error: 'Expected { ids }' }, { status: 400 });
    }
    return (await reorder(section.slug, ids))
      ? Response.json({ ok: true })
      : Response.json({ error: 'The list changed' }, { status: 409 });
  });
}
