'use client';

import { useRef, useState } from 'react';
import type { Project } from '@/lib/domain/types';
import { usePagedList } from '@/lib/hooks/use-paged-list';
import { ShowMoreButton } from '@/components/ui/show-more-button';
import { ProjectCard } from './project-card';
import { originFrom, ProjectModal, type ModalOrigin } from './project-modal';

/** Cards in a centred wrap, three at a time; one modal shared by all cards. */
export function ProjectsGallery({
  projects,
  mediaAutoRotate,
}: {
  projects: Project[];
  mediaAutoRotate: boolean;
}) {
  const { visible, hasMore, canCollapse, showMore, showLess, containerRef } = usePagedList(
    'projects',
    projects.length,
  );
  const [selected, setSelected] = useState<Project | null>(null);
  const [origin, setOrigin] = useState<ModalOrigin>({ x: 0, y: 40, s: 0.8 });
  // Safari doesn't focus a tapped button, so the dialog can't restore focus by itself:
  // return it to the card explicitly (WCAG 2.4.3).
  const trigger = useRef<HTMLElement | null>(null);

  return (
    <>
      <div
        ref={(el) => {
          containerRef.current = el;
        }}
        className="flex flex-wrap justify-center gap-grid-projects"
      >
        {projects.slice(0, visible).map((project, i) => (
          <ProjectCard
            key={project.id}
            project={project}
            index={i}
            onOpen={(card) => {
              trigger.current = card.querySelector<HTMLElement>('.card-trigger');
              setOrigin(originFrom(card));
              setSelected(project);
            }}
          />
        ))}
      </div>
      {(hasMore || canCollapse) && (
        <ShowMoreButton
          label={hasMore ? 'Show more' : 'Show less'}
          onClick={hasMore ? showMore : showLess}
        />
      )}
      <ProjectModal
        project={selected}
        origin={origin}
        autoRotate={mediaAutoRotate}
        onClose={() => {
          setSelected(null);
          trigger.current?.focus({ preventScroll: true });
        }}
      />
    </>
  );
}
