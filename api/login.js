// Admin login. Credentials are stored (hashed) in the `admins` collection.
// POST /api/login { username, password } -> { token, username }
const bcrypt = require('bcryptjs');
const { db } = require('./_lib/firebase');
const { signToken, readJson, withCors } = require('./_lib/auth');

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const { username, password } = await readJson(req);
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required.' });
    return;
  }

  try {
    const snap = await db.collection('admins').doc(String(username).toLowerCase()).get();
    if (!snap.exists) {
      res.status(401).json({ error: 'Invalid username.' });
      return;
    }
    const admin = snap.data();
    const ok = await bcrypt.compare(String(password), admin.passwordHash || '');
    if (!ok) {
      res.status(401).json({ error: 'Invalid password.' });
      return;
    }
    const token = signToken({ username: snap.id, role: 'admin' });
    res.status(200).json({ token, username: snap.id });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
}

module.exports = withCors(handler);
