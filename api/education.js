import { getDb, collection, ObjectId } from './db-mongo.js';
import { requireAuth } from './auth.js';

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
      const data = await (await getDb()).collection('education').find().sort({ order_index: 1 }).toArray();
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      if (!requireAuth(req, res)) return;
      const { institution, degree, period, description, icon, order_index, link } = req.body;
      if (!institution || !degree) return res.status(400).json({ error: 'institution and degree are required' });
      const doc = { institution, degree, period, description, icon: icon || 'GraduationCap', order_index: order_index || 0, link: link || '' };
      const result = await (await getDb()).collection('education').insertOne(doc);
      const inserted = await (await getDb()).collection('education').findOne({ _id: result.insertedId });
      return res.status(201).json(inserted);
    }
    if (req.method === 'PUT') {
      if (!requireAuth(req, res)) return;
      const { _id, ...rest } = req.body;
      if (!_id) return res.status(400).json({ error: '_id is required' });
      await (await getDb()).collection('education').updateOne({ _id: toObjectId(_id) }, { $set: rest });
      const updated = await (await getDb()).collection('education').findOne({ _id: toObjectId(_id) });
      return res.status(200).json(updated);
    }
    if (req.method === 'DELETE') {
      if (!requireAuth(req, res)) return;
      const { _id } = req.body;
      if (!_id) return res.status(400).json({ error: '_id is required' });
      const result = await (await getDb()).collection('education').deleteOne({ _id: toObjectId(_id) });
      if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: err.message });
  }
}