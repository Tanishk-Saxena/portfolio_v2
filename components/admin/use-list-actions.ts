'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { hasStatus, type ListRow, statusOf, toggleToast } from '@/lib/admin/rows';
import type { CollectionSection } from '@/lib/admin/sections';
import { deleteEntry } from './delete-entry';
import { showToast } from './toast';

/** The order is sent this long after the last move (one request for five taps, §7.1). */
const SETTLE_DELAY_MS = 700;
/**
 * A status is sent this long after the last press on its pill: only the final state goes,
 * and presses that cancel out send nothing. Longer than the order's, since a second thought
 * comes slower than a second tap (owner, §14).
 */
const TOGGLE_DELAY_MS = 1200;

export async function send(method: string, path: string, body?: unknown, keepalive = false) {
  return fetch(path, {
    method,
    keepalive,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  }).catch(() => null);
}

/** A pill pressed but not sent yet: what the server holds, and what the owner wants. */
interface PendingToggle {
  row: ListRow;
  from: boolean;
  to: boolean;
  timer: number;
}

/**
 * A list's optimistic actions (ADMIN-DESIGN-SPEC §7.1, §7.3): the quick toggle (with Undo),
 * reorder (↑/↓ or a drag) and Delete. Toggle and reorder change the rows at once, send one request once
 * the presses stop, and roll back if the server says no. Fresh rows from the server (after
 * `router.refresh()`) replace the local ones.
 */
export function useListActions(section: CollectionSection, serverRows: ListRow[]) {
  const router = useRouter();
  const [rows, setRows] = useState(serverRows);
  const [synced, setSynced] = useState(serverRows);
  // Moves not sent yet: server rows arriving meanwhile (an earlier save's refresh) are older
  // than what is on screen, so they are skipped; the pending save's own refresh follows.
  const [reordering, setReordering] = useState(false);
  if (serverRows !== synced) {
    setSynced(serverRows);
    if (!reordering) setRows(serverRows);
  }

  const latest = useRef(rows);
  useEffect(() => {
    latest.current = rows;
  }, [rows]);
  const orderTimer = useRef<number | undefined>(undefined);
  const beforeMoves = useRef<ListRow[] | null>(null);
  const pendingOrder = useRef<string[] | null>(null);
  const pendingToggles = useRef(new Map<string, PendingToggle>());
  const orderPath = `/api/admin/${section.slug}/order`;
  const entryPath = (id: string) => `/api/admin/${section.slug}/${encodeURIComponent(id)}`;
  const slug = section.slug;

  // Leaving the list (in the app, or a reload) inside either delay still saves the change:
  // a keepalive request outlives the page.
  useEffect(() => {
    const toggles = pendingToggles.current;
    const flush = () => {
      window.clearTimeout(orderTimer.current);
      if (pendingOrder.current) void send('PATCH', orderPath, { ids: pendingOrder.current }, true);
      pendingOrder.current = null;
      for (const [id, { from, to, timer }] of toggles) {
        window.clearTimeout(timer);
        if (from !== to) {
          const path = `/api/admin/${slug}/${encodeURIComponent(id)}`;
          void send('PATCH', path, { visible: to }, true);
        }
      }
      toggles.clear();
    };
    window.addEventListener('pagehide', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, [orderPath, slug]);

  /** Puts a row at `to` (a drag), at once; the order is sent once the moves stop. */
  function moveTo(id: string, to: number) {
    const current = latest.current;
    const i = current.findIndex((r) => r.id === id);
    if (i < 0 || to < 0 || to >= current.length || i === to) return;
    const next = [...current];
    next.splice(to, 0, ...next.splice(i, 1));
    beforeMoves.current ??= current;
    pendingOrder.current = next.map((r) => r.id);
    latest.current = next; // a drag's next event may come before the render
    setRows(next);
    setReordering(true);

    window.clearTimeout(orderTimer.current);
    orderTimer.current = window.setTimeout(async () => {
      const before = beforeMoves.current;
      beforeMoves.current = null;
      const ids = next.map((r) => r.id);
      pendingOrder.current = null;
      const response = await send('PATCH', orderPath, { ids });
      if (!pendingOrder.current) setReordering(false); // unless another move began meanwhile
      if (response?.ok) {
        showToast('Order saved');
        router.refresh();
      } else {
        if (before) setRows(before);
        showToast('Could not save the new order.');
      }
    }, SETTLE_DELAY_MS);
  }

  /** One step up or down (the arrows). */
  const move = (id: string, by: -1 | 1) =>
    moveTo(id, latest.current.findIndex((r) => r.id === id) + by);

  const show = (id: string, visible: boolean) => {
    if (!hasStatus(slug)) return;
    setRows((all) => all.map((r) => (r.id === id ? { ...r, status: statusOf(slug, visible) } : r)));
  };

  /** Sends the state the presses settled on; nothing when they cancelled out. */
  async function settle(id: string) {
    const pending = pendingToggles.current.get(id);
    pendingToggles.current.delete(id);
    if (!pending || pending.from === pending.to || !hasStatus(slug)) return;
    const { row, from, to } = pending;
    const response = await send('PATCH', entryPath(id), { visible: to });
    if (!response?.ok) {
      show(id, from);
      showToast(
        response?.status === 422
          ? 'Add a body before publishing'
          : 'Could not reach the server. Nothing changed.',
      );
      return;
    }
    router.refresh();
    showToast(toggleToast(slug, to, row.sub), {
      undo: async () => {
        const back = await send('PATCH', entryPath(id), { visible: from });
        showToast(back?.ok ? 'Restored' : 'Could not undo.');
        router.refresh();
      },
    });
  }

  function toggle(row: ListRow) {
    if (!row.status || !hasStatus(slug)) return;
    const visible = !row.status.live;
    if (visible && row.canGoLive === false) {
      showToast('Add a body before publishing');
      return;
    }
    const earlier = pendingToggles.current.get(row.id);
    window.clearTimeout(earlier?.timer);
    pendingToggles.current.set(row.id, {
      row,
      from: earlier ? earlier.from : row.status.live,
      to: visible,
      timer: window.setTimeout(() => void settle(row.id), TOGGLE_DELAY_MS),
    });
    show(row.id, visible);
  }

  /** Confirm, delete, Undo in the toast (§7.2); the row leaves once the server agrees. */
  function remove(row: ListRow) {
    void deleteEntry(section, row.id, row.title, () => router.refresh());
  }

  return { rows, move, moveTo, toggle, remove };
}
