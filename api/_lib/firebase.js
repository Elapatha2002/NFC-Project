// Initializes the Firebase Admin SDK once and exposes the Firestore instance.
// Uses the modular API (firebase-admin v12+/v14). Credentials come from
// environment variables (set them in Vercel project settings or a local .env).
const { getApps, initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

function getPrivateKey() {
  let key = process.env.FIREBASE_PRIVATE_KEY || '';
  // If the value was pasted into a dashboard wrapped in quotes, strip them —
  // unlike .env files, dashboards keep quotes as literal characters.
  if (key.length > 1 &&
      ((key.startsWith('"') && key.endsWith('"')) ||
       (key.startsWith("'") && key.endsWith("'")))) {
    key = key.slice(1, -1);
  }
  // Convert the escaped two-character "\n" sequences into real newlines.
  return key.replace(/\\n/g, '\n');
}

if (!getApps().length) {
  // .trim() guards against stray whitespace/tabs/newlines pasted into a dashboard,
  // which gRPC otherwise rejects as "illegal characters" in the request metadata.
  const projectId = (process.env.FIREBASE_PROJECT_ID || '').trim();
  const clientEmail = (process.env.FIREBASE_CLIENT_EMAIL || '').trim();
  const privateKey = getPrivateKey().trim();

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.'
    );
  }

  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

const db = getFirestore();

module.exports = { db };
