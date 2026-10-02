import type { EntrySlug } from '@/lib/admin/forms';
import { handleSave } from '@/lib/admin/handle-save';
import { updateEntry } from '@/lib/admin/save';
import { SECTIONS, type SectionSlug } from '@/lib/admin/sections';

/** Save an edit to a collection entry (ADMIN-DESIGN-SPEC §9). 404 when it no longer exists. */
export async function PUT(request: Request, ctx: RouteContext<'/api/admin/[section]/[id]'>) {
  const { section, id } = await ctx.params;
  return handleSave(
    request,
    section,
    (slug) => SECTIONS[slug as SectionSlug].kind === 'collection',
    (slug, draft) => updateEntry(slug as EntrySlug, id, draft),
  );
}
