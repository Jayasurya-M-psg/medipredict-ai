import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { healthAPI } from '../services/api'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import './Dashboard.css'

const PIE_COLORS = ['#6366f1', '#06b6d4', '#ef4444']
const riskColor = { Low: '#10b981', Moderate: '#f59e0b', High: '#f97316', 'Very High': '#ef4444' }

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function PredictionCard({ record, index }) {
  const type = record.prediction_type
  const icons = { disease: '🔬', diabetes: '💉', heart: '❤️' }
  const labels = { disease: 'Disease Check', diabetes: 'Diabetes Risk', heart: 'Heart Risk' }

  let summary = ''
  let riskLevel = ''
  if (type === 'disease') {
    const top = record.result?.predictions?.[0]
    summary = top ? `${top.disease} (${top.confidence}%)` : 'N/A'
  } else {
    summary = `Risk Score: ${record.result?.risk_score}%`
    riskLevel = record.result?.risk_level
  }

  return (
    <div className="history-card animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s` }} id={`history-${index}`}>
      <div className="hc-icon">{icons[type]}</div>
      <div className="hc-info">
        <div className="hc-type">{labels[type]}</div>
        <div className="hc-summary">{summary}</div>
        {riskLevel && (
          <span className="hc-risk" style={{ color: riskColor[riskLevel] }}>{riskLevel} Risk</span>
        )}
      </div>
      <div className="hc-date">{formatDate(record.created_at)}</div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([healthAPI.getStats(), healthAPI.getHistory({ limit: 20 })])
      .then(([s, h]) => { setStats(s.data); setHistory(h.data.records) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const pieData = stats ? [
    { name: 'Disease', value: stats.by_type.disease },
    { name: 'Diabetes', value: stats.by_type.diabetes },
    { name: 'Heart', value: stats.by_type.heart },
  ].filter(d => d.value > 0) : []

  if (loading) return <div className="loading-center"><div className="spinner"></div></div>

  return (
    <div className="dashboard-page">
      <div className="page-container">
        <div className="dashboard-header">
          <div>
            <h1>Health Dashboard</h1>
            <p>Welcome back, <span className="user-highlight">{user?.full_name?.split(' ')[0]}</span> 👋</p>
          </div>
          <Link to="/predict" className="btn btn-primary" id="new-prediction-btn">+ New Prediction</Link>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: 28 }}>
          {[
            { label: 'Total Predictions', value: stats?.total_predictions || 0, icon: '📊' },
            { label: 'Disease Checks',    value: stats?.by_type?.disease   || 0, icon: '🔬' },
            { label: 'Diabetes Checks',   value: stats?.by_type?.diabetes  || 0, icon: '💉' },
            { label: 'Heart Checks',      value: stats?.by_type?.heart     || 0, icon: '❤️' },
          ].map((s, i) => (
            <div key={i} className="stat-card" id={`stat-${i}`}>
              <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="dash-grid">
          {/* Prediction distribution pie */}
          <div className="dash-card">
            <h3 className="dash-card-title">📈 Prediction Distribution</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#141b2d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f0f4ff' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data-msg">No predictions yet. <Link to="/predict">Start now →</Link></div>
            )}
          </div>

          {/* Recent activity */}
          <div className="dash-card">
            <h3 className="dash-card-title">⏱️ Recent Activity</h3>
            <div className="recent-list">
              {history.length === 0 && <div className="no-data-msg">No predictions yet. <Link to="/predict">Make your first →</Link></div>}
              {history.slice(0, 6).map((r, i) => <PredictionCard key={i} record={r} index={i} />)}
            </div>
          </div>
        </div>

        {/* Full history */}
        {history.length > 0 && (
          <div className="history-section">
            <h3 className="dash-card-title">📋 Full Prediction History</h3>
            <div className="history-list">
              {history.map((r, i) => <PredictionCard key={i} record={r} index={i} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
