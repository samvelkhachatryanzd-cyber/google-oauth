const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_MIN = 2
const USERNAME_MAX = 50
const PASSWORD_MIN = 8
const PASSWORD_MAX_BYTES = 72 // bcrypt only uses the first 72 bytes of a password

// Mirrors the server's rules (backend/src/validators/auth.js) so mistakes show up instantly in
// the same error box as server errors, without a request. The server stays the authority.
// Returns the first problem as a message, or '' if the fields look fine.
export function validateCredentials({ username, email, password }, isRegister) {
  if (isRegister) {
    if (!username) return 'Username is required'
    const length = username.trim().length
    if (length < USERNAME_MIN || length > USERNAME_MAX) {
      return `Username must be between ${USERNAME_MIN} and ${USERNAME_MAX} characters`
    }
  }

  if (!email) return 'Email is required'
  if (email.length > 255 || !EMAIL_PATTERN.test(email.trim())) return 'Email is invalid'

  if (!password) return 'Password is required'
  if (isRegister) {
    if (password.length < PASSWORD_MIN) return `Password must be at least ${PASSWORD_MIN} characters`
    if (new TextEncoder().encode(password).length > PASSWORD_MAX_BYTES) {
      return `Password must be at most ${PASSWORD_MAX_BYTES} bytes`
    }
  }

  return ''
}
