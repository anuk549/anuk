const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

function resolveOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return null;

  if (ALLOWED_ORIGINS.length > 0) {
    return ALLOWED_ORIGINS.includes(origin) ? origin : null;
  }

  const host = req.headers.host;
  if (host) {
    try {
      const originHost = new URL(origin).host;
      if (originHost === host) return origin;
    } catch {
      return null;
    }
  }

  return null;
}

export function applyCors(req, res, methods = 'GET, OPTIONS') {
  const origin = resolveOrigin(req);
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
}

export function handlePreflight(req, res) {
  if (req.method !== 'OPTIONS') return false;
  res.status(204).end();
  return true;
}

export function setNoStore(res) {
  res.setHeader('Cache-Control', 'no-store');
}

export function setPublicCache(res, maxAge = 60) {
  // Browser cache only — avoid Vercel CDN caching editable portfolio content.
  res.setHeader('Cache-Control', `public, max-age=${maxAge}, must-revalidate`);
}

export function sendError(res, err, status = 500) {
  console.error('[api]', err);
  const message =
    status === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err?.message || String(err);
  return res.status(status).json({ error: message });
}
