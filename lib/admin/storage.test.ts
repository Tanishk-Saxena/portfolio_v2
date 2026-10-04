import { describe, expect, it, vi } from 'vitest';
import { releasable, releaseFiles, storagePath } from './storage';

const BUCKET = 'https://x.supabase.co/storage/v1/object/public/media/';
const file = (name: string) => `${BUCKET}images/${name}.webp`;
const [OLD, NEW, SHARED] = ['old', 'new', 'shared'].map(file);

describe('storage cleanup', () => {
  it('removes what a save dropped, never a file still pointed at', async () => {
    // The save swapped OLD for NEW and dropped SHARED, which another project still uses.
    const references = [NEW, SHARED];
    expect(releasable([OLD, SHARED], [NEW], references)).toEqual([OLD]);
    expect(releasable([OLD], [OLD], [OLD])).toEqual([]);

    const remove = vi.fn(async () => {});
    const files = { references: vi.fn(async () => references), remove };
    await releaseFiles({ files }, [OLD], [OLD]); // nothing dropped: storage is not even asked
    expect(files.references).not.toHaveBeenCalled();
    await releaseFiles({ files }, [OLD, SHARED], [NEW]);
    expect(remove).toHaveBeenCalledWith([OLD]);

    // A storage failure is logged and swallowed: the save already went through.
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const failing = {
      files: {
        references: async () => references,
        remove: async () => Promise.reject(new Error('storage down')),
      },
    };
    await expect(releaseFiles(failing, [OLD], [NEW])).resolves.toBeUndefined();
    expect(log).toHaveBeenCalled();
    log.mockRestore();
  });

  it('only a file this app uploaded maps to a bucket path', () => {
    const id = '3f2b8c1e-9a4d-4e6f-8b7a-1c2d3e4f5a6b';
    expect(storagePath(`${BUCKET}images/${id}.webp`, BUCKET)).toBe(`images/${id}.webp`);
    expect(storagePath(`${BUCKET}media/${id}.mp4`, BUCKET.slice(0, -1))).toBe(`media/${id}.mp4`);
    for (const url of [
      '/resume.pdf', // served by the site
      `https://elsewhere.example/storage/v1/object/public/media/images/${id}.webp`,
      `${BUCKET}images/../files/${id}.pdf`,
      `${BUCKET}samples/clip.mp4`, // not an upload's name
      `${BUCKET}images/${id}.webp?download=1`,
    ]) {
      expect(storagePath(url, BUCKET)).toBeNull();
    }
  });
});
