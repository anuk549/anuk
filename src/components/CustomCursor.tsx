import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled] = useState(() => window.matchMedia('(pointer: fine)').matches);

  useEffect(() => {
    if (!enabled) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    let raf = 0;
    let hover = false;
    let lastHover: boolean | null = null;
    let lastTarget: EventTarget | null = null;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // Only resolve hover state when the target actually changes — avoids
      // running closest() (and allocating NodeLists) on every mousemove.
      if (e.target !== lastTarget) {
        lastTarget = e.target;
        const el = e.target as HTMLElement | null;
        hover = !!el?.closest?.('a, button, input, textarea, [role="button"]');
      }
    };

    const tick = () => {
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      if (hover !== lastHover) {
        lastHover = hover;
        ring.style.width = hover ? '52px' : '30px';
        ring.style.height = hover ? '52px' : '30px';
        ring.style.borderColor = hover ? 'var(--accent)' : 'var(--fg-muted)';
        ring.style.borderWidth = hover ? '1.5px' : '1px';
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[999] h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
        style={{ willChange: 'transform' }}
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[998] rounded-full transition-[width,height,border-color,border-width] duration-200 ease-out"
        style={{
          width: 30,
          height: 30,
          borderColor: 'var(--fg-muted)',
          borderWidth: 1,
          willChange: 'transform',
        }}
      />
    </>
  );
}