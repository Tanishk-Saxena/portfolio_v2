/**
 * Public-site shell: the `page` container (the one breakpoint is a container query on it,
 * spec §4.3) and the fixed paper grain. Header and footer are per-page so the article
 * route can point its signature back home.
 */
export default function SiteLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="@container/page relative min-h-svh overflow-x-clip">
      <div className="grain" aria-hidden="true" />
      {children}
    </div>
  );
}
