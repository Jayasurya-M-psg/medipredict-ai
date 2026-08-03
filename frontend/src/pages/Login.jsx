import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Auth.css'

export default function Login() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [showPw, setShowPw] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const res = await login(form.email, form.password)
    if (res.success) navigate('/dashboard')
    else {
      const msg = res.error || ''
      if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('timeout') || msg === 'Login failed') {
        setError('⏳ Server is waking up (free tier). Please wait 30 seconds and try again.')
      } else if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('password') || msg.toLowerCase().includes('incorrect')) {
        setError('❌ Wrong email or password. Please check and try again.')
      } else if (msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('exist')) {
        setError('❌ No account found. Please register first.')
      } else {
        setError(msg || 'Login failed. Please try again.')
      }
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1"></div>
        <div className="auth-orb auth-orb-2"></div>
      </div>
      <div className="auth-container animate-fade-in-up">
        <div className="auth-card">
          <div className="auth-logo">⚕️ MediPredict</div>
          <h1>Welcome back</h1>
          <p className="auth-subtitle">Sign in to your health dashboard</p>

          {error && <div className="alert alert-error" role="alert">⚠️ {error}</div>}

          <form onSubmit={handleSubmit} className="auth-form" id="login-form">
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div className="input-with-action">
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Your password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
                />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)} id="toggle-password">
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading} id="login-submit-btn">
              {loading ? <><span className="spinner-sm"></span> Signing in...</> : 'Sign In →'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/register" id="switch-to-register">Create one free →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
