"""
BẢNG GIÁ CẤU HÌNH CỐ ĐỊNH (DISTANCE METER PRICING CONFIG)
=========================================================
Bảng giá cước Taxi Xanh SM (chuẩn theo niêm yết trên xe)
"""

# Bước nhảy làm tròn khoảng cách (step 0.1 km)
STEP_KM = 0.1

# Chế độ làm tròn: "round" (làm tròn chuẩn, vd 1.24 -> 1.2, 1.26 -> 1.3)
ROUNDING_MODE = "round"

# Giá cước thời gian chờ: 60.000 VNĐ / giờ
WAITING_FEE_PER_HOUR = 60000

VEHICLE_PRICING = {
    "xanh_sm": {
        "name": "Taxi Xanh SM",
        "description": "Bảng giá cước Taxi Xanh SM (Đã bao gồm thuế GTGT & Bảo hiểm)",
        "currency": "VNĐ",
        # Giá mở cửa: 2 km đầu tiên
        "base_fare": 30500,          # 30.500 VNĐ
        "base_distance_km": 2.0,     # Áp dụng cho 2.0 km đầu
        "tiers": [
            {
                "from_km": 2.0,
                "to_km": 12.0,
                "price_per_km": 15200,  # 15.200 VNĐ/km (tương đương 1.520 VNĐ / 0.1 km)
                "description": "Giá từ km tiếp theo đến km thứ 12"
            },
            {
                "from_km": 12.0,
                "to_km": 25.0,
                "price_per_km": 14700,  # 14.700 VNĐ/km (tương đương 1.470 VNĐ / 0.1 km)
                "description": "Giá từ km tiếp theo đến km thứ 25"
            },
            {
                "from_km": 25.0,
                "to_km": None,          # Từ km thứ 26 trở đi
                "price_per_km": 13300,  # 13.300 VNĐ/km (tương đương 1.330 VNĐ / 0.1 km)
                "description": "Giá từ km thứ 26 trở đi (đường dài)"
            }
        ]
    },
    "car_4seats": {
        "name": "Xe 4 chỗ tiêu chuẩn",
        "description": "Xe 4 chỗ thông thường",
        "currency": "VNĐ",
        "base_fare": 12000,
        "base_distance_km": 1.0,
        "tiers": [
            { "from_km": 1.0, "to_km": 10.0, "price_per_km": 14500, "description": "Từ trên 1 km đến 10 km" },
            { "from_km": 10.0, "to_km": 30.0, "price_per_km": 13000, "description": "Từ trên 10 km đến 30 km" },
            { "from_km": 30.0, "to_km": None, "price_per_km": 11000, "description": "Từ trên 30 km trở đi" }
        ]
    },
    "motorbike": {
        "name": "Xe máy",
        "description": "Chở khách hoặc giao hàng bằng xe máy",
        "currency": "VNĐ",
        "base_fare": 10000,
        "base_distance_km": 1.5,
        "tiers": [
            { "from_km": 1.5, "to_km": 10.0, "price_per_km": 5000, "description": "Từ trên 1.5 km đến 10 km" },
            { "from_km": 10.0, "to_km": None, "price_per_km": 4000, "description": "Từ trên 10 km trở đi" }
        ]
    }
}

DEFAULT_VEHICLE = "xanh_sm"
