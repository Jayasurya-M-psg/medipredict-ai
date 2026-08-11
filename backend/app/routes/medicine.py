import httpx
from fastapi import APIRouter, Query

router = APIRouter()

OPENFDA_URL = "https://api.fda.gov/drug/label.json"

# Common Indian/UK medicine names → US FDA equivalents
NAME_MAP = {
    "paracetamol":   "acetaminophen",
    "crocin":        "acetaminophen",
    "dolo":          "acetaminophen",
    "dolo-650":      "acetaminophen",
    "brufen":        "ibuprofen",
    "combiflam":     "ibuprofen",
    "calpal":        "acetaminophen",
    "calpol":        "acetaminophen",
    "disprin":       "aspirin",
    "ecosprin":      "aspirin",
    "volini":        "diclofenac",
    "voveran":       "diclofenac",
    "pan":           "pantoprazole",
    "pantop":        "pantoprazole",
    "rantac":        "ranitidine",
    "zintac":        "ranitidine",
    "allegra":       "fexofenadine",
    "montair":       "montelukast",
    "sinarest":      "cetirizine",
    "cetrizine":     "cetirizine",
    "glycomet":      "metformin",
    "glucophage":    "metformin",
    "thyronorm":     "levothyroxine",
    "eltroxin":      "levothyroxine",
    "stamlo":        "amlodipine",
    "norvasc":       "amlodipine",
    "lipitor":       "atorvastatin",
    "rozavel":       "rosuvastatin",
    "shelcal":       "calcium carbonate",
    "vitamin c":     "ascorbic acid",
    "amox":          "amoxicillin",
    "augmentin":     "amoxicillin",
    "azee":          "azithromycin",
    "zithromax":     "azithromycin",
    "erythrocin":    "erythromycin",
    "cipro":         "ciprofloxacin",
    "ciplox":        "ciprofloxacin",
    "montek":        "montelukast",
    "atarax":        "hydroxyzine",
    "dexona":        "dexamethasone",
    "betnesol":      "betamethasone",
}

def safe(data, *keys, default="Not available"):
    try:
        for k in keys:
            data = data[k]
        if isinstance(data, list):
            return data[0][:1500] if data else default
        return str(data)[:1500]
    except:
        return default

@router.get("/medicine")
async def search_medicine(name: str = Query(..., min_length=1)):
    """Search medicine info from OpenFDA Drug Label API with Indian name mapping."""
    original = name.strip()
    mapped   = NAME_MAP.get(original.lower(), original)

    # Build list of search terms to try (mapped name first, then original)
    searches = []
    if mapped.lower() != original.lower():
        searches += [
            f'openfda.generic_name:"{mapped}"',
            f'openfda.brand_name:"{mapped}"',
            mapped,
        ]
    searches += [
        f'openfda.brand_name:"{original}"',
        f'openfda.generic_name:"{original}"',
        original,
    ]

    async with httpx.AsyncClient(timeout=15) as client:
        for search_term in searches:
            try:
                res = await client.get(OPENFDA_URL, params={"search": search_term, "limit": 1})
                if res.status_code == 200:
                    results = res.json().get("results", [])
                    if results:
                        r   = results[0]
                        fda = r.get("openfda", {})
                        brand   = safe(fda, "brand_name")
                        generic = safe(fda, "generic_name")
                        # Show original name if it was mapped
                        display_name = brand
                        if mapped != original and display_name == "Not available":
                            display_name = f"{original} ({mapped})"
                        return {
                            "found":            True,
                            "searched_as":      mapped if mapped != original else original,
                            "original_query":   original,
                            "brand_name":       display_name,
                            "generic_name":     generic,
                            "manufacturer":     safe(fda, "manufacturer_name"),
                            "substance":        safe(fda, "substance_name"),
                            "purpose":          safe(r, "purpose"),
                            "indications":      safe(r, "indications_and_usage"),
                            "dosage":           safe(r, "dosage_and_administration"),
                            "warnings":         safe(r, "warnings"),
                            "side_effects":     safe(r, "adverse_reactions"),
                            "contraindications":safe(r, "contraindications"),
                            "storage":          safe(r, "storage_and_handling"),
                            "drug_interactions":safe(r, "drug_interactions"),
                        }
            except Exception:
                continue

    hint = ""
    if mapped != original:
        hint = f' (searched as "{mapped}")'
    return {
        "found": False,
        "error": f'No FDA information found for "{original}"{hint}. '
                 f'Try the generic name (e.g. "acetaminophen" for Paracetamol, "ibuprofen" for Brufen).'
    }
