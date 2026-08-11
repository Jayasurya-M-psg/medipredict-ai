import { useState } from 'react'
import './Medicine.css'

const API_BASE = import.meta.env.VITE_API_URL || 'https://medipredict-ai-1-zyer.onrender.com'

const COMMON = ['Paracetamol','Ibuprofen','Aspirin','Metformin','Amlodipine','Atorvastatin','Omeprazole','Amoxicillin','Cetirizine','Azithromycin']

function Section({ icon, title, text, color }) {
  if (!text || text === 'Not available') return null
  return (
    <div className="med-section" style={{'--sc': color}}>
      <div className="med-section-title">{icon} {title}</div>
      <div className="med-section-body">{text}</div>
    </div>
  )
}

export default function Medicine() {
  const [query, setQuery]   = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState(null)
  const [error, setError]     = useState('')

  const search = async (name) => {
    const q = name || query.trim()
    if (!q) return
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch(`${API_BASE}/api/medicine?name=${encodeURIComponent(q)}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await res.json()
      if (!data.found) setError(data.error || 'Medicine not found.')
      else setResult(data)
    } catch { setError('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  const handleSubmit = (e) => { e.preventDefault(); search() }

  return (
    <div className="med-page">
      <div className="page-container">
        <div className="med-header">
          <h1>💊 Medicine Information</h1>
          <p>Search any medicine to get uses, dosage, warnings and side effects</p>
        </div>

        <div className="med-search-card">
          <form onSubmit={handleSubmit} className="med-form">
            <div className="med-input-wrap">
              <span className="med-input-icon">🔍</span>
              <input
                type="text"
                placeholder="Search medicine name... e.g. Aspirin, Metformin, Ibuprofen"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="med-input"
                id="medicine-search-input"
              />
            </div>
            <button type="submit" className="med-btn" disabled={loading}>
              {loading ? <><span className="spinner-sm"></span> Searching...</> : 'Search'}
            </button>
          </form>

          <div className="med-suggestions">
            <div className="med-suggestions-label">Common medicines:</div>
            <div className="med-chips">
              {COMMON.map(m => (
                <button key={m} className="med-chip" onClick={() => { setQuery(m); search(m) }}>{m}</button>
              ))}
            </div>
          </div>
        </div>

        {error && <div className="med-error">⚠️ {error}</div>}

        {result && (
          <div className="med-result animate-fade-in-up">
            <div className="med-result-header">
              <div className="med-result-icon">💊</div>
              <div>
                <div className="med-brand">{result.brand_name !== 'Not available' ? result.brand_name : result.generic_name}</div>
                {result.generic_name !== 'Not available' && result.generic_name !== result.brand_name && (
                  <div className="med-generic">Generic: {result.generic_name}</div>
                )}
                {result.substance !== 'Not available' && (
                  <div className="med-substance">Active: {result.substance}</div>
                )}
              </div>
            </div>

            {result.manufacturer !== 'Not available' && (
              <div className="med-manufacturer">🏭 {result.manufacturer}</div>
            )}

            <div className="med-sections">
              <Section icon="✅" title="Uses / Purpose"          text={result.purpose}          color="#10b981" />
              <Section icon="📋" title="Indications"             text={result.indications}       color="#6366f1" />
              <Section icon="💉" title="Dosage & Administration" text={result.dosage}            color="#06b6d4" />
              <Section icon="⚠️" title="Warnings"               text={result.warnings}          color="#f59e0b" />
              <Section icon="🚨" title="Side Effects"            text={result.side_effects}      color="#ef4444" />
              <Section icon="🚫" title="Contraindications"       text={result.contraindications} color="#ec4899" />
              <Section icon="💊" title="Drug Interactions"       text={result.drug_interactions} color="#8b5cf6" />
              <Section icon="📦" title="Storage"                 text={result.storage}           color="#14b8a6" />
            </div>

            <div className="med-disclaimer">
              ⚕️ This information is sourced from the US FDA database and is for informational purposes only.
              Always consult a licensed doctor or pharmacist before taking any medication.
            </div>
          </div>
        )}

        {!result && !loading && !error && (
          <div className="med-empty">
            <div className="med-empty-icon">💊</div>
            <h3>Search Any Medicine</h3>
            <p>Get real FDA-verified information about any medicine including uses, dosage, warnings, and side effects</p>
            <div className="med-features">
              <div className="med-feature">✅ Real FDA database data</div>
              <div className="med-feature">✅ Dosage & administration</div>
              <div className="med-feature">✅ Warnings & side effects</div>
              <div className="med-feature">✅ Drug interactions</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
