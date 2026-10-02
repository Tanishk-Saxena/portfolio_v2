import { savedAccent } from '@/lib/og/accent';
import { renderMonogram } from '@/lib/og/monogram';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

// Square: iOS applies its own rounded mask.
export default async function AppleIcon() {
  return renderMonogram(size.width, await savedAccent(), 0);
}
