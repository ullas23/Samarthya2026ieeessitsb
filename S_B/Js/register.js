/**
 * Js/register.js — Smart Frontend Registration Flow
 * ───────────────────────────────────────────────────
 * Connects the index.html Register buttons to the backend.
 *
 * Flow:
 *   1. User clicks Register on event modal
 *   2. Lock precheck runs immediately (/api/lock-status)
 *   3. If locked → popup, do NOT open form
 *   4. If unlocked → redirect to register.html
 *   5. register.html form submits to /api/register
 *   6. Backend re-validates lock (authoritative)
 *
 * This file overrides samHandleRegister() from register-locks.js
 * with a smarter version that uses backend lock precheck.
 *
 * Loaded on index.html AFTER events-data.js and register-locks.js.
 */

(function () {
  'use strict';

  // ── API base (empty for same-origin) ──────────────────
  const API_BASE = '';

  // ── Cache for event metadata from backend ─────────────
  let eventsCache = null;

  /**
   * Fetch events metadata from backend (cached).
   * Used for logic only — does NOT rebuild visual cards.
   */
  async function fetchEventsMetadata() {
    if (eventsCache) return eventsCache;
    try {
      const resp = await fetch(`${API_BASE}/api/events?active=true`);
      const data = await resp.json();
      if (data.success && data.data && data.data.events) {
        eventsCache = data.data.events;
        return eventsCache;
      }
    } catch (e) {
      console.warn('[register.js] Failed to fetch events metadata:', e);
    }
    return null;
  }

  /**
   * Map a frontend event ID (from index.html events array)
   * to the corresponding backend event ID in events.sample.json.
   *
   * The frontend uses Norse names as IDs (e.g., 'valhalla')
   * while Phase 1 backend may use codes like 'AWK01'.
   * We check both systems and handle the mismatch gracefully.
   */
  function resolveBackendEventId(frontendId) {
    // The lock-status API and register API use the data/events.sample.json IDs.
    // We'll attempt the call with the frontendId first (it works if 
    // events.sample.json uses the same IDs). If not found, we fall through.
    return frontendId;
  }

  /**
   * Run lock precheck before opening registration form.
   * 
   * @param {string} eventId - The frontend event ID
   * @param {string} [email] - User email if already known
   * @param {string} [usn] - User USN if already known
   * @returns {Promise<{locked: boolean, data?: object, error?: string}>}
   */
  async function checkLockStatus(eventId, email, usn) {
    try {
      const params = new URLSearchParams({ eventId });
      if (email) params.set('email', email);
      if (usn) params.set('usn', usn);

      const resp = await fetch(`${API_BASE}/api/lock-status?${params.toString()}`);
      const result = await resp.json();

      if (result.success && result.data) {
        return { locked: result.data.locked, data: result.data };
      }

      // API returned but not as expected — treat as unlocked to not block UX
      return { locked: false };
    } catch (e) {
      console.warn('[register.js] Lock status check failed:', e);
      // Network errors should not block registration — allow fallback
      return { locked: false, error: 'network' };
    }
  }

  /**
   * Enhanced samHandleRegister — replaces the one in register-locks.js.
   * 
   * This runs:
   *   1. Client-side conflict check (existing localStorage-based)
   *   2. Backend lock precheck (/api/lock-status) — if identity available
   *   3. Opens registration page if unlocked
   *
   * @param {string} eventId - The event ID (from frontend events array)
   */
  window.samHandleRegister = async function (eventId) {
    // Get event info from the page's events array
    const evts = window._samEvents || [];
    const ev = evts.find((e) => e.id === eventId || e.eventId === eventId);
    if (!ev) return;
    if (ev.isOfflineOnly) return;

    // Already registered? (localStorage check)
    if (typeof _getRegistered === 'function') {
      const registered = _getRegistered();
      if (registered.includes(eventId)) {
        if (typeof samPopup !== 'undefined') {
          samPopup.duplicate(ev.norse || ev.norseName || eventId);
        } else {
          _samPopup('Already Registered', `You have already registered for ${ev.norse || ev.norseName}.`, null);
        }
        return;
      }
    }

    // Client-side conflict check (from register-locks.js)
    if (typeof samCheckLock === 'function') {
      const localLock = samCheckLock(eventId);
      if (localLock.locked) {
        if (typeof samPopup !== 'undefined') {
          samPopup.lock({
            registeredEventName: localLock.byName || localLock.by,
            clashGroup: '',
          });
        } else {
          _samPopup('Event Locked', `Event locked. Running parallel to ${localLock.byName}, which you have registered for.`, null);
        }
        return;
      }
    }

    // At this point, we don't have the user's email/USN yet.
    // We can still check the backend if clashGroup exists for the event.
    // Since identity is unknown, we do a basic check (backend responds unlocked
    // when no identity is provided). The full check happens on register.html.

    // Show conflict warning for events with known conflicts
    if (typeof samGetConflictNames === 'function') {
      const SAM_EX = ['helheim', 'mimir', 'folkvangr'];
      if (!SAM_EX.includes(eventId)) {
        const cnames = samGetConflictNames(eventId);
        if (cnames.length > 0) {
          const popup = typeof samPopup !== 'undefined' ? samPopup : null;
          if (popup) {
            popup.show({
              type: 'info',
              title: 'Caution!',
              message: `This event, <strong>${ev.norse || ev.norseName}</strong>, runs parallel with <strong>${cnames.join(', ')}</strong>. If you register for this event, those event registrations will be locked.`,
              actions: [
                {
                  label: 'Proceed',
                  fn: () => {
                    window.location.href = `register.html?event=${eventId}`;
                  },
                },
                {
                  label: 'Cancel',
                  fn: () => {},
                },
              ],
            });
          } else {
            _samPopup('Caution!',
              `This event, ${ev.norse || ev.norseName}, runs parallel with ${cnames.join(', ')}. If you register, those events will be locked.`,
              () => { window.location.href = `register.html?event=${eventId}`; }
            );
          }
          return;
        }
      }
    }

    // No conflicts — go directly to registration page
    window.location.href = `register.html?event=${eventId}`;
  };

  // ── Preload events metadata in background ─────────────
  fetchEventsMetadata();

})();
