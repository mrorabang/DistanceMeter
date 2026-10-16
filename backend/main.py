from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

try:
    from config_pricing import VEHICLE_PRICING, STEP_KM, ROUNDING_MODE, DEFAULT_VEHICLE
    from calculator import calculate_fare, process_gps_route, round_to_step
except ImportError:
    from backend.config_pricing import VEHICLE_PRICING, STEP_KM, ROUNDING_MODE, DEFAULT_VEHICLE
    from backend.calculator import calculate_fare, process_gps_route, round_to_step

app = FastAPI(
    title="DistanceMeter API",
    description="Hệ thống tính cước quãng đường di chuyển GPS bước nhảy 0.1 km",
    version="1.0.0"
)

# Cấu hình CORS để React Frontend có thể gọi API mà không bị chặn
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GpsPoint(BaseModel):
    lat: float
    lng: float
    accuracy: Optional[float] = 10.0
    timestamp: Optional[float] = None
    speed: Optional[float] = None

class CalculateRequest(BaseModel):
    distance_km: float = Field(..., ge=0, description="Quãng đường thô tính bằng km")
    vehicle_type: Optional[str] = Field(DEFAULT_VEHICLE, description="Mã loại phương tiện")

class RouteVerifyRequest(BaseModel):
    coordinates: List[GpsPoint]
    vehicle_type: Optional[str] = DEFAULT_VEHICLE
    min_accuracy_meters: Optional[float] = 50.0

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "DistanceMeter Backend"}

@app.get("/api/pricing")
def get_pricing():
    """
    Trả về bảng giá niêm yết cố định được cấu hình trong config_pricing.py
    """
    return {
        "step_km": STEP_KM,
        "rounding_mode": ROUNDING_MODE,
        "default_vehicle": DEFAULT_VEHICLE,
        "vehicles": VEHICLE_PRICING
    }

@app.post("/api/calculate")
def calculate(req: CalculateRequest):
    """
    Tính cước phí dựa trên quãng đường km (làm tròn theo step 0.1)
    """
    result = calculate_fare(req.distance_km, req.vehicle_type or DEFAULT_VEHICLE)
    return result

@app.post("/api/verify-route")
def verify_route(req: RouteVerifyRequest):
    """
    Nhận mảng toạ độ GPS thu thập từ điện thoại/trình duyệt,
    lọc nhiễu, tính tổng quãng đường theo chuẩn Haversine và tính cước.
    """
    coords_dict = [pt.model_dump() for pt in req.coordinates]
    route_res = process_gps_route(
        coords_dict, 
        min_accuracy_meters=req.min_accuracy_meters or 50.0
    )
    
    fare_res = calculate_fare(
        route_res["total_distance_km"], 
        req.vehicle_type or DEFAULT_VEHICLE
    )
    
    return {
        "route": route_res,
        "fare": fare_res
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
