import type { Metadata } from 'next';
import { RippleHost } from '@/components/site/ripple-host';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

/**
 * Admin shell: its own `admin` container for the 760px switch (Q-A3), no grain (ADMIN-DESIGN
 * §4), the site's ripple for presses (Q-A4). The theme comes from the admin's own key.
 */
export default function AdminLayout({ children }: LayoutProps<'/admin'>) {
  return (
    <div className="@container/admin min-h-svh bg-paper text-body-sm text-ink">
      {children}
      <RippleHost />
    </div>
  );
}
