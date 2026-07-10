import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Volume2, VolumeX } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { playClickSound, getMuteState, toggleMuteState } from '../lib/sound';

const links = [
  { href: '#about', label: 'About', n: '01' },
  { href: '#experience', label: 'Work', n: '02' },
  { href: '#education', label: 'Edu', n: '03' },
  { href: '#skills', label: 'Skills', n: '04' },
  { href: '#projects', label: 'Projects', n: '05' },
  { href: '#contact', label: 'Contact', n: '06' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(getMuteState());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); };
  }, []);

  const handleMuteToggle = () => {
    const nextMuted = toggleMuteState();
    setMuted(nextMuted);
    if (!nextMuted) {
      setTimeout(playClickSound, 50);
    }
  };

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'py-2' : 'py-4'}`}
    >
      <div className="mx-auto max-w-6xl px-5">
        <div className={`flex items-center justify-between rounded-full border px-3 py-2 transition-all duration-500 ${scrolled ? 'border-[var(--border)] bg-[var(--card)]/85 backdrop-blur-xl shadow-[0_10px_36px_rgba(0,0,0,0.12)]' : 'border-[var(--border)]/60 bg-[var(--card)]/40 backdrop-blur-sm'}`}>
          <a href="#top" onClick={playClickSound} className="flex items-center gap-2 pl-2 font-heading text-[16px] italic font-semibold tracking-tight text-[var(--fg)]">
            <span className="flex h-2 w-2 rounded-full bg-[var(--accent)]" />
            anuk<span className="text-[var(--accent)] not-italic">.h</span>
          </a>
          <nav className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <a
                key={l.href}
                href={l.href}
                onClick={playClickSound}
                className="group flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11.5px] font-medium uppercase tracking-wider text-[var(--fg-muted)] transition hover:bg-[var(--accent)] hover:text-[var(--accent-ink)]"
              >
                <span className="text-[9px] opacity-50 group-hover:opacity-70">{l.n}</span>
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={handleMuteToggle}
              aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)]/60 backdrop-blur-md transition hover:border-[var(--accent)]/60 text-[var(--accent)] hover:scale-105"
            >
              {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
            <ThemeToggle />
            <button className="md:hidden flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)]" onClick={() => { playClickSound(); setOpen(!open); }} aria-label="Menu">
              {open ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
        {open && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mt-2 flex flex-col gap-1 rounded-3xl border border-[var(--border)] bg-[var(--card)]/95 backdrop-blur-xl p-3 md:hidden">
            {links.map(l => (
              <a key={l.href} href={l.href} onClick={() => { playClickSound(); setOpen(false); }} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--fg)] hover:bg-[var(--accent)]/15">
                <span className="text-[10px] text-[var(--fg-muted)]">{l.n}</span> {l.label}
              </a>
            ))}
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
