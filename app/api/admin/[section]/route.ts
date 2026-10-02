import type { EntrySlug } from '@/lib/admin/forms';
import { handleSave } from '@/lib/admin/handle-save';
import { createEntry, saveSingle, type SingleFormSlug } from '@/lib/admin/save';
import { SECTIONS } from '@/lib/admin/sections';

const isSingle = (slug: string) => SECTIONS[slug as SingleFormSlug]?.kind === 'single';

/** Save a single record: Hero, About, Contact (ADMIN-DESIGN-SPEC §9). */
export async function PUT(request: Request, ctx: RouteContext<'/api/admin/[section]'>) {
  const { section } = await ctx.params;
  return handleSave(request, section, isSingle, (slug, draft) =>
    saveSingle(slug as SingleFormSlug, draft),
  );
}

/** Create a collection entry; it joins the end of the list. */
export async function POST(request: Request, ctx: RouteContext<'/api/admin/[section]'>) {
  const { section } = await ctx.params;
  return handleSave(
    request,
    section,
    (slug) => !isSingle(slug),
    (slug, draft) => createEntry(slug as EntrySlug, draft),
  );
}
