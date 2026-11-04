const jwt = require('jsonwebtoken');

const COOKIE_NAME = 'token';
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

// Must be identical when setting and clearing, otherwise the browser won't remove the cookie.
function cookieOptions() {
  return {
    httpOnly: true, // not readable from JavaScript
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    path: '/',
  };
}

// Signs a token for the user and sends it as an httpOnly cookie.
// The requireAuth middleware verifies it on later requests.
function issueSession(res, userId) {
  const token = jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: SESSION_TTL_SECONDS });
  res.cookie(COOKIE_NAME, token, { ...cookieOptions(), maxAge: SESSION_TTL_SECONDS * 1000 });
}

function clearSession(res) {
  res.clearCookie(COOKIE_NAME, cookieOptions());
}

module.exports = { COOKIE_NAME, issueSession, clearSession };
