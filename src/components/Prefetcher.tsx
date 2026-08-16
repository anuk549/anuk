import { useEffect } from 'react';
import { prefetchPortfolio } from '../lib/data';

/** Warms lazy routes + portfolio data during browser idle time. */
export default function Prefetcher() {
  useEffect(() => {
    const run = () => {
      void import('../pages/Bio');
      void import('../pages/Login');
      void import('../pages/Admin');
      prefetchPortfolio();
    };

    let cleanup: (() => void) | undefined;

    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(run, { timeout: 2000 });
      cleanup = () => window.cancelIdleCallback(id);
    } else {
      const t = window.setTimeout(run, 800);
      cleanup = () => window.clearTimeout(t);
    }

    return cleanup;
  }, []);

  return null;
}