import { getDb, collection, ObjectId } from './db-mongo.js';
import { requireAuth } from './auth.js';

function toObjectId(id) {
  if (!id) return id;
  if (ObjectId.isValid(id)) {
    return new ObjectId(id);
  }
  return id;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const db = await getDb();
    const col = db.collection('messages');

    if (req.method === 'POST') {
      const { name, email, message } = req.body;
      if (!name || !email || !message) return res.status(400).json({ error: 'name, email and message are required' });
      if (!isValidEmail(email)) return res.status(400).json({ error: 'Invalid email address' });
      if (String(message).length > 3000) return res.status(400).json({ error: 'Message too long' });
      const doc = {
        name: String(name).slice(0, 200),
        email: String(email).slice(0, 200),
        message: String(message).slice(0, 3000),
        read: false,
        created_at: new Date().toISOString(),
      };
      const result = await col.insertOne(doc);
      const inserted = await col.findOne({ _id: result.insertedId });
      return res.status(201).json(inserted);
    }
    if (req.method === 'GET') {
      if (!requireAuth(req, res)) return;
      const data = await col.find().sort({ created_at: -1 }).toArray();
      return res.status(200).json(data);
    }
    if (req.method === 'PUT') {
      if (!requireAuth(req, res)) return;
      const { _id, read } = req.body;
      if (!_id) return res.status(400).json({ error: '_id is required' });
      await col.updateOne({ _id: toObjectId(_id) }, { $set: { read: !!read } });
      const updated = await col.findOne({ _id: toObjectId(_id) });
      return res.status(200).json(updated);
    }
    if (req.method === 'DELETE') {
      if (!requireAuth(req, res)) return;
      const { _id } = req.body;
      if (!_id) return res.status(400).json({ error: '_id is required' });
      const result = await col.deleteOne({ _id: toObjectId(_id) });
      if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: err.message });
  }
}