import {useState} from 'react'
import {Link} from 'react-router'
import {GoogleLogin} from '@react-oauth/google'
import api from '../api/axios.js'
import {validateCredentials} from '../validateCredentials.js'

// `onAuthenticated` receives the user once the server has started a session; App then moves the
// browser to the dashboard. `initialError` carries a problem App already ran into (e.g. the
// session check failing because the server is down).
function Login({ onAuthenticated, initialError = '' }) {
  const [error, setError] = useState(initialError)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    const credentials = Object.fromEntries(new FormData(e.currentTarget))

    const problem = validateCredentials(credentials, false)
    if (problem) {
      setError(problem)
      return
    }

    setError('')
    setIsSubmitting(true)
    try {
      const { data } = await api.post('/auth/login', credentials)
      onAuthenticated(data.user)
    } catch (err) {
      setError(err.response?.data?.error ?? 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Google's button hands us an ID token (`credential`); the server verifies it and starts the session.
  async function handleGoogleSuccess({ credential }) {
    setError('')
    setIsSubmitting(true)
    try {
      const { data } = await api.post('/auth/google', { credential })
      onAuthenticated(data.user)
    } catch (err) {
      setError(err.response?.data?.error ?? 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">

        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Please enter your details to log in.</p>

        {/* noValidate: problems are reported by validateCredentials in the error box below,
            instead of the browser's own tooltips. */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-form-field">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              autoComplete="username"
              maxLength={255}
              required
            />
          </div>

          <div className="auth-form-field">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className="auth-error" role="alert">{error}</p>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait…' : 'Login'}
          </button>
        </form>

        <div className="auth-divider">or</div>
        <div className="auth-google">
          {/* TEMPORARY experiment: per Google's docs a medium button is never personalized
              ("Sign in as <name>"). Alternatives to try instead of size="medium":
              type="icon", or size="large" with width={190}. */}
          <GoogleLogin
            size="large"
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google sign-in failed. Please try again.')}
          />
        </div>

        <p className="auth-toggle">
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </p>

      </div>
    </div>
  )
}

export default Login
