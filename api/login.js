import { safeCompare } from './_lib/auth.js';
import { applyCors, handlePreflight, sendError, setNoStore } from './_lib/http.js';
import { rateLimit } from './_lib/rate-limit.js';

export default async function handler(req, res) {
  applyCors(req, res, 'POST, OPTIONS');
  setNoStore(res);
  if (handlePreflight(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const limit = rateLimit(req, { key: 'login', limit: 5, windowMs: 15 * 60_000 });
  if (!limit.allowed) {
    res.setHeader('Retry-After', String(Math.ceil(limit.retryAfterMs / 1000)));
    return res.status(429).json({ error: 'Too many login attempts. Try again later.' });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminToken = process.env.ADMIN_TOKEN;

  try {
    const { password } = req.body || {};

    if (!adminPassword || !adminToken) {
      return res.status(500).json({ error: 'Auth not configured' });
    }

    if (!safeCompare(password, adminPassword)) {
      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.status(200).json({ token: adminToken });
  } catch (err) {
    return sendError(res, err);
  }
}
