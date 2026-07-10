import { getDb, collection, ObjectId } from './_lib/db-mongo.js';
import { requireAuth } from './_lib/auth.js';

function toObjectId(id) {
  if (!id) return id;
  if (ObjectId.isValid(id)) {
    return new ObjectId(id);
  }
  return id;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const db = await getDb();
    const col = db.collection('profile');

    if (req.method === 'GET') {
      const data = await col.find().sort({ _id: 1 }).limit(1).toArray();
      return res.status(200).json(data[0] || null);
    }
    if (req.method === 'PUT') {
      if (!requireAuth(req, res)) return;
      const { _id, ...rest } = req.body;
      if (!_id) return res.status(400).json({ error: '_id is required' });
      const result = await col.updateOne(
        { _id: toObjectId(_id) },
        { $set: { ...rest, updated_at: new Date().toISOString() } }
      );
      if (result.matchedCount === 0) return res.status(404).json({ error: 'Not found' });
      const updated = await col.findOne({ _id: toObjectId(_id) });
      return res.status(200).json(updated);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: err.message });
  }
}