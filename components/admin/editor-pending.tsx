/**
 * Temporary editor body for 8.1: the route, bar and title are real, the form arrives in 8.2.
 * Same pattern as Phase 7's temporary landing.
 */
export function EditorPending({ title }: { title: string }) {
  return (
    <div className="flex max-w-180 flex-col gap-3 px-admin-x pt-admin-editor-top pb-30">
      <h1 className="font-serif text-admin-editor-title text-pretty">{title}</h1>
      <p className="text-muted">The editor arrives in Phase 8.2.</p>
    </div>
  );
}
