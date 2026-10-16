import math
from typing import List, Dict, Any, Optional
try:
    from config_pricing import VEHICLE_PRICING, STEP_KM, ROUNDING_MODE, DEFAULT_VEHICLE
except ImportError:
    from backend.config_pricing import VEHICLE_PRICING, STEP_KM, ROUNDING_MODE, DEFAULT_VEHICLE

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Tính khoảng cách giữa 2 toạ độ GPS theo công thức Haversine (đơn vị: km).
    Bán kính Trái Đất trung bình R = 6371.0088 km.
    """
    R = 6371.0088
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def round_to_step(distance_km: float, step: float = STEP_KM, mode: str = ROUNDING_MODE) -> float:
    """
    Làm tròn quãng đường theo bước nhảy (step 0.1 km).
    mode = 'round': 1.24 -> 1.2, 1.26 -> 1.3
    mode = 'ceil': 1.21 -> 1.3
    """
    if distance_km <= 0:
        return 0.0

    factor = 1.0 / step
    if mode == "ceil":
        stepped = math.ceil(distance_km * factor) / factor
    else:
        # Chuẩn hoá tránh lỗi sai số dấu chấm động float
        stepped = round(distance_km * factor) / factor
    
    return round(stepped, 1)

def calculate_fare(
    distance_km: float, 
    vehicle_type: str = DEFAULT_VEHICLE
) -> Dict[str, Any]:
    """
    Tính toán cước phí dựa trên số km đã quy chuẩn theo step 0.1 km
    và bảng giá cấu hình trong config_pricing.py.
    """
    if vehicle_type not in VEHICLE_PRICING:
        vehicle_type = DEFAULT_VEHICLE

    pricing = VEHICLE_PRICING[vehicle_type]
    stepped_km = round_to_step(distance_km)

    base_dist = pricing["base_distance_km"]
    base_fare = pricing["base_fare"]

    # Luôn tính giá mở cửa ngay từ mét đầu tiên (kể cả 0.0 km)
    total_fare = float(base_fare)
    dist_in_base = min(stepped_km, base_dist)
    breakdown = [{
        "step_name": f"Giá mở cửa ({base_dist} km đầu)",
        "distance_km": round(dist_in_base, 1),
        "rate": base_fare,
        "rate_unit": f"{pricing['currency']}/chuyến",
        "subtotal": base_fare
    }]

    # 2. Các bậc tiếp theo
    if stepped_km > base_dist:
        remaining_km = stepped_km - base_dist
        for tier in pricing.get("tiers", []):
            from_km = tier["from_km"]
            to_km = tier.get("to_km")
            price_per_km = tier["price_per_km"]

            # Kiểm tra xem quãng đường có chạm vào bậc này không
            if stepped_km > from_km:
                if to_km is not None:
                    # Khoảng cách trong bậc này
                    upper = min(stepped_km, to_km)
                    dist_in_tier = max(0.0, upper - from_km)
                else:
                    dist_in_tier = max(0.0, stepped_km - from_km)

                if dist_in_tier > 0:
                    dist_in_tier = round(dist_in_tier, 1)
                    subtotal = dist_in_tier * price_per_km
                    total_fare += subtotal
                    breakdown.append({
                        "step_name": tier.get("description", f"Từ {from_km} km"),
                        "distance_km": dist_in_tier,
                        "rate": price_per_km,
                        "rate_unit": f"{pricing['currency']}/km",
                        "subtotal": round(subtotal)
                    })

    return {
        "vehicle_type": vehicle_type,
        "vehicle_name": pricing["name"],
        "raw_distance_km": round(distance_km, 3),
        "stepped_distance_km": stepped_km,
        "step_precision": STEP_KM,
        "base_fare": pricing["base_fare"],
        "total_fare": int(round(total_fare)),
        "currency": pricing["currency"],
        "breakdown": breakdown
    }

def process_gps_route(
    coordinates: List[Dict[str, float]], 
    min_accuracy_meters: float = 50.0,
    min_delta_meters: float = 3.0
) -> Dict[str, Any]:
    """
    Xử lý danh sách toạ độ GPS thu thập từ thiết bị di chuyển,
    lọc nhiễu (GPS jitter) và tính tổng quãng đường.
    coordinates = [{"lat": 21.0285, "lng": 105.8542, "accuracy": 10.0, "timestamp": 123456789}, ...]
    """
    if not coordinates or len(coordinates) < 2:
        return {
            "total_distance_km": 0.0,
            "stepped_distance_km": 0.0,
            "point_count": len(coordinates) if coordinates else 0,
            "filtered_points": coordinates or []
        }

    valid_points = []
    total_km = 0.0

    last_pt = None
    for pt in coordinates:
        # Bỏ qua điểm nếu độ sai số GPS (accuracy) quá lớn > 50m
        acc = pt.get("accuracy", 0.0)
        if acc > min_accuracy_meters:
            continue

        lat = pt["lat"]
        lng = pt["lng"]

        if last_pt is None:
            last_pt = (lat, lng)
            valid_points.append(pt)
            continue

        dist_km = haversine_distance(last_pt[0], last_pt[1], lat, lng)
        dist_meters = dist_km * 1000.0

        # Lọc nhiễu đứng yên: nếu di chuyển nhỏ hơn min_delta_meters (3m) thì bỏ qua
        if dist_meters >= min_delta_meters:
            total_km += dist_km
            last_pt = (lat, lng)
            valid_points.append(pt)

    return {
        "total_distance_km": round(total_km, 3),
        "stepped_distance_km": round_to_step(total_km),
        "point_count": len(valid_points),
        "filtered_points": valid_points
    }
