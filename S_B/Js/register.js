/**
 * Js/register.js
 * ----------------
 * Frontend-only registration fallback for the static site build.
 * Keeps the existing register buttons and modal UX intact while
 * replacing backend registration with a themed placeholder popup.
 */

(function () {
  'use strict';

  function showClosedPopup(eventId) {
    const evts = window._samEvents || [];
    const ev = evts.find((item) => item.id === eventId || item.eventId === eventId);
    const eventName = ev ? (ev.norse || ev.norseName || eventId) : 'this event';

    if (typeof samPopup !== 'undefined' && samPopup && typeof samPopup.show === 'function') {
      samPopup.show({
        type: 'info',
        title: 'Registrations Closed',
        message: `The gates of the arena for <strong>${eventName}</strong> are not yet open. Please return later, warrior.`,
        actions: [
          { label: 'Close', fn: () => {} },
        ],
      });
      return;
    }

    console.info(`[register.js] Registration disabled for ${eventName}.`);
  }

  window.samHandleRegister = function (eventId) {
    showClosedPopup(eventId);
  };
})();
