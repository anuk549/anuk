import Section, { SectionBody } from './Section';
import ProjectCard from './ProjectCard';
import type { Project } from '../lib/types';

export default function Projects({ items }: { items: Project[] }) {
  return (
    <>
      <Section id="projects" eyebrow="Portfolio" title="Selected Work" index="04" />
      <SectionBody>
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p, i) => (
            <ProjectCard key={p._id || p.key || i} p={p} index={i} />
          ))}
          {items.length === 0 && (
            <p className="col-span-full text-center text-[var(--fg-muted)]">No projects yet.</p>
          )}
        </div>
      </SectionBody>
    </>
  );
}
