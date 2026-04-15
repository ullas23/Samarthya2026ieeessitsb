/**
 * /api/events.js
 * ----------------
 * Returns the list of events from the local JSON data file.
 * The frontend uses this to populate the registration flow.
 *
 * Route:  GET /api/events
 */

const path = require('path');
const fs = require('fs');
const { success, error, send } = require('../backend/response');

module.exports = (req, res) => {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return send(res, 405, error('Method not allowed', 'METHOD_NOT_ALLOWED', ['Use GET']));
  }

  try {
    // Read the events data file
    const dataPath = path.join(__dirname, '..', 'data', 'events.sample.json');
    const raw = fs.readFileSync(dataPath, 'utf-8');
    const events = JSON.parse(raw);

    // Optionally filter: query param ?active=true returns only active events
    const activeOnly = req.query && req.query.active === 'true';
    const filtered = activeOnly ? events.filter((e) => e.active) : events;

    send(res, 200, success('Events retrieved successfully', {
      count: filtered.length,
      events: filtered,
    }));
  } catch (err) {
    console.error('[/api/events] Error reading events data:', err.message);
    send(res, 500, error('Failed to load events', 'INTERNAL_ERROR', [err.message]));
  }
};
