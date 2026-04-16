/**
 * config.js
 * ---------
 * Reads and validates environment variables.
 * Exports a single config object used by other backend modules.
 */

function parsePrivateKey(raw) {
  if (!raw) return '';

  raw = String(raw).trim();

  // Accept the whole service-account JSON if it was pasted accidentally.
  if (raw.startsWith('{')) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.private_key === 'string') {
        raw = parsed.private_key;
      }
    } catch (e) {}
  }

  // Accept a JSON-quoted PEM string.
  if (raw.startsWith('"') && raw.endsWith('"')) {
    try {
      raw = JSON.parse(raw);
    } catch (e) {
      raw = raw.slice(1, -1);
    }
  }

  raw = String(raw)
    .replace(/\\r\\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();

  // Keep PEM markers isolated even if whitespace was flattened.
  raw = raw
    .replace(/-----BEGIN PRIVATE KEY-----\s*/g, '-----BEGIN PRIVATE KEY-----\n')
    .replace(/\s*-----END PRIVATE KEY-----/g, '\n-----END PRIVATE KEY-----');

  return `${raw.trim()}\n`;
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

module.exports = { config, validateConfig, parsePrivateKey };
