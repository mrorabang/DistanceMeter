# DistanceMeter - Đồng Hồ Đo Km & Tính Tiền Cước GPS (100% JavaScript)

Ứng dụng web thời gian thực phục vụ việc đo quãng đường di chuyển bằng GPS (quy chuẩn bước nhảy **0.1 km**), nhúng bản đồ OpenStreetMap trực quan và tính cước theo bảng giá quy định bậc thang — **toàn bộ xử lý 100% trong JavaScript ở phía Frontend, không cần cài đặt hay chạy Backend Python.**

---

## 🌟 Ưu điểm của phiên bản gom gọn (Pure JS Frontend)

1. **Không cần Backend / Python**: Toàn bộ thuật toán đo khoảng cách (Haversine), làm tròn step 0.1 km, tính cước bậc thang, lọc nhiễu GPS và sinh biên lai đều được thực thi trực tiếp trên trình duyệt.
2. **Khởi chạy tức thì**: Bạn chỉ cần nhấp đúp vào file [`index.html`](file:///d:/DistanceMeter/index.html) để mở và sử dụng ngay lập tức trong Chrome, Edge, Cốc Cốc, Safari... mà không cần bật server.
3. **Đầy đủ tính năng**:
   - Tự động bắt tín hiệu GPS thật trên điện thoại / máy tính (`navigator.geolocation.watchPosition`).
   - Nhúng bản đồ **OpenStreetMap & Leaflet** sắc nét, vẽ đường di chuyển (Polyline) xanh ngọc, marker A điểm xuất phát và marker radar pulse điểm hiện tại.
   - Nút **Mô phỏng GPS (Test máy tính)**: Giả lập xe chạy quanh hồ Hoàn Kiếm để kiểm thử tính năng nhảy số km và tính cước ngay tại chỗ.
   - Biên lai cước chuyến đi chi tiết từng bậc tính tiền, hỗ trợ nút **In biên lai / Xuất PDF**.
   - Hỗ trợ nhiều loại xe: **Xe 4 chỗ, Xe 7 chỗ, Xe máy**.

---

## 🚀 Cách sử dụng

### Cách 1: Mở trực tiếp bằng 1-Click (Khuyên dùng)
Nhấp đúp chuột vào file:
👉 **[`index.html`](file:///d:/DistanceMeter/index.html)** hoặc file **[`start.bat`](file:///d:/DistanceMeter/start.bat)**

### Cách 2: Chạy qua React + Vite (Nếu muốn phát triển thêm)
```powershell
cd d:\DistanceMeter\frontend
npm run dev
```
Truy cập [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Bảng giá cấu hình trong file JS

Bạn có thể chỉnh sửa bảng giá hoặc bước nhảy trực tiếp tại đầu file:
- File độc lập: [`index.html`](file:///d:/DistanceMeter/index.html) (tìm phần `DEFAULT_PRICING`)
- Dự án React: [`frontend/src/App.jsx`](file:///d:/DistanceMeter/frontend/src/App.jsx) (tìm phần `DEFAULT_PRICING`)

```javascript
const DEFAULT_PRICING = {
  step_km: 0.1, // Bước nhảy làm tròn
  rounding_mode: "round", // "round" (làm tròn chuẩn) hoặc "ceil" (làm tròn lên)
  vehicles: {
    car_4seats: {
      name: "Xe 4 chỗ",
      base_fare: 12000,      // Giá mở cửa 12.000đ cho 1 km đầu
      base_distance_km: 1.0,
      tiers: [
        { from_km: 1.0, to_km: 10.0, price_per_km: 14500, description: "Từ trên 1 km đến 10 km" },
        { from_km: 10.0, to_km: 30.0, price_per_km: 13000, description: "Từ trên 10 km đến 30 km" },
        { from_km: 30.0, to_km: null, price_per_km: 11000, description: "Từ trên 30 km trở đi" }
      ]
    }
  }
};
```
