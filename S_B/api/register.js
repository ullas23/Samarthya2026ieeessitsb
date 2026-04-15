/**
 * /api/register.js
 * ------------------
 * Accepts registration submissions from the frontend,
 * validates them, checks for duplicates, and appends
 * the data to Google Sheets.
 *
 * Route:  POST /api/register
 */

const path = require('path');
const fs = require('fs');
const { success, error, send } = require('../backend/response');
const { sanitize, validateRegistration, checkDuplicate } = require('../backend/validators');
const { validateConfig } = require('../backend/config');
const { getRegistrationRows, appendRegistration } = require('../backend/googleSheets');

module.exports = async (req, res) => {
  // ── Only allow POST ────────────────────────────────────
  if (req.method !== 'POST') {
    return send(res, 405, error('Method not allowed', 'METHOD_NOT_ALLOWED', ['Use POST']));
  }

  try {
    // ── Check env vars are set ─────────────────────────────
    const missingVars = validateConfig();
    if (missingVars.length > 0) {
      console.error('[/api/register] Missing env vars:', missingVars);
      return send(res, 500, error(
        'Server configuration error',
        'CONFIG_ERROR',
        ['Backend is not fully configured. Contact the administrator.']
      ));
    }

    // ── Parse body ─────────────────────────────────────────
    const body = req.body;
    if (!body || typeof body !== 'object') {
      return send(res, 400, error('Invalid request body', 'INVALID_BODY', ['Request body must be valid JSON']));
    }

    // ── Sanitise string fields ─────────────────────────────
    const sanitisedBody = {
      eventId:         sanitize(body.eventId),
      participantName: sanitize(body.participantName),
      usn:             sanitize(body.usn),
      email:           sanitize(body.email),
      phone:           sanitize(body.phone),
      college:         sanitize(body.college),
      branch:          sanitize(body.branch),
      semester:        sanitize(body.semester),
      teamName:        body.teamName ? sanitize(body.teamName) : '',
      teamSize:        body.teamSize ? Number(body.teamSize) : 1,
      members:         Array.isArray(body.members)
        ? body.members.map((m) => ({
            name:  sanitize(m.name),
            usn:   sanitize(m.usn),
            email: sanitize(m.email),
            phone: sanitize(m.phone),
          }))
        : [],
    };

    // ── Load event data ────────────────────────────────────
    const dataPath = path.join(__dirname, '..', 'data', 'events.sample.json');
    const events = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const event = events.find((e) => e.id === sanitisedBody.eventId);

    // ── Validate payload ───────────────────────────────────
    const validation = validateRegistration(sanitisedBody, event);
    if (!validation.valid) {
      return send(res, 400, error('Validation failed', 'INVALID_INPUT', validation.errors));
    }

    // ── Duplicate check via Google Sheets ──────────────────
    const existingRows = await getRegistrationRows();
    // Skip the header row (index 0) if it exists
    const dataRows = existingRows.length > 0 ? existingRows.slice(1) : [];

    const dupCheck = checkDuplicate(dataRows, sanitisedBody.eventId, sanitisedBody.email, sanitisedBody.usn);
    if (dupCheck.isDuplicate) {
      return send(res, 409, error('Duplicate registration', 'DUPLICATE', [dupCheck.reason]));
    }

    // ── Append row to Google Sheets ────────────────────────
    await appendRegistration(sanitisedBody, event.title);

    // ── Success ────────────────────────────────────────────
    send(res, 201, success('Registration successful', {
      eventId: sanitisedBody.eventId,
      eventName: event.title,
      participantName: sanitisedBody.participantName,
      teamName: sanitisedBody.teamName || null,
    }));
  } catch (err) {
    console.error('[/api/register] Unhandled error:', err);
    send(res, 500, error('Registration failed', 'INTERNAL_ERROR', [err.message]));
  }
};
