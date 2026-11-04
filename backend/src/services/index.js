const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');
const { UniqueConstraintError } = require('sequelize');
const { User } = require('../models');
const { parseGoogleProfile } = require('../validators/auth');
const HttpError = require('../utils/HttpError');

const BCRYPT_COST = 12;

const googleClient = new OAuth2Client();

// Compared against when the email is unknown, so a login attempt takes about as long either way
// and response time doesn't reveal which emails are registered.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', BCRYPT_COST);

function toPublicUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
  };
}

async function registerService({ username, email, password }) {
  const hashedPassword = await bcrypt.hash(password, BCRYPT_COST);

  try {
    const normalizedEmail = email.replace(/[^a-zA-Z0-9]/g, "");
    console.log(normalizedEmail);
    const existingUser = await User.findOne({ where: { email: normalizedEmail } })

    if (existingUser) {
      throw new HttpError(409, 'An account with this email already exists');
    }

    const user = await User.create({ username, email, password: hashedPassword });
    return toPublicUser(user);
  } catch (error) {
    // email is the only unique column. Relying on the database constraint (instead of
    // looking the email up first) also covers two simultaneous registrations.
    if (error instanceof UniqueConstraintError) {
      throw new HttpError(409, 'An account with this email already exists');
    }
    throw error;
  }
}

async function loginService({ email, password }) {
  const user = await User.findOne({ where: { email } });

  const passwordMatches = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);
  if (!user || !passwordMatches) {
    throw new HttpError(401, 'Invalid email or password');
  }

  return toPublicUser(user);
}

// Checks that the ID token was issued by Google, for our client id, and hasn't expired
// (signature, issuer, expiry and audience), and returns its payload.
async function verifyGoogleIdToken(idToken) {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      // Never let this be undefined: the library skips the audience check then.
      // index.js refuses to start without GOOGLE_CLIENT_ID.
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload();
  } catch (error) {
    // The reason stays in the server log; the client only learns that it failed.
    console.warn('Google ID token rejected:', error.message);
    throw new HttpError(401, 'Google sign-in failed. Please try again.');
  }
}

async function googleLoginService({ credential }) {
  const { googleId, email, username } = parseGoogleProfile(await verifyGoogleIdToken(credential));

  // Accounts are matched on Google's stable user id first, never on the email alone.
  let user = await User.findOne({ where: { googleId } });
  if (user) return toPublicUser(user);

  try {
    user = await User.findOne({ where: { email } });

    if (!user) {
      return toPublicUser(await User.create({ username, email, googleId }));
    }

    // The email belongs to an account registered with a password: Google has verified this
    // address, so attach the Google id to that account (no new row). Both sign-in methods then
    // work. `googleId: null` in the condition means an account already tied to a different
    // Google account is never overwritten.
    const [linked] = await User.update({ googleId }, { where: { id: user.id, googleId: null } });
    if (!linked) {
      // Either a simultaneous request linked this same Google account a moment ago (fine), or
      // the account belongs to a different Google account (refuse).
      await user.reload();
      if (user.googleId !== googleId) {
        throw new HttpError(409, 'This email is already linked to a different Google account');
      }
    }
    return toPublicUser(user);
  } catch (error) {
    if (!(error instanceof UniqueConstraintError)) throw error;

    // A simultaneous request for this same Google account got there first: use its result.
    user = await User.findOne({ where: { googleId } });
    if (!user) throw new HttpError(409, 'An account with this email already exists');
    return toPublicUser(user);
  }
}

// Returns the public user, or null if the account no longer exists.
async function getUserService(id) {
  const user = await User.findByPk(id);
  return user ? toPublicUser(user) : null;
}

module.exports = {
  registerService,
  loginService,
  googleLoginService,
  getUserService,
};
