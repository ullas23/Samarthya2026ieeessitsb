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
    // The private key stored in Vercel has literal "\n" strings.
    // We replace them with real newline characters so the JWT library can parse it.
    // Without this, Google auth fails with "Invalid PEM formatted message".
    privateKey: process.env.GOOGLE_PRIVATE_KEY
      ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : '',
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
