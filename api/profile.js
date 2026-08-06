import { getDb } from './_lib/db-mongo.js';
import { requireAuth } from './_lib/auth.js';
import { toObjectId, pick } from './_lib/helpers.js';
import { applyCors, handlePreflight, sendError, setNoStore, setPublicCache } from './_lib/http.js';

const ALLOWED_FIELDS = ['full_name', 'title', 'phone', 'email', 'linkedin', 'github', 'summary', 'avatar_url', 'location'];

export default async function handler(req, res) {
  applyCors(req, res, 'GET, PUT, OPTIONS');
  if (handlePreflight(req, res)) return;

  try {
    const db = await getDb();
    const col = db.collection('profile');

    if (req.method === 'GET') {
      setPublicCache(res, 120);
      const data = await col.find().sort({ _id: 1 }).limit(1).toArray();
      return res.status(200).json(data[0] || null);
    }
    if (req.method === 'PUT') {
      setNoStore(res);
      if (!requireAuth(req, res)) return;
      const { _id } = req.body || {};
      if (!_id) return res.status(400).json({ error: '_id is required' });
      const result = await col.updateOne(
        { _id: toObjectId(_id) },
        { $set: { ...pick(req.body, ALLOWED_FIELDS), updated_at: new Date().toISOString() } }
      );
      if (result.matchedCount === 0) return res.status(404).json({ error: 'Not found' });
      const updated = await col.findOne({ _id: toObjectId(_id) });
      return res.status(200).json(updated);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return sendError(res, err);
  }
}
