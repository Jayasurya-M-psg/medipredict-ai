import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Home.css'

const features = [
  { icon: '🔬', title: 'Disease Prediction', desc: 'Select your symptoms and get instant AI-powered disease predictions with confidence scores for 41 diseases.', color: '#6366f1' },
  { icon: '💉', title: 'Diabetes Risk', desc: 'Assess your diabetes risk using vitals like glucose, BMI, and age with our XGBoost ML model.', color: '#06b6d4' },
  { icon: '❤️', title: 'Heart Disease Risk', desc: 'Evaluate cardiovascular risk factors using clinical measurements and get personalized recommendations.', color: '#ef4444' },
  { icon: '👨‍⚕️', title: 'Specialist Finder', desc: 'Get recommendations for the right medical specialist based on your predicted condition.', color: '#10b981' },
  { icon: '📊', title: 'Health Dashboard', desc: 'Track all your predictions and health trends over time with beautiful interactive charts.', color: '#f59e0b' },
  { icon: '🤖', title: 'AI Chatbot', desc: 'Get instant answers to health questions from our intelligent MediBot health assistant.', color: '#8b5cf6' },
]

const stats = [
  { value: '41', label: 'Diseases Detected', icon: '🦠' },
  { value: '132', label: 'Symptoms Analyzed', icon: '📋' },
  { value: '98%', label: 'Model Accuracy', icon: '🎯' },
  { value: '3', label: 'ML Models', icon: '🧠' },
]

const steps = [
  { num: '01', title: 'Create Account', desc: 'Sign up free and set up your health profile in under a minute.' },
  { num: '02', title: 'Enter Symptoms', desc: 'Select your symptoms from our comprehensive list of 132 medical symptoms.' },
  { num: '03', title: 'Get AI Prediction', desc: 'Our trained ML models analyze your input and predict potential diseases.' },
  { num: '04', title: 'Take Action', desc: 'View recommendations and find the right specialist for your condition.' },
]

export default function Home() {
  const { user } = useAuth()
  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero-section">
        <div className="hero-bg-orbs">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>
        <div className="page-container">
          <div className="hero-content animate-fade-in-up">
            <div className="hero-badge">
              <span className="badge badge-primary">🚀 AI-Powered Healthcare</span>
            </div>
            <h1 className="hero-title">
              Predict Diseases with<br />
              <span className="gradient-text">Artificial Intelligence</span>
            </h1>
            <p className="hero-desc">
              MediPredict AI uses advanced Machine Learning to analyze your symptoms and assess health risks. 
              Get instant predictions for 41 diseases — no waiting, no guessing.
            </p>
            <div className="hero-actions">
              {user ? (
                <Link to="/predict" className="btn btn-primary btn-lg" id="hero-predict-btn">
                  🔬 Start Predicting
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg" id="hero-start-btn">Get Started Free</Link>
                  <Link to="/login" className="btn btn-secondary btn-lg" id="hero-login-btn">Sign In</Link>
                </>
              )}
            </div>
            <div className="hero-trust">
              <span>🔒 Private & Secure</span>
              <span>⚡ Instant Results</span>
              <span>🧠 3 ML Models</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="page-container">
          <div className="stats-grid">
            {stats.map((s, i) => (
              <div key={i} className="stat-card animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="page-container">
          <div className="section-header">
            <h2>Everything You Need for <span className="gradient-text">Health Intelligence</span></h2>
            <p>Comprehensive AI-powered tools to help you understand and monitor your health.</p>
          </div>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card glass-card animate-fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="feature-icon" style={{ background: `${f.color}22`, color: f.color }}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-section">
        <div className="page-container">
          <div className="section-header">
            <h2>How <span className="gradient-text">MediPredict</span> Works</h2>
            <p>Get your health prediction in 4 simple steps</p>
          </div>
          <div className="steps-grid">
            {steps.map((s, i) => (
              <div key={i} className="step-card animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="step-num">{s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="page-container">
          <div className="cta-card glass-card">
            <div className="cta-orb"></div>
            <h2>Ready to Know Your <span className="gradient-text">Health Risk?</span></h2>
            <p>Join thousands of users using AI to stay ahead of health issues.</p>
            {user ? (
              <Link to="/predict" className="btn btn-primary btn-lg" id="cta-predict-btn">Start Prediction Now →</Link>
            ) : (
              <Link to="/register" className="btn btn-primary btn-lg" id="cta-register-btn">Create Free Account →</Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="page-container">
          <p>⚕️ <strong>MediPredict AI</strong> — Final Year Project | Built with Python, FastAPI, React & Machine Learning</p>
          <p className="footer-disclaimer">⚠️ This tool is for educational purposes only. Always consult a qualified healthcare professional.</p>
        </div>
      </footer>
    </div>
  )
}
