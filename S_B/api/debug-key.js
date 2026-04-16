/**
 * /api/debug-key.js
 * ------------------
 * TEMPORARY diagnostic endpoint to debug GOOGLE_PRIVATE_KEY format.
 * Shows key metadata without exposing the actual key content.
 * DELETE THIS FILE after debugging is complete.
 */

module.exports = (req, res) => {
  const raw = process.env.GOOGLE_PRIVATE_KEY || '';

  const info = {
    keyLength: raw.length,
    startsWithDash: raw.startsWith('-----'),
    startsWithQuote: raw.startsWith('"'),
    hasLiteralBackslashN: raw.includes('\\n'),
    hasRealNewlines: raw.includes('\n'),
    first30: raw.substring(0, 30).replace(/[A-Za-z0-9+/=]/g, 'X'),
    last30: raw.substring(raw.length - 30).replace(/[A-Za-z0-9+/=]/g, 'X'),
    containsBeginMarker: raw.includes('BEGIN PRIVATE KEY'),
    containsEndMarker: raw.includes('END PRIVATE KEY'),
    newlineCount: (raw.match(/\n/g) || []).length,
    literalBackslashNCount: (raw.match(/\\n/g) || []).length,
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '(not set)',
    spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID ? '(set)' : '(not set)',
  };

  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(info);
};
