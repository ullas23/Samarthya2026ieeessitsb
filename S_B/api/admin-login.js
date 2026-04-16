/**
 * /api/admin-login.js
 * ---------------------
 * Minimal password-based admin authentication.
 * Returns a JWT token on successful login.
 *
 * Route:  POST /api/admin-login
 *
 * Body:   { "password": "..." }
 * 
 * Required env vars:
 *   ADMIN_PASSWORD  — the admin password
 *   JWT_SECRET      — secret key for signing JWT tokens
 */

const jwt = require('jsonwebtoken');
const { success, error, send } = require('../backend/response');

module.exports = (req, res) => {
  // ── CORS preflight ──────────────────────────────────
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    return res.status(200).end();
  }

  // ── Only allow POST ─────────────────────────────────
  if (req.method !== 'POST') {
    return send(res, 405, error('Method not allowed', 'METHOD_NOT_ALLOWED', ['Use POST']));
  }

  try {
    // ── Check required env vars ─────────────────────────
    const adminPassword = process.env.ADMIN_PASSWORD;
    const jwtSecret = process.env.JWT_SECRET;

    if (!adminPassword || !jwtSecret) {
      console.error('[/api/admin-login] Missing ADMIN_PASSWORD or JWT_SECRET');
      return send(res, 500, error(
        'Server configuration error',
        'CONFIG_ERROR',
        ['Admin auth is not configured. Contact the administrator.']
      ));
    }

    // ── Parse body ──────────────────────────────────────
    const body = req.body;
    if (!body || typeof body !== 'object' || !body.password) {
      return send(res, 400, error('Password is required', 'MISSING_PASSWORD', ['Provide password in request body']));
    }

    // ── Validate password ───────────────────────────────
    if (body.password !== adminPassword) {
      return send(res, 401, error('Invalid password', 'INVALID_PASSWORD', ['The password you entered is incorrect']));
    }

    // ── Generate JWT token (expires in 24 hours) ────────
    const token = jwt.sign(
      { role: 'admin', iat: Math.floor(Date.now() / 1000) },
      jwtSecret,
      { expiresIn: '24h' }
    );

    send(res, 200, success('Login successful', { token }));

  } catch (err) {
    console.error('[/api/admin-login] Unhandled error:', err);
    send(res, 500, error('Login failed', 'INTERNAL_ERROR', [err.message]));
  }
};
