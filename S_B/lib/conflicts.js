// lib/conflicts.js — Parallel Event Conflict Logic
const { EVENTS, getEvent } = require('./events');
const EXCEPTIONS = ['helheim','mimir','folkvangr'];

function overlap(a, b) {
    if (!a || !b || a.eventId===b.eventId) return false;
    if (a.day!==b.day || a.day===0) return false;
    return a.sM < b.eM && b.sM < a.eM;
}

function getConflicts(eventId) {
    const ev = getEvent(eventId);
    if (!ev || EXCEPTIONS.includes(eventId)) return [];
    return EVENTS.filter(o => o.eventId!==eventId && !EXCEPTIONS.includes(o.eventId) && overlap(ev,o)).map(o=>o.eventId);
}

function conflictMap() {
    const m = {};
    EVENTS.forEach(e => { m[e.eventId] = getConflicts(e.eventId); });
    return m;
}

function checkViolation(targetId, registeredIds) {
    if (EXCEPTIONS.includes(targetId)) return { blocked:false, by:[] };
    const c = getConflicts(targetId);
    const by = registeredIds.filter(r => c.includes(r));
    return { blocked: by.length>0, by };
}

module.exports = { EXCEPTIONS, getConflicts, conflictMap, checkViolation };
