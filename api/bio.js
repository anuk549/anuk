import { getDb } from './_lib/db-mongo.js';
import { requireAuth } from './_lib/auth.js';
import { applyCors, handlePreflight, sendError, setNoStore, setPublicCache } from './_lib/http.js';

const BIO_ID = 'bio';

export default async function handler(req, res) {
  applyCors(req, res, 'GET, PUT, OPTIONS');
  if (handlePreflight(req, res)) return;

  try {
    const db = await getDb();
    const col = db.collection('bio');

    if (req.method === 'GET') {
      setPublicCache(res, 30);
      const doc = await col.findOne({ _id: BIO_ID });
      return res.status(200).json(doc || null);
    }
    if (req.method === 'PUT') {
      setNoStore(res);
      if (!requireAuth(req, res)) return;
      const { _id: _ignored, ...rest } = req.body || {};
      await col.updateOne(
        { _id: BIO_ID },
        { $set: { ...rest, _id: BIO_ID, updated_at: new Date().toISOString() } },
        { upsert: true }
      );
      const updated = await col.findOne({ _id: BIO_ID });
      return res.status(200).json(updated);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return sendError(res, err);
  }
}
