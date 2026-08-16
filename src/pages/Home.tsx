import { useEffect, useState } from 'react';
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
import type { Profile, Experience as ExperienceItem, Education as EducationItem, Skill, Project, Tech } from '../lib/types';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tech, setTech] = useState<Tech[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, e, ed, s, pr, t] = await Promise.all([
          fetch('/api/profile').then(r => r.json()),
          fetch('/api/experience').then(r => r.json()),
          fetch('/api/education').then(r => r.json()),
          fetch('/api/skills').then(r => r.json()),
          fetch('/api/projects').then(r => r.json()),
          fetch('/api/technologies').then(r => r.json()),
        ]);
        setProfile(p);
        setExperience(Array.isArray(e) ? e : []);
        setEducation(Array.isArray(ed) ? ed : []);
        setSkills(Array.isArray(s) ? s : []);
        setProjects(Array.isArray(pr) ? pr : []);
        setTech(Array.isArray(t) ? t : []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
