import { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Section, { SectionBody } from './Section';
import { playClickSound, playHoverSound } from '../lib/sound';

interface Profile {
  full_name: string;
}

export default memo(function About({ profile }: { profile: Profile | null }) {
  const name = profile?.full_name || 'Anuk Hettiarachchi';

  return (
    <>
      <Section id="about" eyebrow="About" title="Who I Am" index="01" />
      <SectionBody>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <p className="text-[16px] leading-relaxed text-[var(--fg-muted)]">
            Hi, I'm{' '}
            <Link
              to="/bio"
              onClick={playClickSound}
              onMouseEnter={playHoverSound}
              className="font-medium text-[var(--fg)] underline decoration-[var(--accent)] decoration-2 underline-offset-4 transition hover:text-[var(--accent-2)]"
            >
              {name}
            </Link>
            {' '}— a software developer who enjoys turning ideas into real products.
          </p>
          <p className="mt-5 text-[15px] leading-relaxed text-[var(--fg-muted)]">
            My journey started with curiosity about computers and technology. Today, I build modern web applications, explore new technologies, and enjoy solving real-world problems through software.
          </p>
          <Link
            to="/bio"
            onClick={playClickSound}
            onMouseEnter={playHoverSound}
            className="group mt-8 inline-flex items-center gap-2.5 rounded-full border border-[var(--border)] bg-[var(--card)] px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-[var(--fg)] transition hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--accent-ink)]"
          >
            Read my story
            <ArrowRight size={15} className="transition group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </SectionBody>
    </>
  );
});
