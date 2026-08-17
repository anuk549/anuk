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
        <div className="divide-y divide-[var(--border)]">
          {Object.entries(grouped).map(([category, skills], i) => {
            const Icon = categoryIcon[category] || Code2;
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="group flex flex-col gap-5 py-8 md:flex-row md:items-start md:gap-12"
              >
                <div className="flex w-full items-center gap-3 md:w-56 md:shrink-0 md:pt-1">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--accent)] transition group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-[var(--accent-ink)]">
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-heading text-base italic font-semibold text-[var(--fg)]">{category}</h3>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--accent-2)]">
                      {skills.length} {skills.length === 1 ? 'skill' : 'skills'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {skills.map((s, j) => {
                    const meta = techMeta[s.name];
                    return (
                      <motion.span
                        key={s._id}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.35, delay: i * 0.06 + j * 0.04 }}
                        className="group/chip inline-flex cursor-default items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] py-2 pl-2.5 pr-4 text-[13px] font-medium text-[var(--fg-muted)] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition duration-300 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--fg)]"
                      >
                        {meta && (
                          <img
                            src={`https://cdn.simpleicons.org/${meta.slug}/${meta.color}`}
                            alt=""
                            aria-hidden="true"
                            className="h-4 w-4 transition group-hover/chip:scale-110"
                            width={16}
                            height={16}
                            loading="lazy"
                            decoding="async"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        )}
                        {s.name}
                      </motion.span>
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