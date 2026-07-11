import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Github, Linkedin, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import Section, { SectionBody } from './Section';
import { playClickSound, playHoverSound, playSuccessSound } from '../lib/sound';

interface Profile { phone: string; email: string; linkedin: string; github: string; }

// Bird that flies diagonally across the screen carrying the "msg sent" notification
function BirdFly({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const audio = new Audio('/bird-chirp.mp3');
    audio.volume = 0.6;
    audio.play().catch(() => {});

    const t = setTimeout(onDone, 4200);
    return () => {
      clearTimeout(t);
      audio.pause();
      audio.currentTime = 0;
    };
  }, [onDone]);

  return (
    <motion.div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-0 z-[60]"
    >
      <motion.div
        className="absolute will-change-transform"
        initial={{ x: '-12vw', y: '75vh', rotate: -8 }}
        animate={{
          x: ['-12vw', '20vw', '50vw', '78vw', '112vw'],
          y: ['75vh', '45vh', '55vh', '28vh', '-18vh'],
          rotate: [-8, -4, 2, -2, 6],
        }}
        transition={{ duration: 4, ease: 'easeInOut' }}
      >
        <div className="relative">
          {/* "msg sent" bubble trails slightly above the bird */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: [0, 1, 1, 1, 0], y: [8, 0, 0, 0, -6] }}
            transition={{ duration: 4, times: [0, 0.1, 0.5, 0.85, 1] }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-[var(--border)] bg-[var(--card)]/95 px-4 py-1.5 text-xs font-semibold text-[var(--fg)] shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur"
          >
            ✉ msg sent
          </motion.div>

          {/* Bird SVG with flapping wings */}
          <motion.svg
            width="72"
            height="72"
            viewBox="0 0 100 100"
            style={{ overflow: 'visible' }}
            aria-hidden="true"
          >
            {/* body */}
            <ellipse cx="50" cy="58" rx="20" ry="12" style={{ fill: 'var(--accent)' }} />
            {/* head */}
            <circle cx="70" cy="46" r="10" style={{ fill: 'var(--accent)' }} />
            {/* beak */}
            <polygon points="79,46 90,44 79,50" style={{ fill: '#f59e0b' }} />
            {/* eye */}
            <circle cx="71" cy="44" r="1.6" style={{ fill: '#0a0a06' }} />
            {/* tail */}
            <polygon points="30,58 14,52 16,64" style={{ fill: 'var(--accent-2)' }} />
            {/* left wing (flapping) */}
            <motion.path
              d="M 40,52 Q 25,32 35,15 Q 48,38 40,52 Z"
              style={{ fill: 'var(--accent-2)', transformOrigin: '40px 52px' }}
              animate={{ scaleY: [1, 0.4, 1, 0.5, 1], rotate: [0, -12, 0, -10, 0] }}
              transition={{ duration: 0.45, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* right wing (flapping, offset for natural flap) */}
            <motion.path
              d="M 60,52 Q 75,32 65,15 Q 52,38 60,52 Z"
              style={{ fill: 'var(--accent-2)', transformOrigin: '60px 52px' }}
              animate={{ scaleY: [1, 0.5, 1, 0.4, 1], rotate: [0, 12, 0, 10, 0] }}
              transition={{ duration: 0.45, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.svg>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Contact({ profile }: { profile: Profile | null }) {
  const [form, setForm] = useState({ name: '', email: '', message: '', website: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [shakeKey, setShakeKey] = useState(0);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';

    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';

    if (!form.message.trim()) e.message = 'Message is required';
    else if (form.message.length < 10) e.message = 'Message must be at least 10 characters';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Clear a field's error as soon as the user starts fixing it
  const clearError = (field: 'name' | 'email' | 'message') => {
    setErrors(prev => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    playClickSound();
    if (!validate()) {
      setShakeKey(k => k + 1); // replay the shake animation
      return;
    }
    setStatus('loading');
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('failed');
      setStatus('sent');
      playSuccessSound();
      setForm({ name: '', email: '', message: '', website: '' });
      setErrors({});
    } catch {
      setStatus('error');
    }
  };

  const handleBirdDone = () => setStatus('idle');

  const fieldClass = (field: 'name' | 'email' | 'message') =>
    `w-full rounded-xl border bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)] outline-none transition focus:border-[var(--accent)] ${
      errors[field]
        ? 'border-[var(--accent-2)] focus:border-[var(--accent-2)]'
        : 'border-[var(--border)]'
    }`;

  return (
    <>
      <Section id="contact" eyebrow="Contact" title="Say Hello" index="05" />
      <SectionBody>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <p className="max-w-sm text-[15px] leading-relaxed text-[var(--fg-muted)]">
              Have a project in mind or an opportunity to discuss? Drop a line — I read every message.
            </p>
            <div className="space-y-3">
              {profile?.email && (
                <a
                  href={`mailto:${profile.email}`}
                  onMouseEnter={playHoverSound}
                  onClick={playClickSound}
                  className="group flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-3.5 text-sm font-medium text-[var(--fg)] transition hover:border-[var(--accent)]"
                >
                  <span className="flex items-center gap-3"><Mail size={16} className="text-[var(--accent-2)]" /> {profile.email}</span>
                  <ArrowUpRight size={14} className="opacity-0 transition group-hover:opacity-100" />
                </a>
              )}
              {profile?.phone && (
                <a
                  href={`tel:${profile.phone.replace(/\s/g, '')}`}
                  onMouseEnter={playHoverSound}
                  onClick={playClickSound}
                  className="group flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-3.5 text-sm font-medium text-[var(--fg)] transition hover:border-[var(--accent)]"
                >
                  <span className="flex items-center gap-3"><Phone size={16} className="text-[var(--accent-2)]" /> {profile.phone}</span>
                  <ArrowUpRight size={14} className="opacity-0 transition group-hover:opacity-100" />
                </a>
              )}
              {profile?.linkedin && (
                <a
                  href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  onMouseEnter={playHoverSound}
                  onClick={playClickSound}
                  className="group flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-3.5 text-sm font-medium text-[var(--fg)] transition hover:border-[var(--accent)]"
                >
                  <span className="flex items-center gap-3"><Linkedin size={16} className="text-[var(--accent-2)]" /> LinkedIn Profile</span>
                  <ArrowUpRight size={14} className="opacity-0 transition group-hover:opacity-100" />
                </a>
              )}
              {profile?.github && (
                <a
                  href={profile.github.startsWith('http') ? profile.github : `https://${profile.github}`}
                  target="_blank"
                  rel="noreferrer"
                  onMouseEnter={playHoverSound}
                  onClick={playClickSound}
                  className="group flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-3.5 text-sm font-medium text-[var(--fg)] transition hover:border-[var(--accent)]"
                >
                  <span className="flex items-center gap-3"><Github size={16} className="text-[var(--accent-2)]" /> GitHub Profile</span>
                  <ArrowUpRight size={14} className="opacity-0 transition group-hover:opacity-100" />
                </a>
              )}
            </div>
          </motion.div>

          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            animate={shakeKey > 0 ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : undefined}
            className="space-y-4 rounded-[2rem] border border-[var(--border)] bg-[var(--card)] p-7"
          >
            <input
              type="text"
              name="website"
              value={form.website}
              onChange={e => setForm({ ...form, website: e.target.value })}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
            />
            <div>
              <input
                value={form.name}
                onChange={e => { setForm({ ...form, name: e.target.value }); clearError('name'); }}
                placeholder="your name"
                aria-invalid={!!errors.name}
                className={fieldClass('name')}
              />
              {errors.name && <p className="mt-1 text-xs text-[var(--accent-2)]">{errors.name}</p>}
            </div>
            <div>
              <input
                value={form.email}
                onChange={e => { setForm({ ...form, email: e.target.value }); clearError('email'); }}
                placeholder="your@email.com"
                aria-invalid={!!errors.email}
                className={fieldClass('email')}
              />
              {errors.email && <p className="mt-1 text-xs text-[var(--accent-2)]">{errors.email}</p>}
            </div>
            <div>
              <textarea
                value={form.message}
                onChange={e => { setForm({ ...form, message: e.target.value }); clearError('message'); }}
                placeholder="tell me about your project..."
                rows={5}
                aria-invalid={!!errors.message}
                className={fieldClass('message')}
              />
              {errors.message && <p className="mt-1 text-xs text-[var(--accent-2)]">{errors.message}</p>}
            </div>
            <button
              type="submit"
              disabled={status === 'loading' || status === 'sent'}
              onMouseEnter={playHoverSound}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--fg)] px-6 py-3.5 text-sm font-semibold text-[var(--bg)] transition hover:bg-[var(--accent)] hover:text-[var(--accent-ink)] disabled:opacity-60"
            >
              {status === 'sent' ? <><CheckCircle2 size={16} /> Sent!</> : status === 'loading' ? 'Sending...' : <>Send Message <ArrowUpRight size={15} /></>}
            </button>
            {status === 'error' && <p className="text-center text-xs text-[var(--accent-2)]">Something went wrong. Please try again.</p>}
          </motion.form>
        </div>
      </SectionBody>
      {status === 'sent' && <BirdFly onDone={handleBirdDone} />}
    </>
  );
}
