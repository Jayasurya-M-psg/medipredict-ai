import { useState, useEffect } from 'react'
import './Appointments.css'

const API_BASE = import.meta.env.VITE_API_URL || 'https://medipredict-ai-1-zyer.onrender.com'

const SPECIALTIES = [
  { label: 'General Physician', icon: '🩺', color: '#6366f1', query: 'general practitioner' },
  { label: 'Cardiologist', icon: '❤️', color: '#ef4444', query: 'cardiologist' },
  { label: 'Diabetologist', icon: '💉', color: '#f59e0b', query: 'diabetologist' },
  { label: 'Orthopedic', icon: '🦴', color: '#06b6d4', query: 'orthopedic' },
  { label: 'Dermatologist', icon: '🧴', color: '#8b5cf6', query: 'dermatologist' },
  { label: 'Neurologist', icon: '🧠', color: '#10b981', query: 'neurologist' },
  { label: 'Psychiatrist', icon: '🧘', color: '#ec4899', query: 'psychiatrist' },
  { label: 'ENT Specialist', icon: '👂', color: '#14b8a6', query: 'ENT' },
  { label: 'Ophthalmologist', icon: '👁️', color: '#3b82f6', query: 'ophthalmologist' },
  { label: 'Pediatrician', icon: '👶', color: '#f97316', query: 'pediatrician' },
]

const TIME_SLOTS = [
  '🌅 Morning (9AM – 12PM)',
  '☀️ Afternoon (12PM – 4PM)',
  '🌆 Evening (4PM – 7PM)',
]

const TODAY = new Date().toISOString().split('T')[0]

// Helper so the token key only lives in one place
const getToken = () => localStorage.getItem('medipredict_token')

