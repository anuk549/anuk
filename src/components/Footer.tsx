import { playClickSound } from '../lib/sound';

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] px-5 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-[11px] uppercase tracking-[0.2em] text-[var(--fg-muted)] sm:flex-row">
        <p>&copy; {new Date().getFullYear()} Anuk Hettiarachchi</p>
        <p className="font-heading text-sm italic normal-case tracking-normal text-[var(--fg)]">Built with React &middot; Node &middot; Supabase</p>
        <button
          onClick={() => {
            playClickSound();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="cursor-pointer hover:text-[var(--accent)] transition-colors duration-200 focus:outline-none"
        >
          Back to top &uarr;
        </button>
      </div>
    </footer>
  );
}
