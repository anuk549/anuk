import Loading from '../components/Loading';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import TechMarquee from '../components/TechMarquee';
import Experience from '../components/Experience';
import Education from '../components/Education';
import Skills from '../components/Skills';
import Projects from '../components/Projects';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import CustomCursor from '../components/CustomCursor';
import { usePortfolioData } from '../lib/data';

export default function Home() {
  const { data, loading, error } = usePortfolioData();

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center">
        <p className="text-[var(--fg-muted)]">Couldn't load the portfolio right now. Please refresh the page.</p>
      </div>
    );
  }

  const { profile, experience, education, skills, projects, tech } = data;

  return (
    <div className="cursor-none-desktop min-h-screen text-[var(--fg)]">
      <CustomCursor />
      <Navbar logoUrl={profile?.logo_url} />
      <Hero profile={profile} />
      <TechMarquee items={tech} />
      <About profile={profile} />
      <Experience items={experience} />
      <Education items={education} />
      <Skills items={skills} />
      <Projects items={projects} />
      <Contact profile={profile} />
      <Footer />
    </div>
  );
}