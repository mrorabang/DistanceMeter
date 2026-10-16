// Công thức Haversine tính khoảng cách giữa 2 điểm toạ độ (trả về km)
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371.0088; // Bán kính Trái Đất (km)
  const toRad = (x) => (x * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Quy chuẩn step 0.1 km
export function roundToStep(distanceKm, step = 0.1) {
  if (!distanceKm || distanceKm <= 0) return 0.0;
  return Number((Math.round(distanceKm / step) * step).toFixed(1));
}

// Định dạng tiền tệ VNĐ
export function formatCurrency(amount) {
  if (amount === undefined || amount === null) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount);
}

// Định dạng thời gian di chuyển (hh:mm:ss)
export function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '00:00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const pad = (n) => n.toString().padStart(2, '0');
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}

