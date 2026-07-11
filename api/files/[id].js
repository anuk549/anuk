import { applyCors, handlePreflight, sendError } from '../_lib/http.js';
import { extractFileId, serveFileById } from '../_lib/serve-file.js';

export default async function handler(req, res) {
  applyCors(req, res, 'GET, OPTIONS');
  if (handlePreflight(req, res)) return;

  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const id = extractFileId(req);
    await serveFileById(id, res);
  } catch (err) {
    if (!res.headersSent) {
      return sendError(res, err);
    }
  }
}
