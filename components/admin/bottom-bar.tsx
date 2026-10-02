import type { EditorState } from './editor-bar';

/**
 * The phones' save bar (ADMIN-DESIGN-SPEC §4.2): a round Discard (undo arrow, faded when
 * clean) and Save filling the rest. `data-bottom-bar` lifts the toast above it.
 */
export function BottomBar({ state }: { state: EditorState }) {
  return (
    <div
      data-bottom-bar
      className="fixed inset-x-0 bottom-0 z-8 flex gap-2.5 border-t border-line bg-paper-fade-strong px-4 pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom))] backdrop-blur-bar @wide:hidden"
    >
      <button
        type="button"
        onClick={state.onDiscard}
        disabled={!state.dirty}
        aria-label="Discard changes"
        data-ripple="press-row"
        className="grid size-12.5 flex-none cursor-pointer place-items-center rounded-full border border-line transition-opacity duration-200 disabled:cursor-default disabled:opacity-40"
      >
        <svg width="19" height="19" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M4.5 7.5h8a4 4 0 0 1 0 8H8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M7.5 4.2 4.2 7.5l3.3 3.3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <button
        type="button"
        onClick={state.onSave}
        disabled={state.status === 'saving'}
        data-ripple="paper"
        className="h-12.5 flex-1 cursor-pointer rounded-full bg-accent-fill text-body-sm font-medium whitespace-nowrap text-on-accent disabled:cursor-default"
      >
        {state.saveLabel}
      </button>
    </div>
  );
}
