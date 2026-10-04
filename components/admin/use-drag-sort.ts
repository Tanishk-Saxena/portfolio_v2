'use client';

import { type PointerEvent, useLayoutEffect, useRef, useState } from 'react';

const SETTLE = { duration: 180, easing: 'cubic-bezier(0.2, 0.85, 0.25, 1)' };

/** The item in hand: where it was grabbed, where the pointer is, and how far it is moved. */
interface Held {
  id: string;
  el: HTMLElement;
  grabX: number;
  grabY: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
}

const itemsOf = (held: HTMLElement) => [
  ...(held.parentElement?.querySelectorAll<HTMLElement>(':scope > [data-sort-id]') ?? []),
];

/** Keeps the held item under the pointer, wherever the list has just put it. */
function follow(held: Held, axis: 'y' | 'both') {
  const rect = held.el.getBoundingClientRect();
  const [left, top] = [rect.left - held.dx, rect.top - held.dy]; // where it sits untransformed
  held.dx = axis === 'y' ? 0 : held.x - held.grabX - left;
  held.dy = held.y - held.grabY - top;
  held.el.style.transform = `translate(${held.dx}px, ${held.dy}px)`;
}

/**
 * Drag to reorder (owner, ADMIN-DESIGN-SPEC §14), by pointer, so it works with a finger as
 * well as a mouse. Items carry `data-sort-id`; a handle takes `handle(id)`. The held item
 * lifts and follows the pointer; passing another item's middle trades places
 * (`onMove(id, toIndex)`), and the others glide to their new places; `onDrop` runs once
 * when it is let go. Transforms only, set
 * straight on the elements, so a drag renders nothing until places change. Keyboards keep
 * the arrows.
 */
export function useDragSort(
  ids: string[],
  onMove: (id: string, toIndex: number) => void,
  { axis = 'both', onDrop }: { axis?: 'y' | 'both'; onDrop?: () => void } = {},
) {
  const [dragging, setDragging] = useState<string | null>(null);
  const held = useRef<Held | null>(null);
  const before = useRef<Map<string, DOMRect> | null>(null);
  const order = ids.join('\n');

  // Places changed: keep the held item under the pointer, and let the others glide from
  // where they were (FLIP).
  useLayoutEffect(() => {
    const [h, was] = [held.current, before.current];
    before.current = null;
    if (!h || !was) return;
    follow(h, axis);
    for (const el of itemsOf(h.el)) {
      const from = was.get(el.dataset.sortId ?? '');
      if (el === h.el || !from) continue;
      const now = el.getBoundingClientRect();
      const [dx, dy] = [from.left - now.left, from.top - now.top];
      if (dx || dy) {
        el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], SETTLE);
      }
    }
  }, [order, axis]);

  function release() {
    const h = held.current;
    held.current = null;
    setDragging(null);
    if (!h) return;
    // Settle into its place, then leave no inline style behind.
    const back = h.el.animate(
      [{ transform: `translate(${h.dx}px, ${h.dy}px)` }, { transform: 'none' }],
      SETTLE,
    );
    h.el.style.transform = '';
    back.finished.catch(() => {});
    onDrop?.(); // the drag is over: now, and only now, the new order may be saved
  }

  function handle(id: string) {
    return {
      onPointerDown(e: PointerEvent<HTMLElement>) {
        const el = e.currentTarget.closest<HTMLElement>('[data-sort-id]');
        if (e.button !== 0 || !el) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        const rect = el.getBoundingClientRect();
        held.current = {
          id,
          el,
          grabX: e.clientX - rect.left,
          grabY: e.clientY - rect.top,
          x: e.clientX,
          y: e.clientY,
          dx: 0,
          dy: 0,
        };
        setDragging(id);
      },
      onPointerMove(e: PointerEvent<HTMLElement>) {
        const h = held.current;
        if (!h || h.id !== id) return;
        [h.x, h.y] = [e.clientX, e.clientY];
        follow(h, axis);

        const items = itemsOf(h.el);
        const target = items.find((el) => {
          if (el === h.el) return false;
          const r = el.getBoundingClientRect();
          const inY = h.y >= r.top && h.y <= r.bottom;
          return axis === 'y' ? inY : inY && h.x >= r.left && h.x <= r.right;
        });
        const [from, to] = [ids.indexOf(id), ids.indexOf(target?.dataset.sortId ?? '')];
        if (!target || to < 0 || to === from) return;
        // Trade places only once the pointer is past the other item's middle, along the line
        // the two sit on: items of unlike sizes would otherwise swap back and forth.
        const t = target.getBoundingClientRect();
        const own = h.el.getBoundingClientRect();
        const stacked =
          axis === 'y' || Math.abs(t.top - (own.top - h.dy)) > Math.abs(t.left - (own.left - h.dx));
        const pointer = stacked ? h.y : h.x;
        const middle = stacked ? t.top + t.height / 2 : t.left + t.width / 2;
        if (to > from ? pointer < middle : pointer > middle) return;
        before.current = new Map(
          items.map((el) => [el.dataset.sortId ?? '', el.getBoundingClientRect()]),
        );
        onMove(id, to);
      },
      onPointerUp: release,
      onPointerCancel: release,
    };
  }

  return { dragging, handle };
}
