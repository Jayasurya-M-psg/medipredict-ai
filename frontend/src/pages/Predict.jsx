import { useState, useEffect } from 'react'
import { predictAPI } from '../services/api'
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'
import './Predict.css'

const TABS = [
  { id: 'disease',  label: '🔬 Disease Checker', desc: 'Select symptoms' },
  { id: 'diabetes', label: '💉 Diabetes Risk',   desc: 'Enter vitals' },
  { id: 'heart',    label: '❤️ Heart Risk',       desc: 'Cardiac assessment' },
]

/* ── Disease Tab ──────────────────────────────────────────────────────────── */
function DiseaseTab() {
  const [symptoms, setSymptoms] = useState([])
  const [selected, setSelected] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    predictAPI.getSymptoms().then(r => setSymptoms(r.data.symptoms)).catch(() => {})
  }, [])

  const filtered = symptoms.filter(s =>
    s.replace(/_/g, ' ').toLowerCase().includes(search.toLowerCase())
  )
  const toggle = (s) => setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const predict = async () => {
    if (selected.length === 0) { setError('Please select at least one symptom'); return }
    setLoading(true); setError(''); setResult(null)
    try {
      const r = await predictAPI.predictDisease({ symptoms: selected })
      setResult(r.data.data)
    } catch (e) {
      setError(e.response?.data?.detail || 'Prediction failed. Please try again.')
    } finally { setLoading(false) }
  }

  const confidenceColor = (c) => c >= 60 ? '#10b981' : c >= 35 ? '#f59e0b' : '#ef4444'

  return (
    <div className="predict-tab">
      <div className="tab-layout">
        <div className="symptom-panel">
          <div className="panel-header">
            <h3>Select Symptoms</h3>
            <span className="badge badge-primary">{selected.length} selected</span>
          </div>
          <input
            type="text"
            className="form-input symptom-search"
            placeholder="🔍 Search symptoms..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            id="symptom-search"
          />
          <div className="symptom-grid">
            {filtered.map(s => (
              <button
                key={s}
                id={`symptom-${s}`}
                className={`symptom-chip ${selected.includes(s) ? 'active' : ''}`}
                onClick={() => toggle(s)}
              >
                {s.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="result-panel">
          {selected.length > 0 && (
            <div className="selected-list">
              <p className="selected-label">Selected Symptoms:</p>
              <div className="selected-chips">
                {selected.map(s => (
                  <span key={s} className="selected-chip">
                    {s.replace(/_/g, ' ')}
                    <button onClick={() => toggle(s)} className="remove-chip">✕</button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {error && <div className="alert alert-error">⚠️ {error}</div>}

          <button
            id="predict-disease-btn"
            className="btn btn-primary predict-btn"
            onClick={predict}
            disabled={loading || selected.length === 0}
          >
            {loading ? <><span className="spinner-sm"></span> Analyzing...</> : '🔬 Predict Disease'}
          </button>

          {result && (
            <div className="result-cards animate-fade-in-up">
              <h3 className="result-title">🎯 Prediction Results</h3>
              {result.predictions.map((pred, i) => (
                <div key={i} className={`result-card ${i === 0 ? 'primary-result' : ''}`} id={`result-${i}`}>
                  <div className="result-header">
                    <div>
                      <div className="disease-name">{pred.disease}</div>
                      {i === 0 && <span className="badge badge-primary">Top Match</span>}
                    </div>
                    <div className="confidence-badge" style={{ color: confidenceColor(pred.confidence) }}>
                      {pred.confidence}%
                    </div>
                  </div>
                  <div className="confidence-bar-outer">
                    <div className="confidence-bar-inner" style={{
                      width: `${pred.confidence}%`,
                      background: confidenceColor(pred.confidence)
                    }}></div>
                  </div>
                  <div className="result-meta">
                    <span>👨‍⚕️ {pred.specialist}</span>
                  </div>
                  {i === 0 && pred.description && (
                    <p className="result-desc">{pred.description}</p>
                  )}
                </div>
              ))}
              <div className="alert alert-info" style={{ marginTop: 16 }}>
                ⚠️ This is an AI prediction for educational purposes only. Please consult a healthcare professional.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Diabetes Tab ─────────────────────────────────────────────────────────── */
function DiabetesTab() {
  const [form, setForm] = useState({ pregnancies:0, glucose:120, blood_pressure:70, skin_thickness:20, insulin:80, bmi:25, diabetes_pedigree:0.5, age:30 })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const fields = [
    { key: 'pregnancies', label: 'Pregnancies', min: 0, max: 20, step: 1, unit: 'times', tip: 'Number of times pregnant (0 for males)' },
    { key: 'glucose', label: 'Glucose Level', min: 44, max: 200, step: 1, unit: 'mg/dL', tip: 'Plasma glucose concentration (fasting)' },
    { key: 'blood_pressure', label: 'Blood Pressure', min: 40, max: 130, step: 1, unit: 'mm Hg', tip: 'Diastolic blood pressure' },
    { key: 'skin_thickness', label: 'Skin Thickness', min: 7, max: 60, step: 1, unit: 'mm', tip: 'Triceps skin fold thickness' },
    { key: 'insulin', label: 'Insulin Level', min: 14, max: 850, step: 1, unit: 'µU/mL', tip: '2-hour serum insulin' },
    { key: 'bmi', label: 'BMI', min: 10, max: 70, step: 0.1, unit: 'kg/m²', tip: 'Body Mass Index' },
    { key: 'diabetes_pedigree', label: 'Diabetes Pedigree', min: 0.07, max: 2.5, step: 0.01, unit: '', tip: 'Diabetes family history score' },
    { key: 'age', label: 'Age', min: 1, max: 120, step: 1, unit: 'years', tip: 'Your age' },
  ]

  const submit = async (e) => {
    e.preventDefault(); setError(''); setResult(null); setLoading(true)
    try {
      const r = await predictAPI.predictDiabetes({ ...form, bmi: parseFloat(form.bmi), diabetes_pedigree: parseFloat(form.diabetes_pedigree) })
      setResult(r.data.data)
    } catch (err) { setError(err.response?.data?.detail || 'Prediction failed') }
    finally { setLoading(false) }
  }

  const riskColor = { Low: '#10b981', Moderate: '#f59e0b', High: '#f97316', 'Very High': '#ef4444' }

  return (
    <div className="predict-tab">
      <div className="tab-layout">
        <div className="vitals-panel">
          <h3>Enter Health Vitals</h3>
          <form onSubmit={submit} id="diabetes-form" className="vitals-form">
            <div className="vitals-grid">
              {fields.map(f => (
                <div key={f.key} className="form-group">
                  <label className="form-label" htmlFor={`diab-${f.key}`} title={f.tip}>
                    {f.label} {f.unit && <span className="unit-label">({f.unit})</span>}
                  </label>
                  <input
                    id={`diab-${f.key}`}
                    type="number"
                    className="form-input"
                    min={f.min} max={f.max} step={f.step}
                    value={form[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
              ))}
            </div>
            {error && <div className="alert alert-error">⚠️ {error}</div>}
            <button type="submit" id="predict-diabetes-btn" className="btn btn-primary predict-btn" disabled={loading}>
              {loading ? <><span className="spinner-sm"></span> Analyzing...</> : '💉 Assess Diabetes Risk'}
            </button>
          </form>
        </div>

        <div className="result-panel">
          {result && (
            <div className="risk-result animate-fade-in-up" id="diabetes-result">
              <h3 className="result-title">💉 Diabetes Risk Assessment</h3>
              <div className="risk-gauge">
                <div className="gauge-circle" style={{ '--risk-color': riskColor[result.risk_level] }}>
                  <span className="gauge-value">{result.risk_score}%</span>
                  <span className="gauge-label">Risk Score</span>
                </div>
                <div className="risk-level-badge" style={{ color: riskColor[result.risk_level], background: `${riskColor[result.risk_level]}15`, border: `1px solid ${riskColor[result.risk_level]}40` }}>
                  {result.risk_level} Risk
                </div>
              </div>

              {result.risk_factors.length > 0 && (
                <div className="risk-factors">
                  <h4>⚠️ Risk Factors Detected</h4>
                  {result.risk_factors.map((rf, i) => (
                    <div key={i} className="risk-factor-item">🔴 {rf}</div>
                  ))}
                </div>
              )}

              <div className="recommendations">
                <h4>✅ Recommendations</h4>
                {result.recommendations.map((r, i) => (
                  <div key={i} className="recommendation-item">• {r}</div>
                ))}
              </div>
            </div>
          )}
          {!result && <div className="empty-result">
            <div className="empty-icon">💉</div>
            <p>Enter your vitals to get an instant diabetes risk assessment</p>
          </div>}
        </div>
      </div>
    </div>
  )
}

/* ── Heart Tab ────────────────────────────────────────────────────────────── */
function HeartTab() {
  const [form, setForm] = useState({ age:45, sex:1, chest_pain_type:0, resting_bp:120, cholesterol:200, fasting_blood_sugar:0, resting_ecg:0, max_heart_rate:150, exercise_angina:0, oldpeak:0, slope:1, ca:0, thal:2 })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const fields = [
    { key: 'age', label: 'Age', type: 'number', min: 1, max: 120, step: 1 },
    { key: 'sex', label: 'Sex', type: 'select', options: [{v:1,l:'Male'},{v:0,l:'Female'}] },
    { key: 'chest_pain_type', label: 'Chest Pain Type', type: 'select', options: [{v:0,l:'Asymptomatic'},{v:1,l:'Atypical Angina'},{v:2,l:'Non-anginal Pain'},{v:3,l:'Typical Angina'}] },
    { key: 'resting_bp', label: 'Resting Blood Pressure (mm Hg)', type: 'number', min: 80, max: 250, step: 1 },
    { key: 'cholesterol', label: 'Cholesterol (mg/dL)', type: 'number', min: 100, max: 600, step: 1 },
    { key: 'fasting_blood_sugar', label: 'Fasting Blood Sugar > 120 mg/dL', type: 'select', options: [{v:0,l:'No'},{v:1,l:'Yes'}] },
    { key: 'resting_ecg', label: 'Resting ECG', type: 'select', options: [{v:0,l:'Normal'},{v:1,l:'ST-T Abnormality'},{v:2,l:'Left Ventricular Hypertrophy'}] },
    { key: 'max_heart_rate', label: 'Max Heart Rate Achieved', type: 'number', min: 50, max: 250, step: 1 },
    { key: 'exercise_angina', label: 'Exercise Induced Angina', type: 'select', options: [{v:0,l:'No'},{v:1,l:'Yes'}] },
    { key: 'oldpeak', label: 'ST Depression (Oldpeak)', type: 'number', min: 0, max: 7, step: 0.1 },
  ]

  const submit = async (e) => {
    e.preventDefault(); setError(''); setResult(null); setLoading(true)
    try {
      const r = await predictAPI.predictHeart({ ...form, oldpeak: parseFloat(form.oldpeak) })
      setResult(r.data.data)
    } catch (err) { setError(err.response?.data?.detail || 'Prediction failed') }
    finally { setLoading(false) }
  }

  const riskColor = { Low: '#10b981', Moderate: '#f59e0b', High: '#f97316', 'Very High': '#ef4444' }

  return (
    <div className="predict-tab">
      <div className="tab-layout">
        <div className="vitals-panel">
          <h3>Cardiac Assessment</h3>
          <form onSubmit={submit} id="heart-form" className="vitals-form">
            <div className="vitals-grid">
              {fields.map(f => (
                <div key={f.key} className="form-group">
                  <label className="form-label" htmlFor={`heart-${f.key}`}>{f.label}</label>
                  {f.type === 'select' ? (
                    <select
                      id={`heart-${f.key}`}
                      className="form-input"
                      value={form[f.key]}
                      onChange={e => setForm({ ...form, [f.key]: parseInt(e.target.value) })}
                    >
                      {f.options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                    </select>
                  ) : (
                    <input
                      id={`heart-${f.key}`}
                      type="number"
                      className="form-input"
                      min={f.min} max={f.max} step={f.step}
                      value={form[f.key]}
                      onChange={e => setForm({ ...form, [f.key]: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  )}
                </div>
              ))}
            </div>
            {error && <div className="alert alert-error">⚠️ {error}</div>}
            <button type="submit" id="predict-heart-btn" className="btn btn-primary predict-btn" disabled={loading}>
              {loading ? <><span className="spinner-sm"></span> Analyzing...</> : '❤️ Assess Heart Risk'}
            </button>
          </form>
        </div>

        <div className="result-panel">
          {result && (
            <div className="risk-result animate-fade-in-up" id="heart-result">
              <h3 className="result-title">❤️ Heart Disease Risk Assessment</h3>
              <div className="risk-gauge">
                <div className="gauge-circle" style={{ '--risk-color': riskColor[result.risk_level] }}>
                  <span className="gauge-value">{result.risk_score}%</span>
                  <span className="gauge-label">Risk Score</span>
                </div>
                <div className="risk-level-badge" style={{ color: riskColor[result.risk_level], background: `${riskColor[result.risk_level]}15`, border: `1px solid ${riskColor[result.risk_level]}40` }}>
                  {result.risk_level} Risk
                </div>
              </div>

              {result.risk_factors.length > 0 && (
                <div className="risk-factors">
                  <h4>⚠️ Risk Factors Detected</h4>
                  {result.risk_factors.map((rf, i) => <div key={i} className="risk-factor-item">🔴 {rf}</div>)}
                </div>
              )}
              <div className="recommendations">
                <h4>✅ Recommendations</h4>
                {result.recommendations.map((r, i) => <div key={i} className="recommendation-item">• {r}</div>)}
              </div>
            </div>
          )}
          {!result && <div className="empty-result">
            <div className="empty-icon">❤️</div>
            <p>Fill in the cardiac assessment form to get your heart disease risk score</p>
          </div>}
        </div>
      </div>
    </div>
  )
}

/* ── Main Predict Page ────────────────────────────────────────────────────── */
export default function Predict() {
  const [activeTab, setActiveTab] = useState('disease')
  return (
    <div className="predict-page">
      <div className="page-container">
        <div className="page-header">
          <h1>AI Health Predictor</h1>
          <p>Use our trained ML models to assess disease likelihood and health risks</p>
        </div>

        <div className="predict-tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              className={`predict-tab-btn ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              <span className="tab-label">{t.label}</span>
              <span className="tab-desc">{t.desc}</span>
            </button>
          ))}
        </div>

        <div className="predict-content">
          {activeTab === 'disease'  && <DiseaseTab />}
          {activeTab === 'diabetes' && <DiabetesTab />}
          {activeTab === 'heart'    && <HeartTab />}
        </div>
      </div>
    </div>
  )
}
