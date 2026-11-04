import { useState } from 'react'
import api from '../api/axios.js'

// `onLoggedOut` runs once the server has ended the session; App then sends the browser to /login.
function Dashboard({ user, onLoggedOut }) {
  const [error, setError] = useState('')

  async function handleLogout() {
    setError('')
    try {
      await api.post('/auth/logout')
      onLoggedOut()
    } catch {
      setError('Could not log out. Please try again.')
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome, {user.username}</h2>
        <p className="auth-subtitle">You are signed in as {user.email}</p>

        {error && <p className="auth-error" role="alert">{error}</p>}

        <div className="auth-form">
          <button type="button" onClick={handleLogout}>Log out</button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
