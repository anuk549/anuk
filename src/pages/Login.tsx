import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setToken } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) { setError(data.error || 'Login failed'); return; }
      localStorage.setItem('admin_token', data.token);
      setToken(data.token);
      navigate('/admin');
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Network error');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--bg)] px-5 text-[var(--fg)]">
      <div className="pointer-events-none absolute inset-0 -z-10 [background-image:radial-gradient(circle_at_1px_1px,var(--grid-dot)_1px,transparent_0)] [background-size:28px_28px]" />
      <div className="pointer-events-none absolute -top-20 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[var(--accent)]/20 blur-[130px]" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm rounded-[2rem] border border-[var(--border)] bg-[var(--card)] p-8"
      >
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-[var(--fg-muted)] hover:text-[var(--accent-2)]">
          <ArrowLeft size={14} /> Back to site
        </Link>
        <h1 className="font-heading text-3xl italic font-semibold">Admin Sign In</h1>
        <p className="mt-1 text-sm text-[var(--fg-muted)]">Manage your portfolio content.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--fg-muted)]" />
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[var(--accent)]" />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--fg-muted)]" />
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[var(--accent)]" />
          </div>
          {error && <p className="text-xs text-[var(--accent-2)]">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-full bg-[var(--fg)] px-6 py-3 text-sm font-semibold text-[var(--bg)] transition hover:bg-[var(--accent)] hover:text-[var(--accent-ink)] disabled:opacity-60">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}