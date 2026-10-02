import { beforeEach, describe, expect, it, vi } from 'vitest';
import { handleSave } from './handle-save';

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

  it('writes a valid draft; a missing entry is 404 and a failed write is 500', async () => {
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
