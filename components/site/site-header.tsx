import Link from 'next/link';
import { SignatureMark } from './signature-mark';
import { ThemeToggle } from './theme-toggle';

/**
 * Fixed translucent header (spec §6 Header). The signature returns to the top of the main
 * page, or back to it from an article (label includes the visible name: WCAG 2.5.3, Q23).
 */
export function SiteHeader({ name, onHome }: { name: string; onHome: boolean }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border-header bg-paper-fade backdrop-blur-[10px] transition-colors duration-450">
      <div className="measure-page flex h-header items-center justify-between gap-4">
        <Link
          href={onHome ? '#hero' : '/'}
          aria-label={onHome ? `${name} — back to top` : `${name} — back to portfolio`}
          data-signature-slot
          className="inline-flex origin-[0%_80%] translate-y-1.5 -rotate-4 flex-col"
        >
          <SignatureMark name={name} />
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
