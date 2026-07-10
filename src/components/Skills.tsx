import { motion } from 'framer-motion';
import Section, { SectionBody } from './Section';
import { Code2, Server, Wrench, TestTube2, Layers } from 'lucide-react';

interface Skill { id: number; category: string; name: string; }

const categoryIcon: Record<string, typeof Code2> = {
  'Frontend': Code2,
  'Backend': Server,
  'Testing & QA': TestTube2,
  'Tools & Platforms': Wrench,
  'Methodologies': Layers,
};

export default function Skills({ items }: { items: Skill[] }) {
  const grouped = items.reduce<Record<string, Skill[]>>((acc, s) => {
    (acc[s.category] ||= []).push(s);
    return acc;
  }, {});

  return (
    <>
      <Section id="skills" eyebrow="Skills" title="Toolkit" index="03" />
      <SectionBody>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(grouped).map(([category, skills], i) => {
            const Icon = categoryIcon[category] || Code2;
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="rounded-[2rem] border border-[var(--border)] bg-[var(--card)] p-6"
              >
                <div className="mb-4 flex items-center gap-2.5">
                  <Icon size={17} className="text-[var(--accent-2)]" />
                  <h3 className="font-heading text-base italic font-semibold text-[var(--fg)]">{category}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map(s => (
                    <span key={s.id} className="rounded-full border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-[12.5px] font-medium text-[var(--fg-muted)] transition hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--accent-ink)]">
                      {s.name}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </SectionBody>
    </>
  );
}
