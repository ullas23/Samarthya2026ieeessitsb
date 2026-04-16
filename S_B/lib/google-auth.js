// =============================================
// lib/google-auth.js — Centralized Google Auth
// =============================================
// ENV VARS:
//   GOOGLE_SERVICE_ACCOUNT_EMAIL — service account email
//   GOOGLE_PRIVATE_KEY    — service account private key (keep \n)
// =============================================
const { google } = require('googleapis');

let _auth = null;

function getAuth() {
    if (_auth) return _auth;
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const key = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
    if (!email || !key) return null;
    _auth = new google.auth.JWT(email, null, key, [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file'
    ]);
    return _auth;
}

function getSheets() {
    const auth = getAuth();
    if (!auth) return null;
    return google.sheets({ version: 'v4', auth });
}

function getDrive() {
    const auth = getAuth();
    if (!auth) return null;
    return google.drive({ version: 'v3', auth });
}

module.exports = { getAuth, getSheets, getDrive };
