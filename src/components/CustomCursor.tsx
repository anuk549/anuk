import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const isFine = window.matchMedia('(pointer: fine)').matches;
    setEnabled(isFine);
    if (!isFine) return;

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let raf: number;

    const move = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
      }
      const target = e.target as HTMLElement;
      const hovering = !!target.closest('a, button, input, textarea, [role="button"]');
      if (ringRef.current) {
        ringRef.current.style.width = hovering ? '52px' : '30px';
        ringRef.current.style.height = hovering ? '52px' : '30px';
        ringRef.current.style.borderColor = hovering ? 'var(--accent)' : 'var(--fg-muted)';
        ringRef.current.style.borderWidth = hovering ? '1.5px' : '1px';
      }
    };

    const tick = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', move);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', move);
      cancelAnimationFrame(raf);
    };
  }, []);

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
        className="pointer-events-none fixed left-0 top-0 z-[998] rounded-full border transition-[width,height,border-color] duration-200 ease-out"
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
