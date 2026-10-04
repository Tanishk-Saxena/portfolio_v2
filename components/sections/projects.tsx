import type { Project } from '@/lib/domain/types';
import { ProjectsGallery } from './projects-gallery';
import { Section } from './section';

/** Projects (spec §7): 4:3 cards, overlay on hover/focus/touch, detail in a modal. */
export function Projects({
  projects,
  mediaAutoRotate,
}: {
  projects: Project[];
  mediaAutoRotate: boolean;
}) {
  if (projects.length === 0) return null;

  return (
    <Section id="projects" label="Projects">
      <ProjectsGallery projects={projects} mediaAutoRotate={mediaAutoRotate} />
    </Section>
  );
}
