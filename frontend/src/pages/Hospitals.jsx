import { useState, useEffect } from 'react'
import './Hospitals.css'

const API_BASE = import.meta.env.VITE_API_URL || 'https://medipredict-ai-1-zyer.onrender.com'
const CACHE_KEY = 'hosp_last_results'
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

// Pre-warm backend silently when page loads
function warmupBackend() {
  fetch(`${API_BASE}/`).catch(() => {})
}

function getCached() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) return null
    return data
  } catch { return null }
}

function setCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }))
  } catch {}
}

export default function Hospitals() {
  const [loading, setLoading]       = useState(false)
  const [status, setStatus]         = useState('')   // step-by-step status text
  const [hospitals, setHospitals]   = useState([])
  const [error, setError]           = useState('')
  const [locationName, setLocation] = useState('')
  const [searched, setSearched]     = useState(false)
  const [cityInput, setCityInput]   = useState('')
  const [showManual, setShowManual] = useState(false)

  // On mount: warm up backend + load cached results
  useEffect(() => {
    warmupBackend()
    const cached = getCached()
    if (cached) {
      setHospitals(cached.elements || [])
      setLocation(cached.location || '')
      setSearched(true)
    }
  }, [])

  const processResults = (data) => {
    if (data.error) {
      setError(data.error === 'City not found'
        ? 'City not found. Try a different name e.g. "Coimbatore" or "Anna Nagar Chennai".'
        : 'Hospital data unavailable. Please try again in a few seconds.')
      return
    }
    setCache(data)
    setHospitals(data.elements || [])
    setLocation(data.location || '')
    setSearched(true)
    if (!data.elements || data.elements.length === 0)
      setError('No hospitals found nearby. Try a larger city name.')
  }

  const getLocation = async () => {
    // 1. Try Capacitor GPS (Android app)
    if (typeof window !== 'undefined' && window.Capacitor) {
      setStatus('📍 Requesting location permission...')
      const { Geolocation } = await import('@capacitor/geolocation')
      await Geolocation.requestPermissions()
      setStatus('📍 Getting your GPS location...')
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 })
      return { lat: pos.coords.latitude, lon: pos.coords.longitude }
    }
    // 2. Try browser geolocation (low-accuracy first = fast)
    try {
      setStatus('📍 Getting your location...')
      const pos = await new Promise((res, rej) => {
        navigator.geolocation.getCurrentPosition(res,
          () => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 12000, enableHighAccuracy: true }),
          { timeout: 6000, enableHighAccuracy: false }
        )
      })
      return { lat: pos.coords.latitude, lon: pos.coords.longitude }
    } catch {}
    // 3. Fallback: IP-based location (always works, city-level accuracy)
    setStatus('🌐 Using network location (GPS unavailable)...')
    const ipRes = await fetch('https://ipapi.co/json/')
    const ipData = await ipRes.json()
    if (ipData.latitude) {
      return { lat: ipData.latitude, lon: ipData.longitude, fromIP: true, city: ipData.city }
    }
    throw new Error('Could not determine location')
  }

  const findByGPS = async () => {
    setLoading(true); setError(''); setHospitals([]); setSearched(false); setShowManual(false)
    // Show wake-up warning after 6 seconds
    const wakeTimer = setTimeout(() => setStatus('⏳ Server is waking up... (may take 30s on first use)'), 6000)
    try {
      const loc = await getLocation()
      if (loc.fromIP) setStatus(`📍 Using approximate location: ${loc.city}`)
      else setStatus('🔍 Searching hospitals nearby...')

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 60000)
      try {
        const res = await fetch(
          `${API_BASE}/api/hospitals?lat=${loc.lat}&lon=${loc.lon}&radius=10000`,
          { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }, signal: controller.signal }
        )
        clearTimeout(timeout)
        setStatus('📋 Loading results...')
        const data = await res.json()
        processResults(data)
      } catch (fetchErr) {
        clearTimeout(timeout)
        if (fetchErr.name === 'AbortError') setError('Request timed out. Server may be sleeping. Please try again in 30 seconds.')
        else throw fetchErr
      }

    } catch (err) {
      clearTimeout(wakeTimer)
      if (err.message === 'Could not determine location') {
        setError('Could not get your location. Please type your city name below.')
      } else if (err.code === 1 || err.message?.includes('denied')) {
        setShowManual('denied')
      } else {
        setShowManual('timeout')
      }
    } finally { clearTimeout(wakeTimer); setLoading(false); setStatus('') }
  }

  const findByCity = async (e) => {
    e.preventDefault()
    if (!cityInput.trim()) return
    setLoading(true); setError(''); setHospitals([]); setSearched(false)
    const wakeTimer = setTimeout(() => setStatus('⏳ Server waking up... (may take 30s on first use)'), 6000)
    try {
      setStatus(`🔍 Searching hospitals in ${cityInput}...`)
      const res = await fetch(
        `${API_BASE}/api/hospitals?city=${encodeURIComponent(cityInput.trim())}&radius=10000`,
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
      )
      setStatus('📋 Loading results...')
      const data = await res.json()
      processResults(data)
    } catch {
      setError('Network error. Please check your internet and try again.')
    } finally { clearTimeout(wakeTimer); setLoading(false); setStatus('') }
  }

  const openMaps = (h) => window.open(`https://www.google.com/maps/search/?api=1&query=${h.lat},${h.lon}`, '_blank')
  const typeIcon  = { hospital: '🏥', clinic: '🏨', doctors: '👨‍⚕️' }
  const typeLabel = { hospital: 'Hospital', clinic: 'Clinic', doctors: 'Doctor' }

  return (
    <div className="hosp-page">
      <div className="page-container">
        <div className="hosp-header">
          <h1>🏥 Nearby Hospitals</h1>
          <p>Find hospitals and clinics near you — by GPS or city name</p>
        </div>

        {/* GPS Search */}
        <div className="hosp-search-card">
          <div className="hosp-search-info">
            <div className="hosp-search-icon">📍</div>
            <div>
              <div className="hosp-search-title">Use My Current Location</div>
              <div className="hosp-search-sub">Allow location access to find hospitals within 10km</div>
            </div>
          </div>
          <button className="hosp-btn" onClick={findByGPS} disabled={loading} id="find-hospitals-btn">
            {loading ? <><span className="spinner-sm"></span> Searching...</> : '📍 Find Nearby Hospitals'}
          </button>
        </div>

        {/* Loading status steps */}
        {loading && status && (
          <div className="hosp-status-bar">
            <span className="spinner-sm"></span>
            <span>{status}</span>
          </div>
        )}

        {/* City Name Search */}
        <div className={`hosp-manual-card ${showManual ? 'hosp-manual-highlight' : ''}`}>
          <div className="hosp-manual-title">🔍 Search by City / Area Name</div>
          <form onSubmit={findByCity} className="hosp-manual-form">
            <input
              type="text"
              placeholder="e.g. Coimbatore, Chennai, Anna Nagar..."
              value={cityInput}
              onChange={e => setCityInput(e.target.value)}
              className="hosp-city-input"
              id="city-search-input"
            />
            <button type="submit" className="hosp-city-btn" disabled={loading}>
              {loading ? <span className="spinner-sm"></span> : 'Search'}
            </button>
          </form>
        </div>

        {/* GPS denied — show browser instructions */}
        {showManual === 'denied' && (
          <div className="hosp-denied-card">
            <div className="hosp-denied-title">🔒 Location Access is Blocked</div>
            <p className="hosp-denied-desc">Your browser/app has blocked location. To fix this:</p>
            <div className="hosp-denied-steps">
              <div className="hosp-denied-step">1️⃣ Click the <strong>🔒 lock icon</strong> in your browser address bar</div>
              <div className="hosp-denied-step">2️⃣ Find <strong>"Location"</strong> and change it to <strong>"Allow"</strong></div>
              <div className="hosp-denied-step">3️⃣ <strong>Refresh the page</strong> and try again</div>
            </div>
            <div className="hosp-denied-alt">Or just <strong>type your city name above</strong> — no GPS needed! 👆</div>
          </div>
        )}

        {(showManual === 'unavailable' || showManual === 'timeout') && (
          <div className="hosp-error">⚠️ Could not detect your location. Please type your city name in the search box above.</div>
        )}

        {error && <div className="hosp-error">⚠️ {error}</div>}

        {searched && hospitals.length > 0 && (
          <div className="hosp-location-info">
            📍 Showing <strong>{hospitals.length}</strong> hospitals near <strong>{locationName.split(',').slice(0, 2).join(', ')}</strong>
            {getCached() && <span className="hosp-cached"> · ⚡ Cached</span>}
          </div>
        )}

        {hospitals.length > 0 && (
          <div className="hosp-list">
            {hospitals.map((h, i) => (
              <div key={h.id} className="hosp-card animate-fade-in-up" style={{ animationDelay: `${i * 0.03}s` }}>
                <div className="hosp-card-left">
                  <div className="hosp-type-icon">{typeIcon[h.type] || '🏥'}</div>
                  <div className="hosp-rank">#{i + 1}</div>
                </div>
                <div className="hosp-card-info">
                  <div className="hosp-name">{h.name}</div>
                  <div className="hosp-meta">
                    <span className="hosp-type-badge">{typeLabel[h.type] || 'Hospital'}</span>
                    {h.emergency && <span className="hosp-emergency">🚨 Emergency</span>}
                    {h.phone && <span className="hosp-phone">📞 {h.phone}</span>}
                  </div>
                  <div className="hosp-dist">📏 {h.dist} km away</div>
                </div>
                <button className="hosp-map-btn" onClick={() => openMaps(h)}>🗺️ Map</button>
              </div>
            ))}
          </div>
        )}

        {!searched && !loading && (
          <div className="hosp-empty">
            <div className="hosp-empty-icon">🏥</div>
            <h3>Find Hospitals Near You</h3>
            <p>Use GPS or type your city name to find hospitals and clinics</p>
            <div className="hosp-tips">
              <div className="hosp-tip">✅ Works with GPS or city name</div>
              <div className="hosp-tip">✅ Shows up to 20 nearest hospitals</div>
              <div className="hosp-tip">✅ Opens Google Maps for directions</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
