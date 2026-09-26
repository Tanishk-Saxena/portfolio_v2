'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

const SPEAKER =
  'M12 4.4 7.6 8H4.6v8h3L12 19.6zM16.2 9.2a4 4 0 0 1 0 5.6M18.8 6.6a7.6 7.6 0 0 1 0 10.8';
const PAUSE = 'M9 6.5h2.2v11H9zM12.8 6.5H15v11h-2.2z';

const noop = () => () => {};
const hasSpeech = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

/**
 * Text-to-speech for the article (spec §6 ListenButton, Q18). Reads the <article> text
 * with the platform speech API; toggles to Stop while speaking. Where the API is missing (and
 * during SSR) an invisible 40px spacer holds the row's height, so hydration never shifts layout.
 */
export function ListenButton({ targetId }: { targetId: string }) {
  const supported = useSyncExternalStore(noop, hasSpeech, () => false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  if (!supported) return <span aria-hidden="true" className="h-10" />;

  function toggle() {
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const text = document.getElementById(targetId)?.innerText ?? '';
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    synth.cancel();
    synth.speak(utterance);
    setSpeaking(true);
  }

  return (
    <button
      type="button"
      aria-pressed={speaking}
      onClick={toggle}
      className={`hit-44 relative ml-auto inline-flex h-10 cursor-pointer items-center gap-2.25 rounded-pill border px-4 text-small transition-colors duration-250 ${speaking ? 'border-accent-fill bg-accent-fill text-on-accent' : 'border-border-listen text-ink hover:border-accent'} active:border-accent-fill active:bg-accent-fill active:text-on-accent`}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className={speaking ? '' : 'text-accent'}
      >
        <path
          d={speaking ? PAUSE : SPEAKER}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {speaking ? 'Stop' : 'Listen'}
    </button>
  );
}
