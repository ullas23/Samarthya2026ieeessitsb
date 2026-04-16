/**
 * Js/popup.js — Reusable Norse-Themed Popup / Toast System
 * ──────────────────────────────────────────────────────────
 * Provides elegant, cinematic popup overlays for:
 *   - Success messages
 *   - Error messages
 *   - Lock/conflict warnings
 *   - Duplicate registration alerts
 *   - Network errors
 *
 * Usage:
 *   samPopup.success({ title, eventName, participantName, teamName })
 *   samPopup.error(title, message)
 *   samPopup.lock({ registeredEventName, selectedEventName })
 *   samPopup.duplicate(eventName)
 *   samPopup.validation(message)
 *   samPopup.network()
 */

const samPopup = (function () {
  'use strict';

  // ── Inject popup CSS once ──────────────────────────────
  const styleId = 'sam-popup-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .sam-popup-overlay {
        position: fixed; inset: 0;
        background: rgba(2, 4, 8, 0.95);
        z-index: 10001;
        display: flex; align-items: center; justify-content: center;
        padding: 1rem;
        backdrop-filter: blur(12px);
        opacity: 0;
        transition: opacity 0.35s ease;
        pointer-events: none;
      }
      .sam-popup-overlay.sam-popup-visible {
        opacity: 1;
        pointer-events: all;
      }
      .sam-popup-box {
        max-width: 480px; width: 100%;
        background: linear-gradient(135deg, rgba(10, 22, 40, 0.98), rgba(5, 13, 26, 0.99));
        border: 1px solid rgba(200, 168, 75, 0.35);
        border-radius: 12px;
        padding: clamp(1.5rem, 4vw, 2.5rem);
        text-align: center;
        transform: scale(0.85);
        transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .sam-popup-visible .sam-popup-box {
        transform: scale(1);
      }
      .sam-popup-icon {
        font-size: 2.2rem;
        margin-bottom: 0.75rem;
        line-height: 1;
      }
      .sam-popup-icon.success { color: #5ce08e; text-shadow: 0 0 20px rgba(92, 224, 142, 0.4); }
      .sam-popup-icon.error   { color: #ff6b6b; text-shadow: 0 0 20px rgba(255, 107, 107, 0.4); }
      .sam-popup-icon.lock    { color: #ffa41c; text-shadow: 0 0 20px rgba(255, 164, 28, 0.4); }
      .sam-popup-icon.info    { color: #00d4ff; text-shadow: 0 0 20px rgba(0, 212, 255, 0.4); }
      .sam-popup-title {
        font-family: 'Cinzel Decorative', serif;
        font-size: clamp(1.1rem, 3vw, 1.4rem);
        margin-bottom: 0.75rem;
        letter-spacing: 0.05em;
      }
      .sam-popup-title.success { color: #5ce08e; }
      .sam-popup-title.error   { color: #ff6b6b; }
      .sam-popup-title.lock    { color: #ffa41c; }
      .sam-popup-title.info    { color: #00d4ff; }
      .sam-popup-body {
        font-family: 'Rajdhani', sans-serif;
        font-size: clamp(0.85rem, 2.5vw, 1rem);
        color: rgba(232, 244, 248, 0.75);
        line-height: 1.7;
        margin-bottom: 1.25rem;
      }
      .sam-popup-details {
        background: rgba(5, 13, 26, 0.5);
        border: 1px solid rgba(200, 168, 75, 0.12);
        border-radius: 6px;
        padding: 0.75rem 1rem;
        margin-bottom: 1.25rem;
        text-align: left;
      }
      .sam-popup-detail-row {
        display: flex; justify-content: space-between;
        padding: 0.3rem 0;
        border-bottom: 1px solid rgba(200, 168, 75, 0.05);
        font-family: 'Share Tech Mono', monospace;
        font-size: 0.7rem;
      }
      .sam-popup-detail-row:last-child { border-bottom: none; }
      .sam-popup-detail-label {
        color: rgba(232, 244, 248, 0.4);
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }
      .sam-popup-detail-value {
        color: #e8f4f8;
        font-size: 0.8rem;
      }
      .sam-popup-actions {
        display: flex; gap: 0.75rem;
        justify-content: center; flex-wrap: wrap;
      }
      .sam-popup-btn {
        padding: 0.65rem 1.8rem;
        font-family: 'Cinzel', serif;
        font-size: 0.75rem;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        border: none; cursor: pointer;
        transition: all 0.3s;
        border-radius: 2px;
      }
      .sam-popup-btn-primary {
        background: linear-gradient(135deg, #c8a84b, #8b6a1a);
        color: #020408;
      }
      .sam-popup-btn-primary:hover {
        box-shadow: 0 0 20px rgba(200, 168, 75, 0.4);
        transform: translateY(-1px);
      }
      .sam-popup-btn-secondary {
        background: transparent;
        color: #e8f4f8;
        border: 1px solid rgba(232, 244, 248, 0.25);
      }
      .sam-popup-btn-secondary:hover {
        border-color: rgba(200, 168, 75, 0.5);
        color: #c8a84b;
      }
    `;
    document.head.appendChild(style);
  }

  // ── Core show function ─────────────────────────────────
  function show(config) {
    // Remove any existing popup
    const existing = document.querySelector('.sam-popup-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'sam-popup-overlay';

    const iconMap = {
      success: '✦',
      error: '✕',
      lock: '⛊',
      info: 'ᛟ',
    };

    let detailsHTML = '';
    if (config.details && config.details.length > 0) {
      const rows = config.details
        .map((d) => `<div class="sam-popup-detail-row">
          <span class="sam-popup-detail-label">${d.label}</span>
          <span class="sam-popup-detail-value">${d.value}</span>
        </div>`)
        .join('');
      detailsHTML = `<div class="sam-popup-details">${rows}</div>`;
    }

    let actionsHTML = '';
    if (config.actions && config.actions.length > 0) {
      actionsHTML = '<div class="sam-popup-actions">' +
        config.actions.map((a, i) =>
          `<button class="sam-popup-btn ${i === 0 ? 'sam-popup-btn-primary' : 'sam-popup-btn-secondary'}" data-action="${i}">${a.label}</button>`
        ).join('') +
        '</div>';
    } else {
      actionsHTML = `<div class="sam-popup-actions">
        <button class="sam-popup-btn sam-popup-btn-secondary" data-action="close">Close</button>
      </div>`;
    }

    const box = document.createElement('div');
    box.className = 'sam-popup-box';
    box.innerHTML = `
      <div class="sam-popup-icon ${config.type}">${iconMap[config.type] || 'ᛟ'}</div>
      <div class="sam-popup-title ${config.type}">${config.title}</div>
      <div class="sam-popup-body">${config.message}</div>
      ${detailsHTML}
      ${actionsHTML}
    `;

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    // Trigger animation
    requestAnimationFrame(() => {
      overlay.classList.add('sam-popup-visible');
    });

    // Close handler
    function close() {
      overlay.classList.remove('sam-popup-visible');
      setTimeout(() => overlay.remove(), 350);
    }

    // Click outside to close
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    // Button handlers
    box.querySelectorAll('[data-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const actionIdx = btn.getAttribute('data-action');
        if (actionIdx === 'close') {
          close();
        } else {
          const action = config.actions[parseInt(actionIdx)];
          close();
          if (action && action.fn) action.fn();
        }
      });
    });

    // ESC key
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        close();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);

    return { close };
  }

  // ── Public API ─────────────────────────────────────────
  return {
    /** Show a success popup after successful registration */
    success(data) {
      const details = [
        { label: 'Event', value: data.eventName || '' },
        { label: 'Participant', value: data.participantName || '' },
      ];
      if (data.teamName) {
        details.push({ label: 'Team', value: data.teamName });
      }
      return show({
        type: 'success',
        title: 'Registration Successful',
        message: 'Your registration has been submitted successfully. You will receive a confirmation shortly.',
        details,
        actions: [
          { label: 'Back to Events', fn: () => { window.location.href = 'index.html#events'; } },
        ],
      });
    },

    /** Show a duplicate registration popup */
    duplicate(eventName) {
      return show({
        type: 'error',
        title: 'Already Registered',
        message: `You are already registered for <strong>${eventName || 'this event'}</strong>. Each participant can only register once per event.`,
      });
    },

    /** Show a validation error popup */
    validation(message) {
      return show({
        type: 'error',
        title: 'Validation Error',
        message: message || 'Please check the entered details and try again.',
      });
    },

    /** Show a lock popup (triggered BEFORE form opens) */
    lock(data) {
      return show({
        type: 'lock',
        title: 'Event Locked',
        message: `This event is locked. It runs parallel to <strong>${data.registeredEventName || 'another event'}</strong>, which you have already registered for.`,
        details: data.clashGroup
          ? [{ label: 'Clash Group', value: data.clashGroup }]
          : [],
      });
    },

    /** Show a network / retry error popup */
    network() {
      return show({
        type: 'error',
        title: 'Network Error',
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
        actions: [
          { label: 'Retry', fn: () => window.location.reload() },
          { label: 'Close', fn: () => {} },
        ],
      });
    },

    /** Show a custom error popup */
    error(title, message) {
      return show({
        type: 'error',
        title: title || 'Error',
        message: message || 'Something went wrong. Please try again.',
      });
    },

    /** Show a custom info popup */
    info(title, message) {
      return show({
        type: 'info',
        title: title || 'Info',
        message: message || '',
      });
    },

    /** Generic show for custom configs */
    show,
  };
})();
