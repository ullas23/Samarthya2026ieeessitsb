/**
 * /api/admin-registrations.js
 * ----------------------------
 * Protected admin endpoint — fetches registration data from Google Sheets.
 * Requires a valid JWT token in the Authorization header.
 *
 * Route:  GET /api/admin-registrations
 *
 * Headers:  Authorization: Bearer <token>
 *
 * Query params (all optional filters):
 *   eventId  — filter by event ID
 *   name     — filter by participant name (partial match)
 *   email    — filter by email (partial match)
 *   team     — filter by team name (partial match)
 *   q        — general search query (searches across name, email, team, college)
 */

const jwt = require('jsonwebtoken');
const { success, error, send } = require('../backend/response');
const { validateConfig } = require('../backend/config');
const { getRegistrationRows } = require('../backend/googleSheets');
const { sanitize } = require('../backend/validators');

/**
 * Verify JWT token from Authorization header.
 * Returns decoded payload or null.
 */
function verifyToken(req) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.slice(7);
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return null;
  }
}

module.exports = async (req, res) => {
  // ── CORS preflight ──────────────────────────────────
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    return res.status(200).end();
  }

  // ── Only allow GET ──────────────────────────────────
  if (req.method !== 'GET') {
    return send(res, 405, error('Method not allowed', 'METHOD_NOT_ALLOWED', ['Use GET']));
  }

  try {
    // ── Auth check ──────────────────────────────────────
    if (!process.env.JWT_SECRET) {
      return send(res, 500, error('Server misconfigured', 'CONFIG_ERROR', ['JWT_SECRET not set']));
    }

    const decoded = verifyToken(req);
    if (!decoded || decoded.role !== 'admin') {
      return send(res, 401, error('Unauthorized', 'UNAUTHORIZED', ['Invalid or expired admin token']));
    }

    // ── Config check ────────────────────────────────────
    const missingVars = validateConfig();
    if (missingVars.length > 0) {
      return send(res, 500, error(
        'Server configuration error',
        'CONFIG_ERROR',
        ['Google Sheets not configured']
      ));
    }

    // ── Fetch rows from Google Sheets ───────────────────
    const allRows = await getRegistrationRows();

    // First row is header
    const headerRow = allRows.length > 0 ? allRows[0] : [];
    const dataRows = allRows.length > 1 ? allRows.slice(1) : [];

    // Column indices:
    //  0: timestamp, 1: eventId, 2: eventName, 3: participantName,
    //  4: usn, 5: email, 6: phone, 7: college, 8: branch, 9: semester,
    // 10: teamName, 11: teamSize, 12: members, 13: status

    // ── Parse rows into objects ─────────────────────────
    let registrations = dataRows.map((row) => ({
      timestamp: row[0] || '',
      eventId: row[1] || '',
      eventName: row[2] || '',
      participantName: row[3] || '',
      usn: row[4] || '',
      email: row[5] || '',
      phone: row[6] || '',
      college: row[7] || '',
      branch: row[8] || '',
      semester: row[9] || '',
      teamName: row[10] || '',
      teamSize: row[11] || '1',
      members: row[12] || '',
      status: row[13] || '',
    }));

    // ── Apply filters ───────────────────────────────────
    const filterEventId = sanitize(req.query.eventId || '');
    const filterName = sanitize(req.query.name || '').toLowerCase();
    const filterEmail = sanitize(req.query.email || '').toLowerCase();
    const filterTeam = sanitize(req.query.team || '').toLowerCase();
    const searchQuery = sanitize(req.query.q || '').toLowerCase();

    if (filterEventId) {
      registrations = registrations.filter((r) => r.eventId === filterEventId);
    }
    if (filterName) {
      registrations = registrations.filter((r) =>
        r.participantName.toLowerCase().includes(filterName)
      );
    }
    if (filterEmail) {
      registrations = registrations.filter((r) =>
        r.email.toLowerCase().includes(filterEmail)
      );
    }
    if (filterTeam) {
      registrations = registrations.filter((r) =>
        r.teamName.toLowerCase().includes(filterTeam)
      );
    }
    if (searchQuery) {
      registrations = registrations.filter((r) => {
        const haystack = [
          r.participantName,
          r.email,
          r.teamName,
          r.college,
          r.eventName,
          r.eventId,
          r.usn,
        ].join(' ').toLowerCase();
        return haystack.includes(searchQuery);
      });
    }

    // ── Sort by timestamp descending (newest first) ─────
    registrations.sort((a, b) => {
      if (!a.timestamp) return 1;
      if (!b.timestamp) return -1;
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    send(res, 200, success('Registrations retrieved', {
      count: registrations.length,
      registrations,
    }));

  } catch (err) {
    console.error('[/api/admin-registrations] Unhandled error:', err);
    send(res, 500, error('Failed to load registrations', 'INTERNAL_ERROR', [err.message]));
  }
};
