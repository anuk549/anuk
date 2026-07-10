import crypto from 'node:crypto';

export function safeCompare(a, b) {
  if (!a || !b) return false;
  try {
    const hashA = crypto.createHash('sha256').update(a).digest();
    const hashB = crypto.createHash('sha256').update(b).digest();
    return crypto.timingSafeEqual(hashA, hashB);
  } catch {
    return false;
  }
}

export function getAuthToken(req) {
  const auth = req.headers.authorization || '';
  return auth.replace(/^Bearer\s+/i, '').trim();
}

export function requireAuth(req, res) {
  const token = getAuthToken(req);
  const adminToken = process.env.ADMIN_TOKEN;
  if (!token || !adminToken || !safeCompare(token, adminToken)) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}