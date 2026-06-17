// ONE-TIME setup helper to create the first admin user (and an optional sample company)
// without needing local tooling. Protected by SETUP_SECRET.
//
// POST /api/setup
//   { secret, username, password, withSample? }
//
// After you've created your admin user you can safely delete this file/route.
const bcrypt = require('bcryptjs');
const { db } = require('./_lib/firebase');
const { readJson, withCors } = require('./_lib/auth');

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const body = await readJson(req);
  const { secret, username, password, withSample } = body;

  if (!process.env.SETUP_SECRET) {
    res.status(500).json({ error: 'SETUP_SECRET is not configured on the server.' });
    return;
  }
  if (secret !== process.env.SETUP_SECRET) {
    res.status(403).json({ error: 'Invalid setup secret.' });
    return;
  }
  if (!username || !password) {
    res.status(400).json({ error: 'username and password are required.' });
    return;
  }

  try {
    const id = String(username).toLowerCase();
    const passwordHash = await bcrypt.hash(String(password), 10);
    await db.collection('admins').doc(id).set({
      passwordHash,
      createdAt: new Date().toISOString(),
    });

    let sample = null;
    if (withSample) {
      sample = '11299';
      await db.collection('companies').doc(sample).set({
        name: 'ABC Company',
        logo: 'sample-logo.png',
        links: {
          whatsapp: '94771234567',
          phone: '+94112345678',
          email: 'info@abc.com',
          website: 'https://abc.com',
          facebook: 'https://facebook.com/abc',
          instagram: 'https://instagram.com/abc',
          tiktok: 'https://tiktok.com/@abc',
        },
      });
    }

    res.status(200).json({
      ok: true,
      admin: id,
      sampleCompanyId: sample,
      message: 'Admin created. You can now log in at /admin.',
    });
  } catch (err) {
    console.error('setup error:', err);
    res.status(500).json({ error: 'Server error during setup.' });
  }
}

module.exports = withCors(handler);
