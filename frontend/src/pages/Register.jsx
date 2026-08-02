import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Auth.css'

export default function Register() {
  const { register, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    const res = await register(form.full_name, form.email, form.password)
    if (res.success) navigate('/dashboard')
    else setError(res.error)
  }

  const strength = (pw) => {
    if (!pw) return 0
    let s = 0
    if (pw.length >= 6) s++
    if (pw.length >= 10) s++
    if (/[A-Z]/.test(pw)) s++
    if (/[0-9]/.test(pw)) s++
    if (/[^A-Za-z0-9]/.test(pw)) s++
    return s
  }
  const pw_strength = strength(form.password)
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
  const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#06b6d4']

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1"></div>
        <div className="auth-orb auth-orb-2"></div>
      </div>
      <div className="auth-container animate-fade-in-up">
        <div className="auth-card">
          <div className="auth-logo">⚕️ MediPredict</div>
          <h1>Create Account</h1>
          <p className="auth-subtitle">Start your AI health journey today — free forever</p>

          {error && <div className="alert alert-error" role="alert">⚠️ {error}</div>}

          <form onSubmit={handleSubmit} className="auth-form" id="register-form">
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">Full Name</label>
              <input id="reg-name" type="text" className="form-input" placeholder="Your full name"
                value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">Email Address</label>
              <input id="reg-email" type="email" className="form-input" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">Password</label>
              <input id="reg-password" type="password" className="form-input" placeholder="Min. 6 characters"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
              {form.password && (
                <div className="pw-strength">
                  <div className="strength-bars">
                    {[1,2,3,4,5].map(n => (
                      <div key={n} className="strength-bar" style={{ background: n <= pw_strength ? strengthColor[pw_strength] : 'var(--border-card)' }}></div>
                    ))}
                  </div>
                  <span style={{ color: strengthColor[pw_strength], fontSize: '0.75rem' }}>{strengthLabel[pw_strength]}</span>
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
              <input id="reg-confirm" type="password" className="form-input" placeholder="Repeat your password"
                value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} required />
            </div>

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading} id="register-submit-btn">
              {loading ? <><span className="spinner-sm"></span> Creating Account...</> : 'Create Free Account →'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login" id="switch-to-login">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
