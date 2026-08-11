import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import './Navbar.css'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location])

  const handleLogout = () => { logout(); navigate('/') }
  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link'

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">⚕️</span>
          <span className="logo-text">Medi<span className="logo-accent">Predict</span></span>
          <span className="logo-badge">AI</span>
        </Link>

        {/* Desktop Nav */}
        <div className="nav-links">
          <Link to="/" className={isActive('/')}>Home</Link>
          {user && <>
            <Link to="/predict"      className={isActive('/predict')}>Predict</Link>
            <Link to="/dashboard"    className={isActive('/dashboard')}>Dashboard</Link>
            <Link to="/bmi"          className={isActive('/bmi')}>BMI</Link>
            <Link to="/hospitals"    className={isActive('/hospitals')}>Hospitals</Link>
            <Link to="/appointments" className={isActive('/appointments')}>Appointments</Link>
            <Link to="/medicine"     className={isActive('/medicine')}>Medicine</Link>
            {isAdmin && <Link to="/admin" className={isActive('/admin')}>Admin</Link>}
          </>}
        </div>

        <div className="nav-actions">
          {user ? (
            <div className="nav-user">
              <Link to="/profile" className="user-avatar" title="Profile">
                {user.full_name?.[0]?.toUpperCase() || '?'}
              </Link>
              <span className="user-name">{user.full_name?.split(' ')[0]}</span>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout} id="logout-btn">Logout</button>
            </div>
          ) : (
            <div className="nav-auth">
              <Link to="/login" className="btn btn-secondary btn-sm" id="login-nav-btn">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm" id="register-nav-btn">Get Started</Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} id="hamburger-btn" aria-label="Menu">
          <span className={menuOpen ? 'open' : ''}></span>
          <span className={menuOpen ? 'open' : ''}></span>
          <span className={menuOpen ? 'open' : ''}></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <Link to="/" className="mobile-link">🏠 Home</Link>
        {user && <>
          <Link to="/predict"      className="mobile-link">🔬 Predict</Link>
          <Link to="/dashboard"    className="mobile-link">📊 Dashboard</Link>
          <Link to="/bmi"          className="mobile-link">⚖️ BMI Calculator</Link>
          <Link to="/hospitals"    className="mobile-link">🏥 Nearby Hospitals</Link>
          <Link to="/appointments" className="mobile-link">🩺 Doctor Appointments</Link>
          <Link to="/medicine"     className="mobile-link">💊 Medicine Info</Link>
          <Link to="/profile"      className="mobile-link">👤 Profile</Link>
          {isAdmin && <Link to="/admin" className="mobile-link">⚙️ Admin</Link>}
          <button className="mobile-link logout-mobile" onClick={handleLogout}>🚪 Logout</button>
        </>}
        {!user && <>
          <Link to="/login"    className="mobile-link">Login</Link>
          <Link to="/register" className="mobile-link">Get Started</Link>
        </>}
      </div>
    </nav>
  )
}
