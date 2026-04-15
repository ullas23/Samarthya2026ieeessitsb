// lib/validation.js — Field Validation

function vName(v) {
    if (!v||typeof v!=='string') return 'Name is required.';
    const t=v.trim();
    if (t.length<2) return 'Name must be at least 2 characters.';
    if (/\d/.test(t)) return 'Name must not contain numbers.';
    if (/[^a-zA-Z\s.\-']/.test(t)) return 'Name must not contain special characters.';
    return null;
}
function vPhone(v) {
    const c=(v||'').trim().replace(/[\s\-]/g,'');
    if (!/^\d{10}$/.test(c)) return 'Phone must be exactly 10 digits.';
    return null;
}
function vEmail(v) {
    if (!v||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return 'Invalid email.';
    return null;
}
function vUSN(v) {
    if (!v||v.trim().length<2) return 'USN is required.';
    return null;
}
function vCollege(v) {
    if (!v||v.trim().length<2) return 'College name is required.';
    return null;
}
function vCity(v) {
    if (!v||v.trim().length<2) return 'City is required.';
    return null;
}
function vUTR(v) {
    if (!v||!/^\d{12}$/.test(v.trim())) return 'UTR must be exactly 12 digits.';
    return null;
}
function vFile(f) {
    if (!f) return 'Payment screenshot is required.';
    if (!['image/jpeg','image/jpg','image/png'].includes(f.mime)) return 'Screenshot must be JPG or PNG.';
    if (f.buffer.length > 5*1024*1024) return 'Screenshot must be under 5 MB.';
    if (f.buffer.length===0) return 'Screenshot file is empty.';
    return null;
}

function validateMember(m, label) {
    const errs=[], c={};
    let e;
    e=vName(m.name);  if(e) errs.push(`${label}: ${e}`); else c.name=m.name.trim();
    e=vPhone(m.phone); if(e) errs.push(`${label}: ${e}`); else c.phone=m.phone.trim().replace(/[\s-]/g,'');
    e=vEmail(m.email); if(e) errs.push(`${label}: ${e}`); else c.email=m.email.trim().toLowerCase();
    e=vUSN(m.usn);    if(e) errs.push(`${label}: ${e}`); else c.usn=m.usn.trim().toUpperCase();
    e=vCollege(m.college); if(e) errs.push(`${label}: ${e}`); else c.college=m.college.trim();
    return { ok:errs.length===0, errs, cleaned:c };
}

function checkTeamDupes(members) {
    const errs=[];
    const usnMap=new Map();
    members.forEach((m,i)=>{
        if(!m.usn) return;
        const u=m.usn.toUpperCase();
        if(usnMap.has(u)){
            const p=usnMap.get(u);
            errs.push(`USN already used. ${i===0?'Team Lead':'Member '+(i+1)} shares USN with ${p===0?'Team Lead':'Member '+(p+1)}.`);
        } else usnMap.set(u,i);
    });
    return errs;
}

module.exports = { vName,vPhone,vEmail,vUSN,vCollege,vCity,vUTR,vFile,validateMember,checkTeamDupes };
