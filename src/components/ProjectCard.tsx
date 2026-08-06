import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, Github, ImageOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { playClickSound } from '../lib/sound';

export interface Project {
  _id: string;
  key?: string;
  title: string;
  description: string;
  image_url: string;
  images?: string[];
  live_url: string;
  github_url: string;
  tags: string[];
  featured?: boolean;
  order_index?: number;
}

export default function ProjectCard({ p, index }: { p: Project; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const images = useMemo(
    () => (p.images && p.images.length ? p.images : p.image_url ? [p.image_url] : []),
    [p.images, p.image_url]
  );
  const [current, setCurrent] = useState(0);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (images.length < 2) return;
    const timer = setInterval(() => setCurrent(c => (c + 1) % images.length), 3000);
    return () => clearInterval(timer);
  }, [images.length]);

  const safeCurrent = images.length ? current % images.length : 0;
  const showReadMore = p.description.length > 120;
  const next = () => setCurrent(c => (images.length ? (c + 1) % images.length : 0));
  const prev = () => setCurrent(c => (images.length ? (c - 1 + images.length) % images.length : 0));

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
        {images.length > 0 ? (
          <AnimatePresence initial={false}>
            <motion.img
              key={images[safeCurrent]}
              src={images[safeCurrent]}
              alt={p.title}
              loading="lazy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"
            />
          </AnimatePresence>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[var(--fg-muted)]">
            <ImageOff size={28} strokeWidth={1.3} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white opacity-0 backdrop-blur-md transition hover:bg-black/50 group-hover:opacity-100"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Next image"
              className="absolute right-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white opacity-0 backdrop-blur-md transition hover:bg-black/50 group-hover:opacity-100"
            >
              <ChevronRight size={14} />
            </button>
            <span className="absolute bottom-3 right-3 z-10 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
              {safeCurrent + 1} / {images.length}
            </span>
            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                  aria-label={`Show image ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === safeCurrent ? 'w-5 bg-white' : 'w-1.5 bg-white/60 hover:bg-white'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6" style={{ transform: 'translateZ(30px)' }}>
        <h3 className="font-heading text-xl italic font-semibold text-[var(--fg)]">{p.title}</h3>
        <p className={`mt-2 flex-1 text-[13.5px] leading-relaxed text-[var(--fg-muted)] ${expanded ? '' : 'line-clamp-3'}`}>{p.description}</p>
        {showReadMore && (
          <button
            onClick={() => { playClickSound(); setExpanded(e => !e); }}
            className="mt-2 self-start text-xs font-semibold text-[var(--accent)] transition hover:underline"
          >
            {expanded ? 'Show less' : 'Read more'}
          </button>
        )}
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
