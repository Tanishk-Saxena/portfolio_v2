import { About } from '@/components/sections/about';
import { Contact } from '@/components/sections/contact';
import { Experience } from '@/components/sections/experience';
import { Hero } from '@/components/sections/hero';
import { Projects } from '@/components/sections/projects';
import { Quotes } from '@/components/sections/quotes';
import { Skills } from '@/components/sections/skills';
import { Writing } from '@/components/sections/writing';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { getRepositories } from '@/lib/container';

// Section order is the mockup's (spec §7): Hero → About → Experience → Projects → Writing →
// Skills → Quotes → Contact → footer.
export default async function HomePage() {
  const repos = getRepositories();
  const [profile, experience, projects, articles, skillGroups, quotes, socialLinks] =
    await Promise.all([
      repos.profile.get(),
      repos.experience.list(),
      repos.projects.list(),
      repos.articles.list(),
      repos.skills.listGroups(),
      repos.quotes.list(),
      repos.socialLinks.list(),
    ]);

  return (
    <>
      <SiteHeader name={profile.name} onHome />
      <main>
        <Hero profile={profile} />
        <About profile={profile} />
        <Experience items={experience} />
        <Projects projects={projects} />
        <Writing articles={articles} />
        <Skills groups={skillGroups} />
        <Quotes quotes={quotes} />
        <Contact profile={profile} links={socialLinks} />
      </main>
      <SiteFooter note={profile.footerNote} name={profile.name} />
    </>
  );
}
