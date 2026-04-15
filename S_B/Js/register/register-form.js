// Js/register/register-form.js — Client-Side Validation + FormData Builder

function _vN(v){if(!v||v.trim().length<2) return 'Name must be at least 2 characters.'; if(/\d/.test(v)) return 'Name must not contain numbers.'; if(/[^a-zA-Z\s.\-']/.test(v.trim())) return 'Name must not contain special characters.'; return null;}
function _vP(v){if(!/^\d{10}$/.test((v||'').trim().replace(/[\s-]/g,''))) return 'Phone must be exactly 10 digits.'; return null;}
function _vE(v){if(!v||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return 'Invalid email.'; return null;}
function _vU(v){if(!v||v.trim().length<2) return 'USN is required.'; return null;}
function _vC(v){if(!v||v.trim().length<2) return 'College name is required.'; return null;}
function _vCi(v){if(!v||v.trim().length<2) return 'City is required.'; return null;}
function _vUT(v){if(!/^\d{12}$/.test((v||'').trim())) return 'UTR must be exactly 12 digits.'; return null;}
function _vSS(fi){
    if(!fi||!fi.files||fi.files.length===0) return 'Payment screenshot is required.';
    const f=fi.files[0];
    if(!['image/jpeg','image/jpg','image/png'].includes(f.type)) return 'Screenshot must be JPG or PNG.';
    if(f.size>5*1024*1024) return 'Screenshot must be under 5 MB.';
    return null;
}

function validateRegForm(cnt) {
    clearAllErrors(); hideFormError();
    const errs=[];
    for(let i=0;i<cnt;i++){
        const p=`member${i}`, lb=i===0?'Team Lead':`Member ${i+1}`;
        const checks=[
            ['name',_vN],['phone',_vP],['email',_vE],['usn',_vU],['college',_vC]
        ];
        checks.forEach(([key,fn])=>{
            const e=fn(document.getElementById(`${p}_${key}`)?.value);
            if(e){showFieldError(`${p}_${key}`,e);errs.push(`${lb}: ${e}`);}
        });
    }
    let e;
    e=_vCi(document.getElementById('reg_city')?.value); if(e){showFieldError('reg_city',e);errs.push(e);}
    e=_vUT(document.getElementById('reg_utr')?.value); if(e){showFieldError('reg_utr',e);errs.push(e);}
    e=_vSS(document.getElementById('reg_screenshot')); if(e){showFieldError('reg_screenshot',e);errs.push(e);}

    // Intra-team USN dupe
    if(cnt>1 && errs.length===0){
        const usnMap=new Map();
        for(let i=0;i<cnt;i++){
            const u=(document.getElementById(`member${i}_usn`)?.value||'').trim().toUpperCase();
            if(usnMap.has(u)){
                const p=usnMap.get(u);
                errs.push(`USN already used. ${i===0?'Team Lead':'Member '+(i+1)} shares USN with ${p===0?'Team Lead':'Member '+(p+1)}.`);
                showFieldError(`member${i}_usn`,'USN already used.');
            } else usnMap.set(u,i);
        }
    }
    if(errs.length) showFormError(errs[0]);
    return { ok:errs.length===0, errs };
}

function buildFormData(eventId, cnt) {
    const fd = new FormData();
    fd.append('eventId', eventId);
    fd.append('memberCount', String(cnt));
    for(let i=0;i<cnt;i++){
        ['name','phone','email','usn','college'].forEach(k=>{
            let v = document.getElementById(`member${i}_${k}`)?.value||'';
            if(k==='email') v=v.trim().toLowerCase();
            else if(k==='usn') v=v.trim().toUpperCase();
            else if(k==='phone') v=v.trim().replace(/[\s-]/g,'');
            else v=v.trim();
            fd.append(`members[${i}][${k}]`, v);
        });
    }
    fd.append('city', document.getElementById('reg_city')?.value?.trim()||'');
    fd.append('utr', document.getElementById('reg_utr')?.value?.trim()||'');
    const fi = document.getElementById('reg_screenshot');
    if(fi?.files?.[0]) fd.append('screenshot', fi.files[0]);
    return fd;
}
