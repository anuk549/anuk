import { memo, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import Section, { SectionBody } from './Section';
import ProjectCard from './ProjectCard';
import { playClickSound } from '../lib/sound';
import type { Project } from '../lib/types';

export default memo(function Projects({ items }: { items: Project[] }) {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = () => setIsDesktop(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const limit = isDesktop ? 3 : 2;
  const visible = items.slice(0, limit);
  const hasMore = items.length > visible.length;

  return (
    <>
      <Section id="projects" eyebrow="Portfolio" title="Selected Work" index="04" />
      <SectionBody>
        <div className="grid grid-cols-2 gap-4 sm:gap-7 lg:grid-cols-3">
          {visible.map((p, i) => (
            <ProjectCard key={p._id || p.key || i} p={p} index={i} />
          ))}
          {items.length === 0 && (
            <p className="col-span-full text-center text-[var(--fg-muted)]">No projects yet.</p>
          )}
        </div>
        {hasMore && (
          <div className="mt-14 text-center">
            <Link
              to="/work"
              onClick={playClickSound}
              className="group inline-flex items-center gap-2.5 rounded-full border border-[var(--border)] bg-[var(--card)] px-7 py-3.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--fg)] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--accent-ink)]"
            >
              See more
              <span className="rounded-full bg-[var(--accent-2)]/15 px-2 py-0.5 text-[10px] tabular-nums group-hover:bg-[var(--accent-ink)]/20">
                +{items.length - visible.length}
              </span>
              <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        )}
      </SectionBody>
    </>
  );
});