// lib/sheets.js — Google Sheets Integration
const { getSheets } = require('./google-auth');

const SHEET_ID = process.env.GOOGLE_SHEET_ID || '1bEPaQSgztJ0WSmWYxOmcYiaWbCUwLO52PdVdnoA97p4';
const TAB = 'Registrations';

const HEADERS = [
    'Registration ID','Event ID','Event Name','Arena Name','Event Date',
    'Min Team Size','Max Team Size',
    'Team Lead Name','Team Lead Phone','Team Lead Email','Team Lead USN','Team Lead College Name',
    'Member 2 Name','Member 2 Phone','Member 2 Email','Member 2 USN','Member 2 College Name',
    'Member 3 Name','Member 3 Phone','Member 3 Email','Member 3 USN','Member 3 College Name',
    'Member 4 Name','Member 4 Phone','Member 4 Email','Member 4 USN','Member 4 College Name',
    'City','UTR Number','Screenshot Drive Link','Status',
    'Submission Timestamp','Verification Timestamp','Verification Remarks'
];

async function ensureHeaders() {
    const s = getSheets(); if(!s) return;
    try {
        const r = await s.spreadsheets.values.get({ spreadsheetId:SHEET_ID, range:`${TAB}!A1:AH1` });
        if (!r.data.values || r.data.values.length===0 || r.data.values[0].length===0) {
            await s.spreadsheets.values.update({
                spreadsheetId:SHEET_ID, range:`${TAB}!A1:AH1`,
                valueInputOption:'USER_ENTERED', requestBody:{ values:[HEADERS] }
            });
            // Bold headers
            try {
                const meta = await s.spreadsheets.get({ spreadsheetId:SHEET_ID });
                const sh = meta.data.sheets.find(x=>x.properties.title===TAB);
                if(sh) await s.spreadsheets.batchUpdate({ spreadsheetId:SHEET_ID, requestBody:{ requests:[{
                    repeatCell:{ range:{sheetId:sh.properties.sheetId,startRowIndex:0,endRowIndex:1},
                    cell:{userEnteredFormat:{textFormat:{bold:true}}}, fields:'userEnteredFormat.textFormat.bold' }
                }]}});
            } catch(e){ console.warn('[Sheets] bold headers:',e.message); }
        }
    } catch(e){ console.warn('[Sheets] ensureHeaders:',e.message); }
}

async function getNextSeq(eventId) {
    const s = getSheets(); if(!s) return 1;
    try {
        const r = await s.spreadsheets.values.get({ spreadsheetId:SHEET_ID, range:`${TAB}!A:B` });
        let max=0;
        (r.data.values||[]).forEach(row => {
            if(row[1]===eventId) {
                const m=(row[0]||'').match(/-(\d{4})$/);
                if(m) { const n=parseInt(m[1]); if(n>max) max=n; }
            }
        });
        return max+1;
    } catch{ return 1; }
}

async function appendRow(d) {
    const s = getSheets();
    if(!s) return { ok:true, skipped:true };
    await ensureHeaders();
    const g = i => d.members[i]||{};
    const row = [
        d.regId, d.eventId, d.eventName, d.arenaName, d.eventDate,
        String(d.minMembers), String(d.maxMembers),
        g(0).name||'', g(0).phone||'', g(0).email||'', g(0).usn||'', g(0).college||'',
        g(1).name||'', g(1).phone||'', g(1).email||'', g(1).usn||'', g(1).college||'',
        g(2).name||'', g(2).phone||'', g(2).email||'', g(2).usn||'', g(2).college||'',
        g(3).name||'', g(3).phone||'', g(3).email||'', g(3).usn||'', g(3).college||'',
        d.city||'', d.utr||'', d.screenshotLink||'',
        'PENDING_PAYMENT_VERIFICATION', d.timestamp, '', ''
    ];
    await s.spreadsheets.values.append({
        spreadsheetId:SHEET_ID, range:`${TAB}!A:AH`,
        valueInputOption:'USER_ENTERED', insertDataOption:'INSERT_ROWS',
        requestBody:{ values:[row] }
    });
    return { ok:true };
}

async function isDupeNameUSN(eventId, name, usn) {
    const s = getSheets(); if(!s) return false;
    try {
        const r = await s.spreadsheets.values.get({ spreadsheetId:SHEET_ID, range:`${TAB}!B:AB` });
        const nu=name.toUpperCase(), uu=usn.toUpperCase();
        for(const row of (r.data.values||[])) {
            if(row[0]!==eventId) continue;
            const slots=[{n:6,u:9},{n:11,u:14},{n:16,u:19},{n:21,u:24}];
            for(const sl of slots) {
                if((row[sl.n]||'').toUpperCase()===nu && (row[sl.u]||'').toUpperCase()===uu) return true;
            }
        }
    } catch{}
    return false;
}

async function isDupeUTR(utr) {
    const s = getSheets(); if(!s) return false;
    try {
        const r = await s.spreadsheets.values.get({ spreadsheetId:SHEET_ID, range:`${TAB}!AC:AC` });
        return (r.data.values||[]).some(row=>row[0]===utr);
    } catch{ return false; }
}

async function getRegisteredEventsForMembers(members) {
    const s = getSheets(); if(!s) return [];
    try {
        const r = await s.spreadsheets.values.get({ spreadsheetId:SHEET_ID, range:`${TAB}!B:AB` });
        const keys = members.map(m=>`${(m.name||'').toUpperCase()}|${(m.usn||'').toUpperCase()}`);
        const found = new Set();
        for(const row of (r.data.values||[])) {
            const eid=row[0]; if(!eid) continue;
            const slots=[{n:6,u:9},{n:11,u:14},{n:16,u:19},{n:21,u:24}];
            for(const sl of slots) {
                const k=`${(row[sl.n]||'').toUpperCase()}|${(row[sl.u]||'').toUpperCase()}`;
                if(k!=='|' && keys.includes(k)) found.add(eid);
            }
        }
        return [...found];
    } catch{ return []; }
}

module.exports = { ensureHeaders, getNextSeq, appendRow, isDupeNameUSN, isDupeUTR, getRegisteredEventsForMembers };
