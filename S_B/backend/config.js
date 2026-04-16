/**
 * config.js
 * ---------
 * Reads and validates environment variables.
 * Exports a single config object used by other backend modules.
 */

function parsePrivateKey(raw) {
  if (!raw) return '';
  // Handle JSON-quoted strings
  if (raw.startsWith('"')) {
    try { raw = JSON.parse(raw); } catch (e) {}
  }
  // Replace literal two-char sequence \n with real newline
  raw = raw.split(String.raw`\n`).join('\n');
  return raw.trim();
}

const config = {
  // Google Sheets credentials
  googleSheets: {
    spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKey: parsePrivateKey(process.env.GOOGLE_PRIVATE_KEY),
  },

  // Sheet tab name where registrations are stored
  registrationSheet: 'registrations',
};

/**
 * Checks that the critical Google Sheets env vars are set.
 * Returns an array of missing variable names (empty = all good).
 */
function validateConfig() {
  const missing = [];

  if (!process.env.GOOGLE_SHEETS_SPREADSHEET_ID) missing.push('GOOGLE_SHEETS_SPREADSHEET_ID');
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) missing.push('GOOGLE_SERVICE_ACCOUNT_EMAIL');
  if (!process.env.GOOGLE_PRIVATE_KEY) missing.push('GOOGLE_PRIVATE_KEY');

  return missing;
}

module.exports = { config, validateConfig };
