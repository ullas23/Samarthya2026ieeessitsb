/**
 * /api/debug-key.js
 * ------------------
 * TEMPORARY diagnostic endpoint to debug GOOGLE_PRIVATE_KEY format.
 * Shows key metadata without exposing the actual key content.
 * DELETE THIS FILE after debugging is complete.
 */

const crypto = require('crypto');
const { parsePrivateKey } = require('../backend/config');

module.exports = (req, res) => {
  const raw = process.env.GOOGLE_PRIVATE_KEY || '';
  const normalized = parsePrivateKey(raw);
  let cryptoCheck;

  try {
    const keyObject = crypto.createPrivateKey(normalized);
    cryptoCheck = {
      ok: true,
      asymmetricKeyType: keyObject.asymmetricKeyType || '(unknown)',
    };
  } catch (err) {
    cryptoCheck = {
      ok: false,
      code: err.code || null,
      message: err.message,
    };
  }

  const info = {
    raw: {
      keyLength: raw.length,
      startsWithDash: raw.startsWith('-----'),
      startsWithQuote: raw.startsWith('"'),
      startsWithBrace: raw.trim().startsWith('{'),
      hasLiteralBackslashN: raw.includes('\\n'),
      hasRealNewlines: raw.includes('\n'),
      containsBeginMarker: raw.includes('BEGIN PRIVATE KEY'),
      containsEndMarker: raw.includes('END PRIVATE KEY'),
      newlineCount: (raw.match(/\n/g) || []).length,
      literalBackslashNCount: (raw.match(/\\n/g) || []).length,
      first30: raw.substring(0, 30).replace(/[A-Za-z0-9+/=]/g, 'X'),
      last30: raw.substring(Math.max(0, raw.length - 30)).replace(/[A-Za-z0-9+/=]/g, 'X'),
    },
    normalized: {
      keyLength: normalized.length,
      hasRealNewlines: normalized.includes('\n'),
      containsBeginMarker: normalized.includes('BEGIN PRIVATE KEY'),
      containsEndMarker: normalized.includes('END PRIVATE KEY'),
      newlineCount: (normalized.match(/\n/g) || []).length,
      first30: normalized.substring(0, 30).replace(/[A-Za-z0-9+/=]/g, 'X'),
      last30: normalized.substring(Math.max(0, normalized.length - 30)).replace(/[A-Za-z0-9+/=]/g, 'X'),
    },
    cryptoCheck,
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '(not set)',
    spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID ? '(set)' : '(not set)',
  };

  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(info);
};
