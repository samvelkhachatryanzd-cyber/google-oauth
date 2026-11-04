const HttpError = require('../utils/HttpError');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_MAX = 255;
const USERNAME_MIN = 2;
const USERNAME_MAX = 50;
const PASSWORD_MIN = 8;
const PASSWORD_MAX_BYTES = 72; // bcrypt only uses the first 72 bytes of a password

function requireString(value, label) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new HttpError(400, `${label} is required`);
  }
  return value;
}

function parseEmail(value) {
  const email = requireString(value, 'Email').trim().toLowerCase();
  if (email.length > EMAIL_MAX || !EMAIL_PATTERN.test(email)) {
    throw new HttpError(400, 'Email is invalid');
  }
  return email;
}

// Each parser returns clean values or throws a 400 HttpError. `body` is undefined when the
// request had no JSON body.
function parseRegister(body = {}) {
  const username = requireString(body.username, 'Username').trim();
  if (username.length < USERNAME_MIN || username.length > USERNAME_MAX) {
    throw new HttpError(400, `Username must be between ${USERNAME_MIN} and ${USERNAME_MAX} characters`);
  }

  const email = parseEmail(body.email);

  const password = requireString(body.password, 'Password');
  if (password.length < PASSWORD_MIN) {
    throw new HttpError(400, `Password must be at least ${PASSWORD_MIN} characters`);
  }
  if (Buffer.byteLength(password) > PASSWORD_MAX_BYTES) {
    throw new HttpError(400, `Password must be at most ${PASSWORD_MAX_BYTES} bytes`);
  }

  return { username, email, password };
}

// Login only checks the shape; whether the credentials are right is the service's job
// (and must not reveal which half was wrong).
function parseLogin(body = {}) {
  return {
    email: requireString(body.email, 'Email').trim().toLowerCase(),
    password: requireString(body.password, 'Password'),
  };
}

function parseGoogleLogin(body = {}) {
  return { credential: requireString(body.credential, 'Google credential') };
}

// Cuts to `max` characters (not UTF-16 units, so an emoji is never split in half).
function clip(text, max) {
  return Array.from(text.trim()).slice(0, max).join('');
}

// Turns the payload of a verified Google ID token into the fields of a new account.
function parseGoogleProfile(payload) {
  // Without a verified email we can't tell the address really belongs to this person.
  if (payload.email_verified !== true) {
    throw new HttpError(403, 'Your Google email address is not verified');
  }

  const email = parseEmail(payload.email);

  // The Google name if usable, otherwise the part of the email before the @.
  let username = clip(typeof payload.name === 'string' ? payload.name : '', USERNAME_MAX);
  if (username.length < USERNAME_MIN) {
    username = clip(email.split('@')[0], USERNAME_MAX);
  }

  return { googleId: requireString(payload.sub, 'Google user id'), email, username };
}

module.exports = { parseRegister, parseLogin, parseGoogleLogin, parseGoogleProfile };
