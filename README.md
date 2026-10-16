# DistanceMeter - Đồng Hồ Đo Km & Tính Tiền Cước GPS (100% Client-side JavaScript)

Ứng dụng web thời gian thực phục vụ việc đo quãng đường di chuyển bằng GPS (quy chuẩn bước nhảy **0.1 km**), nhúng bản đồ trực quan (Google Maps, Carto Voyager, Ảnh Vệ Tinh) và tính cước theo bảng giá quy định bậc thang **Taxi Xanh SM**.

Toàn bộ ứng dụng được đóng gói gọn trong **1 file duy nhất (`index.html`)**, chạy 100% bằng JavaScript trên trình duyệt mà không cần cài đặt bất kỳ server hay thư viện backend nào.

---

## 🌟 Tính năng nổi bật

1. **Không cần cài đặt**: Chỉ cần mở file [`index.html`](file:///d:/DistanceMeter/index.html) bằng bất kỳ trình duyệt nào (Chrome, Edge, Safari, Cốc Cốc, v.v.).
2. **Bảng giá chuẩn Taxi Xanh SM**:
   - **Giá mở cửa**: 30.500 VNĐ cho 2.0 km đầu tiên (áp dụng tối thiểu ngay từ 0.0 km).
   - **Từ km tiếp theo đến km 12**: 15.200 VNĐ / km (1.520 VNĐ / 0.1 km).
   - **Từ km tiếp theo đến km 25**: 14.700 VNĐ / km (1.470 VNĐ / 0.1 km).
   - **Từ km thứ 26 trở đi**: 13.300 VNĐ / km (1.330 VNĐ / 0.1 km).
   - Cước thời gian chờ: 60.000 VNĐ / giờ.
3. **Đo quãng đường GPS chuẩn xác (step 0.1 km)**:
   - Thuật toán Haversine đo khoảng cách chuẩn xác, tự động lọc rung lắc GPS khi dừng xe.
   - Làm tròn mỗi 100 mét (step 0.1) đúng chuẩn đồng hồ taxi.
4. **Bản đồ không bị chặn 403**:
   - Tích hợp Google Maps sắc nét, chi tiết đường xá ngõ hẻm Việt Nam.
   - Kèm theo bản đồ Carto Voyager và Ảnh Vệ Tinh, chuyển đổi layer bằng 1 click.
5. **Lưu trữ đám mây Firebase Firestore**:
   - Tự động lưu dữ liệu chuyến đi lên Firebase (`distancemeter-b7a3a`):
     - `stt`: Số thứ tự chuyến đi (1, 2, 3...)
     - `date`: Ngày & giờ hoàn thành chuyến đi
     - `distance`: Quãng đường chuẩn xác (step 0.1 km)
     - `img`: Hình ảnh snapshot lộ trình di chuyển (Canvas Base64)
     - `total_fare`: Tổng tiền cước thanh toán
   - Cơ chế lưu 2 lớp thông minh: Đồng bộ Cloud Firestore và sao lưu LocalStorage, hoạt động ổn định kể cả khi mất mạng.
6. **Xem lịch sử chuyến đi**:
   - Nút **"Lịch sử"** nằm ngay cạnh nút **"Bảng giá cước"** trên thanh tiêu đề.
   - Thống kê tổng số chuyến, tổng số km, tổng doanh thu.
   - Xem ảnh snapshot lộ trình (phóng to, tải ảnh PNG về máy).
   - Mở lại biên lai chi tiết để xem hoặc in lại bất cứ lúc nào.
7. **Biên lai & In hoá đơn**:
   - Xuất hoá đơn chi tiết từng bậc cước kèm hình ảnh đoạn đường đã di chuyển và hỗ trợ In/Lưu PDF tiện lợi.

---

## 🚀 Cách sử dụng

Nhấp đúp chuột vào file:
👉 **`index.html`** hoặc **`start.bat`**

---

## 📁 Cấu trúc thư mục tối giản

```
d:\DistanceMeter\
├── index.html     # Toàn bộ ứng dụng Web (Giao diện + Bản đồ + Tính cước + Firebase)
├── start.bat      # File mở nhanh 1-click
├── README.md      # Tài liệu hướng dẫn
└── .gitignore     # Cấu hình Git
```
