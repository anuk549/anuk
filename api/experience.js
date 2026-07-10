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
    if (req.method === 'GET') {
      const db = await getDb();
      const data = await db.collection('experience').find().sort({ order_index: 1 }).toArray();
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      if (!requireAuth(req, res)) return;
      const { company, role, period, points, icon, order_index, link } = req.body;
      if (!company || !role) return res.status(400).json({ error: 'company and role are required' });
      const doc = { company, role, period, points: points || [], icon: icon || 'Briefcase', order_index: order_index || 0, link: link || '' };
      const db = await getDb();
      const result = await db.collection('experience').insertOne(doc);
      const inserted = await db.collection('experience').findOne({ _id: result.insertedId });
      return res.status(201).json(inserted);
    }
    if (req.method === 'PUT') {
      if (!requireAuth(req, res)) return;
      const { _id, ...rest } = req.body;
      if (!_id) return res.status(400).json({ error: '_id is required' });
      const db = await getDb();
      await db.collection('experience').updateOne({ _id: toObjectId(_id) }, { $set: rest });
      const updated = await db.collection('experience').findOne({ _id: toObjectId(_id) });
      return res.status(200).json(updated);
    }
    if (req.method === 'DELETE') {
      if (!requireAuth(req, res)) return;
      const { _id } = req.body;
      if (!_id) return res.status(400).json({ error: '_id is required' });
      const db = await getDb();
      const result = await db.collection('experience').deleteOne({ _id: toObjectId(_id) });
      if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: err.message });
  }
}