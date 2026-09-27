import { HomeLink } from './home-link';
import { HeaderShell } from './header-shell';
import { SignatureMark } from './signature-mark';
import { ThemeToggle } from './theme-toggle';

const SIGNATURE = 'inline-flex origin-[0%_80%] translate-y-1.5 -rotate-4 flex-col';

/**
 * Fixed translucent header (spec §6 Header), auto-hiding on scroll (HeaderShell). The
 * signature returns to the top of the main page, or back to it from an article (label
 * includes the visible name: WCAG 2.5.3, Q23).
 */
export function SiteHeader({ name, onHome }: { name: string; onHome: boolean }) {
  return (
    <HeaderShell>
      <div className="measure-page flex h-header items-center justify-between gap-4">
        {onHome ? (
          // A plain link: next/link skips navigation when the URL is already #hero.
          <a
            href="#hero"
            aria-label={`${name} — back to top`}
            data-signature-slot
            className={SIGNATURE}
          >
            <SignatureMark name={name} />
          </a>
        ) : (
          <HomeLink
            href="/"
            aria-label={`${name} — back to portfolio`}
            data-signature-slot
            className={SIGNATURE}
          >
            <SignatureMark name={name} />
          </HomeLink>
        )}
        <ThemeToggle />
      </div>
    </HeaderShell>
  );
}
