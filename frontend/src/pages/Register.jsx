import { useState } from 'react'
import { Link } from 'react-router'
import api from '../api/axios.js'
import { validateCredentials } from '../validateCredentials.js'

// `onAuthenticated` receives the new user once the server has created the account and started a
// session; App then moves the browser to the dashboard.
function Register({ onAuthenticated }) {
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    const credentials = Object.fromEntries(new FormData(e.currentTarget))

    const problem = validateCredentials(credentials, true)
    if (problem) {
      setError(problem)
      return
    }

    setError('')
    setIsSubmitting(true)
    try {
      const { data } = await api.post('/auth/register', credentials)
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

        <h2>Create Account</h2>
        <p className="auth-subtitle">Fill in the details to get started.</p>

        {/* noValidate: problems are reported by validateCredentials in the error box below,
            instead of the browser's own tooltips. */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-form-field">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter your preferred username"
              autoComplete="nickname"
              minLength={2}
              maxLength={50}
              required
            />
          </div>

          <div className="auth-form-field">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              autoComplete="email"
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
              placeholder="Create a password"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          {error && <p className="auth-error" role="alert">{error}</p>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait…' : 'Register'}
          </button>
        </form>

        <p className="auth-toggle">
          Already have an account? <Link to="/login">Login</Link>
        </p>

      </div>
    </div>
  )
}

export default Register
