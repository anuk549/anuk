import crypto from 'node:crypto';

function safeCompare(a, b) {
  if (!a || !b) return false;
  try {
    const hashA = crypto.createHash('sha256').update(a).digest();
    const hashB = crypto.createHash('sha256').update(b).digest();
    return crypto.timingSafeEqual(hashA, hashB);
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  // Always log so we can see in Vercel logs that the function is being invoked
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminToken = process.env.ADMIN_TOKEN;
  const mongoUri = process.env.MONGODB_URI;
  console.error(
    `[login] invoked method=${req.method} ` +
      `ADMIN_PASSWORD_set=${!!adminPassword} ` +
      `ADMIN_TOKEN_set=${!!adminToken} ` +
      `MONGODB_URI_set=${!!mongoUri}`
  );

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { password } = req.body || {};

    if (!adminPassword || !adminToken) {
      console.error('[login] Auth env diagnostic: REJECTED — missing ADMIN_PASSWORD or ADMIN_TOKEN');
      return res.status(500).json({ error: 'Auth not configured' });
    }

    if (!safeCompare(password, adminPassword)) {
      // Intentionally slow down failed login attempts to prevent brute-force attacks
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.status(200).json({ token: adminToken });
  } catch (err) {
    console.error('[login] uncaught error:', err);
    return res.status(500).json({ error: err.message });
  }
}
