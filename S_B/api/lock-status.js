/**
 * /api/lock-status.js
 * --------------------
 * Pre-registration lock check endpoint.
 * Called BEFORE the registration form is opened.
 *
 * Checks whether the user (identified by email+USN) is already
 * registered for a conflicting event in the same clashGroup.
 *
 * Route:  GET /api/lock-status?eventId=AWK02&email=user@example.com&usn=4XX22XX001
 */

const path = require('path');
const fs = require('fs');
const { success, error, send } = require('../backend/response');
const { sanitize } = require('../backend/validators');
const { getRegistrationRows } = require('../backend/googleSheets');
const { validateConfig } = require('../backend/config');

module.exports = async (req, res) => {
  // ── CORS preflight ──────────────────────────────────
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // ── Only allow GET ──────────────────────────────────
  if (req.method !== 'GET') {
    return send(res, 405, error('Method not allowed', 'METHOD_NOT_ALLOWED', ['Use GET']));
  }

  try {
    // ── Validate config ─────────────────────────────────
    const missingVars = validateConfig();
    if (missingVars.length > 0) {
      console.error('[/api/lock-status] Missing env vars:', missingVars);
      return send(res, 500, error(
        'Server configuration error',
        'CONFIG_ERROR',
        ['Backend is not fully configured. Contact the administrator.']
      ));
    }

    // ── Parse & sanitise query params ───────────────────
    const eventId = sanitize(req.query.eventId || '');
    const email = sanitize(req.query.email || '').toLowerCase();
    const usn = sanitize(req.query.usn || '').toUpperCase();

    if (!eventId) {
      return send(res, 400, error('eventId is required', 'MISSING_PARAM', ['Provide eventId query parameter']));
    }

    // ── Load event data ─────────────────────────────────
    const dataPath = path.join(__dirname, '..', 'data', 'events.sample.json');
    const events = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const selectedEvent = events.find((e) => e.id === eventId);

    if (!selectedEvent) {
      return send(res, 404, error('Event not found', 'EVENT_NOT_FOUND', [`No event with id "${eventId}"`]));
    }

    // ── If no clashGroup, the event is always unlocked ──
    if (!selectedEvent.clashGroup) {
      return send(res, 200, success('Lock status checked', { locked: false }));
    }

    // ── If no identity provided, we can't check ─────────
    if (!email && !usn) {
      return send(res, 200, success('Lock status checked', { locked: false }));
    }

    // ── Find events in the same clashGroup ──────────────
    const clashGroupEvents = events.filter(
      (e) => e.id !== eventId && e.clashGroup === selectedEvent.clashGroup
    );

    if (clashGroupEvents.length === 0) {
      return send(res, 200, success('Lock status checked', { locked: false }));
    }

    const clashGroupEventIds = clashGroupEvents.map((e) => e.id);

    // ── Check Google Sheets for existing registrations ──
    const existingRows = await getRegistrationRows();
    // Skip header row (index 0)
    const dataRows = existingRows.length > 0 ? existingRows.slice(1) : [];

    // Column indices (from googleSheets.js appendRegistration):
    //   0: timestamp, 1: eventId, 2: eventName, 3: participantName,
    //   4: usn, 5: email, 6: phone, 7: college, 8: branch, 9: semester,
    //  10: teamName, 11: teamSize, 12: members (JSON), 13: status

    for (const row of dataRows) {
      const rowEventId = row[1];
      const rowUSN = (row[4] || '').toUpperCase();
      const rowEmail = (row[5] || '').toLowerCase();

      // Check if the user is registered for a conflicting event
      if (!clashGroupEventIds.includes(rowEventId)) continue;

      const matchesEmail = email && rowEmail === email;
      const matchesUSN = usn && rowUSN === usn;

      // Also check team members in the members JSON column
      let memberMatch = false;
      if (row[12]) {
        try {
          const members = JSON.parse(row[12]);
          if (Array.isArray(members)) {
            memberMatch = members.some((m) => {
              const mEmail = (m.email || '').toLowerCase();
              const mUSN = (m.usn || '').toUpperCase();
              return (email && mEmail === email) || (usn && mUSN === usn);
            });
          }
        } catch (e) {
          // Invalid JSON in members column — skip
        }
      }

      if (matchesEmail || matchesUSN || memberMatch) {
        const registeredEvent = clashGroupEvents.find((e) => e.id === rowEventId);
        return send(res, 200, success('Lock status checked', {
          locked: true,
          selectedEventId: eventId,
          registeredEventId: rowEventId,
          registeredEventName: registeredEvent ? registeredEvent.title : rowEventId,
          clashGroup: selectedEvent.clashGroup,
        }));
      }
    }

    // ── No conflicts found ──────────────────────────────
    send(res, 200, success('Lock status checked', { locked: false }));

  } catch (err) {
    console.error('[/api/lock-status] Unhandled error:', err);
    send(res, 500, error('Lock status check failed', 'INTERNAL_ERROR', [err.message]));
  }
};
