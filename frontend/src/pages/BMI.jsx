import { useState } from 'react'
import './BMI.css'

const categories = [
  { max: 18.5, label: 'Underweight', color: '#06b6d4', advice: 'You may need to gain some weight. Consult a nutritionist for a healthy diet plan.', icon: '⚠️' },
  { max: 25,   label: 'Normal',      color: '#10b981', advice: 'Great! Your weight is healthy. Keep maintaining your current lifestyle.', icon: '✅' },
  { max: 30,   label: 'Overweight',  color: '#f59e0b', advice: 'Consider a balanced diet and regular exercise to reach a healthy weight.', icon: '⚠️' },
  { max: 999,  label: 'Obese',       color: '#ef4444', advice: 'Please consult a doctor. Diet control and physical activity are important.', icon: '🚨' },
]

function getCategory(bmi) {
  return categories.find(c => bmi < c.max) || categories[3]
}

export default function BMI() {
  const [height, setHeight] = useState('')
  const [weight, setWeight] = useState('')
  const [bmi, setBmi]     = useState(null)
  const [cat, setCat]     = useState(null)

  const calculate = (e) => {
    e.preventDefault()
    const h = parseFloat(height) / 100
    const w = parseFloat(weight)
    if (!h || !w || h <= 0 || w <= 0) return
    const result = +(w / (h * h)).toFixed(1)
    setBmi(result)
    setCat(getCategory(result))
  }

  const needleAngle = bmi ? Math.min(Math.max(((bmi - 10) / 30) * 180, 0), 180) : 0

  return (
    <div className="bmi-page">
      <div className="page-container">
        <div className="bmi-header">
          <h1>⚖️ BMI Calculator</h1>
          <p>Calculate your Body Mass Index and understand your health status</p>
        </div>

        <div className="bmi-grid">
          {/* Calculator card */}
          <div className="bmi-card">
            <h3 className="bmi-card-title">Enter Your Details</h3>
            <form onSubmit={calculate} className="bmi-form">
              <div className="bmi-field">
                <label>Height (cm)</label>
                <input type="number" placeholder="e.g. 170" value={height} onChange={e => setHeight(e.target.value)} min="50" max="250" required />
              </div>
              <div className="bmi-field">
                <label>Weight (kg)</label>
                <input type="number" placeholder="e.g. 65" value={weight} onChange={e => setWeight(e.target.value)} min="10" max="300" required />
              </div>
              <button type="submit" className="bmi-btn">Calculate BMI</button>
            </form>

            {/* BMI Scale */}
            <div className="bmi-scale">
              <div className="scale-label">BMI Scale</div>
              <div className="scale-bar">
                <div className="scale-seg" style={{background:'#06b6d4',flex:1}}><span>Underweight<br/>&lt;18.5</span></div>
                <div className="scale-seg" style={{background:'#10b981',flex:1}}><span>Normal<br/>18.5–25</span></div>
                <div className="scale-seg" style={{background:'#f59e0b',flex:1}}><span>Overweight<br/>25–30</span></div>
                <div className="scale-seg" style={{background:'#ef4444',flex:1}}><span>Obese<br/>&gt;30</span></div>
              </div>
            </div>
          </div>

          {/* Result card */}
          <div className="bmi-card bmi-result-card">
            {!bmi ? (
              <div className="bmi-placeholder">
                <div className="bmi-placeholder-icon">⚖️</div>
                <p>Enter your height and weight to see your BMI result</p>
              </div>
            ) : (
              <div className="bmi-result animate-fade-in-up">
                {/* Gauge */}
                <div className="bmi-gauge">
                  <svg viewBox="0 0 200 110" className="gauge-svg">
                    <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#1e293b" strokeWidth="18" strokeLinecap="round"/>
                    <path d="M 20 100 A 80 80 0 0 1 75 28" fill="none" stroke="#06b6d4" strokeWidth="18" strokeLinecap="round"/>
                    <path d="M 75 28 A 80 80 0 0 1 125 28" fill="none" stroke="#10b981" strokeWidth="18" strokeLinecap="round"/>
                    <path d="M 125 28 A 80 80 0 0 1 165 55" fill="none" stroke="#f59e0b" strokeWidth="18" strokeLinecap="round"/>
                    <path d="M 165 55 A 80 80 0 0 1 180 100" fill="none" stroke="#ef4444" strokeWidth="18" strokeLinecap="round"/>
                    <line
                      x1="100" y1="100"
                      x2={100 + 60 * Math.cos((needleAngle - 180) * Math.PI / 180)}
                      y2={100 + 60 * Math.sin((needleAngle - 180) * Math.PI / 180)}
                      stroke="white" strokeWidth="3" strokeLinecap="round"
                    />
                    <circle cx="100" cy="100" r="6" fill="white"/>
                  </svg>
                  <div className="gauge-value" style={{ color: cat.color }}>{bmi}</div>
                  <div className="gauge-label" style={{ color: cat.color }}>{cat.icon} {cat.label}</div>
                </div>

                {/* Details */}
                <div className="bmi-details">
                  <div className="bmi-detail-row">
                    <span>Your BMI</span><strong style={{color:cat.color}}>{bmi}</strong>
                  </div>
                  <div className="bmi-detail-row">
                    <span>Category</span><strong style={{color:cat.color}}>{cat.label}</strong>
                  </div>
                  <div className="bmi-detail-row">
                    <span>Height</span><strong>{height} cm</strong>
                  </div>
                  <div className="bmi-detail-row">
                    <span>Weight</span><strong>{weight} kg</strong>
                  </div>
                </div>

                <div className="bmi-advice">
                  <div className="bmi-advice-icon">{cat.icon}</div>
                  <p>{cat.advice}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info cards */}
        <div className="bmi-info-grid">
          {categories.map((c, i) => (
            <div key={i} className={`bmi-info-card ${bmi && getCategory(bmi).label === c.label ? 'active-cat' : ''}`} style={{'--cat-color': c.color}}>
              <div className="bmi-info-range" style={{color:c.color}}>{c.label}</div>
              <div className="bmi-info-val">{i===0?'< 18.5':i===1?'18.5 – 25':i===2?'25 – 30':'> 30'}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
