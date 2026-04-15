/**
 * googleSheets.js
 * ----------------
 * Handles all communication with Google Sheets.
 *
 * Uses the `googleapis` package with a service-account JWT
 * to authenticate, then exposes helpers to:
 *   1. Read existing registrations (for duplicate checking).
 *   2. Append a new registration row.
 */

const { google } = require('googleapis');
const { config } = require('./config');

// ─── Auth client (created once, reused across invocations) ─
let sheetsClient = null;

/**
 * Build (or return cached) an authorised Google Sheets client.
 * @returns {Promise<import('googleapis').sheets_v4.Sheets>}
 */
async function getSheetsClient() {
  if (sheetsClient) return sheetsClient;

  const auth = new google.auth.JWT(
    config.googleSheets.serviceAccountEmail,
    null,
    config.googleSheets.privateKey,
    ['https://www.googleapis.com/auth/spreadsheets']
  );

  await auth.authorize();

  sheetsClient = google.sheets({ version: 'v4', auth });
  return sheetsClient;
}

// ─── Read helpers ──────────────────────────────────────────

/**
 * Fetch all rows from the registrations sheet.
 * Returns an array of arrays — first element is the header row.
 *
 * @returns {Promise<string[][]>}
 */
async function getRegistrationRows() {
  const sheets = await getSheetsClient();

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: config.googleSheets.spreadsheetId,
    range: `${config.registrationSheet}!A:N`, // columns A through N
  });

  return response.data.values || [];
}

// ─── Write helpers ─────────────────────────────────────────

/**
 * Append a single registration row to the sheet.
 *
 * Column order (must match what validators.checkDuplicate expects):
 *   A: timestamp
 *   B: eventId
 *   C: eventName
 *   D: participantName
 *   E: usn
 *   F: email
 *   G: phone
 *   H: college
 *   I: branch
 *   J: semester
 *   K: teamName
 *   L: teamSize
 *   M: members (JSON string)
 *   N: status
 *
 * @param {object} data - Sanitised registration data.
 * @param {string} eventName - Resolved event title.
 */
async function appendRegistration(data, eventName) {
  const sheets = await getSheetsClient();

  const timestamp = new Date().toISOString();

  // For team events, store members as a JSON string; for solo, leave blank.
  const membersString = Array.isArray(data.members) && data.members.length > 0
    ? JSON.stringify(data.members)
    : '';

  const row = [
    timestamp,
    data.eventId,
    eventName,
    data.participantName,
    data.usn,
    data.email,
    data.phone,
    data.college,
    data.branch,
    data.semester,
    data.teamName || '',
    data.teamSize || 1,
    membersString,
    'confirmed',
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: config.googleSheets.spreadsheetId,
    range: `${config.registrationSheet}!A:N`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [row],
    },
  });
}

module.exports = { getRegistrationRows, appendRegistration };
