import { memo } from 'react';
import { motion } from 'framer-motion';
import Section, { SectionBody } from './Section';
import { Code2, Server, Wrench, TestTube2, Layers } from 'lucide-react';
import { techMeta } from '../lib/icons';
import type { Skill } from '../lib/types';

const categoryIcon: Record<string, typeof Code2> = {
  'Frontend': Code2,
  'Backend': Server,
  'Testing & QA': TestTube2,
  'Tools & Platforms': Wrench,
  'Methodologies': Layers,
};

export default memo(function Skills({ items }: { items: Skill[] }) {
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
                  {skills.map(s => {
                    const meta = techMeta[s.name];
                    return (
                      <span key={s._id} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-[12.5px] font-medium text-[var(--fg-muted)] transition hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--accent-ink)]">
                        {meta && (
                          <img
                            src={`https://cdn.simpleicons.org/${meta.slug}/${meta.color}`}
                            alt=""
                            aria-hidden="true"
                            className="h-3.5 w-3.5 opacity-90 transition group-hover:brightness-0"
                            width={14}
                            height={14}
                            loading="lazy"
                            decoding="async"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        )}
                        {s.name}
                      </span>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      </SectionBody>
    </>
  );
});
