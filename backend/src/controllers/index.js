const { registerService, loginService, googleLoginService } = require('../services');
const { parseRegister, parseLogin, parseGoogleLogin } = require('../validators/auth');
const { issueSession, clearSession } = require('../utils/session');

// Express 5 forwards errors thrown (or rejected) in async handlers to the error middleware,
// so no try/catch is needed here.

async function register(req, res) {
  const user = await registerService(parseRegister(req.body));

  issueSession(res, user.id);
  res.status(201).json({ user });
}

async function login(req, res) {
  const user = await loginService(parseLogin(req.body));

  issueSession(res, user.id);
  res.json({ user });
}

// Signs in with the ID token the Google button hands to the browser, creating the account on
// first use.
async function googleLogin(req, res) {
  const user = await googleLoginService(parseGoogleLogin(req.body));

  issueSession(res, user.id);
  res.json({ user });
}

function logout(req, res) {
  clearSession(res);
  res.status(204).end();
}

// requireAuth has already verified the session and loaded the user.
function me(req, res) {
  res.json({ user: req.user });
}

module.exports = {
  login,
  register,
  googleLogin,
  logout,
  me,
};
