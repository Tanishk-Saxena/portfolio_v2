/**
 * Temporary body for Settings until 8.5 builds its form: the route, bar and title are real.
 * Same pattern as Phase 7's temporary landing.
 */
export function EditorPending({ title }: { title: string }) {
  return (
    <div className="flex max-w-admin-main flex-col gap-3 px-admin-x pt-admin-editor-top pb-30">
      <h1 className="font-serif text-admin-editor-title text-pretty">{title}</h1>
      <p className="text-muted">Settings arrive in Phase 8.5.</p>
    </div>
  );
}
