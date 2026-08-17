import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import CustomCursor from '../components/CustomCursor';
import ThemeToggle from '../components/ThemeToggle';
import Loading from '../components/Loading';
import ProjectCard from '../components/ProjectCard';
import Footer from '../components/Footer';
import { playClickSound, playHoverSound } from '../lib/sound';
import { usePortfolioData } from '../lib/data';

export default function Work() {
  const { data, loading, error } = usePortfolioData();
  const [filter, setFilter] = useState('All');

  const tags = useMemo(() => {
    const set = new Set<string>();
    data.projects.forEach(p => (p.tags || []).forEach(t => set.add(t)));
    return Array.from(set).sort();
  }, [data.projects]);

  const filtered = useMemo(
    () => (filter === 'All' ? data.projects : data.projects.filter(p => (p.tags || []).includes(filter))),
    [data.projects, filter]
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="cursor-none-desktop min-h-screen text-[var(--fg)]">
      <CustomCursor />

      <header className="fixed top-0 left-0 right-0 z-50 px-5 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-[var(--border)] bg-[var(--card)]/80 px-4 py-2 backdrop-blur-xl">
          <Link
            to="/#projects"
            onClick={playClickSound}
            onMouseEnter={playHoverSound}
            className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.16em] text-[var(--fg-muted)] transition hover:text-[var(--fg)]"
          >
            <ArrowLeft size={14} />
            Back
          </Link>
          <span className="font-heading text-sm italic text-[var(--fg)]">All Work</span>
          <ThemeToggle />
        </div>
      </header>

      <section className="px-5 pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-6xl"
        >
          <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--accent-2)]">
            <span className="h-px w-6 bg-[var(--accent-2)]" /> Portfolio
          </p>
          <h1 className="font-heading text-4xl italic tracking-tight text-[var(--fg)] sm:text-5xl">All Work</h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[var(--fg-muted)]">
            A complete collection of projects I've built.
          </p>

          {!loading && !error && tags.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <label htmlFor="work-filter" className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-2)]">
                Filter
              </label>
              <div className="relative">
                <select
                  id="work-filter"
                  value={filter}
                  onChange={(e) => { playClickSound(); setFilter(e.target.value); }}
                  className="cursor-pointer appearance-none rounded-full border border-[var(--border)] bg-[var(--card)] py-2.5 pl-4 pr-10 text-[13px] font-medium text-[var(--fg)] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition outline-none hover:border-[var(--accent)] focus:border-[var(--accent)]"
                >
                  <option value="All">All ({data.projects.length})</option>
                  {tags.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--fg-muted)]" />
              </div>
            </div>
          )}
        </motion.div>
      </section>

      <section className="px-5 pb-24">
        <div className="mx-auto max-w-6xl">
          {loading && <Loading />}

          {error && (
            <div className="flex min-h-[40vh] items-center justify-center text-center">
              <p className="text-[var(--fg-muted)]">Couldn't load the projects right now. Please refresh the page.</p>
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3">
              {filtered.map((p, i) => (
                <ProjectCard key={p._id || p.key || i} p={p} index={i} />
              ))}
              {filtered.length === 0 && (
                <p className="col-span-full text-center text-[var(--fg-muted)]">No projects match this filter.</p>
              )}
            </div>
          )}

          <div className="mt-16 text-center">
            <Link
              to="/"
              onClick={playClickSound}
              onMouseEnter={playHoverSound}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--accent-ink)] transition hover:brightness-95"
            >
              <ArrowLeft size={14} />
              Back to portfolio
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}