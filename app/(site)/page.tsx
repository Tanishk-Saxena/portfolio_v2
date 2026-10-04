import type { Metadata } from 'next';
import { About } from '@/components/sections/about';
import { Contact } from '@/components/sections/contact';
import { Experience } from '@/components/sections/experience';
import { Hero } from '@/components/sections/hero';
import { Projects } from '@/components/sections/projects';
import { Quotes } from '@/components/sections/quotes';
import { Skills } from '@/components/sections/skills';
import { Writing } from '@/components/sections/writing';
import { FloatingNav } from '@/components/site/floating-nav';
import { NAV_SECTIONS } from '@/components/site/nav-sections';
import { PageTransition } from '@/components/site/page-transition';
import { RevealObserver } from '@/components/site/reveal-observer';
import { ScrollRestore } from '@/components/site/scroll-restore';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { JsonLd } from '@/components/site/json-ld';
import { getRepositories } from '@/lib/container';
import { personJsonLd, profilePageJsonLd } from '@/lib/structured-data';

export const metadata: Metadata = { alternates: { canonical: '/' } };

// Section order is the mockup's (spec §7): Hero → About → Experience → Projects → Writing →
// Skills → Quotes → Contact → footer.
export default async function HomePage() {
  const repos = getRepositories();
  const [profile, experience, projects, articles, skillGroups, quotes, socialLinks, settings] =
    await Promise.all([
      repos.profile.get(),
      repos.experience.list(),
      repos.projects.list(),
      repos.articles.list(),
      repos.skills.listGroups(),
      repos.quotes.list(),
      repos.socialLinks.list(),
      repos.settings.get(),
    ]);

  // The nav lists only sections that render (empty sections return null).
  const present: Record<string, boolean> = {
    about: true,
    experience: experience.length > 0,
    projects: projects.length > 0,
    writing: articles.length > 0,
    skills: skillGroups.length > 0,
    contact: true,
  };
  const navSections = NAV_SECTIONS.filter((s) => present[s.id]);

  return (
    <>
      <JsonLd data={profilePageJsonLd(personJsonLd(profile, experience, socialLinks))} />
      <SiteHeader name={profile.name} onHome />
      <PageTransition>
        <main>
          <Hero profile={profile} />
          <About profile={profile} />
          <Experience items={experience} />
          <Projects projects={projects} mediaAutoRotate={settings.mediaAutoRotate} />
          <Writing articles={articles} />
          <Skills groups={skillGroups} />
          <Quotes quotes={quotes} />
          <Contact profile={profile} links={socialLinks} />
        </main>
        <SiteFooter note={profile.footerNote} name={profile.name} />
      </PageTransition>
      {/* Last in DOM order: a convenience duplicate of in-page navigation (Q26). */}
      <FloatingNav
        sections={navSections}
        position={settings.navPosition}
        layout={settings.menuLayout}
      />
      <RevealObserver />
      <ScrollRestore />
    </>
  );
}
