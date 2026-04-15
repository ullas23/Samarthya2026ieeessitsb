/**
 * /api/health.js
 * ---------------
 * Simple health-check endpoint.
 * Confirms the backend is running on Vercel.
 *
 * Route:  GET /api/health
 */

const { success, send } = require('../backend/response');

module.exports = (req, res) => {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return send(res, 405, {
      success: false,
      message: 'Method not allowed',
      data: null,
      error: { code: 'METHOD_NOT_ALLOWED', details: ['Use GET'] },
    });
  }

  send(res, 200, success('Backend is running', {
    service: 'Samarthya Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  }));
};
