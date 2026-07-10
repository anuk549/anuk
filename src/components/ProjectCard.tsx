import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Github, ImageOff } from 'lucide-react';
import { playClickSound } from '../lib/sound';

export interface Project {
  _id: string;
  key?: string;
  title: string;
  description: string;
  image_url: string;
  live_url: string;
  github_url: string;
  tags: string[];
  featured?: boolean;
  order_index?: number;
}

export default function ProjectCard({ p, index }: { p: Project; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -8, y: px * 10 });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: index * 0.08 }}
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
      style={{ transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, transformStyle: 'preserve-3d', transition: 'transform 0.15s ease-out' }}
      className="group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--card)] transition-shadow hover:shadow-[0_30px_70px_-30px_rgba(0,0,0,0.35)]"
    >
      <span className="absolute left-4 top-4 z-10 rounded-full bg-[var(--fg)] px-2.5 py-1 text-[10px] font-semibold text-[var(--bg)]">
        {String(index + 1).padStart(2, '0')}
      </span>
      {/* Icon Badge at right top */}
      {(p.live_url || p.github_url) && (
        <a
          href={p.live_url || p.github_url}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => {
            e.stopPropagation();
            playClickSound();
          }}
          className="absolute right-4 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--card)]/80 text-[var(--fg)] backdrop-blur-md border border-[var(--border)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] hover:scale-110"
          title={p.live_url ? 'View Live Site' : 'View Source Code'}
        >
          {p.live_url ? <ExternalLink size={12} /> : <Github size={12} />}
        </a>
      )}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--bg)]">
        {p.image_url ? (
          <img src={p.image_url} alt={p.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[var(--fg-muted)]">
            <ImageOff size={28} strokeWidth={1.3} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
      </div>
      <div className="flex flex-1 flex-col p-6" style={{ transform: 'translateZ(30px)' }}>
        <h3 className="font-heading text-xl italic font-semibold text-[var(--fg)]">{p.title}</h3>
        <p className="mt-2 flex-1 text-[13.5px] leading-relaxed text-[var(--fg-muted)]">{p.description}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {(p.tags || []).map(t => (
            <span key={t} className="rounded-full bg-[var(--accent-2)]/10 px-2.5 py-1 text-[11px] font-medium text-[var(--accent-2)]">{t}</span>
          ))}
        </div>
        <div className="mt-5 flex gap-3">
          {p.live_url && (
            <a href={p.live_url} target="_blank" rel="noreferrer" onClick={playClickSound} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[var(--accent)] px-4 py-2.5 text-xs font-semibold text-[var(--accent-ink)] transition hover:brightness-95">
              <ExternalLink size={13} /> Live
            </a>
          )}
          {p.github_url && (
            <a href={p.github_url} target="_blank" rel="noreferrer" onClick={playClickSound} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[var(--border)] px-4 py-2.5 text-xs font-semibold text-[var(--fg)] transition hover:border-[var(--fg)]">
              <Github size={13} /> Code
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
