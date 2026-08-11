from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import random, string
from app.utils.auth import get_current_user
from app.database.mongo import get_db

router = APIRouter()

class AppointmentCreate(BaseModel):
    doctor_name: str
    specialty: str
    clinic_address: Optional[str] = None
    doctor_phone: Optional[str] = None
    date: str          # "2024-08-15"
    time_slot: str     # "Morning (9AM-12PM)"
    reason: str

def gen_ref():
    return 'MP' + ''.join(random.choices(string.digits, k=6))

@router.post("/appointments")
async def create_appointment(data: AppointmentCreate, current_user=Depends(get_current_user)):
    db = await get_db()
    appt = {
        "user_id": str(current_user["_id"]),
        "doctor_name": data.doctor_name,
        "specialty": data.specialty,
        "clinic_address": data.clinic_address,
        "doctor_phone": data.doctor_phone,
        "date": data.date,
        "time_slot": data.time_slot,
        "reason": data.reason,
        "status": "Pending",
        "ref_code": gen_ref(),
        "created_at": datetime.utcnow().isoformat()
    }
    result = await db.appointments.insert_one(appt)
    appt["_id"] = str(result.inserted_id)
    return {"success": True, "appointment": appt}

@router.get("/appointments")
async def get_appointments(current_user=Depends(get_current_user)):
    db = await get_db()
    cursor = db.appointments.find({"user_id": str(current_user["_id"])}).sort("created_at", -1)
    appts = []
    async for a in cursor:
        a["_id"] = str(a["_id"])
        appts.append(a)
    return {"appointments": appts}

@router.delete("/appointments/{appt_id}")
async def cancel_appointment(appt_id: str, current_user=Depends(get_current_user)):
    from bson import ObjectId
    db = await get_db()
    result = await db.appointments.update_one(
        {"_id": ObjectId(appt_id), "user_id": str(current_user["_id"])},
        {"$set": {"status": "Cancelled"}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"success": True}
