/*
 * What the admin may upload (ADMIN-DESIGN-SPEC §10, Q-A17): images for the portrait and
 * project covers, a PDF for the résumé, and images, GIFs or short videos for a project's
 * modal media. Checked in the browser before uploading and again by
 * the upload route; the `media` bucket caps everything at 10 MB as well.
 */

export type UploadKind = 'image' | 'pdf' | 'media';

const MB = 1024 * 1024;

export const UPLOADS = {
  image: {
    types: ['image/jpeg', 'image/png', 'image/webp'],
    maxBytes: 5 * MB,
    accept: 'image/jpeg,image/png,image/webp',
    acceptText: 'JPG, PNG or WebP',
    folder: 'images',
    error: 'Images must be JPG, PNG or WebP, up to 5 MB.', // [ASSUMED] Q-A25
  },
  pdf: {
    types: ['application/pdf'],
    maxBytes: 10 * MB,
    accept: 'application/pdf',
    acceptText: 'PDF',
    folder: 'files',
    error: 'The résumé must be a PDF, up to 10 MB.', // [ASSUMED] Q-A25
  },
  media: {
    types: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'],
    maxBytes: 10 * MB,
    accept: 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm',
    acceptText: 'JPG, PNG, WebP, GIF, MP4 or WebM, up to 10 MB each',
    folder: 'media',
    error: 'Media must be JPG, PNG, WebP, GIF, MP4 or WebM, up to 10 MB.',
  },
} as const satisfies Record<UploadKind, object>;

export const isUploadKind = (kind: unknown): kind is UploadKind =>
  kind === 'image' || kind === 'pdf' || kind === 'media';

/** The refusal message, or null when the file can go up. */
export function checkUpload(kind: UploadKind, type: string, bytes: number): string | null {
  const rule = UPLOADS[kind];
  return (rule.types as readonly string[]).includes(type) && bytes > 0 && bytes <= rule.maxBytes
    ? null
    : rule.error;
}

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
  'image/gif': 'gif',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
};
export const extensionFor = (type: string) => EXTENSIONS[type] ?? 'bin';
