import httpx
from fastapi import APIRouter, Query

router = APIRouter()

OPENFDA_URL = "https://api.fda.gov/drug/label.json"

def safe(data, *keys, default="Not available"):
    try:
        for k in keys:
            data = data[k]
        if isinstance(data, list):
            return data[0][:1200] if data else default
        return str(data)[:1200]
    except:
        return default

@router.get("/medicine")
async def search_medicine(name: str = Query(..., min_length=2)):
    """Search medicine info from OpenFDA Drug Label API."""
    async with httpx.AsyncClient(timeout=15) as client:
        for search_field in [f'openfda.brand_name:"{name}"', f'openfda.generic_name:"{name}"', name]:
            try:
                res = await client.get(OPENFDA_URL, params={"search": search_field, "limit": 1})
                if res.status_code == 200:
                    results = res.json().get("results", [])
                    if results:
                        r = results[0]
                        fda = r.get("openfda", {})
                        return {
                            "found": True,
                            "brand_name": safe(fda, "brand_name"),
                            "generic_name": safe(fda, "generic_name"),
                            "manufacturer": safe(fda, "manufacturer_name"),
                            "substance": safe(fda, "substance_name"),
                            "purpose": safe(r, "purpose"),
                            "indications": safe(r, "indications_and_usage"),
                            "dosage": safe(r, "dosage_and_administration"),
                            "warnings": safe(r, "warnings"),
                            "side_effects": safe(r, "adverse_reactions"),
                            "contraindications": safe(r, "contraindications"),
                            "storage": safe(r, "storage_and_handling"),
                            "drug_interactions": safe(r, "drug_interactions"),
                        }
            except:
                continue
    return {"found": False, "error": f"No information found for '{name}'. Try the generic name (e.g. 'acetaminophen' for Paracetamol)."}
