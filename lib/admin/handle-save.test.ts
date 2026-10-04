import { beforeEach, describe, expect, it, vi } from 'vitest';
import { handleSave } from './handle-save';
import { Conflict, createEntry, Full, isFull } from './save';

const auth = vi.hoisted(() => ({ admin: null as { id: string; email: string } | null }));
vi.mock('@/lib/auth/server', () => ({ getAdmin: async () => auth.admin }));

const post = (body: unknown) =>
  new Request('http://admin.test/api/admin/quotes', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
const quote = { text: 'Less, but better.', author: 'Dieter Rams', active: true };

describe('admin saves (route handlers)', () => {
  beforeEach(() => {
    auth.admin = { id: 'u1', email: 'owner@example.com' };
  });

  it('answers each failure with its status, and writes nothing', async () => {
    const write = vi.fn(async () => ({ id: 'q1', updatedAt: null }));
    const all = () => true;

    auth.admin = null;
    expect((await handleSave(post(quote), 'quotes', all, write)).status).toBe(401);
    auth.admin = { id: 'u1', email: 'owner@example.com' };

    expect((await handleSave(post(quote), 'nope', all, write)).status).toBe(404);
    expect((await handleSave(post(quote), 'quotes', () => false, write)).status).toBe(404);
    expect((await handleSave(post('{not json'), 'quotes', all, write)).status).toBe(400);
    expect((await handleSave(post({ text: 1 }), 'quotes', all, write)).status).toBe(400);

    const invalid = await handleSave(post({ ...quote, text: '' }), 'quotes', all, write);
    expect(invalid.status).toBe(422);
    expect(await invalid.json()).toEqual({ errors: { text: 'Quote is required.' } });
    expect(write).not.toHaveBeenCalled();
  });

  it('writes a valid draft; missing is 404, a stale stamp 409, a failed write 500', async () => {
    const ok = await handleSave(
      post(quote),
      'quotes',
      () => true,
      async (slug, draft) => {
        expect(slug).toBe('quotes');
        expect(draft).toEqual(quote);
        return { id: 'q1', updatedAt: '2026-10-02T10:00:00Z' };
      },
    );
    expect(ok.status).toBe(200);
    expect(await ok.json()).toEqual({ id: 'q1', updatedAt: '2026-10-02T10:00:00Z' });

    const gone = await handleSave(
      post(quote),
      'quotes',
      () => true,
      async () => null,
    );
    expect(gone.status).toBe(404);

    // The stamp the editor started from reaches the write; a stale one is 409.
    const stale = await handleSave(
      post({ ...quote, updatedAt: '2026-01-01T00:00:00Z' }),
      'quotes',
      () => true,
      async (_slug, _draft, expected) => {
        expect(expected).toBe('2026-01-01T00:00:00Z');
        throw new Conflict();
      },
    );
    expect(stale.status).toBe(409);

    // A full list (four skill groups) is a 409 the editor can tell apart.
    const full = await handleSave(
      post(quote),
      'quotes',
      () => true,
      async () => {
        throw new Full();
      },
    );
    expect([full.status, await full.json()]).toEqual([409, { error: 'Full', full: true }]);
    // The shipped fixtures hold four groups: a fifth is refused before any write.
    expect([await isFull('skills'), await isFull('quotes')]).toEqual([true, false]);
    const fifth = { title: 'Fifth', items: ['a', 'b', 'c', 'd'] };
    await expect(createEntry('skills', fifth)).rejects.toBeInstanceOf(Full);

    vi.spyOn(console, 'error').mockImplementation(() => {});
    const failed = await handleSave(
      post(quote),
      'quotes',
      () => true,
      async () => {
        throw new Error('db down');
      },
    );
    expect(failed.status).toBe(500);
  });
});
