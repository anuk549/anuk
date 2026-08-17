import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Github, ImageOff, Images, X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, RefreshCw, RotateCcw } from 'lucide-react';
import { playClickSound } from '../lib/sound';
import type { Project } from '../lib/types';

export default memo(function ProjectCard({ p, index }: { p: Project; index: number }) {
  const images = useMemo(
    () => (p.images && p.images.length ? p.images : p.image_url ? [p.image_url] : []),
    [p.images, p.image_url]
  );
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [touchX, setTouchX] = useState<number | null>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);

  const hasLinks = Boolean(p.live_url || p.github_url);

  useEffect(() => {
    if (images.length < 2) return;
    const timer = setInterval(() => setCurrent(c => (c + 1) % images.length), 3000);
    return () => clearInterval(timer);
  }, [images.length]);

  useEffect(() => {
    if (!galleryOpen) return;
    setZoomed(false);
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setGalleryOpen(false);
      if (e.key === 'ArrowRight') setGalleryIndex(i => (images.length ? (i + 1) % images.length : 0));
      if (e.key === 'ArrowLeft') setGalleryIndex(i => (images.length ? (i - 1 + images.length) % images.length : 0));
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [galleryOpen, images.length]);

  useEffect(() => {
    if (!galleryOpen) return;
    const el = thumbsRef.current?.querySelector('[data-active="true"]');
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [galleryOpen, galleryIndex]);

  const safeCurrent = images.length ? current % images.length : 0;
  const safeGallery = images.length ? galleryIndex % images.length : 0;
  const next = (e: React.MouseEvent) => { e.stopPropagation(); setCurrent(c => (images.length ? (c + 1) % images.length : 0)); };
  const prev = (e: React.MouseEvent) => { e.stopPropagation(); setCurrent(c => (images.length ? (c - 1 + images.length) % images.length : 0)); };
  const galleryNext = (e: React.MouseEvent) => { e.stopPropagation(); setZoomed(false); setGalleryIndex(i => (i + 1) % images.length); };
  const galleryPrev = (e: React.MouseEvent) => { e.stopPropagation(); setZoomed(false); setGalleryIndex(i => (i - 1 + images.length) % images.length); };
  const onTouchStart = (e: React.TouchEvent) => setTouchX(e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) {
      if (dx < 0) setGalleryIndex(i => (i + 1) % images.length);
      else setGalleryIndex(i => (i - 1 + images.length) % images.length);
    }
    setTouchX(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay: index * 0.08 }}
      className="group/card relative [perspective:1600px]"
    >
      {/* Top-right chrome */}
      <div className="absolute right-4 top-4 z-30 flex gap-2">
        {images.length > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); playClickSound(); setGalleryIndex(safeCurrent); setGalleryOpen(true); }}
            aria-label={`View all ${images.length} images`}
            title="View all images"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md border border-white/20 transition hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:scale-110"
          >
            <Images size={13} />
          </button>
        )}
      </div>

      <div
        className="relative h-[500px] w-full cursor-pointer select-none transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* FRONT */}
        <div
          onClick={() => { playClickSound(); setFlipped(true); }}
          role="button"
          aria-label={`Show details for ${p.title}`}
          className="absolute inset-0 flex flex-col overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--card)] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_30px_70px_-30px_rgba(0,0,0,0.5)]"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          {/* Full-bleed image background */}
          <div className="absolute inset-0 overflow-hidden bg-[var(--bg)]">
            {images.length > 0 ? (
              <motion.img
                key={images[safeCurrent]}
                src={images[safeCurrent]}
                alt={p.title}
                loading="lazy"
                decoding="async"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover/card:scale-110"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[var(--fg-muted)]">
                <ImageOff size={28} strokeWidth={1.3} />
              </div>
            )}
          </div>

          {/* Readability gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent opacity-0 transition duration-300 group-hover/card:opacity-100" />

          {/* Image carousel controls */}
          {images.length > 1 && (
            <>
              <span
                onClick={prev}
                role="button"
                aria-label="Previous image"
                className="absolute left-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/35 text-white opacity-0 backdrop-blur-md transition hover:bg-black/55 hover:opacity-100"
              >
                <ChevronLeft size={15} />
              </span>
              <span
                onClick={next}
                role="button"
                aria-label="Next image"
                className="absolute right-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/35 text-white opacity-0 backdrop-blur-md transition hover:bg-black/55 hover:opacity-100"
              >
                <ChevronRight size={15} />
              </span>
              <div className="absolute bottom-1/2 left-3 z-20 -translate-y-1/2 rotate-90 flex gap-1">
                {images.map((_, i) => (
                  <span key={i} onClick={(e) => { e.stopPropagation(); setCurrent(i); }} role="button" aria-label={`Show image ${i + 1}`} className={`h-1 rounded-full transition-all duration-300 ${i === safeCurrent ? 'w-4 bg-white' : 'w-1 bg-white/50 hover:bg-white/80'}`} />
                ))}
              </div>
            </>
          )}

          {/* Bottom content */}
          <div className="relative z-10 mt-auto flex flex-col gap-3 p-6">
            <div className="flex items-center gap-2.5">
              <span className="font-heading text-sm italic font-semibold text-[var(--accent)]">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="h-px w-6 bg-[var(--accent)]/60" />
            </div>
            <h3 className="font-heading text-2xl italic font-semibold tracking-tight text-white drop-shadow-sm">
              {p.title}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {(p.tags || []).map(t => (
                <span key={t} className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md border border-white/10">
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-1 flex gap-2.5">
              {hasLinks ? (
                <>
                  {p.live_url && (
                    <a href={p.live_url} target="_blank" rel="noreferrer" onClick={(e) => { e.stopPropagation(); playClickSound(); }} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[var(--accent)] px-4 py-2.5 text-xs font-semibold text-[var(--accent-ink)] shadow-lg shadow-[var(--accent)]/25 transition hover:brightness-110">
                      <ExternalLink size={13} /> Live
                    </a>
                  )}
                  {p.github_url && (
                    <a href={p.github_url} target="_blank" rel="noreferrer" onClick={(e) => { e.stopPropagation(); playClickSound(); }} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-white/15 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-md border border-white/25 transition hover:bg-white hover:text-black">
                      <Github size={13} /> Code
                    </a>
                  )}
                </>
              ) : (
                <div className="flex w-full items-center justify-center gap-2 rounded-full border border-dashed border-white/35 bg-black/25 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
                  <RefreshCw size={12} />
                  Click to view details
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BACK */}
        <div
          onClick={() => { playClickSound(); setFlipped(false); }}
          role="button"
          aria-label={`Show overview for ${p.title}`}
          className="absolute inset-0 flex flex-col overflow-hidden rounded-[1.75rem] border border-[var(--border)] bg-[var(--card)] shadow-[0_30px_70px_-30px_rgba(0,0,0,0.35)]"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="flex flex-1 flex-col p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">About this project</p>
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg)] text-[var(--fg-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]">
                <RotateCcw size={12} />
              </span>
            </div>
            <h3 className="mt-2 font-heading text-xl italic font-semibold text-[var(--fg)]">{p.title}</h3>
            <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-width:thin]">
              <p className="text-[13.5px] leading-relaxed whitespace-pre-line text-[var(--fg-muted)]">
                {p.description}
              </p>
            </div>
            {p.live_url && (
              <a
                href={p.live_url}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => { e.stopPropagation(); playClickSound(); }}
                className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[var(--accent)] px-4 py-2.5 text-xs font-semibold text-[var(--accent-ink)] transition hover:brightness-95"
              >
                <ExternalLink size={13} /> View Live
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Image gallery modal */}
      {createPortal(
        <AnimatePresence>
          {galleryOpen && images.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setGalleryOpen(false)}
              className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/85 p-4 backdrop-blur-md sm:p-8"
            >
              <div className="absolute right-5 top-5 flex items-center gap-3">
                <span className="rounded-full bg-white/10 px-3 py-1 text-[12px] font-medium tabular-nums text-white backdrop-blur-md border border-white/15">
                  {safeGallery + 1} / {images.length}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); playClickSound(); setGalleryOpen(false); }}
                  aria-label="Close gallery"
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md border border-white/20 transition hover:bg-[var(--accent)] hover:scale-110"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="absolute left-5 top-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">Gallery</p>
                <h3 className="font-heading text-lg italic font-semibold text-white drop-shadow">{p.title}</h3>
              </div>

              <div onClick={(e) => e.stopPropagation()} className="relative flex w-full max-w-5xl flex-col gap-4">
                <div
                  onTouchStart={onTouchStart}
                  onTouchEnd={onTouchEnd}
                  className="relative overflow-hidden rounded-2xl bg-black/40 select-none"
                >
                  <AnimatePresence initial={false} mode="popLayout">
                    <motion.img
                      key={images[safeGallery]}
                      src={images[safeGallery]}
                      alt={`${p.title} image ${safeGallery + 1}`}
                      initial={{ opacity: 0, scale: 0.96, rotate: 1.5 }}
                      animate={{ opacity: 1, scale: zoomed ? 1.6 : 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                      onClick={() => setZoomed(z => !z)}
                      draggable={false}
                      className={`mx-auto max-h-[62vh] w-auto object-contain transition-[cursor] ${zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
                    />
                  </AnimatePresence>
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white/90 backdrop-blur-md border border-white/15">
                      {zoomed ? <ZoomOut size={13} /> : <ZoomIn size={13} />}
                    </span>
                  </div>
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={galleryPrev}
                        aria-label="Previous image"
                        className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md border border-white/20 transition hover:bg-black/70 hover:scale-110"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <button
                        onClick={galleryNext}
                        aria-label="Next image"
                        className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md border border-white/20 transition hover:bg-black/70 hover:scale-110"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </>
                  )}
                </div>

                {/* All images in a row */}
                <div
                  ref={thumbsRef}
                  onWheel={(e) => { e.currentTarget.scrollLeft += e.deltaY; }}
                  className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:thin] [scroll-behavior:smooth]"
                >
                  {images.map((img, i) => (
                    <motion.button
                      key={img}
                      onClick={(e) => { e.stopPropagation(); playClickSound(); setZoomed(false); setGalleryIndex(i); }}
                      aria-label={`Show image ${i + 1}`}
                      whileTap={{ scale: 0.92 }}
                      data-active={i === safeGallery}
                      className={`relative h-16 w-24 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 transition duration-300 ${i === safeGallery ? 'border-[var(--accent)] opacity-100 scale-100 shadow-[0_0_0_3px_rgba(0,0,0,0.3)]' : 'border-transparent opacity-50 hover:opacity-90 hover:scale-105'}`}
                    >
                      <img src={img} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  );
});