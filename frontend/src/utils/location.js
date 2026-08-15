/**
 * Smart location helper — tries 3 methods in order:
 * 1. Capacitor GPS (Android app)
 * 2. Browser geolocation (low → high accuracy)
 * 3. IP-based location (always works, city-level)
 */
export async function getSmartLocation(setStatus) {
  // 1. Android app — native GPS
  if (typeof window !== 'undefined' && window.Capacitor) {
    setStatus?.('📍 Requesting location permission...')
    const { Geolocation } = await import('@capacitor/geolocation')
    await Geolocation.requestPermissions()
    setStatus?.('📍 Getting your GPS location...')
    const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 })
    return { lat: pos.coords.latitude, lon: pos.coords.longitude }
  }

  // 2. Browser geolocation — low-accuracy first (fast), then high-accuracy
  try {
    setStatus?.('📍 Getting your location...')
    const pos = await new Promise((res, rej) => {
      navigator.geolocation.getCurrentPosition(
        res,
        () => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 12000, enableHighAccuracy: true }),
        { timeout: 6000, enableHighAccuracy: false }
      )
    })
    return { lat: pos.coords.latitude, lon: pos.coords.longitude }
  } catch {
    // GPS denied or unavailable — fall through to IP
  }

  // 3. IP-based geolocation — always works, city-level accuracy
  setStatus?.('🌐 Using network location (GPS unavailable)...')
  try {
    const res = await fetch('https://ipapi.co/json/')
    const data = await res.json()
    if (data.latitude && data.longitude) {
      return {
        lat: data.latitude,
        lon: data.longitude,
        fromIP: true,
        city: data.city || data.region || 'your area'
      }
    }
  } catch {}

  // Final fallback — try alternate IP service
  try {
    const res = await fetch('https://ip-api.com/json/')
    const data = await res.json()
    if (data.lat && data.lon) {
      return {
        lat: data.lat,
        lon: data.lon,
        fromIP: true,
        city: data.city || data.regionName || 'your area'
      }
    }
  } catch {}

  throw new Error('LOCATION_FAILED')
}
