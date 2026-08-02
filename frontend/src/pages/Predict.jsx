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
                    <div className="result-content">
                      <p className="result-desc">{pred.description}</p>
                      {pred.recommendations && (
                        <div className="result-recommendations">
                          <h4>Recommended Steps:</h4>
                          <ul>{pred.recommendations.map((rec, j) => <li key={j}>{rec}</li>)}</ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Disease Guide for Top Match */}
              <DiseaseGuideCard disease={result.predictions[0]?.disease} />

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

/* ── Disease Guide Data ───────────────────────────────────────────────────── */
const DISEASE_GUIDE = {
  'GERD': {
    first: ['Avoid eating for 2–3 hours before lying down', 'Sit upright and sip warm water slowly', 'Take an antacid (e.g., Gelusil, Digene) if available'],
    recommendations: ['Eat smaller meals more frequently', 'Avoid spicy, oily, and acidic foods', 'Elevate head of bed by 6–8 inches', 'Avoid coffee, alcohol, and carbonated drinks'],
    avoid: ['Lying down immediately after meals', 'Tight clothing around waist', 'Smoking and alcohol'],
    seeDoctor: 'If symptoms persist more than 2 weeks or you have difficulty swallowing'
  },
  'Diabetes': {
    first: ['Check blood sugar if glucometer is available', 'Drink water (not sugary drinks)', 'If dizzy or weak, eat a small piece of sugar immediately'],
    recommendations: ['Follow a low-sugar, low-carb diet', 'Exercise 30 minutes daily (walking is fine)', 'Monitor blood sugar regularly', 'Take prescribed medications consistently'],
    avoid: ['Sugary foods, white rice, white bread', 'Skipping meals', 'Sedentary lifestyle'],
    seeDoctor: 'Immediately if blood sugar is very high/low, or you feel confused or unconscious'
  },
  'Hypertension': {
    first: ['Sit calmly and rest for 10 minutes', 'Avoid caffeine immediately', 'Take prescribed BP medication if available'],
    recommendations: ['Reduce salt intake to less than 5g/day', 'Exercise regularly — 30 min/day', 'Practice meditation or deep breathing daily', 'Monitor BP every morning'],
    avoid: ['Salty foods, pickles, processed food', 'Stress, smoking, and alcohol', 'Caffeine in large amounts'],
    seeDoctor: 'If BP reading is above 180/120 or you have headache, chest pain, or vision changes'
  },
  'Common Cold': {
    first: ['Rest completely and drink warm water or soup', 'Take paracetamol for fever or body ache', 'Gargle with warm salt water for throat pain'],
    recommendations: ['Drink 8–10 glasses of warm fluids daily', 'Take steam inhalation twice daily', 'Eat Vitamin C rich foods (orange, lemon, amla)', 'Get 8+ hours of sleep'],
    avoid: ['Cold drinks and ice cream', 'Going out in cold or rainy weather', 'Touching face with unwashed hands'],
    seeDoctor: 'If fever exceeds 103°F, breathing is difficult, or symptoms worsen after 7 days'
  },
  'Pneumonia': {
    first: ['Seek medical attention immediately — do not delay', 'Rest completely and avoid all exertion', 'Note breathing rate and temperature'],
    recommendations: ['Complete the full course of prescribed antibiotics', 'Stay well hydrated', 'Do breathing exercises as advised by doctor', 'Rest at home for full recovery'],
    avoid: ['Smoking and secondhand smoke', 'Cold environments', 'Stopping antibiotics midway'],
    seeDoctor: '🚨 IMMEDIATELY — Pneumonia is serious. Go to hospital if breathing is difficult'
  },
  'Tuberculosis': {
    first: ['Cover mouth when coughing (use tissue, then dispose)', 'Temporarily isolate from others', 'Go to hospital today for sputum test'],
    recommendations: ['Take the full 6-month DOTS treatment — never skip', 'Eat a nutritious, protein-rich diet', 'Sleep in a well-ventilated room', 'Inform close contacts to get tested'],
    avoid: ['Stopping TB medication before completion', 'Sharing utensils or close contact with others', 'Alcohol (reduces medication effectiveness)'],
    seeDoctor: 'Today — TB requires professional diagnosis and a structured treatment plan'
  },
  'Malaria': {
    first: ['Go to hospital immediately for blood smear test', 'Take paracetamol ONLY for fever (not aspirin)', 'Stay hydrated with ORS or water'],
    recommendations: ['Complete the full course of anti-malarial drugs', 'Rest completely at home', 'Use mosquito nets and insect repellent', 'Stay in screened or air-conditioned rooms'],
    avoid: ['Aspirin or ibuprofen (can cause dangerous bleeding)', 'Skipping any anti-malarial doses', 'Outdoor activity at dusk or dawn'],
    seeDoctor: '🚨 IMMEDIATELY — Malaria can become life-threatening within hours'
  },
  'Dengue': {
    first: ['Go to hospital for platelet count test immediately', 'Drink ORS, coconut water, or papaya leaf juice', 'Take paracetamol ONLY for fever — NO ibuprofen or aspirin'],
    recommendations: ['Rest completely — avoid all physical exertion', 'Monitor platelet count daily', 'Drink at least 3 litres of fluids daily', 'Eat soft, easily digestible foods'],
    avoid: ['Ibuprofen, aspirin, or any blood thinners', 'Mosquito bites — wear full-cover clothing', 'Physical activity of any kind'],
    seeDoctor: 'Immediately — hospitalisation needed if platelets drop below 1 lakh'
  },
  'Typhoid': {
    first: ['Go to hospital for Widal test or blood culture today', 'Drink boiled water only — no raw food', 'Take paracetamol for fever control'],
    recommendations: ['Take prescribed antibiotics for the full duration', 'Eat soft bland diet: khichdi, dal, soup, bread', 'Strict hand hygiene before eating', 'Rest completely for at least 2 weeks'],
    avoid: ['Raw food, street food, unboiled water', 'Sharing food or utensils', 'Stopping antibiotics before completing the course'],
    seeDoctor: 'Today — blood tests needed to confirm and start antibiotics quickly'
  },
  'Jaundice': {
    first: ['Stop all alcohol consumption immediately', 'Increase fluid intake (water, coconut water)', 'Avoid all fatty or heavy food right now'],
    recommendations: ['Eat a light diet: fruits, boiled vegetables, low-fat food', 'Rest completely', 'Drink plenty of fluids throughout the day', 'Take liver supplements as prescribed by doctor'],
    avoid: ['Alcohol completely — even small amounts damage liver', 'Oily, spicy, or fried foods', 'Self-medication — many drugs are toxic to a stressed liver'],
    seeDoctor: 'Today — jaundice indicates liver trouble and needs blood tests (bilirubin, LFT)'
  },
  'Chicken Pox': {
    first: ['Isolate immediately — highly contagious for 5–7 days', 'Apply calamine lotion on blisters to reduce itching', 'Take paracetamol for fever — NO aspirin'],
    recommendations: ['Cut nails short to prevent scratching and scarring', 'Wear loose, soft cotton clothing', 'Take antihistamines for itching as prescribed', 'Eat soft cooling foods'],
    avoid: ['Scratching blisters — causes infection and permanent scars', 'Aspirin (causes dangerous Reye syndrome in children)', 'Contact with pregnant women, newborns, or elderly'],
    seeDoctor: 'If blisters are infected (red, warm, pus), fever is very high, or breathing is affected'
  },
  'Allergy': {
    first: ['Remove yourself from the allergen source immediately', 'Take an antihistamine (e.g., Cetirizine 10mg)', 'Apply cold compress to itchy skin areas'],
    recommendations: ['Identify and strictly avoid your specific triggers', 'Keep antihistamines with you at all times', 'Consider allergy testing to identify exact triggers', 'Wear a medical alert bracelet for severe allergies'],
    avoid: ['Known allergens — food, dust, pollen, animals, etc.', 'Rubbing or scratching allergic skin areas', 'Ignoring severe reactions (anaphylaxis is life-threatening)'],
    seeDoctor: '🚨 IMMEDIATELY if throat swells, difficulty breathing, or swallowing (anaphylaxis emergency)'
  },
  'Migraine': {
    first: ['Move to a dark, quiet room immediately', 'Apply cold compress to forehead and neck', 'Take prescribed migraine medication early — earlier is more effective'],
    recommendations: ['Maintain a regular sleep and meal schedule', 'Stay well hydrated throughout the day', 'Keep a migraine diary to identify personal triggers', 'Practice stress management (yoga, meditation)'],
    avoid: ['Bright lights and loud sounds during attack', 'Skipping meals or fasting', 'Alcohol, caffeine, processed cheese, and MSG', 'Irregular sleep patterns'],
    seeDoctor: 'If this is the worst headache of your life, starts suddenly, or comes with fever/stiff neck'
  },
  'Arthritis': {
    first: ['Rest the painful joint completely', 'Apply warm compress for stiffness or cold pack for swelling', 'Take prescribed pain relief medication with food'],
    recommendations: ['Do low-impact exercises: swimming, walking, yoga', 'Maintain a healthy body weight to reduce joint stress', 'Use warm water soaks in the morning for stiffness', 'Eat anti-inflammatory foods (fish, walnuts, turmeric)'],
    avoid: ['High-impact activities like running or jumping on hard surfaces', 'Prolonged sitting or standing in one position', 'Smoking — worsens inflammation', 'Processed, sugary, and fried foods'],
    seeDoctor: 'If joints are severely swollen, very painful, or morning stiffness lasts over 1 hour'
  },
  'Urinary Tract Infection': {
    first: ['Drink 2–3 large glasses of water immediately', 'Urinate frequently — never hold it in', 'Start prescribed antibiotics if already available'],
    recommendations: ['Drink 8–10 glasses of water daily to flush bacteria', 'Urinate after sexual activity', 'Wipe front to back (for women)', 'Take the full antibiotic course without stopping'],
    avoid: ['Holding urine for long periods', 'Perfumed soaps or sprays in the genital area', 'Tight synthetic underwear', 'Caffeine and alcohol which irritate the bladder'],
    seeDoctor: 'Today — UTI spreads to kidneys if untreated. Go urgently if you have back pain or high fever'
  },
  'Heart Attack': {
    first: ['📞 CALL 108 / 112 IMMEDIATELY', 'Chew one aspirin (325mg) if not allergic and available', 'Sit or lie in comfortable position — do NOT walk around', 'Loosen all tight clothing around chest and neck'],
    recommendations: ['After treatment: follow cardiac rehabilitation program fully', 'Take all prescribed cardiac medications every day', 'Follow a heart-healthy diet: low fat, low salt, high fiber', 'Light exercise only as specifically advised by cardiologist'],
    avoid: ['Any physical exertion or stress', 'Smoking and alcohol completely', 'Salty, fatty, and processed foods', 'Skipping any cardiac medications'],
    seeDoctor: '🚨 CALL 108 NOW — Heart attack is a life-threatening emergency. Every minute counts'
  },
  'Gastroenteritis': {
    first: ['Start ORS (Oral Rehydration Solution) immediately in small sips', 'Rest completely and avoid any food for 2 hours if vomiting', 'After 2 hours, try BRAT diet: Banana, Rice, Apple, Toast'],
    recommendations: ['Drink small sips of ORS or electrolyte solution frequently', 'Gradually reintroduce bland, easily digestible foods', 'Wash hands thoroughly before eating and after using toilet', 'Avoid dairy products for 2–3 days'],
    avoid: ['Spicy, oily, and dairy foods during recovery', 'Raw food and street food', 'Caffeine and alcohol', 'Anti-diarrhea medicine in first 24 hours (body is expelling germs)'],
    seeDoctor: 'If vomiting or diarrhea persists more than 2 days, blood in stool, or signs of dehydration'
  },
  'Peptic Ulcer Disease': {
    first: ['Eat something mild immediately: banana, plain rice, or bread', 'Take an antacid if available', 'Avoid ALL painkillers — ibuprofen and aspirin severely worsen ulcers'],
    recommendations: ['Eat small, frequent meals every 3–4 hours — never skip', 'Take prescribed PPI medication (Omeprazole) before meals', 'Get tested and treated for H. pylori infection', 'Manage stress through relaxation techniques'],
    avoid: ['NSAIDs, aspirin, and ibuprofen completely', 'Alcohol and smoking', 'Spicy food, coffee, tea, and citrus fruits', 'Skipping or delaying meals'],
    seeDoctor: '🚨 Immediately if you see blood in vomit or black/tarry stool — this is an emergency'
  },
}

const DEFAULT_GUIDE = {
  first: ['Rest and avoid any strenuous activity', 'Stay hydrated — drink plenty of clean water', 'Monitor your symptoms and note any changes or worsening'],
  recommendations: ['Consult a qualified doctor for proper diagnosis and treatment', 'Take all prescribed medications as directed', 'Maintain a balanced diet and get adequate sleep', 'Avoid self-medication without medical supervision'],
  avoid: ['Ignoring worsening symptoms', 'Self-diagnosing without professional medical confirmation', 'Stopping medications before completing the course'],
  seeDoctor: 'Schedule a doctor appointment as soon as possible for accurate diagnosis and proper treatment'
}

function DiseaseGuideCard({ disease }) {
  const guide = DISEASE_GUIDE[disease] || DEFAULT_GUIDE
  return (
    <div className="disease-guide-card animate-fade-in-up">
      <div className="guide-header">
        <span className="guide-icon">📋</span>
        <h4>What To Do — <span className="guide-disease-name">{disease}</span></h4>
      </div>

      <div className="guide-section guide-first">
        <div className="guide-section-title">🚨 Do This First (Immediate Steps)</div>
        <ul className="guide-list">
          {guide.first.map((item, i) => <li key={i}><span className="guide-num">{i+1}</span>{item}</li>)}
        </ul>
      </div>

      <div className="guide-section guide-rec">
        <div className="guide-section-title">✅ Recommendations</div>
        <ul className="guide-list">
          {guide.recommendations.map((item, i) => <li key={i}><span className="guide-dot">•</span>{item}</li>)}
        </ul>
      </div>

      <div className="guide-section guide-avoid">
        <div className="guide-section-title">🚫 What To Avoid</div>
        <ul className="guide-list">
          {guide.avoid.map((item, i) => <li key={i}><span className="guide-cross">✗</span>{item}</li>)}
        </ul>
      </div>

      <div className="guide-doctor">
        <span className="guide-doctor-icon">👨‍⚕️</span>
        <div>
          <div className="guide-doctor-label">When To See A Doctor</div>
          <div className="guide-doctor-text">{guide.seeDoctor}</div>
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
