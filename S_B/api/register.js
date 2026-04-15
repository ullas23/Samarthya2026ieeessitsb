// api/register.js — Full Registration Pipeline
const { getEvent } = require('../lib/events');
const { validateMember, vCity, vUTR, vFile, checkTeamDupes } = require('../lib/validation');
const { checkViolation } = require('../lib/conflicts');
const { getNextSeq, appendRow, isDupeNameUSN, isDupeUTR, getRegisteredEventsForMembers } = require('../lib/sheets');
const { uploadScreenshot } = require('../lib/drive');
const { sendConfirmation } = require('../lib/mailer');
const { genRegId, istNow, json, cors, parseForm } = require('../lib/utils');

module.exports = async function handler(req, res) {
    if (cors(req, res)) return;
    if (req.method !== 'POST') return json(res, 405, { success:false, error:'Method not allowed' });

    try {
        // 1. Parse multipart
        const { fields, file } = await parseForm(req);
        const eventId = fields.eventId;

        // 2. Validate event
        const ev = getEvent(eventId);
        if (!ev) return json(res, 400, { success:false, error:'Invalid event.' });
        if (ev.isOfflineOnly) return json(res, 400, { success:false, error:'This event accepts offline registrations on spot only.' });

        // 3. Parse + validate members
        const count = parseInt(fields.memberCount) || 1;
        if (count < ev.minMembers || count > ev.maxMembers) {
            return json(res, 400, { success:false, error:`Team size must be ${ev.minMembers}–${ev.maxMembers}.` });
        }

        const raw = fields.members || [];
        const allErrs = [];
        const cleaned = [];
        for (let i = 0; i < count; i++) {
            const m = raw[i] || {};
            const label = i === 0 ? 'Team Lead' : `Member ${i+1}`;
            const r = validateMember(m, label);
            if (!r.ok) allErrs.push(...r.errs);
            else cleaned.push(r.cleaned);
        }

        // 4. City
        const cityErr = vCity(fields.city);
        if (cityErr) allErrs.push(cityErr);

        // 5. UTR
        const utrErr = vUTR(fields.utr);
        if (utrErr) allErrs.push(utrErr);

        // 6. Screenshot
        const fileErr = vFile(file);
        if (fileErr) allErrs.push(fileErr);

        if (allErrs.length > 0) return json(res, 400, { success:false, errors:allErrs });

        // 7. Intra-team duplicates
        const teamDupes = checkTeamDupes(cleaned);
        if (teamDupes.length > 0) return json(res, 400, { success:false, errors:teamDupes });

        // 8. Same-event duplicate (Name+USN in Sheets)
        for (const m of cleaned) {
            if (await isDupeNameUSN(eventId, m.name, m.usn)) {
                return json(res, 409, { success:false, error:`Already Registered! ${m.name} (${m.usn}) is already registered for this event.` });
            }
        }

        // 9. Parallel conflict check
        const regEvents = await getRegisteredEventsForMembers(cleaned);
        const cv = checkViolation(eventId, regEvents);
        if (cv.blocked) {
            const names = cv.by.map(id => {
                const e = getEvent(id);
                return e ? `${e.norseName} (${e.commonName})` : id;
            });
            return json(res, 409, { success:false, error:`Event locked. A team member is registered for parallel event: ${names.join(', ')}.` });
        }

        // 10. UTR uniqueness
        if (await isDupeUTR(fields.utr.trim())) {
            return json(res, 409, { success:false, error:'Invalid UTR. This UTR number has already been used.' });
        }

        // 11. Upload screenshot to Drive
        let screenshotLink = '';
        try {
            const up = await uploadScreenshot(file.buffer, file.filename, file.mime, `${ev.key}_${Date.now()}`);
            screenshotLink = up.link || '';
        } catch (e) {
            console.error('[Drive]', e.message);
            screenshotLink = 'UPLOAD_FAILED';
        }

        // 12. Generate Registration ID
        const seq = await getNextSeq(eventId);
        const regId = genRegId(ev.key, seq);

        // 13. Append to Sheets
        const ts = istNow();
        await appendRow({
            regId, eventId, eventName:ev.norseName, arenaName:ev.arenaName,
            eventDate:ev.eventDate, minMembers:ev.minMembers, maxMembers:ev.maxMembers,
            members:cleaned, city:fields.city.trim(), utr:fields.utr.trim(),
            screenshotLink, timestamp:ts
        });

        // 14. Send confirmation email
        let emailResult = { sent:false };
        try {
            emailResult = await sendConfirmation({
                regId, eventName:ev.norseName, commonName:ev.commonName,
                arenaName:ev.arenaName, eventDate:ev.eventDate, members:cleaned
            });
        } catch (e) { console.error('[Mail]', e.message); }

        // 15. Success
        return json(res, 200, {
            success:true, registrationId:regId,
            eventName:ev.norseName, eventCommon:ev.commonName,
            arenaName:ev.arenaName, eventDate:ev.eventDate,
            memberCount:cleaned.length, emailSent:emailResult.sent,
            message:'Registration submitted successfully.'
        });
    } catch (e) {
        console.error('[Register]', e);
        return json(res, 500, { success:false, error:'An unexpected error occurred. Please try again.' });
    }
};

module.exports.config = { api: { bodyParser: false } };
