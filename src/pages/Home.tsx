import { useEffect, useState } from 'react';
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

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [experience, setExperience] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [tech, setTech] = useState<any[]>([]);
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
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--bg)] text-[var(--fg)]">
        <span className="font-heading text-3xl italic">anuk.h</span>
        <div className="flex gap-1.5">
          <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--accent)]" style={{ animationDelay: '0ms' }} />
          <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--accent-2)]" style={{ animationDelay: '150ms' }} />
          <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--fg)]" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-6 text-center">
        <p className="text-[var(--fg-muted)]">Couldn't load the portfolio right now. Please refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="cursor-none-desktop min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <CustomCursor />
      <Navbar />
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