function BookingModal({ doctor, onClose, onBooked }) {
  const [date, setDate] = useState('')
  const [slot, setSlot] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    if (!date || !slot || !reason.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({
          doctor_name: doctor.name,
          specialty: doctor.specialty || 'General',
          clinic_address: doctor.address || null,
          doctor_phone: doctor.phone || null,
          date, time_slot: slot, reason,
        })
      })
      const data = await res.json()
      if (data.success) { setDone(data.appointment); onBooked() }
      else setDone({ error: 'Booking failed. Try again.' })
    } catch { setDone({ error: 'Network error.' }) }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        {done ? (
          done.error ? (
            <div className="modal-error">
              <div style={{fontSize:'2rem'}}>⚠️</div>
              <p>{done.error}</p>
              <button className="modal-close-btn" onClick={onClose}>Close</button>
            </div>
          ) : (
            <div className="modal-success">
              <div className="modal-success-icon">✅</div>
              <h3>Appointment Booked!</h3>
              <div className="modal-ref">Ref: <strong>{done.ref_code}</strong></div>
              <div className="modal-detail-row"><span>Doctor</span><strong>{done.doctor_name}</strong></div>
              <div className="modal-detail-row"><span>Date</span><strong>{done.date}</strong></div>
              <div className="modal-detail-row"><span>Time</span><strong>{done.time_slot}</strong></div>
              <div className="modal-detail-row"><span>Status</span><span className="badge-pending">Pending</span></div>
              <p className="modal-note">📋 Save your reference number. View in "My Appointments" tab.</p>
              <button className="modal-close-btn" onClick={onClose}>Done</button>
            </div>
          )
        ) : (
          <>
            <div className="modal-header">
              <div>
                <div className="modal-title">📅 Book Appointment</div>
                <div className="modal-doctor">{doctor.name}</div>
                {doctor.address && <div className="modal-addr">📍 {doctor.address}</div>}
              </div>
              <button className="modal-x" onClick={onClose}>✕</button>
            </div>
            <form onSubmit={submit} className="modal-form">
              <div className="modal-field">
                <label>Date</label>
                <input type="date" value={date} min={TODAY} onChange={e => setDate(e.target.value)} required />
              </div>
              <div className="modal-field">
                <label>Time Slot</label>
                <div className="slot-grid">
                  {TIME_SLOTS.map(s => (
                    <button key={s} type="button"
                      className={`slot-btn ${slot === s ? 'slot-active' : ''}`}
                      onClick={() => setSlot(s)}>{s}</button>
                  ))}
                </div>
              </div>
              <div className="modal-field">
                <label>Reason for Visit</label>
                <textarea value={reason} onChange={e => setReason(e.target.value)}
                  placeholder="Describe your symptoms or reason..." rows={3} required />
              </div>
              <button type="submit" className="modal-submit" disabled={loading || !date || !slot}>
                {loading ? '⏳ Booking...' : '✅ Confirm Appointment'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default function Appointments() {
  const [tab, setTab]               = useState('find')   // 'find' | 'mine'
  const [searchMode, setSearchMode] = useState('gps')    // 'gps' | 'city' | 'specialty'
  const [cityInput, setCityInput]   = useState('')
  const [selSpecialty, setSpecialty]= useState(null)
  const [loading, setLoading]       = useState(false)
  const [status, setStatus]         = useState('')
  const [doctors, setDoctors]       = useState([])
  const [error, setError]           = useState('')
  const [booking, setBooking]       = useState(null)    // doctor being booked
  const [myAppts, setMyAppts]       = useState([])
  const [apptLoading, setApptLoading] = useState(false)
  const [cancellingId, setCancellingId] = useState(null)

  useEffect(() => { if (tab === 'mine') loadMyAppts() }, [tab])

  const loadMyAppts = async () => {
    setApptLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/appointments`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
      const data = await res.json()
      setMyAppts(data.appointments || [])
    } catch {} finally { setApptLoading(false) }
  }

  const cancelAppt = async (id) => {
    setCancellingId(id)
    try {
      await fetch(`${API_BASE}/api/appointments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
      await loadMyAppts()
    } catch {} finally { setCancellingId(null) }
  }

  const searchDoctors = async ({ lat, lon, city, specialty }) => {
    setLoading(true); setError(''); setDoctors([])
    try {
      const params = new URLSearchParams({ radius: 10000 })
      if (lat) { params.append('lat', lat); params.append('lon', lon) }
      if (city) params.append('city', city)
      if (specialty) params.append('type', specialty)
      setStatus('🔍 Searching doctors nearby...')
      const res = await fetch(`${API_BASE}/api/doctors?${params}`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      })
      setStatus('📋 Loading results...')
      const data = await res.json()
      if (data.error) { setError('No doctors found. Try a different city or specialty.'); return }
      if (!data.elements?.length) { setError('No doctors found nearby. Try another area.'); return }
      setDoctors(data.elements.map(d => ({ ...d, specialty: specialty || 'General Physician' })))
    } catch { setError('Network error. Please try again.') }
    finally { setLoading(false); setStatus('') }
  }

  const findByGPS = async () => {
    setStatus('📍 Getting your location...')
    setLoading(true); setError('')
    try {
      let lat, lon
      if (window.Capacitor) {
        const { Geolocation } = await import('@capacitor/geolocation')
        await Geolocation.requestPermissions()
        const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 })
        lat = pos.coords.latitude; lon = pos.coords.longitude
      } else {
        // Try low-accuracy first (fast), then high-accuracy fallback
        const pos = await new Promise((res, rej) => {
          navigator.geolocation.getCurrentPosition(res,
            () => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 15000, enableHighAccuracy: true }),
            { timeout: 8000, enableHighAccuracy: false }
          )
        })
        lat = pos.coords.latitude; lon = pos.coords.longitude
      }
      await searchDoctors({ lat, lon, specialty: selSpecialty?.query })
    } catch { setError('Location denied. Use city search below.'); setLoading(false); setStatus('') }
  }

  const findByCity = async (e) => {
    e.preventDefault()
    if (!cityInput.trim()) return
    await searchDoctors({ city: cityInput.trim(), specialty: selSpecialty?.query })
  }

  const statusColor = { Pending: '#f59e0b', Confirmed: '#10b981', Cancelled: '#6b7280' }
  const upcoming = myAppts.filter(a => a.status !== 'Cancelled' && new Date(a.date) >= new Date(TODAY))
  const past     = myAppts.filter(a => a.status === 'Cancelled' || new Date(a.date) < new Date(TODAY))

  return (
    <div className="appt-page">
      <div className="page-container">
        <div className="appt-header">
          <h1>🩺 Doctor Appointments</h1>
          <p>Find nearby doctors and book appointments directly from the app</p>
        </div>

        {/* Tabs */}
        <div className="appt-tabs">
          <button className={`appt-tab ${tab==='find'?'active':''}`} onClick={()=>setTab('find')}>🔍 Find & Book</button>
          <button className={`appt-tab ${tab==='mine'?'active':''}`} onClick={()=>setTab('mine')}>📋 My Appointments</button>
        </div>

        {/* ── FIND TAB ── */}
        {tab === 'find' && (
          <>
            {/* Specialty picker */}
            <div className="spec-section">
              <div className="spec-title">Choose Specialty (optional)</div>
              <div className="spec-grid">
                {SPECIALTIES.map(s => (
                  <button key={s.label}
                    className={`spec-btn ${selSpecialty?.label===s.label?'spec-active':''}`}
                    style={selSpecialty?.label===s.label ? {'--sc': s.color} : {}}
                    onClick={() => setSpecialty(selSpecialty?.label===s.label ? null : s)}>
                    <span className="spec-icon">{s.icon}</span>
                    <span className="spec-label">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {selSpecialty && (
              <div className="spec-selected">
                Searching for: <strong style={{color: selSpecialty.color}}>{selSpecialty.icon} {selSpecialty.label}</strong>
                <button onClick={()=>setSpecialty(null)} className="spec-clear">✕</button>
              </div>
            )}

            {/* GPS Search */}
            <div className="appt-search-card">
              <div className="appt-search-info">
                <div className="appt-search-icon">📍</div>
                <div>
                  <div className="appt-search-title">Use My Current Location</div>
                  <div className="appt-search-sub">Find doctors within 10km of you</div>
                </div>
              </div>
              <button className="appt-btn" onClick={findByGPS} disabled={loading}>
                {loading ? <><span className="spinner-sm"></span> Searching...</> : '📍 Find Nearby Doctors'}
              </button>
            </div>

            {loading && status && (
              <div className="appt-status-bar"><span className="spinner-sm"></span><span>{status}</span></div>
            )}

            {/* City Search */}
            <div className="appt-city-card">
              <div className="appt-city-title">🔍 Search by City / Area</div>
              <form onSubmit={findByCity} className="appt-city-form">
                <input type="text" placeholder="e.g. Coimbatore, Chennai, Anna Nagar..."
                  value={cityInput} onChange={e=>setCityInput(e.target.value)} className="appt-city-input" />
                <button type="submit" className="appt-city-btn" disabled={loading}>Search</button>
              </form>
            </div>

            {error && <div className="appt-error">⚠️ {error}</div>}

            {doctors.length > 0 && (
              <>
                <div className="appt-results-title">Found {doctors.length} doctors/clinics nearby</div>
                <div className="appt-list">
                  {doctors.map((d, i) => (
                    <div key={d.id} className="appt-card animate-fade-in-up" style={{animationDelay:`${i*0.04}s`}}>
                      <div className="appt-card-left">
                        <div className="appt-doc-icon">👨‍⚕️</div>
                        <div className="appt-rank">#{i+1}</div>
                      </div>
                      <div className="appt-card-info">
                        <div className="appt-doc-name">{d.name}</div>
                        <div className="appt-doc-meta">
                          <span className="appt-spec-badge">{d.specialty}</span>
                          {d.phone && <span className="appt-phone">📞 {d.phone}</span>}
                        </div>
                        <div className="appt-dist">📏 {d.dist} km away</div>
                      </div>
                      <div className="appt-card-actions">
                        <button className="appt-book-btn" onClick={()=>setBooking(d)}>📅 Book</button>
                        <button className="appt-map-btn"
                          onClick={()=>window.open(`https://www.google.com/maps/search/?api=1&query=${d.lat},${d.lon}`,'_blank')}>
                          🗺️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {!doctors.length && !loading && !error && (
              <div className="appt-empty">
                <div className="appt-empty-icon">🩺</div>
                <h3>Find Doctors Near You</h3>
                <p>Use GPS or type your city to find doctors and clinics. Then click <strong>📅 Book</strong> to request an appointment.</p>
                <div className="appt-tips">
                  <div className="appt-tip">✅ Find real nearby clinics via GPS or city</div>
                  <div className="appt-tip">✅ Filter by specialty</div>
                  <div className="appt-tip">✅ Book & track appointments</div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── MY APPOINTMENTS TAB ── */}
        {tab === 'mine' && (
          <div className="my-appts">
            {apptLoading ? (
              <div className="appt-loading"><span className="spinner-sm"></span> Loading appointments...</div>
            ) : myAppts.length === 0 ? (
              <div className="appt-empty">
                <div className="appt-empty-icon">📋</div>
                <h3>No Appointments Yet</h3>
                <p>Go to "Find & Book" tab to book your first appointment</p>
              </div>
            ) : (
              <>
                {upcoming.length > 0 && (
                  <>
                    <div className="appts-section-title">📅 Upcoming ({upcoming.length})</div>
                    {upcoming.map(a => (
                      <div key={a._id} className="my-appt-card">
                        <div className="my-appt-top">
                          <div>
                            <div className="my-appt-doctor">{a.doctor_name}</div>
                            <div className="my-appt-spec">{a.specialty}</div>
                          </div>
                          <span className="my-appt-badge" style={{background: statusColor[a.status]+'20', color: statusColor[a.status], border:`1px solid ${statusColor[a.status]}40`}}>{a.status}</span>
                        </div>
                        <div className="my-appt-details">
                          <span>📅 {a.date}</span>
                          <span>⏰ {a.time_slot}</span>
                          {a.doctor_phone && <span>📞 {a.doctor_phone}</span>}
                        </div>
                        <div className="my-appt-reason">💬 {a.reason}</div>
                        <div className="my-appt-footer">
                          <span className="my-appt-ref">Ref: {a.ref_code}</span>
                          <button className="my-appt-cancel"
                            onClick={() => cancelAppt(a._id)}
                            disabled={cancellingId === a._id}>
                            {cancellingId === a._id ? '...' : '✕ Cancel'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </>
                )}
                {past.length > 0 && (
                  <>
                    <div className="appts-section-title" style={{marginTop:'24px'}}>🕒 Past / Cancelled ({past.length})</div>
                    {past.map(a => (
                      <div key={a._id} className="my-appt-card my-appt-past">
                        <div className="my-appt-top">
                          <div>
                            <div className="my-appt-doctor">{a.doctor_name}</div>
                            <div className="my-appt-spec">{a.specialty}</div>
                          </div>
                          <span className="my-appt-badge" style={{background:'#6b728020',color:'#9ca3af',border:'1px solid #6b728040'}}>{a.status}</span>
                        </div>
                        <div className="my-appt-details">
                          <span>📅 {a.date}</span>
                          <span>⏰ {a.time_slot}</span>
                        </div>
                        <div className="my-appt-ref">Ref: {a.ref_code}</div>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {booking && <BookingModal doctor={booking} onClose={()=>setBooking(null)} onBooked={()=>{ setBooking(null); setTab('mine') }} />}
    </div>
  )
}
