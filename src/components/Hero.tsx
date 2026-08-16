import { memo } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownRight, Mail, Github, Linkedin, Phone } from 'lucide-react';
import { playClickSound, playHoverSound } from '../lib/sound';

interface Profile {
  full_name: string;
  title: string;
  phone: string;
  email: string;
  linkedin: string;
  github: string;
  summary: string;
  avatar_url: string;
}


export default memo(function Hero({ profile }: { profile: Profile | null }) {
  const name = profile?.full_name || 'Anuk Hettiarachchi';
  const [first, ...rest] = name.split(' ');
  const last = rest.join(' ');

  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-10">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,var(--grid-dot)_1px,transparent_0)] [background-size:28px_28px]" />
        <div className="absolute -top-32 right-[-10%] h-[420px] w-[420px] rounded-full bg-[var(--accent)]/25 blur-[130px]" />
        <div className="absolute bottom-0 left-[-10%] h-[380px] w-[380px] rounded-full bg-[var(--accent-2)]/20 blur-[110px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-5">
        {/* top meta row */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-5 text-[11px] uppercase tracking-[0.2em] text-[var(--fg-muted)]"
        >
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-pulse" /> Open to opportunities
          </span>
          <span>Colombo, Sri Lanka</span>
          <span>Full Stack </span>
        </motion.div>

        {/* kinetic name */}
        <div className="relative">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-heading text-[15vw] leading-[0.86] tracking-tight text-[var(--fg)] sm:text-[9vw] lg:text-[7.2rem]"
          >
            {first}
          </motion.h1>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="font-heading text-[15vw] leading-[0.86] tracking-tight text-transparent sm:text-[9vw] lg:text-[7.2rem]"
            style={{ WebkitTextStroke: '1.5px var(--fg)' }}
          >
            {last || 'Hettiarachchi'}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, scale: 0.6, rotate: -12 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease: 'backOut' }}
            className="absolute -right-2 top-2 hidden h-28 w-28 items-center justify-center sm:flex lg:h-36 lg:w-36"
          >
            <div className="animate-float-slow relative flex h-full w-full items-center justify-center">
              <svg viewBox="0 0 100 100" className="absolute h-full w-full animate-[spin_18s_linear_infinite] text-[var(--fg-muted)]">
                <defs>
                  <path id="circlePath" d="M 50, 50 m -38, 0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" fill="none" />
                </defs>
                <text fontSize="7.6" letterSpacing="3" fill="currentColor">
                  <textPath href="#circlePath">FULL STACK DEVELOPER &middot; AVAILABLE NOW &middot;</textPath>
                </text>
              </svg>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-ink)]">
                <ArrowDownRight size={22} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* role title under name */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 flex flex-wrap items-center gap-3"
        >
          <span className="h-px w-10 bg-[var(--accent)] sm:w-14" />
          <h2 className="font-heading text-2xl italic tracking-tight text-[var(--fg)] sm:text-3xl lg:text-4xl">
            Full Stack Developer
          </h2>
        </motion.div>

        {/* role tag strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-4 flex flex-wrap items-center gap-2"
        >
          {(profile?.title && profile.title !== 'Full Stack Developer'
            ? profile.title.split('|').map(part => part.trim()).filter(tag => tag && tag !== 'Full Stack Developer')
            : ['React', 'Java', 'Spring Boot']
          ).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[var(--border)] bg-[var(--card)]/50 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[var(--fg-muted)] backdrop-blur-sm"
            >
              {tag}
            </span>
          ))}
        </motion.div>

        {/* summary + contacts grid */}
        <div className="mt-12 grid grid-cols-1 gap-10 border-t border-[var(--border)] pt-10 lg:grid-cols-[1fr_auto]">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl text-[15px] leading-relaxed text-[var(--fg-muted)]"
          >
            Full Stack Developer building enterprise web applications across transport, HR, and manufacturing.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex shrink-0 flex-col gap-2 text-[13px]"
          >
            {profile?.email && (
              <a href={`mailto:${profile.email}`} onMouseEnter={playHoverSound} onClick={playClickSound} className="group flex items-center gap-2.5 text-[var(--fg)]">
                <Mail size={14} className="text-[var(--accent-2)]" />
                <span className="border-b border-transparent group-hover:border-[var(--fg)]">{profile.email}</span>
              </a>
            )}
            {profile?.phone && (
              <a href={`tel:${profile.phone.replace(/\s/g, '')}`} onMouseEnter={playHoverSound} onClick={playClickSound} className="group flex items-center gap-2.5 text-[var(--fg)]">
                <Phone size={14} className="text-[var(--accent-2)]" />
                <span className="border-b border-transparent group-hover:border-[var(--fg)]">{profile.phone}</span>
              </a>
            )}
            <div className="flex gap-2 pt-1">
              {profile?.github && (
                <a href={profile.github.startsWith('http') ? profile.github : `https://${profile.github}`} target="_blank" rel="noreferrer" onMouseEnter={playHoverSound} onClick={playClickSound} className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]">
                  <Github size={15} />
                </a>
              )}
              {profile?.linkedin && (
                <a href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`} target="_blank" rel="noreferrer" onMouseEnter={playHoverSound} onClick={playClickSound} className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]">
                  <Linkedin size={15} />
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
});
