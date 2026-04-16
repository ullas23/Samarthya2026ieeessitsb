/**
 * config.js
 * ---------
 * Reads and validates environment variables.
 * Exports a single config object used by other backend modules.
 */

const config = {
  // Google Sheets credentials
  googleSheets: {
    spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    // The private key may arrive in many formats from Vercel env vars.
    // We handle ALL known encoding scenarios to prevent PEM parse errors.
    privateKey: (function () {
      let raw = process.env.GOOGLE_PRIVATE_KEY || '';
      if (!raw) return '';

      // 1. If the value is JSON-quoted (starts with "), parse it
      if (raw.startsWith('"')) {
        try { raw = JSON.parse(raw); } catch (e) { /* keep as-is */ }
      }

      // 2. Replace all literal \n (two chars: backslash + n) with real newlines
      raw = raw.replace(/\\n/g, '\n');

      // 3. Replace double-escaped \\n as well
      raw = raw.replace(/\\\\n/g, '\n');

      // 4. Trim whitespace
      raw = raw.trim();

      return raw;
    })(),
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
