import { ObjectId, GridFSBucket } from 'mongodb';
import { getDb } from './db-mongo.js';

export async function serveFileById(id, res) {
  if (!id || !ObjectId.isValid(id)) {
    res.status(400).json({ error: 'Valid id is required' });
    return;
  }

  const db = await getDb();
  const bucket = new GridFSBucket(db, { bucketName: 'portfolio-media' });

  const files = await bucket.find({ _id: new ObjectId(id) }).toArray();
  if (!files || files.length === 0) {
    res.status(404).json({ error: 'File not found' });
    return;
  }

  const file = files[0];
  if (file.contentType) {
    res.setHeader('Content-Type', file.contentType);
  }
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

  const downloadStream = bucket.openDownloadStream(new ObjectId(id));

  downloadStream.on('error', (err) => {
    console.error('GridFS download error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to stream file' });
    }
  });

  downloadStream.pipe(res);
}

export function extractFileId(req) {
  return (
    req.query?.id ||
    req.query?.['[id]'] ||
    req.url?.split('/').pop()?.split('?')[0]
  );
}
