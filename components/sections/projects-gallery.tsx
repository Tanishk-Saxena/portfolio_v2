'use client';

import { useState } from 'react';
import type { Project } from '@/lib/domain/types';
import { usePagedList } from '@/lib/hooks/use-paged-list';
import { ShowMoreButton } from '@/components/ui/show-more-button';
import { ProjectCard } from './project-card';
import { ProjectModal } from './project-modal';

/** Cards in a centred wrap, three at a time; one modal shared by all cards. */
export function ProjectsGallery({ projects }: { projects: Project[] }) {
  const { visible, hasMore, showMore, containerRef } = usePagedList(projects.length);
  const [selected, setSelected] = useState<Project | null>(null);

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
            onOpen={() => setSelected(project)}
          />
        ))}
      </div>
      {hasMore && <ShowMoreButton onClick={showMore} />}
      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </>
  );
}
