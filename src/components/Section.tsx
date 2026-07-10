import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export default function Section({ id, eyebrow, title, index }: { id: string; eyebrow: string; title: string; index: string; children?: ReactNode }) {
  return (
    <div id={id} className="mx-auto max-w-6xl px-5 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
        className="mb-12 flex items-end justify-between gap-4 border-b border-[var(--border)] pb-5"
      >
        <div>
          <p className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--accent-2)]">
            <span className="h-px w-6 bg-[var(--accent-2)]" /> {eyebrow}
          </p>
          <h2 className="font-heading text-4xl italic tracking-tight text-[var(--fg)] sm:text-5xl">{title}</h2>
        </div>
        <span className="font-heading text-6xl italic text-[var(--border)] sm:text-7xl">{index}</span>
      </motion.div>
    </div>
  );
}

export function SectionBody({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-6xl px-5 pb-24">{children}</div>;
}
