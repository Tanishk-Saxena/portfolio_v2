'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { TO_HOME } from '@/components/site/page-transition';
import { ArrowLeftIcon } from '@/components/ui/icons';
import { requestRestore } from '@/lib/scroll-memory';

/**
 * The article's Back link (owner revision, spec §10). If the reader came from the home
 * page, it returns them to their exact scroll position; otherwise (a direct visit) it goes
 * to the Writing section.
 */
export function BackLink() {
  const router = useRouter();
  // Home is where Back goes: have it ready so the transition starts at once.
  useEffect(() => router.prefetch('/'), [router]);
  return (
    <Link
      href="/#writing"
      transitionTypes={TO_HOME}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || !requestRestore()) return;
        e.preventDefault();
        router.push('/', { scroll: false, transitionTypes: TO_HOME });
      }}
      className="hit-44 relative mb-article-back inline-flex items-center gap-2 text-label tracking-label text-muted uppercase transition-colors duration-200 hover:text-accent active:text-ink"
    >
      <ArrowLeftIcon />
      Writing
    </Link>
  );
}
