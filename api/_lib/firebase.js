// Initializes the Firebase Admin SDK once and exposes the Firestore instance.
// Uses the modular API (firebase-admin v12+/v14). Credentials come from
// environment variables (set them in Vercel project settings or a local .env).
const { getApps, initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

function getPrivateKey() {
  const key = process.env.FIREBASE_PRIVATE_KEY || '';
  // In dashboards/.env the newlines are usually escaped as the two characters "\n".
  return key.replace(/\\n/g, '\n');
}

if (!getApps().length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = getPrivateKey();

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.'
    );
  }

  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

const db = getFirestore();

module.exports = { db };
