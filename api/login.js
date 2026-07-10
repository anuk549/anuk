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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Read env vars up front so the diagnostic is always available
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminToken = process.env.ADMIN_TOKEN;
  const mongoUri = process.env.MONGODB_URI;
  const envDiag = {
    ADMIN_PASSWORD: !!adminPassword,
    ADMIN_TOKEN: !!adminToken,
    MONGODB_URI: !!mongoUri,
  };

  // Loud log so it appears in Vercel Function Logs tab too
  console.error('[login] env=' + JSON.stringify(envDiag));

  try {
    const { password } = req.body || {};

    if (!adminPassword || !adminToken) {
      return res.status(500).json({
        error: 'Auth not configured',
        env: envDiag,
        hint: 'Set ADMIN_PASSWORD and ADMIN_TOKEN in Vercel → Settings → Environment Variables (Production + Preview + Development)',
      });
    }

    if (!safeCompare(password, adminPassword)) {
      // Intentionally slow down failed login attempts to prevent brute-force attacks
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.status(200).json({ token: adminToken });
  } catch (err) {
    console.error('[login] uncaught error:', err);
    return res.status(500).json({ error: err.message, stack: err.stack });
  }
}
