import { getDb } from './_lib/db-mongo.js';
import { applyCors, handlePreflight, sendError, setPublicCache } from './_lib/http.js';

// Aggregated endpoint: single round-trip instead of six separate serverless
// invocations (each with its own cold-start overhead).
export default async function handler(req, res) {
  applyCors(req, res, 'GET, OPTIONS');
  if (handlePreflight(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = await getDb();
    const [profile, experience, education, skills, projects, technologies] = await Promise.all([
      db.collection('profile').find().sort({ _id: 1 }).limit(1).toArray(),
      db.collection('experience').find().sort({ order_index: 1 }).toArray(),
      db.collection('education').find().sort({ order_index: 1 }).toArray(),
      db.collection('skills').find().sort({ order_index: 1 }).toArray(),
      db.collection('projects').find().sort({ order_index: 1 }).toArray(),
      db.collection('technologies').find().sort({ order_index: 1 }).toArray(),
    ]);

    setPublicCache(res, 120);
    return res.status(200).json({
      profile: profile[0] || null,
      experience,
      education,
      skills,
      projects,
      technologies,
    });
  } catch (err) {
    return sendError(res, err);
  }
}
