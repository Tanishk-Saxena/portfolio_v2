import { savedAccent } from '@/lib/og/accent';
import { renderMonogram } from '@/lib/og/monogram';

export const size = { width: 48, height: 48 };
export const contentType = 'image/png';

export default async function Icon() {
  return renderMonogram(size.width, await savedAccent());
}
