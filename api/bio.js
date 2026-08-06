import { getDb } from './_lib/db-mongo.js';
import { requireAuth } from './_lib/auth.js';
import { pick } from './_lib/helpers.js';
import { applyCors, handlePreflight, sendError, setNoStore, setPublicCache } from './_lib/http.js';

const BIO_ID = 'bio';

const ALLOWED_FIELDS = [
  'hero_title',
  'story_paragraphs',
  'university_title',
  'university_intro',
  'university_image_url',
  'university_text_before_links',
  'university_links',
  'university_text_after_links',
  'career_period',
  'career_role',
  'career_company',
  'career_intro',
  'career_image_url',
  'career_body',
  'career_stack',
  'ending',
];

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
      await col.updateOne(
        { _id: BIO_ID },
        { $set: { ...pick(req.body, ALLOWED_FIELDS), _id: BIO_ID, updated_at: new Date().toISOString() } },
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
