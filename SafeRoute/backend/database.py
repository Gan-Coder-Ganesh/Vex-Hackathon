import os
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

supabase: Client = create_client(url, key)

def create_report(lat: float, long: float, report_type: str, description: str = None):
    # 1. First, check verification logic
    # Find reports within 200m in last 30 mins
    
    # We use Supabase RPC or direct query.
    # Since we can't easily write RPCs without access to the dashboard SQL editor, 
    # we will use the client to fetch data and filter (less efficient but works for hackathon)
    # OR we can assume we have PostGIS enabled and try a colorful query if possible.
    # But Supabase-js/py client allows filtering.
    
    # However, PostGIS 'st_dwithin' is hard to call from client strictly unless we used an RPC.
    # Let's try to simple fetching of recent reports and calculating distance in Python 
    # OR if we trust the user has run the schema.sql which enabled PostGIS.
    
    # Let's use a Python verification for simplicity and reliability if we can't guarantee RPC.
    # Actually, we can use the `.rpc()` method if we defined a function, but we didn't define a 'verify' function in schema.sql.
    # So we will fetch basic data.
    
    time_threshold = datetime.utcnow() - timedelta(minutes=30)
    
    # Fetch all reports from last 30 mins. 
    # Optimized: ideally we'd filter by lat/long box, but for prototype fetch last 50-100 reports.
    response = supabase.table("user_reports")\
        .select("*")\
        .gte("created_at", time_threshold.isoformat())\
        .execute()
        
    reports = response.data
    nearby_count = 0
    
    # Simple Haversine or simple Euclidean for small distances (200m is small)
    # 1 deg lat approx 111km. 200m = 0.2km. 0.2/111 = 0.0018 degrees.
    # Let's use simple bounding box or distance check in python.
    
    for r in reports:
        # crude euclidean approximation for speed
        d_lat = abs(r['lat'] - lat)
        d_long = abs(r['long'] - long)
        if d_lat < 0.002 and d_long < 0.002:
             nearby_count += 1
             
    status = "UNVERIFIED"
    if nearby_count >= 2: # " > 2 other reports" means 3 including this one, or existing 2? 
        # " > 2 other reports" usually means strictly more than 2 existing. 
        # But let's say if we find 2 existing, plus this one = 3 total. 
        # Let's stick to "> 2" existing (so 3 existing).
        # Actually simplest interpretation: if there are already 2 reports nearby.
        status = "VERIFIED"
        
    data = {
        "lat": lat,
        "long": long,
        "report_type": report_type,
        "verified_status": status,
        "verification_score": nearby_count,
        "description": description
    }
    
    # Insert
    result = supabase.table("user_reports").insert(data).execute()
    return result.data[0]

def get_reports():
    response = supabase.table("user_reports").select("*").order("created_at", desc=True).limit(100).execute()
    return response.data
