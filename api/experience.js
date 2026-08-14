import { getDb } from './_lib/db-mongo.js';
import { requireAuth } from './_lib/auth.js';
import { toObjectId, pick, asArray } from './_lib/helpers.js';
import { applyCors, handlePreflight, sendError, setNoStore, setPublicCache } from './_lib/http.js';

const ALLOWED_FIELDS = ['company', 'role', 'period', 'points', 'icon', 'link', 'logo_url'];

export default async function handler(req, res) {
  applyCors(req, res, 'GET, POST, PUT, DELETE, OPTIONS');
  if (handlePreflight(req, res)) return;

  try {
    const db = await getDb();
    const col = db.collection('experience');

    if (req.method === 'GET') {
      setPublicCache(res, 120);
      const data = await col.find().sort({ order_index: 1 }).toArray();
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      setNoStore(res);
      if (!requireAuth(req, res)) return;
      const doc = pick(req.body, ALLOWED_FIELDS);
      if (!doc.company || !doc.role) return res.status(400).json({ error: 'company and role are required' });
      doc.points = asArray(doc.points);
      doc.icon = doc.icon || 'Briefcase';
      doc.link = doc.link || '';
      await col.updateMany({}, { $inc: { order_index: 1 } });
      doc.order_index = 0;
      const result = await col.insertOne(doc);
      const inserted = await col.findOne({ _id: result.insertedId });
      return res.status(201).json(inserted);
    }
    if (req.method === 'PUT') {
      setNoStore(res);
      if (!requireAuth(req, res)) return;
      const { _id } = req.body || {};
      if (!_id) return res.status(400).json({ error: '_id is required' });
      await col.updateOne({ _id: toObjectId(_id) }, { $set: pick(req.body, ALLOWED_FIELDS) });
      const updated = await col.findOne({ _id: toObjectId(_id) });
      return res.status(200).json(updated);
    }
    if (req.method === 'DELETE') {
      setNoStore(res);
      if (!requireAuth(req, res)) return;
      const { _id } = req.body || {};
      if (!_id) return res.status(400).json({ error: '_id is required' });
      const result = await col.deleteOne({ _id: toObjectId(_id) });
      if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return sendError(res, err);
  }
}
