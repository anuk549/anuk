import { ObjectId, GridFSBucket } from 'mongodb';
import { getDb } from './db-mongo.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const id = req.query?.id || req.url?.split('/').pop()?.split('?')[0];
    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Valid id is required' });
    }

    const db = await getDb();
    const bucket = new GridFSBucket(db, { bucketName: 'portfolio-media' });

    const files = await bucket.find({ _id: new ObjectId(id) }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const file = files[0];
    if (file.contentType) {
      res.setHeader('Content-Type', file.contentType);
    }

    const downloadStream = bucket.openDownloadStream(new ObjectId(id));

    downloadStream.on('error', (err) => {
      console.error('GridFS download error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to stream file' });
      }
    });

    downloadStream.pipe(res);
  } catch (err) {
    console.error('API error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
}
