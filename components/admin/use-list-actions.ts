'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { hasStatus, type ListRow, statusOf, toggleToast } from '@/lib/admin/rows';
import type { CollectionSection } from '@/lib/admin/sections';
import { showToast } from './toast';

/** The order is sent this long after the last ↑/↓ (one request for five taps, §7.1). */
const ORDER_DELAY_MS = 700;

export async function send(method: string, path: string, body?: unknown, keepalive = false) {
  return fetch(path, {
    method,
    keepalive,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  }).catch(() => null);
}

/**
 * A list's optimistic actions (ADMIN-DESIGN-SPEC §7.1, §7.3): the quick toggle (with Undo)
 * and ↑/↓ reorder. Both change the rows at once and roll back if the server says no. Fresh
 * rows from the server (after `router.refresh()`) replace the local ones.
 */
export function useListActions(section: CollectionSection, serverRows: ListRow[]) {
  const router = useRouter();
  const [rows, setRows] = useState(serverRows);
  const [synced, setSynced] = useState(serverRows);
  if (serverRows !== synced) {
    setSynced(serverRows);
    setRows(serverRows);
  }

  const orderTimer = useRef<number | undefined>(undefined);
  const beforeMoves = useRef<ListRow[] | null>(null);
  const pendingOrder = useRef<string[] | null>(null);
  const orderPath = `/api/admin/${section.slug}/order`;

  // Leaving the list (in the app, or a reload) inside the 700ms window still saves the order:
  // a keepalive request outlives the page.
  useEffect(() => {
    const flush = () => {
      window.clearTimeout(orderTimer.current);
      if (pendingOrder.current) void send('PATCH', orderPath, { ids: pendingOrder.current }, true);
      pendingOrder.current = null;
    };
    window.addEventListener('pagehide', flush);
    return () => {
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, [orderPath]);

  function move(id: string, by: -1 | 1) {
    const i = rows.findIndex((r) => r.id === id);
    const j = i + by;
    if (i < 0 || j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    beforeMoves.current ??= rows;
    pendingOrder.current = next.map((r) => r.id);
    setRows(next);

    window.clearTimeout(orderTimer.current);
    orderTimer.current = window.setTimeout(async () => {
      const before = beforeMoves.current;
      beforeMoves.current = null;
      const ids = next.map((r) => r.id);
      pendingOrder.current = null;
      const response = await send('PATCH', orderPath, { ids });
      if (response?.ok) {
        showToast('Order saved');
        router.refresh();
      } else {
        if (before) setRows(before);
        showToast('Could not save the new order.');
      }
    }, ORDER_DELAY_MS);
  }

  async function setVisible(row: ListRow, visible: boolean) {
    return send('PATCH', `/api/admin/${section.slug}/${encodeURIComponent(row.id)}`, { visible });
  }

  async function toggle(row: ListRow) {
    const slug = section.slug;
    if (!row.status || !hasStatus(slug)) return;
    const visible = !row.status.live;
    if (visible && row.canGoLive === false) {
      showToast('Add a body before publishing');
      return;
    }
    const before = rows;
    setRows(rows.map((r) => (r.id === row.id ? { ...r, status: statusOf(slug, visible) } : r)));

    const response = await setVisible(row, visible);
    if (!response?.ok) {
      setRows(before);
      showToast(
        response?.status === 422
          ? 'Add a body before publishing'
          : 'Could not reach the server. Nothing changed.',
      );
      return;
    }
    router.refresh();
    showToast(toggleToast(slug, visible, row.sub), {
      undo: async () => {
        const back = await setVisible(row, !visible);
        showToast(back?.ok ? 'Restored' : 'Could not undo.');
        router.refresh();
      },
    });
  }

  return { rows, move, toggle };
}
