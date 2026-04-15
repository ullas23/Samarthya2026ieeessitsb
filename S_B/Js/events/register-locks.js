// =============================================
// Js/events/register-locks.js — Conflict Lock System
// =============================================
// Uses localStorage + conflict map for lock logic.
// Loaded after events data is available on page.
// =============================================

const SAM_STORAGE = 'samarthya26_registered';
const SAM_EXCEPTIONS = ['helheim','mimir','folkvangr'];

function _getRegistered() {
    try { return JSON.parse(localStorage.getItem(SAM_STORAGE)||'[]'); } catch{ return []; }
}

function _addRegistered(id) {
    const r = _getRegistered();
    if(!r.includes(id)) { r.push(id); localStorage.setItem(SAM_STORAGE, JSON.stringify(r)); }
}

// Conflict map — computed from events data inline in the page
// This function expects window._samConflictMap to be set by the page
function _getConflictMap() {
    return window._samConflictMap || {};
}

function _getLockedEvents() {
    const reg = _getRegistered(), cm = _getConflictMap(), locked = {};
    for(const rid of reg) {
        if(SAM_EXCEPTIONS.includes(rid)) continue;
        for(const cid of (cm[rid]||[])) {
            if(!reg.includes(cid)) locked[cid] = rid;
        }
    }
    return locked;
}

function samCheckLock(eventId) {
    if(SAM_EXCEPTIONS.includes(eventId)) return { locked:false };
    const l = _getLockedEvents();
    if(l[eventId]) {
        // Find blocker name from events array on page
        const blocker = (window._samEvents||[]).find(e=>e.id===l[eventId]||e.eventId===l[eventId]);
        return { locked:true, by:l[eventId], byName: blocker ? blocker.norse || blocker.norseName : l[eventId] };
    }
    return { locked:false };
}

function samGetConflictNames(eventId) {
    const cm = _getConflictMap();
    return (cm[eventId]||[]).map(id => {
        const ev = (window._samEvents||[]).find(e=>e.id===id||e.eventId===id);
        return ev ? `${ev.norse||ev.norseName} (${ev.common||ev.commonName})` : id;
    });
}

function samHandleRegister(eventId) {
    const evts = window._samEvents||[];
    const ev = evts.find(e=>e.id===eventId||e.eventId===eventId);
    if(!ev) return;
    if(ev.isOfflineOnly) return;

    // Already registered?
    if(_getRegistered().includes(eventId)) {
        _samPopup('Already Registered', `You have already registered for ${ev.norse||ev.norseName}.`, null);
        return;
    }

    // Locked?
    const lk = samCheckLock(eventId);
    if(lk.locked) {
        _samPopup('Event Locked', `Event locked. Running parallel to ${lk.byName}, which you have registered for.`, null);
        return;
    }

    // Has conflicts?
    const cnames = samGetConflictNames(eventId);
    if(cnames.length > 0 && !SAM_EXCEPTIONS.includes(eventId)) {
        _samPopup('Caution!',
            `This event, ${ev.norse||ev.norseName}, runs parallel with ${cnames.join(', ')}. If you register for this event, those event registrations will be locked.`,
            () => { window.location.href = `register.html?event=${eventId}`; }
        );
        return;
    }

    // No conflicts
    window.location.href = `register.html?event=${eventId}`;
}

function _samPopup(title, msg, onProceed) {
    let o = document.getElementById('sam-conflict-overlay');
    if(o) o.remove();
    o = document.createElement('div');
    o.id = 'sam-conflict-overlay';
    o.style.cssText = 'position:fixed;inset:0;background:rgba(2,4,8,0.95);z-index:10000;display:flex;align-items:center;justify-content:center;padding:1rem;backdrop-filter:blur(10px);';
    const b = document.createElement('div');
    b.style.cssText = 'max-width:440px;width:100%;background:linear-gradient(135deg,rgba(10,22,40,0.98),rgba(5,13,26,0.99));border:1px solid rgba(200,168,75,0.35);border-radius:12px;padding:clamp(1.5rem,4vw,2.5rem);text-align:center;';
    let btns = '';
    if(onProceed) btns += `<button id="sam-popup-proceed" style="padding:0.7rem 2rem;background:linear-gradient(135deg,#c8a84b,#8b6a1a);color:#020408;font-family:'Cinzel',serif;font-size:0.8rem;letter-spacing:0.15em;text-transform:uppercase;border:none;cursor:pointer;margin-right:0.5rem;">Proceed</button>`;
    btns += `<button id="sam-popup-cancel" style="padding:0.7rem 2rem;background:transparent;color:#e8f4f8;font-family:'Cinzel',serif;font-size:0.8rem;letter-spacing:0.15em;text-transform:uppercase;border:1px solid rgba(232,244,248,0.3);cursor:pointer;">${onProceed?'Cancel':'Close'}</button>`;
    b.innerHTML = `<div style="font-family:'Cinzel Decorative',serif;font-size:clamp(1.1rem,3vw,1.4rem);color:#c8a84b;margin-bottom:1rem;">${title}</div>
        <div style="font-family:'Rajdhani',sans-serif;font-size:clamp(0.85rem,2.5vw,1rem);color:rgba(232,244,248,0.75);line-height:1.7;margin-bottom:1.5rem;">${msg}</div>
        <div style="display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap;">${btns}</div>`;
    o.appendChild(b);
    document.body.appendChild(o);
    document.getElementById('sam-popup-cancel').onclick = () => o.remove();
    if(onProceed) document.getElementById('sam-popup-proceed').onclick = () => { o.remove(); onProceed(); };
    o.addEventListener('click', e => { if(e.target===o) o.remove(); });
}
