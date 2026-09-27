import { renderMonogram } from '@/lib/og/monogram';

export const size = { width: 48, height: 48 };
export const contentType = 'image/png';

export default function Icon() {
  return renderMonogram(size.width);
}
