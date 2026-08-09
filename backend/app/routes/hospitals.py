import httpx
from fastapi import APIRouter, Query

router = APIRouter()

OVERPASS_MIRRORS = [
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass-api.de/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
]

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"


@router.get("/hospitals", tags=["Hospitals"])
async def find_hospitals(lat: float = Query(None), lon: float = Query(None), city: str = Query(None), radius: int = 10000):
    """
    Find hospitals near coordinates (lat/lon) or city name.
    Proxies Overpass API to avoid CORS issues on the frontend.
    """
    # If city provided, geocode it first
    if city and (lat is None or lon is None):
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                geo_res = await client.get(NOMINATIM_URL, params={
                    "q": city, "format": "json", "limit": 1
                }, headers={"User-Agent": "MediPredict/1.0"})
                geo_data = geo_res.json()
                if not geo_data:
                    return {"error": "City not found", "elements": []}
                lat = float(geo_data[0]["lat"])
                lon = float(geo_data[0]["lon"])
                display_name = geo_data[0]["display_name"]
        except Exception as e:
            return {"error": f"Geocoding failed: {str(e)}", "elements": []}
    else:
        display_name = f"{lat:.4f}, {lon:.4f}"

    if lat is None or lon is None:
        return {"error": "Provide lat/lon or city", "elements": []}

    query = f"""[out:json][timeout:30];(
  node["amenity"="hospital"](around:{radius},{lat},{lon});
  way["amenity"="hospital"](around:{radius},{lat},{lon});
  node["amenity"="clinic"](around:{radius},{lat},{lon});
  node["amenity"="doctors"](around:{radius},{lat},{lon});
  node["healthcare"="hospital"](around:{radius},{lat},{lon});
  node["healthcare"="clinic"](around:{radius},{lat},{lon});
);out center body;"""

    last_error = "All hospital data servers failed"
    async with httpx.AsyncClient(timeout=20) as client:
        for mirror in OVERPASS_MIRRORS:
            try:
                res = await client.post(mirror, data={"data": query},
                                        headers={"Content-Type": "application/x-www-form-urlencoded"})
                if res.status_code == 200:
                    data = res.json()
                    elements = data.get("elements", [])

                    import math
                    results = []
                    for e in elements:
                        name = e.get("tags", {}).get("name")
                        if not name:
                            continue
                        e_lat = e.get("lat") or (e.get("center", {}) or {}).get("lat")
                        e_lon = e.get("lon") or (e.get("center", {}) or {}).get("lon")
                        if not e_lat or not e_lon:
                            continue
                        dist = round(math.sqrt((e_lat - lat)**2 + (e_lon - lon)**2) * 111, 2)
                        results.append({
                            "id": e["id"],
                            "name": name,
                            "type": e.get("tags", {}).get("amenity") or e.get("tags", {}).get("healthcare") or "hospital",
                            "phone": e.get("tags", {}).get("phone") or e.get("tags", {}).get("contact:phone"),
                            "emergency": e.get("tags", {}).get("emergency") == "yes",
                            "lat": e_lat,
                            "lon": e_lon,
                            "dist": dist,
                        })

                    results.sort(key=lambda x: x["dist"])
                    return {
                        "elements": results[:20],
                        "total": len(results),
                        "location": display_name,
                        "lat": lat,
                        "lon": lon,
                    }
            except Exception as ex:
                last_error = str(ex)
                continue

    return {"error": last_error, "elements": []}
