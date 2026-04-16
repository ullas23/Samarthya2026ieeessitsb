// Js/register/register-page.js — Registration Page Controller
// Enhanced for Phase 2: backend lock precheck + /api/register integration
(function(){
    'use strict';
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('event');
    const formSec = document.getElementById('reg-form-section');
    const successSec = document.getElementById('reg-success-section');

    if(!eventId){
        formSec.innerHTML='<div style="text-align:center;padding:4rem 1rem;"><div style="font-family:\'Cinzel Decorative\',serif;font-size:1.5rem;color:#c8a84b;margin-bottom:1rem;">No Event Selected</div><p style="color:rgba(232,244,248,0.6);">Please select an event from the <a href="index.html#events" style="color:#00d4ff;">events page</a>.</p></div>';
        return;
    }

    // Fetch event metadata from API
    fetch(`/api/get-event?event=${eventId}`)
        .then(r=>r.json())
        .then(data=>{
            if(!data.success||!data.event) {
                formSec.innerHTML='<div style="text-align:center;padding:4rem 1rem;"><div style="font-family:\'Cinzel Decorative\',serif;font-size:1.5rem;color:#ff6b6b;margin-bottom:1rem;">Event Not Found</div><p style="color:rgba(232,244,248,0.6);"><a href="index.html#events" style="color:#00d4ff;">Browse events</a></p></div>';
                return;
            }
            const ev = data.event;

            if(ev.isOfflineOnly){
                formSec.innerHTML=`<div style="text-align:center;padding:4rem 1rem;"><div style="font-family:'Cinzel Decorative',serif;font-size:1.5rem;color:#c8a84b;margin-bottom:1rem;">${ev.norseName}</div><p style="color:rgba(232,244,248,0.6);font-size:1.1rem;">This event accepts offline registrations on spot only.</p><a href="index.html#events" class="btn-rune btn-rune-primary" style="display:inline-block;margin-top:2rem;text-decoration:none;">Back to Events</a></div>`;
                return;
            }

            // Store conflict map globally for register-locks.js
            window._samConflictMap = data.conflictMap || {};

            // Populate header
            document.getElementById('reg-event-rune').textContent = ev.rune;
            document.getElementById('reg-event-norse').textContent = ev.norseName;
            document.getElementById('reg-event-common').textContent = `[ ${ev.commonName} ]`;
            document.getElementById('reg-event-meta').textContent = `${ev.arenaName} · ${ev.eventDate} · ${ev.startTime} – ${ev.endTime}`;

            const teamNote = ev.minMembers===ev.maxMembers
                ? (ev.minMembers===1 ? 'Solo Event' : `Team of ${ev.minMembers}`)
                : `Team: ${ev.minMembers} – ${ev.maxMembers} members`;
            document.getElementById('reg-team-note').textContent = teamNote;

            // Dynamic member fields
            let currentCount = ev.minMembers;
            const container = document.getElementById('reg-members-container');
            const addBtn = document.getElementById('reg-add-member');
            const rmBtn = document.getElementById('reg-remove-member');
            const countDisp = document.getElementById('reg-member-count');

            function renderMembers(){
                container.innerHTML='';
                for(let i=0;i<currentCount;i++){
                    const lb=i===0?'Team Lead':`Member ${i+1}`;
                    const d=document.createElement('div');
                    d.className='reg-member-block';
                    d.innerHTML=`<div class="reg-member-label">${lb}</div>
                    <div class="reg-field-group"><label class="reg-label" for="member${i}_name">Full Name</label><input type="text" id="member${i}_name" class="reg-input" placeholder="Enter full name" autocomplete="name"></div>
                    <div class="reg-field-group"><label class="reg-label" for="member${i}_phone">Phone Number</label><input type="tel" id="member${i}_phone" class="reg-input" placeholder="10-digit number" maxlength="10" autocomplete="tel"></div>
                    <div class="reg-field-group"><label class="reg-label" for="member${i}_email">Email</label><input type="email" id="member${i}_email" class="reg-input" placeholder="your@email.com" autocomplete="email"></div>
                    <div class="reg-field-group"><label class="reg-label" for="member${i}_usn">USN</label><input type="text" id="member${i}_usn" class="reg-input" placeholder="University Seat Number" autocomplete="off"></div>
                    <div class="reg-field-group"><label class="reg-label" for="member${i}_college">College Name</label><input type="text" id="member${i}_college" class="reg-input" placeholder="College / Institution" autocomplete="organization"></div>`;
                    container.appendChild(d);
                }
                if(countDisp) countDisp.textContent=`${currentCount} member${currentCount>1?'s':''}`;
            }

            function updateBtns(){
                if(addBtn) addBtn.style.display = currentCount<ev.maxMembers ? 'inline-flex' : 'none';
                if(rmBtn) rmBtn.style.display = currentCount>ev.minMembers ? 'inline-flex' : 'none';
            }

            renderMembers();
            updateBtns();
            if(ev.minMembers===ev.maxMembers){ if(addBtn)addBtn.style.display='none'; if(rmBtn)rmBtn.style.display='none'; }

            if(addBtn) addBtn.onclick=()=>{if(currentCount<ev.maxMembers){currentCount++;renderMembers();updateBtns();}};
            if(rmBtn) rmBtn.onclick=()=>{if(currentCount>ev.minMembers){currentCount--;renderMembers();updateBtns();}};

            // Screenshot label
            const ssInput = document.getElementById('reg_screenshot');
            const ssLabel = document.getElementById('reg-screenshot-label');
            if(ssInput&&ssLabel) ssInput.onchange=()=>{ ssLabel.textContent = ssInput.files.length ? ssInput.files[0].name : 'Choose payment screenshot…'; };

            // ── Lock precheck on identity blur ──────────────
            // Once user fills email/USN for team lead (member 0),
            // trigger a backend lock precheck
            let lockChecked = false;
            let lockResult = null;

            async function runLockPrecheck() {
                const emailEl = document.getElementById('member0_email');
                const usnEl = document.getElementById('member0_usn');
                const email = emailEl ? emailEl.value.trim().toLowerCase() : '';
                const usn = usnEl ? usnEl.value.trim().toUpperCase() : '';

                if (!email && !usn) return; // Not enough identity data

                try {
                    const params = new URLSearchParams({ eventId });
                    if (email) params.set('email', email);
                    if (usn) params.set('usn', usn);

                    const resp = await fetch(`/api/lock-status?${params.toString()}`);
                    const result = await resp.json();

                    if (result.success && result.data && result.data.locked) {
                        lockResult = result.data;
                        lockChecked = true;
                        // Show lock popup immediately
                        if (typeof samPopup !== 'undefined') {
                            samPopup.lock({
                                registeredEventName: result.data.registeredEventName,
                                clashGroup: result.data.clashGroup || '',
                            });
                        } else {
                            showErrorPopup('Event Locked',
                                `Event locked. Running parallel to ${result.data.registeredEventName}, which you have registered for.`);
                        }
                    } else {
                        lockResult = null;
                        lockChecked = true;
                    }
                } catch (e) {
                    console.warn('[register-page] Lock precheck failed:', e);
                    lockChecked = false;
                }
            }

            // Attach blur handlers for lock precheck
            setTimeout(() => {
                const emailEl = document.getElementById('member0_email');
                const usnEl = document.getElementById('member0_usn');
                if (emailEl) emailEl.addEventListener('blur', runLockPrecheck);
                if (usnEl) usnEl.addEventListener('blur', runLockPrecheck);
            }, 100);

            // ── Form submit → /api/register ─────────────────
            document.getElementById('reg-form').onsubmit = async (e) => {
                e.preventDefault();

                // Client-side validation
                const v = validateRegForm(currentCount);
                if(!v.ok) return;

                setLoading(true);

                // ── Final lock precheck before submit ───────
                const emailVal = (document.getElementById('member0_email')?.value || '').trim().toLowerCase();
                const usnVal = (document.getElementById('member0_usn')?.value || '').trim().toUpperCase();

                try {
                    const lockParams = new URLSearchParams({ eventId });
                    if (emailVal) lockParams.set('email', emailVal);
                    if (usnVal) lockParams.set('usn', usnVal);

                    const lockResp = await fetch(`/api/lock-status?${lockParams.toString()}`);
                    const lockData = await lockResp.json();

                    if (lockData.success && lockData.data && lockData.data.locked) {
                        setLoading(false);
                        if (typeof samPopup !== 'undefined') {
                            samPopup.lock({
                                registeredEventName: lockData.data.registeredEventName,
                                clashGroup: lockData.data.clashGroup || '',
                            });
                        } else {
                            showErrorPopup('Event Locked',
                                `Event locked. Running parallel to ${lockData.data.registeredEventName}, which you have registered for.`);
                        }
                        return;
                    }
                } catch (lockErr) {
                    console.warn('[register-page] Final lock check failed:', lockErr);
                    // Continue anyway — backend /api/register has authoritative validation
                }

                // ── Build JSON payload for /api/register ────
                // The backend expects JSON with: eventId, participantName, usn,
                // email, phone, college, branch, semester, teamName, teamSize, members[]
                const leadName = (document.getElementById('member0_name')?.value || '').trim();
                const leadPhone = (document.getElementById('member0_phone')?.value || '').trim().replace(/[\s-]/g, '');
                const leadEmail = (document.getElementById('member0_email')?.value || '').trim().toLowerCase();
                const leadUSN = (document.getElementById('member0_usn')?.value || '').trim().toUpperCase();
                const leadCollege = (document.getElementById('member0_college')?.value || '').trim();

                // Build members array (for team events, members beyond the lead)
                const membersArr = [];
                for (let i = 1; i < currentCount; i++) {
                    membersArr.push({
                        name: (document.getElementById(`member${i}_name`)?.value || '').trim(),
                        usn: (document.getElementById(`member${i}_usn`)?.value || '').trim().toUpperCase(),
                        email: (document.getElementById(`member${i}_email`)?.value || '').trim().toLowerCase(),
                        phone: (document.getElementById(`member${i}_phone`)?.value || '').trim().replace(/[\s-]/g, ''),
                    });
                }

                // Determine team name: for multi-member events, use lead name as default
                const teamName = currentCount > 1 ? (leadName + "'s Team") : '';

                const payload = {
                    eventId: eventId,
                    participantName: leadName,
                    usn: leadUSN,
                    email: leadEmail,
                    phone: leadPhone,
                    college: leadCollege,
                    branch: 'N/A',
                    semester: 'N/A',
                    teamName: teamName,
                    teamSize: currentCount,
                    members: membersArr,
                };

                try {
                    const resp = await fetch('/api/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                    });
                    const result = await resp.json();

                    if(result.success){
                        // Mark as registered in localStorage
                        if (typeof _addRegistered === 'function') {
                            _addRegistered(eventId);
                        }

                        // Show success using popup or inline UI
                        if (typeof samPopup !== 'undefined') {
                            samPopup.success({
                                eventName: result.data?.eventName || ev.norseName,
                                participantName: result.data?.participantName || '',
                                teamName: result.data?.teamName || '',
                            });
                        } else {
                            showSuccess(result);
                        }
                    } else if(result.error) {
                        const errCode = result.error.code || '';
                        const errDetails = result.error.details || [];
                        const errMsg = errDetails[0] || result.message || 'Registration failed';

                        if (errCode === 'DUPLICATE') {
                            if (typeof samPopup !== 'undefined') {
                                samPopup.duplicate(ev.norseName || ev.commonName);
                            } else {
                                showErrorPopup('Already Registered!', errMsg);
                            }
                        } else if (errCode === 'CLASH_LOCKED') {
                            if (typeof samPopup !== 'undefined') {
                                samPopup.lock({ registeredEventName: errMsg });
                            } else {
                                showErrorPopup('Event Locked', errMsg);
                            }
                        } else if (errCode === 'INVALID_INPUT') {
                            if (typeof samPopup !== 'undefined') {
                                samPopup.validation(errMsg);
                            } else {
                                showFormError(errMsg);
                            }
                        } else {
                            if (typeof samPopup !== 'undefined') {
                                samPopup.error('Registration Failed', errMsg);
                            } else {
                                showFormError(errMsg);
                            }
                        }
                        setLoading(false);
                    } else {
                        // Unexpected response shape
                        showFormError('Unexpected response from server. Please try again.');
                        setLoading(false);
                    }
                } catch(err){
                    console.error('[register-page] Submit error:', err);
                    if (typeof samPopup !== 'undefined') {
                        samPopup.network();
                    } else {
                        showFormError('Network error. Please check your connection and try again.');
                    }
                    setLoading(false);
                }
            };

            // Show form
            document.getElementById('reg-form-wrap').style.display='block';
        })
        .catch(err=>{
            console.error(err);
            if (typeof samPopup !== 'undefined') {
                samPopup.network();
            }
            formSec.innerHTML='<div style="text-align:center;padding:4rem 1rem;color:rgba(232,244,248,0.6);">Failed to load event data. Please try again.</div>';
        });
})();
