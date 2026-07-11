import { getDb, ObjectId } from './_lib/db-mongo.js';
import { requireAuth } from './_lib/auth.js';
import { applyCors, handlePreflight, sendError, setNoStore, setPublicCache } from './_lib/http.js';

function toObjectId(id) {
  if (!id) return id;
  if (ObjectId.isValid(id)) {
    return new ObjectId(id);
  }
  return id;
}

export default async function handler(req, res) {
  applyCors(req, res, 'GET, PUT, OPTIONS');
  if (handlePreflight(req, res)) return;

  try {
    const db = await getDb();
    const col = db.collection('bio');

    if (req.method === 'GET') {
      setPublicCache(res, 120);
      const data = await col.find().sort({ _id: 1 }).limit(1).toArray();
      return res.status(200).json(data[0] || null);
    }
    if (req.method === 'PUT') {
      setNoStore(res);
      if (!requireAuth(req, res)) return;
      const { _id, ...rest } = req.body;
      if (!_id) return res.status(400).json({ error: '_id is required' });
      const id = toObjectId(_id);
      await col.updateOne(
        { _id: id },
        { $set: { ...rest, updated_at: new Date().toISOString() } },
        { upsert: true }
      );
      const updated = await col.findOne({ _id: id });
      return res.status(200).json(updated);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return sendError(res, err);
  }
}
