import { useEffect, useState } from 'react'
import { adminAPI } from '../services/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function Admin() {
  const [stats, setStats]   = useState(null)
  const [users, setUsers]   = useState([])
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    Promise.all([adminAPI.getStats(), adminAPI.getUsers(), adminAPI.recentPredictions()])
      .then(([s, u, r]) => { setStats(s.data); setUsers(u.data.users); setRecent(r.data.records) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const toggleUser = async (id) => {
    try {
      const r = await adminAPI.toggleUser(id)
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: r.data.is_active } : u))
    } catch {}
  }

  const chartData = stats ? [
    { name: 'Disease',  value: stats.predictions.disease  },
    { name: 'Diabetes', value: stats.predictions.diabetes },
    { name: 'Heart',    value: stats.predictions.heart    },
  ] : []

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>

  const TABS = ['overview', 'users', 'predictions']

  return (
    <div style={{ paddingTop: 88, minHeight: '100vh' }}>
      <div className="page-container" style={{ paddingTop: 40 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '2rem', marginBottom: 4 }}>⚙️ Admin Panel</h1>
          <p style={{ color: 'var(--text-secondary)' }}>System overview and management</p>
        </div>

        {/* Tab navigation */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          {TABS.map(t => (
            <button key={t} id={`admin-tab-${t}`}
              className={`btn ${activeTab === t ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              onClick={() => setActiveTab(t)}
              style={{ textTransform: 'capitalize' }}>
              {t}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            <div className="grid-4" style={{ marginBottom: 28 }}>
              {[
                { label: 'Total Users',    value: stats?.users.total       || 0, icon: '👥' },
                { label: 'Active Users',   value: stats?.users.active      || 0, icon: '✅' },
                { label: 'Total Preds',    value: stats?.predictions.total || 0, icon: '🧠' },
                { label: 'Disease Checks', value: stats?.predictions.disease || 0, icon: '🔬' },
              ].map((s, i) => (
                <div key={i} className="stat-card" id={`admin-stat-${i}`}>
                  <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{s.icon}</div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="glass-card" style={{ padding: 28 }}>
              <h3 style={{ marginBottom: 20, fontSize: '1rem' }}>📊 Predictions by Type</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: '#141b2d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f0f4ff' }} />
                  <Bar dataKey="value" fill="#6366f1" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="animate-fade-in">
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-card)', background: 'var(--bg-input)' }}>
                    {['Name','Email','Role','Status','Joined','Action'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} id={`user-row-${i}`} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px 16px', fontSize: '0.875rem', fontWeight: 500 }}>{u.full_name}</td>
                      <td style={{ padding: '12px 16px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className={`badge ${u.role === 'admin' ? 'badge-warning' : 'badge-primary'}`}>{u.role}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(u.created_at).toLocaleDateString('en-IN')}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          id={`toggle-user-${i}`}
                          className={`btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-secondary'}`}
                          onClick={() => toggleUser(u.id)}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'predictions' && (
          <div className="animate-fade-in">
            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ marginBottom: 16, fontSize: '1rem' }}>🕐 Recent Predictions (All Users)</h3>
              {recent.map((r, i) => (
                <div key={i} id={`recent-pred-${i}`} style={{
                  display: 'flex', gap: 12, padding: '12px 0',
                  borderBottom: '1px solid var(--border-light)', alignItems: 'center'
                }}>
                  <span style={{ fontSize: '1.2rem' }}>{r.prediction_type === 'disease' ? '🔬' : r.prediction_type === 'diabetes' ? '💉' : '❤️'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 500, textTransform: 'capitalize' }}>{r.prediction_type} Prediction</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>User: {r.user_id?.slice(0, 8)}...</div>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN') : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
