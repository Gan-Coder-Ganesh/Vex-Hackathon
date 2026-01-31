from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import os
import traceback
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase Init
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

class ReportSchema(BaseModel):
    lat: float
    lng: float
    type: str 
    description: Optional[str] = None

@app.get("/")
def read_root():
    return {"status": "online", "service": "SafeRoute Backend"}

@app.post("/api/report")
async def create_report(report: ReportSchema):
    print(f"📥 RECEIVED DATA: {report}")  # Print 1: Prove request arrived

    try:
        data = {
            "lat": report.lat,
            "lng": report.lng,
            "type": report.type,
            "description": report.description,
            "status": "PENDING"
        }
        
        # Print 2: Check Supabase connection
        print("⚡ Connecting to Supabase...")
        
        # Execute Insert
        response = supabase.table("user_reports").insert(data).execute()
        
        print(f"✅ SUCCESS: {response}")
        return {"message": "Report saved", "data": response.data}

    except Exception as e:
        # Print 3: The Actual Error
        print("❌ CRITICAL BACKEND ERROR ❌")
        traceback.print_exc()  # Prints the full error to terminal
        return JSONResponse(status_code=500, content={"detail": str(e)})

@app.get("/api/shelters")
async def get_shelters():
    try:
        # Fetch all active shelters
        response = supabase.table("shelters").select("*").execute()
        return response.data
    except Exception as e:
        print(f"Error fetching shelters: {e}")
        return [] # Return empty list on error

@app.get("/api/reports")
async def list_reports():
    print("🔄 FETCHING REPORTS...")
    try:
        # Select all data from Supabase
        response = supabase.table("user_reports").select("*").execute()
        
        # Check if response has data
        if not response.data:
            print("⚠ No reports found or empty list.")
            return []
            
        print(f"✅ Loaded {len(response.data)} reports.")
        return response.data

    except Exception as e:
        print("❌ CRITICAL GET ERROR ❌")
        traceback.print_exc() # Print full error to terminal
        return JSONResponse(status_code=500, content={"detail": str(e)})

@app.get("/weather")
def get_weather():
    return {
        "status": "alert", 
        "message": "Heavy Rain in Chennai",
        "details": "Severe weather conditions detected."
    }

