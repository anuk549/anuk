import { GridFSBucket } from 'mongodb';
import { getDb } from './_lib/db-mongo.js';
import { requireAuth } from './_lib/auth.js';
import { applyCors, handlePreflight, sendError, setNoStore } from './_lib/http.js';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const MAX_BYTES = 5 * 1024 * 1024;

export default async function handler(req, res) {
  applyCors(req, res, 'POST, OPTIONS');
  setNoStore(res);
  if (handlePreflight(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAuth(req, res)) return;

  try {
    const { fileName, fileBase64, contentType } = req.body;
    if (!fileName || !fileBase64 || !contentType) {
      return res.status(400).json({ error: 'fileName, fileBase64 and contentType are required' });
    }
    if (!ALLOWED_TYPES.includes(contentType)) {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

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
    return sendError(res, err);
  }
}
