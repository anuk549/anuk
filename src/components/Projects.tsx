import Section, { SectionBody } from './Section';
import ProjectCard from './ProjectCard';

interface Project {
  id: number; title: string; description: string; image_url: string;
  live_url: string; github_url: string; tags: string[];
}

export default function Projects({ items }: { items: Project[] }) {
  return (
    <>
      <Section id="projects" eyebrow="Portfolio" title="Selected Work" index="04" />
      <SectionBody>
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p, i) => (
            <ProjectCard key={p.id} p={p} index={i} />
          ))}
          {items.length === 0 && (
            <p className="col-span-full text-center text-[var(--fg-muted)]">No projects yet.</p>
          )}
        </div>
      </SectionBody>
    </>
  );
}
