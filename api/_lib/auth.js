// Small helpers shared by the API functions: JSON body parsing, CORS,
// and JWT issuing/verification for the admin panel.
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || '';

function signToken(payload) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not set.');
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
}

function verifyToken(token) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not set.');
  return jwt.verify(token, JWT_SECRET);
}

// Reads and parses a JSON request body. Vercel usually populates req.body,
// but we fall back to reading the raw stream so this works everywhere.
async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.length) {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { return {}; }
}

// Pulls the bearer token from the Authorization header and verifies it.
// Returns the decoded payload, or sends a 401 and returns null.
function requireAdmin(req, res) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) {
    res.status(401).json({ error: 'Missing authorization token.' });
    return null;
  }
  try {
    return verifyToken(token);
  } catch {
    res.status(401).json({ error: 'Invalid or expired token. Please log in again.' });
    return null;
  }
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// Wraps a handler with CORS + OPTIONS preflight handling.
function withCors(handler) {
  return async (req, res) => {
    setCors(res);
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    return handler(req, res);
  };
}

module.exports = { signToken, verifyToken, readJson, requireAdmin, withCors };
