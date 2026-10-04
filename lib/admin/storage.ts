import type { AdminRepositories } from '@/lib/domain/repositories';
import type { Profile, Project } from '@/lib/domain/types';

/*
 * Keeping the `media` bucket clean (owner, ADMIN-DESIGN-SPEC §14 "Storage cleanup"): once a
 * save no longer points at an uploaded file, the file is removed. A file is only removed
 * when no record points at it any more, so a duplicated project and its original can share
 * a cover. Cleanup runs after the save and never fails it.
 */

/** How long a deleted entry's files are kept: Undo must be able to bring them back. */
export const UNDO_WINDOW_MS = 10 * 60 * 1000;

const present = (urls: (string | null | undefined)[]) => urls.filter((u): u is string => !!u);

/** The uploaded files a profile points at: the portrait and the résumé. */
export const profileFiles = (p: Pick<Profile, 'portrait' | 'resumeUrl'>) =>
  present([p.portrait?.src, p.resumeUrl]);

/** The uploaded files a project points at: its cover and its modal media. */
export const projectFiles = (p: Pick<Project, 'image' | 'media'>) =>
  present([p.image?.src, ...(p.media ?? []).map((m) => m.src)]);

/**
 * The files to remove: those the save dropped (`before` minus `after`) and those of entries
 * deleted too long ago to restore, less anything a record still points at.
 */
export function releasable(
  before: string[],
  after: string[],
  references: { kept: string[]; expired: string[] },
): string[] {
  const kept = new Set([...after, ...references.kept]);
  return [...new Set([...before, ...references.expired])].filter((url) => !kept.has(url));
}

/** Call after the save has been written, so the references read are the new ones. */
export async function releaseFiles(
  r: Pick<AdminRepositories, 'files'>,
  before: string[] = [],
  after: string[] = [],
): Promise<void> {
  try {
    const gone = releasable(before, after, await r.files.references());
    if (gone.length) await r.files.remove(gone);
  } catch (error) {
    console.error('Storage cleanup failed; the save itself went through.', error);
  }
}

/** `folder/uuid.ext`, as the upload route names files: nothing else is ever removed. */
const UPLOADED_PATH = /^(images|files|media)\/[0-9a-f-]{36}\.[a-z0-9]{2,5}$/;

/**
 * The bucket path of a file this app uploaded, from its public URL; null for anything else
 * (a file the site serves itself, another host, a path that is not an upload's).
 */
export function storagePath(url: string, bucketUrl: string): string | null {
  const base = bucketUrl.endsWith('/') ? bucketUrl : `${bucketUrl}/`;
  if (!url.startsWith(base)) return null;
  const path = url.slice(base.length);
  return UPLOADED_PATH.test(path) ? path : null;
}
