import { useState } from 'react'
import './Hospitals.css'

const OVERPASS_MIRRORS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
]

async function fetchOverpass(query) {
  for (const mirror of OVERPASS_MIRRORS) {
    try {
      const res = await fetch(mirror, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(15000),
      })
      if (!res.ok) continue
      const data = await res.json()
      return data
    } catch {
      continue
    }
  }
  throw new Error('All Overpass mirrors failed')
}

async function geocodeCity(city) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
    { headers: { 'Accept-Language': 'en' } }
  )
  const data = await res.json()
  if (!data || data.length === 0) throw new Error('City not found')
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), displayName: data[0].display_name }
}

function calcDist(lat1, lon1, lat2, lon2) {
  return +(Math.sqrt((lat2 - lat1) ** 2 + (lon2 - lon1) ** 2) * 111).toFixed(2)
}

export default function Hospitals() {
  const [loading, setLoading]     = useState(false)
  const [hospitals, setHospitals] = useState([])
  const [error, setError]         = useState('')
  const [locationName, setLocationName] = useState('')
  const [searched, setSearched]   = useState(false)
  const [cityInput, setCityInput] = useState('')
  const [showManual, setShowManual] = useState(false)

  const searchByCoords = async (lat, lon) => {
    const query = `[out:json][timeout:30];(
      node["amenity"="hospital"](around:10000,${lat},${lon});
      way["amenity"="hospital"](around:10000,${lat},${lon});
      node["amenity"="clinic"](around:8000,${lat},${lon});
      node["amenity"="doctors"](around:8000,${lat},${lon});
      node["healthcare"="hospital"](around:10000,${lat},${lon});
    );out center body;`

    const data = await fetchOverpass(query)
    const results = data.elements
      .filter(e => e.tags?.name)
      .map(e => {
        const eLat = e.lat || e.center?.lat
        const eLon = e.lon || e.center?.lon
        return {
          id: e.id,
          name: e.tags.name,
          type: e.tags.amenity || e.tags.healthcare || 'hospital',
          phone: e.tags.phone || e.tags['contact:phone'] || null,
          emergency: e.tags.emergency === 'yes',
          lat: eLat, lon: eLon,
          dist: calcDist(lat, lon, eLat, eLon),
        }
      })
      .filter(e => e.lat && e.lon)
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 20)
    return results
  }

  const findByGPS = async () => {
    setLoading(true); setError(''); setHospitals([]); setSearched(false)
    try {
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 12000, enableHighAccuracy: true })
      )
      const { latitude: lat, longitude: lon } = pos.coords
      const results = await searchByCoords(lat, lon)
      setHospitals(results)
      setLocationName('your current location')
      setSearched(true)
      if (results.length === 0) setError('No hospitals found within 10km. Try searching by city name instead.')
    } catch (err) {
      if (err.code === 1) {
        setError('Location permission denied.')
        setShowManual(true)
      } else if (err.message?.includes('Overpass')) {
        setError('Hospital data service is temporarily unavailable. Please try again in a moment.')
      } else {
        setError('Could not get your location. Please try the city search below.')
        setShowManual(true)
      }
    } finally { setLoading(false) }
  }

  const findByCity = async (e) => {
    e.preventDefault()
    if (!cityInput.trim()) return
    setLoading(true); setError(''); setHospitals([]); setSearched(false)
    try {
      const { lat, lon, displayName } = await geocodeCity(cityInput)
      const results = await searchByCoords(lat, lon)
      setHospitals(results)
      setLocationName(displayName.split(',').slice(0, 2).join(', '))
      setSearched(true)
      if (results.length === 0) setError('No hospitals found in this area. Try a nearby city or area name.')
    } catch (err) {
      if (err.message === 'City not found') setError('City not found. Please try a different name.')
      else setError('Could not load hospitals. Please check your internet and try again.')
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

        {/* Manual city search */}
        <div className={`hosp-manual-card ${showManual ? 'hosp-manual-highlight' : ''}`}>
          <div className="hosp-manual-title">🔍 Search by City / Area Name</div>
          <form onSubmit={findByCity} className="hosp-manual-form">
            <input
              type="text"
              placeholder="e.g. Chennai, Coimbatore, Anna Nagar..."
              value={cityInput}
              onChange={e => setCityInput(e.target.value)}
              className="hosp-city-input"
              id="city-search-input"
            />
            <button type="submit" className="hosp-city-btn" disabled={loading}>Search</button>
          </form>
          {showManual && (
            <div className="hosp-manual-tip">
              ⚠️ GPS was denied — please type your city or area name above to find hospitals
            </div>
          )}
        </div>

        {error && <div className="hosp-error">⚠️ {error}</div>}

        {searched && (
          <div className="hosp-location-info">
            📍 Showing {hospitals.length} hospitals near <strong>{locationName}</strong>
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
