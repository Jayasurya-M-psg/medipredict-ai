import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { authAPI } from '../services/api'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({
    full_name:   user?.full_name   || '',
    age:         user?.age         || '',
    gender:      user?.gender      || '',
    blood_group: user?.blood_group || '',
    phone:       user?.phone       || '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError]   = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setSuccess(''); setError('')
    try {
      const r = await authAPI.updateProfile(form)
      updateUser(r.data.user)
      setSuccess('Profile updated successfully!')
    } catch (err) {
      setError(err.response?.data?.detail || 'Update failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ paddingTop: 88, minHeight: '100vh' }}>
      <div className="page-container" style={{ maxWidth: 600, paddingTop: 40 }}>
        <div className="page-header" style={{ textAlign: 'left', padding: '0 0 32px' }}>
          <h1 style={{ fontSize: '2rem' }}>👤 My Profile</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your personal health information</p>
        </div>

        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '2rem', fontWeight: 700, color: 'white',
            border: '3px solid rgba(99,102,241,0.4)'
          }}>
            {user?.full_name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{user?.full_name}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{user?.email}</div>
            <span className={`badge ${user?.role === 'admin' ? 'badge-warning' : 'badge-primary'}`} style={{ marginTop: 6 }}>
              {user?.role === 'admin' ? '⭐ Admin' : '👤 User'}
            </span>
          </div>
        </div>

        {success && <div className="alert alert-success" style={{ marginBottom: 20 }}>✅ {success}</div>}
        {error   && <div className="alert alert-error"   style={{ marginBottom: 20 }}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit} id="profile-form" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="glass-card" style={{ padding: 28 }}>
            <h3 style={{ fontSize: '1rem', marginBottom: 20, color: 'var(--text-secondary)' }}>PERSONAL INFORMATION</h3>
            <div className="grid-2" style={{ gap: 16 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="prof-name">Full Name</label>
                <input id="prof-name" type="text" className="form-input" value={form.full_name}
                  onChange={e => setForm({ ...form, full_name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="prof-phone">Phone</label>
                <input id="prof-phone" type="tel" className="form-input" placeholder="+91 XXXXXXXXXX" value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="prof-age">Age</label>
                <input id="prof-age" type="number" className="form-input" min={1} max={120} value={form.age}
                  onChange={e => setForm({ ...form, age: parseInt(e.target.value) || '' })} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="prof-gender">Gender</label>
                <select id="prof-gender" className="form-input" value={form.gender}
                  onChange={e => setForm({ ...form, gender: e.target.value })}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="prof-bg">Blood Group</label>
                <select id="prof-bg" className="form-input" value={form.blood_group}
                  onChange={e => setForm({ ...form, blood_group: e.target.value })}>
                  <option value="">Select</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg}>{bg}</option>)}
                </select>
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" id="save-profile-btn" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: 14 }}>
            {loading ? 'Saving...' : '💾 Save Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}
