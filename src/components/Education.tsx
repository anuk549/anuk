import { motion } from 'framer-motion';
import Section, { SectionBody } from './Section';
import { getIcon } from '../lib/icons';

interface Edu { _id: string; institution: string; degree: string; period: string; description: string; icon: string; link?: string; logo_url?: string; }

export default function Education({ items }: { items: Edu[] }) {
  return (
    <>
      <Section id="education" eyebrow="Education" title="Academics" index="02" />
      <SectionBody>
        <div className="space-y-5">
          {items.map((edu, i) => {
            const Icon = getIcon(edu.icon);
            return (
              <motion.div
                key={edu._id}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, delay: i * 0.08 }}
                className="group relative overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--card)] p-7 transition hover:-translate-y-1 hover:border-[var(--accent)]/60"
              >
                <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-[var(--accent)]/10 blur-2xl transition group-hover:bg-[var(--accent)]/25" />
                <div className="relative flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {edu.logo_url ? (
                      <img src={edu.logo_url} alt={`${edu.institution} logo`} className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--accent)] text-[var(--accent-ink)] transition group-hover:rotate-6">
                        <Icon size={20} />
                      </div>
                    )}
                    <div>
                      <h3 className="font-heading text-xl font-semibold text-[var(--fg)]">{edu.degree}</h3>
                      <p className="text-sm font-medium text-[var(--accent-2)]">
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
                    </div>
                  </div>
                  <span className="rounded-full border border-[var(--border)] px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-[var(--fg-muted)]">{edu.period}</span>
                </div>
                {edu.description && (
                  <p className="relative mt-6 text-[14px] leading-relaxed text-[var(--fg-muted)]">
                    {edu.description}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </SectionBody>
    </>
  );
}
