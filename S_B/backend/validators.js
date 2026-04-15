/**
 * validators.js
 * --------------
 * Pure validation & sanitisation helpers.
 * No side-effects — these just inspect data and return results.
 */

// ─── Regex patterns ────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/; // Indian 10-digit mobile numbers

// ─── Sanitisation ──────────────────────────────────────────

/**
 * Trim and strip potentially dangerous characters from a string.
 * @param {string} value
 * @returns {string}
 */
function sanitize(value) {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/[<>]/g, '');
}

// ─── Individual field validators ───────────────────────────

function isValidEmail(email) {
  return EMAIL_REGEX.test(email);
}

function isValidPhone(phone) {
  return PHONE_REGEX.test(phone);
}

// ─── Registration payload validation ───────────────────────

/**
 * Validate a full registration payload against the event it targets.
 *
 * @param {object} body   - The parsed request body.
 * @param {object} event  - The matching event object from events.sample.json.
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateRegistration(body, event) {
  const errors = [];

  // --- Required fields (always needed) ---
  const requiredFields = ['eventId', 'participantName', 'usn', 'email', 'phone', 'college', 'branch', 'semester'];
  for (const field of requiredFields) {
    if (!body[field] || sanitize(String(body[field])) === '') {
      errors.push(`${field} is required`);
    }
  }

  // If basic fields are missing, return early — no point checking formats.
  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // --- Format checks ---
  if (!isValidEmail(body.email)) {
    errors.push('email format is invalid');
  }
  if (!isValidPhone(body.phone)) {
    errors.push('phone must be a valid 10-digit Indian mobile number');
  }

  // --- Event-level checks ---
  if (!event) {
    errors.push('event does not exist');
    return { valid: false, errors };
  }
  if (!event.active) {
    errors.push('event is not currently active');
    return { valid: false, errors };
  }

  // --- Solo vs Team mode ---
  if (event.mode === 'solo') {
    // Solo events must NOT have team fields
    if (body.teamName || (body.members && body.members.length > 0)) {
      errors.push('solo events do not accept team registrations');
    }
  }

  if (event.mode === 'team') {
    // Team events require teamName and members array
    if (!body.teamName || sanitize(String(body.teamName)) === '') {
      errors.push('teamName is required for team events');
    }
    if (!Array.isArray(body.members) || body.members.length === 0) {
      errors.push('members array is required for team events');
    } else {
      const teamSize = body.members.length;

      if (teamSize < event.minTeamSize) {
        errors.push(`team must have at least ${event.minTeamSize} member(s)`);
      }
      if (teamSize > event.maxTeamSize) {
        errors.push(`team must have at most ${event.maxTeamSize} member(s)`);
      }

      // Validate each member
      body.members.forEach((member, index) => {
        if (!member.name || sanitize(String(member.name)) === '') {
          errors.push(`members[${index}].name is required`);
        }
        if (!member.usn || sanitize(String(member.usn)) === '') {
          errors.push(`members[${index}].usn is required`);
        }
        if (!member.email || !isValidEmail(member.email)) {
          errors.push(`members[${index}].email is missing or invalid`);
        }
        if (!member.phone || !isValidPhone(member.phone)) {
          errors.push(`members[${index}].phone is missing or invalid`);
        }
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Check if a registration is a duplicate by scanning existing rows.
 * A duplicate means the same email OR USN already registered for the same eventId.
 *
 * @param {string[][]} existingRows - All current rows from the sheet (header excluded).
 * @param {string}     eventId      - The event being registered for.
 * @param {string}     email        - Participant email.
 * @param {string}     usn          - Participant USN.
 * @returns {{ isDuplicate: boolean, reason: string }}
 */
function checkDuplicate(existingRows, eventId, email, usn) {
  // Column indices (must match the order we write rows in googleSheets.js):
  // 0: timestamp, 1: eventId, 2: eventName, 3: participantName,
  // 4: usn, 5: email, 6: phone, 7: college, 8: branch, 9: semester,
  // 10: teamName, 11: teamSize, 12: members, 13: status

  for (const row of existingRows) {
    if (row[1] !== eventId) continue; // different event — skip

    if (row[5] && row[5].toLowerCase() === email.toLowerCase()) {
      return { isDuplicate: true, reason: 'This email is already registered for this event' };
    }
    if (row[4] && row[4].toUpperCase() === usn.toUpperCase()) {
      return { isDuplicate: true, reason: 'This USN is already registered for this event' };
    }
  }

  return { isDuplicate: false, reason: '' };
}

module.exports = {
  sanitize,
  isValidEmail,
  isValidPhone,
  validateRegistration,
  checkDuplicate,
};
