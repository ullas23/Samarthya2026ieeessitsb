// lib/drive.js — Google Drive Screenshot Upload
const { getDrive } = require('./google-auth');
const { Readable } = require('stream');

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '14a-YUmcbh84CSHMRxyX6LylhcA59zlDH';

async function uploadScreenshot(buffer, filename, mime, regId) {
    const drv = getDrive();
    if(!drv) return { ok:true, link:'DRIVE_NOT_CONFIGURED', skipped:true };

    const stream = new Readable();
    stream.push(buffer); stream.push(null);
    const ext = filename.split('.').pop()||'png';

    const resp = await drv.files.create({
        requestBody: { name: `${regId}_payment.${ext}`, parents: [FOLDER_ID] },
        media: { mimeType: mime, body: stream },
        fields: 'id,webViewLink'
    });

    const fileId = resp.data.id;

    // Make viewable by anyone
    try {
        await drv.permissions.create({ fileId, requestBody: { role:'reader', type:'anyone' } });
    } catch(e) { console.warn('[Drive] perms:', e.message); }

    const meta = await drv.files.get({ fileId, fields:'webViewLink' });
    return { ok:true, link: meta.data.webViewLink || `https://drive.google.com/file/d/${fileId}/view` };
}

module.exports = { uploadScreenshot };
