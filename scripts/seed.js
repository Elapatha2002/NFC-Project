/* Local seeding script — alternative to the /api/setup endpoint.
 * Creates an admin user and an optional sample company directly from your machine.
 *
 * Usage (PowerShell):
 *   npm run seed -- --user admin --pass "StrongPass123" --sample
 *
 * Requires the same FIREBASE_* env vars (loaded from .env via dotenv).
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');

function arg(name, fallback) {
  const i = process.argv.indexOf('--' + name);
  if (i !== -1) {
    const next = process.argv[i + 1];
    if (!next || next.startsWith('--')) return true; // flag
    return next;
  }
  return fallback;
}

(async () => {
  const { db } = require('../api/_lib/firebase');

  const user = String(arg('user', 'admin')).toLowerCase();
  const pass = arg('pass');
  const sample = arg('sample', false);

  if (!pass || pass === true) {
    console.error('Provide a password:  npm run seed -- --user admin --pass "YourPassword"');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(String(pass), 10);
  await db.collection('admins').doc(user).set({
    passwordHash,
    createdAt: new Date().toISOString(),
  });
  console.log('✓ Admin created:', user);

  if (sample) {
    await db.collection('companies').doc('11299').set({
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
    console.log('✓ Sample company created. View it at /?cid=11299');
  }

  console.log('Done.');
  process.exit(0);
})().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
