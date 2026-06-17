// PROTECTED: read / create-update / delete a single company.
//   GET    /api/admin/company?cid=11299        -> full company doc
//   POST   /api/admin/company  { cid, name, logo, links }  -> create or overwrite
//   DELETE /api/admin/company?cid=11299        -> delete
const { db } = require('../_lib/firebase');
const { requireAdmin, readJson, withCors } = require('../_lib/auth');

// Keep only non-empty string values so "remove a field" works by clearing it.
function cleanLinks(links) {
  const out = {};
  if (links && typeof links === 'object') {
    for (const [key, value] of Object.entries(links)) {
      const v = (value == null ? '' : String(value)).trim();
      if (v) out[key] = v;
    }
  }
  return out;
}

async function handler(req, res) {
  if (!requireAdmin(req, res)) return;

  try {
    if (req.method === 'GET') {
      const cid = (req.query.cid || '').toString().trim();
      if (!cid) return res.status(400).json({ error: 'Missing cid.' });
      const snap = await db.collection('companies').doc(cid).get();
      if (!snap.exists) return res.status(404).json({ error: 'Company not found.' });
      const data = snap.data() || {};
      return res.status(200).json({
        id: snap.id,
        name: data.name || '',
        logo: data.logo || '',
        links: data.links || {},
      });
    }

    if (req.method === 'POST') {
      const body = await readJson(req);
      const cid = (body.cid || '').toString().trim();
      if (!cid) return res.status(400).json({ error: 'Company ID is required.' });
      if (!body.name || !String(body.name).trim()) {
        return res.status(400).json({ error: 'Company name is required.' });
      }
      const doc = {
        name: String(body.name).trim(),
        logo: (body.logo || '').toString().trim(),
        links: cleanLinks(body.links),
        updatedAt: new Date().toISOString(),
      };
      await db.collection('companies').doc(cid).set(doc); // full overwrite
      return res.status(200).json({ ok: true, id: cid, ...doc });
    }

    if (req.method === 'DELETE') {
      const cid = (req.query.cid || '').toString().trim();
      if (!cid) return res.status(400).json({ error: 'Missing cid.' });
      await db.collection('companies').doc(cid).delete();
      return res.status(200).json({ ok: true, id: cid });
    }

    res.status(405).json({ error: 'Method not allowed.' });
  } catch (err) {
    console.error('admin company error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
}

module.exports = withCors(handler);
