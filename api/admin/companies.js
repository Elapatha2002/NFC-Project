// PROTECTED: list every company for the admin's company selector.
// GET /api/admin/companies  ->  { companies: [{ id, name }] }
const { db } = require('../_lib/firebase');
const { requireAdmin, withCors } = require('../_lib/auth');

async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }
  if (!requireAdmin(req, res)) return;

  try {
    const snap = await db.collection('companies').get();
    const companies = snap.docs
      .map((d) => ({ id: d.id, name: (d.data().name || '').toString() }))
      .sort((a, b) => a.name.localeCompare(b.name));
    res.status(200).json({ companies });
  } catch (err) {
    console.error('admin companies error:', err);
    res.status(500).json({ error: 'Server error while listing companies.' });
  }
}

module.exports = withCors(handler);
