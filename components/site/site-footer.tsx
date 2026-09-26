/** Footer (spec §4.4): its height derives from the floating-control offset, so the rule
 *  above it passes through the gap between the parked nav buttons (Dev notes). */
export function SiteFooter({ note, name }: { note: string; name: string }) {
  return (
    <footer className="measure-page flex min-h-[calc(var(--spacing-float)+96px)] flex-wrap items-center justify-between gap-x-3 gap-y-1.5 text-small text-muted">
      <span>{note}</span>
      <span>
        © {new Date().getFullYear()} {name}
      </span>
    </footer>
  );
}
