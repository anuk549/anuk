import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft, Github, ImageIcon } from 'lucide-react';
import CustomCursor from '../components/CustomCursor';
import ThemeToggle from '../components/ThemeToggle';
import Loading from '../components/Loading';
import { playClickSound, playHoverSound } from '../lib/sound';
import { defaultBio, mergeBio, type BioData, type BioLink } from '../lib/bio';

function FloatingShape({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, delay }}
      className={`pointer-events-none absolute ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="animate-float-3d h-full w-full rounded-2xl border border-[var(--border)] bg-[var(--card)]/40 backdrop-blur-sm" />
    </motion.div>
  );
}

function TimelineDot({ active = false }: { active?: boolean }) {
  return (
    <div className={`relative z-10 flex h-3 w-3 shrink-0 items-center justify-center rounded-full ${active ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`}>
      {active && <span className="absolute h-5 w-5 animate-ping rounded-full bg-[var(--accent)]/40" />}
    </div>
  );
}

function GitHubInlineLink({ link }: { link: BioLink }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noreferrer"
      onClick={playClickSound}
      onMouseEnter={playHoverSound}
      className="inline-flex items-center gap-1 font-medium text-[var(--fg)] underline decoration-[var(--accent)] decoration-2 underline-offset-4 transition hover:text-[var(--accent-2)]"
    >
      <Github size={14} className="shrink-0" />
      {link.title}
    </a>
  );
}

function UniversityParagraph({ bio }: { bio: BioData }) {
  const links = bio.university_links;
  const [first, second] = links;

  return (
    <p className="text-[16px] leading-[1.85] text-[var(--fg-muted)] sm:text-[17px]">
      {bio.university_text_before_links}{' '}
      {first && <GitHubInlineLink link={first} />}
      {first && second && ' and '}
      {second && <GitHubInlineLink link={second} />}
      {bio.university_text_after_links && <> {bio.university_text_after_links}</>}
    </p>
  );
}

export default function Bio() {
  const [bio, setBio] = useState<BioData>(defaultBio);
  const [loading, setLoading] = useState(true);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -40]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0.6]);

  useEffect(() => {
    fetch('/api/bio')
      .then((r) => r.json())
      .then((data) => setBio(mergeBio(data)))
      .catch(() => setBio(defaultBio))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="cursor-none-desktop min-h-screen text-[var(--fg)]">
      <CustomCursor />

      <header className="fixed top-0 left-0 right-0 z-50 px-5 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between rounded-full border border-[var(--border)] bg-[var(--card)]/80 px-4 py-2 backdrop-blur-xl">
          <Link
            to="/"
            onClick={playClickSound}
            onMouseEnter={playHoverSound}
            className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.16em] text-[var(--fg-muted)] transition hover:text-[var(--fg)]"
          >
            <ArrowLeft size={14} />
            Back
          </Link>
          <span className="font-heading text-sm italic text-[var(--fg)]">My Story</span>
          <ThemeToggle />
        </div>
      </header>

      <section className="relative overflow-hidden px-5 pt-32 pb-20">
        <FloatingShape className="right-[8%] top-24 h-20 w-20 rotate-12 opacity-60" delay={0.3} />
        <FloatingShape className="left-[6%] top-48 h-14 w-14 -rotate-6 opacity-40" delay={0.5} />
        <FloatingShape className="right-[18%] bottom-12 h-10 w-10 rotate-45 opacity-30" delay={0.7} />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative mx-auto max-w-4xl">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--accent-2)]"
          >
            Anuk Hettiarachchi
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-heading text-[2.4rem] leading-[1.1] tracking-tight text-[var(--fg)] sm:text-5xl lg:text-6xl"
          >
            {bio.hero_title}
          </motion.h1>
        </motion.div>
      </section>

      <section className="px-5 pb-24">
        <div className="mx-auto max-w-4xl space-y-6">
          {bio.story_paragraphs.map((paragraph, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="text-[17px] leading-[1.8] text-[var(--fg-muted)] sm:text-lg"
            >
              {paragraph}
            </motion.p>
          ))}
        </div>
      </section>

      <section className="border-t border-[var(--border)] px-5 py-24">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--accent-2)]">University</p>
            <h2 className="font-heading text-3xl italic tracking-tight text-[var(--fg)] sm:text-4xl">
              {bio.university_title}
            </h2>
            <p className="mt-5 max-w-3xl text-[16px] leading-[1.85] text-[var(--fg-muted)] sm:text-[17px]">
              {bio.university_intro}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-10 overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--card)]"
          >
            <div className="relative aspect-[16/9] overflow-hidden bg-[var(--bg)] sm:aspect-[21/9]">
              {bio.university_image_url ? (
                <img
                  src={bio.university_image_url}
                  alt="University friends at SLIIT"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-[var(--fg-muted)]">
                  <ImageIcon size={36} strokeWidth={1.2} />
                  <span className="text-[11px] uppercase tracking-[0.2em]">College friends photo</span>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <UniversityParagraph bio={bio} />
          </motion.div>
        </div>
      </section>

      <section className="border-t border-[var(--border)] px-5 py-24">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--accent-2)]">Career</p>
            <h2 className="font-heading text-3xl italic tracking-tight text-[var(--fg)] sm:text-4xl">
              Professional journey
            </h2>
          </motion.div>

          <div className="relative">
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-[5px] top-2 bottom-2 w-px origin-top bg-[var(--border)]"
            />

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative flex gap-6 sm:gap-8"
            >
              <TimelineDot active />
              <div className="flex-1 pb-4">
                <span className="text-[12px] font-medium uppercase tracking-[0.2em] text-[var(--fg-muted)]">
                  {bio.career_period}
                </span>
                <h3 className="mt-2 font-heading text-2xl italic font-semibold text-[var(--fg)]">{bio.career_role}</h3>
                <p className="mt-1 text-sm font-medium text-[var(--accent-2)]">{bio.career_company}</p>
                <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-[var(--fg-muted)]">{bio.career_intro}</p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="mt-6 overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--card)]"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-[var(--bg)] sm:aspect-[21/9]">
                    {bio.career_image_url ? (
                      <img
                        src={bio.career_image_url}
                        alt="Professional journey at Inntri Labs"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-[var(--fg-muted)]">
                        <ImageIcon size={36} strokeWidth={1.2} />
                        <span className="text-[11px] uppercase tracking-[0.2em]">Career photo</span>
                      </div>
                    )}
                  </div>
                </motion.div>

                <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-[var(--fg-muted)]">{bio.career_body}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {bio.career_stack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-[var(--fg-muted)]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--border)] px-5 py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-4xl text-center"
        >
          <p className="font-heading text-2xl italic leading-relaxed text-[var(--fg)] sm:text-3xl">
            {bio.ending}
          </p>
          <Link
            to="/"
            onClick={playClickSound}
            onMouseEnter={playHoverSound}
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-[var(--accent-ink)] transition hover:brightness-95"
          >
            <ArrowLeft size={14} />
            Back to portfolio
          </Link>
        </motion.div>
      </section>

      <footer className="border-t border-[var(--border)] px-5 py-8 text-center text-[11px] uppercase tracking-[0.2em] text-[var(--fg-muted)]">
        &copy; {new Date().getFullYear()} Anuk Hettiarachchi
      </footer>
    </div>
  );
}
