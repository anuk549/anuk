import { GridFSBucket } from 'mongodb';
import { getDb } from './db-mongo.js';
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

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'];
const MAX_BYTES = 5 * 1024 * 1024;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const adminToken = process.env.ADMIN_TOKEN;
    if (!token || !adminToken || !safeCompare(token, adminToken)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { fileName, fileBase64, contentType } = req.body;
    if (!fileName || !fileBase64 || !contentType) return res.status(400).json({ error: 'fileName, fileBase64 and contentType are required' });
    if (!ALLOWED_TYPES.includes(contentType)) return res.status(400).json({ error: 'Unsupported file type' });

    const buffer = Buffer.from(fileBase64, 'base64');
    if (buffer.length > MAX_BYTES) return res.status(400).json({ error: 'File too large (max 5MB)' });

    const safeName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    const db = await getDb();
    const bucket = new GridFSBucket(db, { bucketName: 'portfolio-media' });

    const uploadStream = bucket.openUploadStream(safeName, {
      contentType,
      metadata: { uploadedAt: new Date().toISOString() },
    });

    await new Promise((resolve, reject) => {
      uploadStream.on('finish', resolve);
      uploadStream.on('error', reject);
      uploadStream.end(buffer);
    });

    const url = `/api/files/${uploadStream.id}`;
    return res.status(200).json({ url });
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: err.message });
  }
}