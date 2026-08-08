import { useState } from 'react'
import './Hospitals.css'

export default function Hospitals() {
  const [loading, setLoading]     = useState(false)
  const [hospitals, setHospitals] = useState([])
  const [error, setError]         = useState('')
  const [location, setLocation]   = useState(null)
  const [searched, setSearched]   = useState(false)

  const findHospitals = async () => {
    setLoading(true)
    setError('')
    setHospitals([])
    setSearched(false)
    try {
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 10000 })
      )
      const { latitude: lat, longitude: lon } = pos.coords
      setLocation({ lat, lon })

      // Overpass API — free, no API key needed
      const query = `[out:json][timeout:25];(node["amenity"="hospital"](around:5000,${lat},${lon});node["amenity"="clinic"](around:5000,${lat},${lon});node["amenity"="doctors"](around:3000,${lat},${lon}););out body;`
      const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`)
      const data = await res.json()

      const results = data.elements
        .filter(e => e.tags?.name)
        .map(e => ({
          id: e.id,
          name: e.tags.name,
          type: e.tags.amenity,
          phone: e.tags.phone || e.tags['contact:phone'] || null,
          emergency: e.tags.emergency === 'yes',
          lat: e.lat,
          lon: e.lon,
          dist: +(Math.sqrt((e.lat-lat)**2+(e.lon-lon)**2)*111).toFixed(2),
        }))
        .sort((a,b) => a.dist - b.dist)
        .slice(0, 15)

      setHospitals(results)
      setSearched(true)
      if (results.length === 0) setError('No hospitals found within 5km of your location.')
    } catch (err) {
      if (err.code === 1) setError('Location access denied. Please allow location permission and try again.')
      else setError('Could not find hospitals. Please check your internet and try again.')
    } finally {
      setLoading(false)
    }
  }

  const typeIcon = { hospital: '🏥', clinic: '🏨', doctors: '👨⚕️' }
  const typeLabel = { hospital: 'Hospital', clinic: 'Clinic', doctors: 'Doctor' }

  const openMaps = (h) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${h.lat},${h.lon}`, '_blank')
  }

  return (
    <div className="hosp-page">
      <div className="page-container">
        <div className="hosp-header">
          <h1>🏥 Nearby Hospitals</h1>
          <p>Find hospitals and clinics near your current location</p>
        </div>

        <div className="hosp-search-card">
          <div className="hosp-search-info">
            <div className="hosp-search-icon">📍</div>
            <div>
              <div className="hosp-search-title">Find Healthcare Near You</div>
              <div className="hosp-search-sub">We'll use your device location to find hospitals within 5km</div>
            </div>
          </div>
          <button className="hosp-btn" onClick={findHospitals} disabled={loading} id="find-hospitals-btn">
            {loading ? <><span className="spinner-sm"></span> Searching...</> : '📍 Find Nearby Hospitals'}
          </button>
        </div>

        {error && (
          <div className="hosp-error">⚠️ {error}</div>
        )}

        {location && searched && (
          <div className="hosp-location-info">
            📍 Showing results near your location · {hospitals.length} found within 5km
          </div>
        )}

        {hospitals.length > 0 && (
          <div className="hosp-list">
            {hospitals.map((h, i) => (
              <div key={h.id} className="hosp-card animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="hosp-card-left">
                  <div className="hosp-type-icon">{typeIcon[h.type] || '🏥'}</div>
                  <div className="hosp-rank">#{i+1}</div>
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
                <button className="hosp-map-btn" onClick={() => openMaps(h)} title="Open in Maps">🗺️ Map</button>
              </div>
            ))}
          </div>
        )}

        {!searched && !loading && (
          <div className="hosp-empty">
            <div className="hosp-empty-icon">🏥</div>
            <h3>Find Hospitals Near You</h3>
            <p>Click the button above to discover hospitals and clinics within 5km of your location</p>
            <div className="hosp-tips">
              <div className="hosp-tip">✅ Works without internet for location</div>
              <div className="hosp-tip">✅ No sign up or API key needed</div>
              <div className="hosp-tip">✅ Opens in Google Maps for directions</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
