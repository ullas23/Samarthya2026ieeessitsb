/**
 * response.js
 * ------------
 * Helper functions that build standardised JSON responses.
 * Every API endpoint should use these instead of crafting responses manually.
 */

/**
 * Build a success response object.
 * @param {string} message - Human-readable success message.
 * @param {any}    data    - Payload to return (object, array, etc.).
 * @returns {{ success: true, message: string, data: any, error: null }}
 */
function success(message, data = null) {
  return {
    success: true,
    message,
    data,
    error: null,
  };
}

/**
 * Build an error response object.
 * @param {string}   message - Human-readable error message.
 * @param {string}   code    - Machine-readable error code (e.g. "INVALID_INPUT").
 * @param {string[]} details - Array of specific error descriptions.
 * @returns {{ success: false, message: string, data: null, error: { code: string, details: string[] } }}
 */
function error(message, code = 'UNKNOWN_ERROR', details = []) {
  return {
    success: false,
    message,
    data: null,
    error: {
      code,
      details,
    },
  };
}

/**
 * Send a JSON response on a Vercel `res` object.
 * @param {object} res        - Vercel response object.
 * @param {number} statusCode - HTTP status code.
 * @param {object} body       - The response body (use success() or error() helpers).
 */
function send(res, statusCode, body) {
  res.status(statusCode).json(body);
}

module.exports = { success, error, send };
