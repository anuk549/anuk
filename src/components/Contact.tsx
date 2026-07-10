import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Github, Linkedin, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import Section, { SectionBody } from './Section';

interface Profile { phone: string; email: string; linkedin: string; github: string; }

export default function Contact({ profile }: { profile: Profile | null }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.message.trim()) e.message = 'Message is required';
    else if (form.message.length < 10) e.message = 'Message must be at least 10 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('failed');
      setStatus('sent');
      setForm({ name: '', email: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

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
                <a href={`mailto:${profile.email}`} className="group flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-3.5 text-sm font-medium text-[var(--fg)] transition hover:border-[var(--accent)]">
                  <span className="flex items-center gap-3"><Mail size={16} className="text-[var(--accent-2)]" /> {profile.email}</span>
                  <ArrowUpRight size={14} className="opacity-0 transition group-hover:opacity-100" />
                </a>
              )}
              {profile?.phone && (
                <a href={`tel:${profile.phone.replace(/\s/g, '')}`} className="group flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-3.5 text-sm font-medium text-[var(--fg)] transition hover:border-[var(--accent)]">
                  <span className="flex items-center gap-3"><Phone size={16} className="text-[var(--accent-2)]" /> {profile.phone}</span>
                  <ArrowUpRight size={14} className="opacity-0 transition group-hover:opacity-100" />
                </a>
              )}
              {profile?.linkedin && (
                <a href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`} target="_blank" rel="noreferrer" className="group flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-3.5 text-sm font-medium text-[var(--fg)] transition hover:border-[var(--accent)]">
                  <span className="flex items-center gap-3"><Linkedin size={16} className="text-[var(--accent-2)]" /> LinkedIn Profile</span>
                  <ArrowUpRight size={14} className="opacity-0 transition group-hover:opacity-100" />
                </a>
              )}
              {profile?.github && (
                <a href={profile.github.startsWith('http') ? profile.github : `https://${profile.github}`} target="_blank" rel="noreferrer" className="group flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] px-5 py-3.5 text-sm font-medium text-[var(--fg)] transition hover:border-[var(--accent)]">
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
            className="space-y-4 rounded-[2rem] border border-[var(--border)] bg-[var(--card)] p-7"
          >
            <div>
              <input
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="your name"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)] outline-none transition focus:border-[var(--accent)]"
              />
              {errors.name && <p className="mt-1 text-xs text-[var(--accent-2)]">{errors.name}</p>}
            </div>
            <div>
              <input
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)] outline-none transition focus:border-[var(--accent)]"
              />
              {errors.email && <p className="mt-1 text-xs text-[var(--accent-2)]">{errors.email}</p>}
            </div>
            <div>
              <textarea
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                placeholder="tell me about your project..."
                rows={5}
                className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)] outline-none transition focus:border-[var(--accent)]"
              />
              {errors.message && <p className="mt-1 text-xs text-[var(--accent-2)]">{errors.message}</p>}
            </div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--fg)] px-6 py-3.5 text-sm font-semibold text-[var(--bg)] transition hover:bg-[var(--accent)] hover:text-[var(--accent-ink)] disabled:opacity-60"
            >
              {status === 'sent' ? <><CheckCircle2 size={16} /> Sent!</> : status === 'loading' ? 'Sending...' : <>Send Message <ArrowUpRight size={15} /></>}
            </button>
            {status === 'error' && <p className="text-center text-xs text-[var(--accent-2)]">Something went wrong. Please try again.</p>}
          </motion.form>
        </div>
      </SectionBody>
    </>
  );
}
