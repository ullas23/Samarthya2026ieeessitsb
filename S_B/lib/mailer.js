// lib/mailer.js — Confirmation Email
const nodemailer = require('nodemailer');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'ieeesamarthya@gmail.com';

function getTransport() {
    const u = process.env.MAIL_USER, p = process.env.MAIL_PASS;
    if(!u||!p) return null;
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT||'587'),
        secure: false,
        auth: { user:u, pass:p }
    });
}

async function sendConfirmation(d) {
    const tp = getTransport();
    if(!tp) return { sent:false, reason:'SMTP not configured' };

    const members = d.members||[];
    const lead = members[0]||{};

    const memberRows = members.map((m,i) => {
        const role = i===0?'Team Lead':`Member ${i+1}`;
        return `<tr>
            <td style="padding:6px 12px;border-bottom:1px solid #1a2a40;color:#c8a84b;font-size:13px;">${role}</td>
            <td style="padding:6px 12px;border-bottom:1px solid #1a2a40;color:#e8f4f8;font-size:13px;">${m.name}</td>
            <td style="padding:6px 12px;border-bottom:1px solid #1a2a40;color:#b0c4d4;font-size:13px;">${m.email}</td>
            <td style="padding:6px 12px;border-bottom:1px solid #1a2a40;color:#b0c4d4;font-size:13px;">${m.phone}</td>
        </tr>`;
    }).join('');

    const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#020408;font-family:'Segoe UI',sans-serif;">
    <div style="max-width:620px;margin:0 auto;background:linear-gradient(180deg,#050d1a,#020408);border:1px solid rgba(200,168,75,0.25);">
        <div style="text-align:center;padding:36px 20px 18px;border-bottom:1px solid rgba(200,168,75,0.15);">
            <div style="font-size:10px;letter-spacing:4px;color:#00d4ff;text-transform:uppercase;margin-bottom:8px;">ᚠᚢᚦᚨᚱᚲ · Registration Submitted · ᚠᚢᚦᚨᚱᚲ</div>
            <div style="font-size:26px;font-weight:700;color:#c8a84b;letter-spacing:3px;">SAMARTHYA 2026</div>
            <div style="font-size:10px;letter-spacing:3px;color:rgba(232,244,248,0.45);margin-top:4px;">IEEE SSIT STUDENT BRANCH</div>
        </div>
        <div style="padding:28px 22px;">
            <div style="font-size:14px;color:rgba(232,244,248,0.7);line-height:1.7;margin-bottom:18px;">
                Hail, <strong style="color:#e8f4f8;">${lead.name||'Warrior'}</strong>!<br><br>
                Your registration for <strong style="color:#c8a84b;">${d.eventName}</strong> has been submitted successfully.
            </div>
            <div style="background:rgba(10,22,40,0.8);border:1px solid rgba(200,168,75,0.2);padding:18px;margin-bottom:18px;">
                <div style="font-size:11px;letter-spacing:2px;color:#c8a84b;text-transform:uppercase;margin-bottom:12px;">Registration Details</div>
                <table style="width:100%;">
                    <tr><td style="padding:4px 0;color:rgba(232,244,248,0.45);font-size:12px;width:130px;">REGISTRATION ID</td><td style="padding:4px 0;color:#c8a84b;font-size:14px;font-weight:700;">${d.regId}</td></tr>
                    <tr><td style="padding:4px 0;color:rgba(232,244,248,0.45);font-size:12px;">EVENT</td><td style="padding:4px 0;color:#e8f4f8;font-size:14px;">${d.eventName} <span style="color:#00d4ff;font-size:12px;">[ ${d.commonName} ]</span></td></tr>
                    <tr><td style="padding:4px 0;color:rgba(232,244,248,0.45);font-size:12px;">ARENA</td><td style="padding:4px 0;color:#e8f4f8;">${d.arenaName}</td></tr>
                    <tr><td style="padding:4px 0;color:rgba(232,244,248,0.45);font-size:12px;">DATE</td><td style="padding:4px 0;color:#e8f4f8;">${d.eventDate}</td></tr>
                    <tr><td style="padding:4px 0;color:rgba(232,244,248,0.45);font-size:12px;">TEAM SIZE</td><td style="padding:4px 0;color:#e8f4f8;">${members.length} member${members.length>1?'s':''}</td></tr>
                    <tr><td style="padding:4px 0;color:rgba(232,244,248,0.45);font-size:12px;">STATUS</td><td style="padding:4px 0;color:#ffd700;font-weight:600;">PENDING PAYMENT VERIFICATION</td></tr>
                </table>
            </div>
            <div style="background:rgba(10,22,40,0.5);border:1px solid rgba(200,168,75,0.12);padding:14px;margin-bottom:18px;">
                <div style="font-size:11px;letter-spacing:2px;color:#c8a84b;text-transform:uppercase;margin-bottom:10px;">Team Members</div>
                <table style="width:100%;border-collapse:collapse;">
                    <thead><tr style="background:rgba(200,168,75,0.06);">
                        <th style="padding:6px 12px;text-align:left;color:#c8a84b;font-size:10px;">ROLE</th>
                        <th style="padding:6px 12px;text-align:left;color:#c8a84b;font-size:10px;">NAME</th>
                        <th style="padding:6px 12px;text-align:left;color:#c8a84b;font-size:10px;">EMAIL</th>
                        <th style="padding:6px 12px;text-align:left;color:#c8a84b;font-size:10px;">PHONE</th>
                    </tr></thead>
                    <tbody>${memberRows}</tbody>
                </table>
            </div>
            <div style="background:rgba(200,168,75,0.04);border-left:3px solid #c8a84b;padding:14px 16px;margin-bottom:18px;">
                <div style="font-size:11px;letter-spacing:2px;color:#c8a84b;text-transform:uppercase;margin-bottom:8px;">Important</div>
                <ul style="margin:0;padding:0 0 0 16px;font-size:13px;color:rgba(232,244,248,0.65);line-height:1.8;">
                    <li>Your registration details, payment screenshot, and UTR have been recorded.</li>
                    <li>Please save your Registration ID: <strong style="color:#c8a84b;">${d.regId}</strong></li>
                    <li>Have to be on campus at least 30 minutes prior to the event start time (9 AM).</li>
                </ul>
            </div>
            <div style="text-align:center;font-size:12px;color:rgba(232,244,248,0.3);line-height:1.5;">
                <div style="width:40px;height:1px;background:linear-gradient(90deg,transparent,#c8a84b,transparent);margin:20px auto;"></div>
                SSIT, Tumakuru · 22–23 April 2026<br>© 2026 IEEE SSIT Student Branch
            </div>
        </div>
    </div></body></html>`;

    const ccList = [...new Set(members.slice(1).map(m=>m.email).filter(e=>e&&e!==lead.email))];

    try {
        await tp.sendMail({
            from: `"Samarthya 2026" <${process.env.MAIL_USER}>`,
            to: lead.email,
            cc: ccList.length ? ccList.join(',') : undefined,
            bcc: ADMIN_EMAIL,
            subject: 'Samarthya 2026 Registration Submitted Successfully',
            html
        });
        return { sent:true };
    } catch(e) {
        console.error('[Mail]',e.message);
        return { sent:false, reason:e.message };
    }
}

module.exports = { sendConfirmation };
