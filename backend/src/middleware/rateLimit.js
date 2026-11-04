const { rateLimit } = require('express-rate-limit');

// Limits are per client IP and kept in memory, so they reset when the server restarts.
function limiter({ message, ...options }) {
  return rateLimit({
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: message },
    ...options,
  });
}

// Only failed attempts count, so a user who logs in correctly is never locked out by it.
const loginLimiter = limiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  message: 'Too many failed login attempts. Please try again in a few minutes.',
});

// Every request counts, which also caps how fast accounts can be created.
const registerLimiter = limiter({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  message: 'Too many sign-up attempts. Please try again later.',
});

module.exports = { loginLimiter, registerLimiter };
