// PUBLIC endpoint used by the customer-facing page.
// GET /api/company?cid=11299  ->  { id, name, logo, links }
const { db } = require('./_lib/firebase');
const { withCors } = require('./_lib/auth');

async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const cid = (req.query.cid || '').toString().trim();
  if (!cid) {
    res.status(400).json({ error: 'Missing company id.' });
    return;
  }

  try {
    const snap = await db.collection('companies').doc(cid).get();
    if (!snap.exists) {
      res.status(404).json({ error: 'Company not found.' });
      return;
    }
    const data = snap.data() || {};
    res.status(200).json({
      id: snap.id,
      name: data.name || '',
      logo: data.logo || '',
      links: data.links || {},
    });
  } catch (err) {
    console.error('company GET error:', err);
    res.status(500).json({ error: 'Server error while loading company.' });
  }
}

module.exports = withCors(handler);
