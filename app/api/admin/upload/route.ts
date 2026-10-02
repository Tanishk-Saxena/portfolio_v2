import { randomUUID } from 'node:crypto';
import { handleAction, readJson } from '@/lib/admin/handle-save';
import { checkUpload, extensionFor, isUploadKind, UPLOADS } from '@/lib/admin/uploads';
import { createAuthClient } from '@/lib/auth/server';

/**
 * A signed upload URL for one file (ADMIN-DESIGN-SPEC §10): `{ kind, type, bytes }` →
 * `{ signedUrl, publicUrl }`. The browser then uploads straight to Storage, so the file
 * never passes through this server. Storage RLS allows the upload only for the admin. Files
 * replaced or removed later stay in the bucket (Q-A17). Saving the record stores `publicUrl`.
 */
export async function POST(request: Request) {
  return handleAction(async () => {
    const body = (await readJson(request)) as { kind?: unknown; type?: unknown; bytes?: unknown };
    const { kind, type, bytes } = body ?? {};
    if (!isUploadKind(kind) || typeof type !== 'string' || typeof bytes !== 'number') {
      return Response.json({ error: 'Expected { kind, type, bytes }' }, { status: 400 });
    }
    const refused = checkUpload(kind, type, bytes);
    if (refused) return Response.json({ error: refused }, { status: 422 });

    const db = await createAuthClient();
    if (!db) return Response.json({ error: 'Storage is not configured' }, { status: 503 });
    const bucket = db.storage.from('media');
    const path = `${UPLOADS[kind].folder}/${randomUUID()}.${extensionFor(type)}`;
    const { data, error } = await bucket.createSignedUploadUrl(path);
    if (error) throw error;
    return Response.json({
      signedUrl: data.signedUrl,
      publicUrl: bucket.getPublicUrl(path).data.publicUrl,
    });
  });
}
