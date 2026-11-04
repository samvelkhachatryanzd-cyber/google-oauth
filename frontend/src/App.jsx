import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import './App.css'
import api from './api/axios.js'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'

function App() {
  const [user, setUser] = useState(null)
  const [sessionError, setSessionError] = useState('')
  // True until the server has said whether the browser already has a valid session,
  // so a refresh doesn't flash the login form at someone who is logged in.
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  useEffect(() => {
    // `ignore` drops the answer of a request whose effect was already cleaned up
    // (React StrictMode runs effects twice in development).
    let ignore = false

    api.get('/auth/me')
      .then(({ data }) => {
        if (!ignore) setUser(data.user)
      })
      .catch((err) => {
        // 401 just means "not logged in". Anything else (server down, timeout) is worth saying.
        if (!ignore && err.response?.status !== 401) {
          setSessionError('Could not check your session. Please try again.')
        }
      })
      .finally(() => {
        if (!ignore) setIsCheckingSession(false)
      })

    return () => {
      ignore = true
    }
  }, [])

  if (isCheckingSession) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <p className="auth-subtitle">Loading…</p>
        </div>
      </div>
    )
  }

  // Logged-in users are kept off /login and /register, logged-out users off /dashboard.
  // `replace` keeps the redirect out of the history, so Back doesn't bounce off it.
  // Signing in or out only changes `user`; these redirects do the navigation.
  return (
    <Routes>
      <Route
        path="/login"
        element={user
          ? <Navigate to="/dashboard" replace />
          : <Login onAuthenticated={setUser} initialError={sessionError} />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/dashboard" replace /> : <Register onAuthenticated={setUser} />}
      />
      <Route
        path="/dashboard"
        element={user
          ? <Dashboard user={user} onLoggedOut={() => setUser(null)} />
          : <Navigate to="/login" replace />}
      />
      {/* "/" and any unknown path */}
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  )
}

export default App
