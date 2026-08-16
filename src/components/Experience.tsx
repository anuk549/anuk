import { memo } from 'react';
import { motion } from 'framer-motion';
import Section, { SectionBody } from './Section';
import { getIcon } from '../lib/icons';

interface Exp { _id: string; company: string; role: string; period: string; points: string[]; icon: string; link?: string; logo_url?: string; }

export default memo(function Experience({ items }: { items: Exp[] }) {
  return (
    <>
      <Section id="experience" eyebrow="Work" title="Experience" index="01" />
      <SectionBody>
        <div className="space-y-5">
          {items.map((exp, i) => {
            const Icon = getIcon(exp.icon);
            return (
              <motion.div
                key={exp._id}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, delay: i * 0.08 }}
                className="group relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--card)] p-7 transition hover:-translate-y-1 hover:border-[var(--accent)]/60"
              >
                <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-[var(--accent)]/10 blur-2xl transition group-hover:bg-[var(--accent)]/25" />
                <div className="relative flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {exp.logo_url ? (
                      <img src={exp.logo_url} alt={`${exp.company} logo`} className="h-12 w-12 shrink-0 rounded-xl object-cover" width={48} height={48} loading="lazy" decoding="async" />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--accent)] text-[var(--accent-ink)] transition group-hover:rotate-6">
                        <Icon size={20} />
                      </div>
                    )}
                    <div>
                      <h3 className="font-heading text-xl italic font-semibold text-[var(--fg)]">{exp.role}</h3>
                      <p className="text-sm font-medium text-[var(--accent-2)]">
                        {exp.link ? (
                          <a
                            href={exp.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline hover:text-[var(--accent)] transition-colors inline-flex items-center gap-1"
                          >
                            {exp.company}
                          </a>
                        ) : (
                          exp.company
                        )}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full border border-[var(--border)] px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-[var(--fg-muted)]">{exp.period}</span>
                </div>
                <ul className="relative mt-6 space-y-2.5">
                  {exp.points?.map((p, idx) => (
                    <li key={idx} className="flex gap-3 text-[14px] leading-relaxed text-[var(--fg-muted)]">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--accent-2)]" />
                      {p}
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </SectionBody>
    </>
  );
});
