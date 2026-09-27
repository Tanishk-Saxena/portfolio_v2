import { ArrowUpIcon } from '@/components/ui/icons';

/**
 * Back-to-top (spec §6 BackToTop): 42px visual (hit area extended to 44px), 16px above the
 * nav button, shown with it once the hero is past and hidden while the menu is open.
 * A plain `#hero` link, no JS: the URL follows the scroll (so a reload stays at the top,
 * not on the last section's hash), the browser scrolls natively with the page's
 * scroll-behavior (instant under reduced motion), and the sequential-focus start moves
 * to the hero. Its press ripple is the inverse of its face (ink on paper), since the page
 * behind it can be the accent band.
 */
export function BackToTop({ visible }: { visible: boolean }) {
  return (
    <a
      href="#hero"
      aria-label="Back to top"
      inert={!visible}
      data-ripple="ink"
      className={`hit-44 absolute bottom-full left-1/2 mb-4 -ml-5.25 grid size-10.5 place-items-center rounded-full border border-border-quiet bg-paper text-ink shadow-float-top [transition:opacity_.3s_ease,translate_.4s_var(--ease-out-soft),scale_.4s_var(--ease-out-soft),visibility_0s_linear_var(--vis-delay),border-color_.2s_ease] hover:border-ink hover:text-ink data-pressed:border-ink! data-pressed:text-paper! ${visible ? '[--vis-delay:0s]' : 'invisible opacity-0 [--vis-delay:.4s] motion-safe:translate-y-2.5 motion-safe:scale-70'}`}
    >
      <ArrowUpIcon />
    </a>
  );
}
