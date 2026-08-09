import { useState } from 'react'
import './Hospitals.css'

const API_BASE = import.meta.env.VITE_API_URL || 'https://medipredict-ai-1-zyer.onrender.com'

export default function Hospitals() {
  const [loading, setLoading]       = useState(false)
  const [hospitals, setHospitals]   = useState([])
  const [error, setError]           = useState('')
  const [locationName, setLocation] = useState('')
  const [searched, setSearched]     = useState(false)
  const [cityInput, setCityInput]   = useState('')
  const [showManual, setShowManual] = useState(false)

  const processResults = (data) => {
    if (data.error) {
      setError(data.error === 'City not found'
        ? 'City not found. Please try a different name (e.g. "Coimbatore" or "Anna Nagar Chennai").'
        : 'Hospital data is temporarily unavailable. Please try again in a few seconds.')
      return
    }
    setHospitals(data.elements || [])
    setLocation(data.location || '')
    setSearched(true)
    if (!data.elements || data.elements.length === 0) {
      setError('No hospitals found in this area. Try a larger city name or nearby area.')
    }
  }

  const findByGPS = async () => {
    setLoading(true); setError(''); setHospitals([]); setSearched(false)
    try {
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 12000, enableHighAccuracy: true })
      )
      const { latitude: lat, longitude: lon } = pos.coords
      const res = await fetch(`${API_BASE}/api/hospitals?lat=${lat}&lon=${lon}&radius=10000`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await res.json()
      processResults(data)
    } catch (err) {
      if (err.code === 1) {
        setError('Location permission denied on your device.')
        setShowManual(true)
      } else {
        setError('Could not get your location. Please use the city search below.')
        setShowManual(true)
      }
    } finally { setLoading(false) }
  }

  const findByCity = async (e) => {
    e.preventDefault()
    if (!cityInput.trim()) return
    setLoading(true); setError(''); setHospitals([]); setSearched(false)
    try {
      const res = await fetch(
        `${API_BASE}/api/hospitals?city=${encodeURIComponent(cityInput.trim())}&radius=10000`,
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
      )
      const data = await res.json()
      processResults(data)
    } catch {
      setError('Network error. Please check your internet and try again.')
    } finally { setLoading(false) }
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
          {showManual && (
            <div className="hosp-manual-tip">
              ⚠️ GPS was denied — please type your city or area name above to find hospitals
            </div>
          )}
        </div>

        {error && <div className="hosp-error">⚠️ {error}</div>}

        {searched && hospitals.length > 0 && (
          <div className="hosp-location-info">
            📍 Showing <strong>{hospitals.length}</strong> hospitals near <strong>{locationName.split(',').slice(0, 2).join(', ')}</strong>
          </div>
        )}

        {hospitals.length > 0 && (
          <div className="hosp-list">
            {hospitals.map((h, i) => (
              <div key={h.id} className="hosp-card animate-fade-in-up" style={{ animationDelay: `${i * 0.04}s` }}>
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
