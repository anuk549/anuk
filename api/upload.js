import { GridFSBucket } from 'mongodb';
import { getDb } from './_lib/db-mongo.js';
import { requireAuth } from './_lib/auth.js';
import { applyCors, handlePreflight, sendError, setNoStore } from './_lib/http.js';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_BASE64_LENGTH = Math.ceil((MAX_BYTES * 4) / 3) + 4;

function matchesContentType(buffer, contentType) {
  const b = buffer;
  switch (contentType) {
    case 'image/jpeg':
      return b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
    case 'image/png':
      return b.length > 4 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
    case 'image/gif':
      return b.length > 4 && b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38;
    case 'image/webp':
      return (
        b.length > 12 &&
        b.toString('ascii', 0, 4) === 'RIFF' &&
        b.toString('ascii', 8, 12) === 'WEBP'
      );
    default:
      return false;
  }
}

export default async function handler(req, res) {
  applyCors(req, res, 'POST, OPTIONS');
  setNoStore(res);
  if (handlePreflight(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAuth(req, res)) return;

  try {
    const { fileName, fileBase64, contentType } = req.body || {};
    if (!fileName || !fileBase64 || !contentType) {
      return res.status(400).json({ error: 'fileName, fileBase64 and contentType are required' });
    }
    if (!ALLOWED_TYPES.includes(contentType)) {
      return res.status(400).json({ error: 'Unsupported file type' });
    }
    if (typeof fileBase64 !== 'string' || fileBase64.length > MAX_BASE64_LENGTH) {
      return res.status(400).json({ error: 'File too large (max 5MB)' });
    }

    const buffer = Buffer.from(fileBase64, 'base64');
    if (buffer.length === 0 || buffer.length > MAX_BYTES) {
      return res.status(400).json({ error: 'File too large (max 5MB)' });
    }
    if (!matchesContentType(buffer, contentType)) {
      return res.status(400).json({ error: 'File content does not match its declared type' });
    }

    const safeName = `${Date.now()}-${String(fileName).replace(/[^a-zA-Z0-9._-]/g, '_')}`;

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
