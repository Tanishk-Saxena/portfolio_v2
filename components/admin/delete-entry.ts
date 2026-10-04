import { type CollectionSection, fullMessage } from '@/lib/admin/sections';
import { askConfirm } from './confirm-dialog';
import { showToast } from './toast';

/** Entries with a delete or an undo in flight: a second press does nothing (§7.3). */
const busy = new Set<string>();

/**
 * Confirm, soft delete, then a toast that offers Undo (ADMIN-DESIGN-SPEC §7.2–7.3). Shared by
 * the editor and the list rows. True once the entry is deleted; `refresh` runs after the
 * delete and after an Undo.
 */
export async function deleteEntry(
  section: CollectionSection,
  id: string,
  title: string,
  refresh: () => void,
): Promise<boolean> {
  if (busy.has(id)) return false;
  busy.add(id);
  try {
    const sure = await askConfirm({
      title: `Delete this ${section.singular}?`,
      body: `“${title}” will be removed from the site. You can undo straight after.`,
      ok: 'Delete',
      cancel: 'Cancel',
    });
    if (!sure) return false;
    const path = `/api/admin/${section.slug}/${encodeURIComponent(id)}`;
    const response = await fetch(path, { method: 'DELETE' }).catch(() => null);
    if (!response?.ok) {
      showToast('Could not delete. Try again.');
      return false;
    }
  } finally {
    busy.delete(id);
  }
  refresh();
  showToast('Deleted, removed from the site', {
    undo: async () => {
      const restored = await fetch('/api/admin/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section: section.slug, id }),
      }).catch(() => null);
      const full = restored?.status === 409;
      showToast(restored?.ok ? 'Restored' : full ? fullMessage(section) : 'Could not undo.');
      refresh();
    },
  });
  return true;
}
