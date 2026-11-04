const jwt = require('jsonwebtoken');
const { COOKIE_NAME, clearSession } = require('../utils/session');
const { getUserService } = require('../services');
const HttpError = require('../utils/HttpError');

// Lets a request through only if its session cookie holds a valid token for an existing user,
// and exposes that user as `req.user`. A cookie that is invalid, expired or points to a deleted
// account is cleared, so the browser stops sending it.
async function requireAuth(req, res, next) {
  const token = req.cookies[COOKIE_NAME];
  if (!token) {
    throw new HttpError(401, 'Not authenticated');
  }

  let userId;
  try {
    // Pin the algorithm so the token can only ever be verified the way issueSession signs it.
    ({ sub: userId } = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] }));
  } catch {
    clearSession(res);
    throw new HttpError(401, 'Not authenticated');
  }

  const user = await getUserService(userId);
  if (!user) {
    clearSession(res);
    throw new HttpError(401, 'Not authenticated');
  }

  req.user = user;
  next();
}

module.exports = requireAuth;
