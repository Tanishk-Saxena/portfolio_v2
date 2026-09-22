import type { Metadata } from 'next';
import { TokenPanel } from '@/components/tokens/token-panel';

export const metadata: Metadata = {
  title: 'Tokens',
  robots: { index: false, follow: false },
};

// Phase 1 verification page: every token, in both modes, side by side.
export default function TokensPage() {
  return (
    <main className="grid min-h-svh grid-cols-1 xl:grid-cols-2">
      <TokenPanel mode="light" />
      <TokenPanel mode="dark" />
    </main>
  );
}
