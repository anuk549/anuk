import { techMeta } from '../lib/icons';
import type { Tech } from '../lib/types';

function Row({ items }: { items: Tech[] }) {
  const loop = [...items, ...items];
  return (
    <div className="flex w-max gap-10 animate-marquee">
      {loop.map((t, i) => {
        const meta = techMeta[t.name] || { slug: t.slug, color: 'FFFFFF' };
        return (
          <div key={`${t._id}-${i}`} className="flex items-center gap-3 whitespace-nowrap">
            <img
              src={`https://cdn.simpleicons.org/${meta.slug}/${meta.color}`}
              alt={t.name}
              className="h-6 w-6 opacity-90"
              loading="lazy"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <span className="font-heading text-2xl font-medium text-[var(--bg)]">{t.name}</span>
            <span className="text-lg text-[var(--accent)]">&bull;</span>
          </div>
        );
      })}
    </div>
  );
}

export default function TechMarquee({ items }: { items: Tech[] }) {
  if (!items.length) return null;

  return (
    <div className="relative -rotate-1 overflow-hidden border-y-2 border-[var(--fg)] bg-[var(--fg)] py-3 shadow-[0_0_0_4px_var(--bg)]">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[var(--fg)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[var(--fg)] to-transparent" />
      <Row items={items} />
    </div>
  );
}
