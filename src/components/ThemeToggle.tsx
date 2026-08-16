import { memo } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { playToggleSound } from '../lib/sound';

export default memo(function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={() => {
        playToggleSound();
        toggleTheme();
      }}
      aria-label="Toggle theme"
      className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)]/60 backdrop-blur-md transition hover:border-[var(--accent)]/60"
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        {theme === 'dark' ? <Sun size={16} className="text-[var(--accent)]" /> : <Moon size={16} className="text-[var(--accent)]" />}
      </motion.div>
    </button>
  );
});
