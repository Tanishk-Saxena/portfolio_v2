import { About } from '@/components/sections/about';
import { Hero } from '@/components/sections/hero';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { getRepositories } from '@/lib/container';

export default async function HomePage() {
  const repos = getRepositories();
  const [profile] = await Promise.all([repos.profile.get()]);

  return (
    <>
      <SiteHeader name={profile.name} onHome />
      <main>
        <Hero profile={profile} />
        <About profile={profile} />
      </main>
      <SiteFooter note={profile.footerNote} name={profile.name} />
    </>
  );
}
