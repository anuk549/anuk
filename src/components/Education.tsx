import { motion } from 'framer-motion';
import Section, { SectionBody } from './Section';
import { getIcon } from '../lib/icons';

interface Edu { _id: string; institution: string; degree: string; period: string; description: string; icon: string; link?: string; }

export default function Education({ items }: { items: Edu[] }) {
  return (
    <>
      <Section id="education" eyebrow="Education" title="Academics" index="02" />
      <SectionBody>
        <div className="grid gap-6 sm:grid-cols-2">
          {items.map((edu, i) => {
            const Icon = getIcon(edu.icon);
            return (
              <motion.div
                key={edu._id}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, delay: i * 0.08 }}
                className="rounded-[2rem] border border-[var(--border)] bg-[var(--card)] p-7 transition hover:-translate-y-1 hover:border-[var(--accent-2)]/60"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--accent-2)] text-white">
                  <Icon size={20} />
                </div>
                <h3 className="mt-4 font-heading text-xl italic font-semibold text-[var(--fg)]">{edu.degree}</h3>
                <p className="mt-1 text-sm font-medium text-[var(--accent-2)]">
                  {edu.link ? (
                    <a
                      href={edu.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline hover:text-[var(--accent)] transition-colors inline-flex items-center gap-1"
                    >
                      {edu.institution}
                    </a>
                  ) : (
                    edu.institution
                  )}
                </p>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-[var(--fg-muted)]">{edu.period}</p>
                {edu.description && <p className="mt-3 text-[14px] leading-relaxed text-[var(--fg-muted)]">{edu.description}</p>}
              </motion.div>
            );
          })}
        </div>
      </SectionBody>
    </>
  );
}
