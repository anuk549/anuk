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

  try {
    const { password } = req.body || {};
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminToken = process.env.ADMIN_TOKEN;

    if (!adminPassword || !adminToken) {
      console.log(
        `[login] Auth env diagnostic: ` +
          `ADMIN_PASSWORD_set=${!!adminPassword} ` +
          `ADMIN_TOKEN_set=${!!adminToken}`
      );
      return res.status(500).json({ error: 'Auth not configured' });
    }

    if (!safeCompare(password, adminPassword)) {
      // Intentionally slow down failed login attempts to prevent brute-force attacks
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.status(200).json({ token: adminToken });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: err.message });
  }
}