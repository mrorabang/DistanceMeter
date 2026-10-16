const API_BASE = '/api';

export async function fetchPricing() {
  try {
    const res = await fetch(`${API_BASE}/pricing`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Lỗi khi tải bảng giá:', err);
    throw err;
  }
}

export async function calculateFareApi(distanceKm, vehicleType) {
  try {
    const res = await fetch(`${API_BASE}/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        distance_km: distanceKm,
        vehicle_type: vehicleType
      })
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Lỗi khi gọi API tính cước:', err);
    throw err;
  }
}

export async function verifyRouteApi(coordinates, vehicleType) {
  try {
    const res = await fetch(`${API_BASE}/verify-route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        coordinates,
        vehicle_type: vehicleType
      })
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Lỗi khi thẩm tra lộ trình GPS:', err);
    throw err;
  }
}

