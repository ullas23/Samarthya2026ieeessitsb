// Js/register/register-ui.js — Registration Page UI Helpers

function showFieldError(id, msg) {
    const f = document.getElementById(id); if(!f) return;
    f.classList.add('reg-field-error');
    let e = f.parentElement.querySelector('.reg-error-msg');
    if(!e) { e = document.createElement('div'); e.className='reg-error-msg'; f.parentElement.appendChild(e); }
    e.textContent = msg; e.style.display = 'block';
}
function clearFieldError(id) {
    const f = document.getElementById(id); if(!f) return;
    f.classList.remove('reg-field-error');
    const e = f.parentElement.querySelector('.reg-error-msg');
    if(e) e.style.display = 'none';
}
function clearAllErrors() {
    document.querySelectorAll('.reg-field-error').forEach(e=>e.classList.remove('reg-field-error'));
    document.querySelectorAll('.reg-error-msg').forEach(e=>e.style.display='none');
}
function showFormError(msg) {
    const b = document.getElementById('form-error-banner');
    if(b) { b.textContent=msg; b.style.display='block'; b.scrollIntoView({behavior:'smooth',block:'center'}); }
}
function hideFormError() {
    const b = document.getElementById('form-error-banner');
    if(b) b.style.display='none';
}
function setLoading(on) {
    const btn = document.getElementById('reg-submit-btn');
    const sp = document.getElementById('reg-submit-spinner');
    const tx = document.getElementById('reg-submit-text');
    if(btn) btn.disabled = on;
    if(sp) sp.style.display = on ? 'inline-block' : 'none';
    if(tx) tx.textContent = on ? 'Submitting…' : 'Submit Registration';
}
function showSuccess(d) {
    const fs = document.getElementById('reg-form-section');
    const ss = document.getElementById('reg-success-section');
    if(fs) fs.style.display='none';
    if(!ss) return;
    ss.innerHTML = `<div class="reg-success-card">
        <div class="reg-success-rune">ᚠ</div>
        <h2 class="reg-success-title">Registration Submitted Successfully</h2>
        <p class="reg-success-msg">Check email for submission success mail.</p>
        <div class="reg-success-details">
            <div class="reg-success-row"><span class="reg-success-label">Registration ID</span><span class="reg-success-value reg-success-id">${d.registrationId}</span></div>
            <div class="reg-success-row"><span class="reg-success-label">Event</span><span class="reg-success-value">${d.eventName} [ ${d.eventCommon} ]</span></div>
            <div class="reg-success-row"><span class="reg-success-label">Arena</span><span class="reg-success-value">${d.arenaName}</span></div>
            <div class="reg-success-row"><span class="reg-success-label">Date</span><span class="reg-success-value">${d.eventDate}</span></div>
            <div class="reg-success-row"><span class="reg-success-label">Team Size</span><span class="reg-success-value">${d.memberCount} member${d.memberCount>1?'s':''}</span></div>
            <div class="reg-success-row"><span class="reg-success-label">Status</span><span class="reg-success-value reg-status-pending">Pending Payment Verification</span></div>
        </div>
        <p class="reg-success-note">Check email for payment verification mail.</p>
        <p class="reg-success-note">Save a screenshot of this page / registration ID for reference.</p>
        <div class="reg-success-actions">
            <a href="index.html#events" class="btn-rune btn-rune-primary" style="text-decoration:none;">Back to Events</a>
            <a href="index.html" class="btn-rune btn-rune-outline" style="text-decoration:none;">Home</a>
        </div>
    </div>`;
    ss.style.display='block';
    ss.scrollIntoView({behavior:'smooth',block:'start'});
}
function showErrorPopup(title, msg) {
    let o = document.getElementById('reg-error-overlay');
    if(o) o.remove();
    o = document.createElement('div');
    o.id = 'reg-error-overlay';
    o.style.cssText='position:fixed;inset:0;background:rgba(2,4,8,0.95);z-index:10000;display:flex;align-items:center;justify-content:center;padding:1rem;backdrop-filter:blur(10px);';
    const b = document.createElement('div');
    b.style.cssText='max-width:420px;width:100%;background:linear-gradient(135deg,rgba(10,22,40,0.98),rgba(5,13,26,0.99));border:1px solid rgba(200,80,80,0.4);border-radius:12px;padding:clamp(1.5rem,4vw,2.5rem);text-align:center;';
    b.innerHTML=`<div style="font-family:'Cinzel Decorative',serif;font-size:clamp(1.1rem,3vw,1.4rem);color:#ff6b6b;margin-bottom:1rem;">${title}</div>
        <div style="font-family:'Rajdhani',sans-serif;font-size:clamp(0.85rem,2.5vw,1rem);color:rgba(232,244,248,0.75);line-height:1.7;margin-bottom:1.5rem;">${msg}</div>
        <button onclick="this.closest('#reg-error-overlay').remove();" style="padding:0.7rem 2rem;background:transparent;color:#e8f4f8;font-family:'Cinzel',serif;font-size:0.8rem;letter-spacing:0.15em;text-transform:uppercase;border:1px solid rgba(232,244,248,0.3);cursor:pointer;">Close</button>`;
    o.appendChild(b); document.body.appendChild(o);
    o.addEventListener('click',e=>{if(e.target===o) o.remove();});
}
