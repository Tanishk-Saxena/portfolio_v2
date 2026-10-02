import type { EntrySlug } from '@/lib/admin/forms';
import { handleAction, handleSave, readJson } from '@/lib/admin/handle-save';
import { isToggleSlug, setDeleted, setVisible } from '@/lib/admin/list-actions';
import { updateEntry } from '@/lib/admin/save';
import { findSection, SECTIONS, type SectionSlug } from '@/lib/admin/sections';

/** Save an edit to a collection entry (ADMIN-DESIGN-SPEC §9). 404 when it no longer exists. */
export async function PUT(request: Request, ctx: RouteContext<'/api/admin/[section]/[id]'>) {
  const { section, id } = await ctx.params;
  return handleSave(
    request,
    section,
    (slug) => SECTIONS[slug as SectionSlug].kind === 'collection',
    (slug, draft, expected) => updateEntry(slug as EntrySlug, id, draft, expected),
  );
}

/**
 * The list's quick toggle: `{ visible }` (ADMIN-DESIGN-SPEC §7.1). 422 when an article has
 * nothing to show yet.
 */
export async function PATCH(request: Request, ctx: RouteContext<'/api/admin/[section]/[id]'>) {
  return handleAction(async () => {
    const { section, id } = await ctx.params;
    if (!isToggleSlug(section)) return Response.json({ error: 'No toggle' }, { status: 404 });
    const visible = ((await readJson(request)) as { visible?: unknown } | null)?.visible;
    if (typeof visible !== 'boolean') {
      return Response.json({ error: 'Expected { visible }' }, { status: 400 });
    }
    const result = await setVisible(section, id, visible);
    if (result === 'nothing-to-show') {
      return Response.json({ error: 'Add a body before publishing' }, { status: 422 });
    }
    return result === 'ok'
      ? Response.json({ ok: true })
      : Response.json({ error: 'No such entry' }, { status: 404 });
  });
}

/** Soft delete; Undo goes through `/api/admin/restore`. */
export async function DELETE(_request: Request, ctx: RouteContext<'/api/admin/[section]/[id]'>) {
  return handleAction(async () => {
    const { section, id } = await ctx.params;
    const found = findSection(section);
    if (found?.kind !== 'collection')
      return Response.json({ error: 'No such list' }, { status: 404 });
    return (await setDeleted(found.slug, id, true))
      ? Response.json({ ok: true })
      : Response.json({ error: 'No such entry' }, { status: 404 });
  });
}
