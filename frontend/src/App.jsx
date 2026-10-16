import React, { useState, useEffect, useRef } from 'react';
import { 
  Car, 
  MapPin, 
  Coins, 
  FileText, 
  Navigation,
  Sparkles,
  Printer,
  X,
  Play,
  Pause,
  Square,
  RotateCcw,
  Route,
  Clock,
  Gauge,
  Crosshair
} from 'lucide-react';
import L from 'leaflet';

// =========================================================================
// BẢNG GIÁ QUY ĐỊNH CỐ ĐỊNH & BƯỚC NHẢY (STEP 0.1 KM) TRONG FILE JS
// =========================================================================
const DEFAULT_PRICING = {
  step_km: 0.1, // Bước nhảy 0.1 km
  rounding_mode: 'round', // 'round' hoặc 'ceil'
  waiting_fee_per_hour: 60000, // Giá cước thời gian chờ: 60.000 VNĐ/giờ
  vehicles: {
    xanh_sm: {
      name: 'Taxi Xanh SM',
      description: 'Bảng giá cước Taxi Xanh SM (Đã gồm thuế GTGT & Bảo hiểm)',
      base_fare: 30500,          // 30.500 VNĐ
      base_distance_km: 2.0,     // 2.0 km đầu tiên
      tiers: [
        { 
          from_km: 2.0, 
          to_km: 12.0, 
          price_per_km: 15200, 
          description: 'Giá từ km tiếp theo đến km thứ 12' 
        },
        { 
          from_km: 12.0, 
          to_km: 25.0, 
          price_per_km: 14700, 
          description: 'Giá từ km tiếp theo đến km thứ 25' 
        },
        { 
          from_km: 25.0, 
          to_km: null, 
          price_per_km: 13300, 
          description: 'Giá từ km thứ 26 trở đi (đường dài)' 
        }
      ]
    },
    car_4seats: {
      name: 'Xe 4 chỗ tiêu chuẩn',
      description: 'Xe sedan / hatchback 4 chỗ thông dụng',
      base_fare: 12000,
      base_distance_km: 1.0,
      tiers: [
        { from_km: 1.0, to_km: 10.0, price_per_km: 14500, description: 'Từ trên 1 km đến 10 km' },
        { from_km: 10.0, to_km: 30.0, price_per_km: 13000, description: 'Từ trên 10 km đến 30 km' },
        { from_km: 30.0, to_km: null, price_per_km: 11000, description: 'Từ trên 30 km trở đi (đường dài)' }
      ]
    },
    motorbike: {
      name: 'Xe máy',
      description: 'Giao hàng hoặc chở khách bằng xe máy',
      base_fare: 10000,
      base_distance_km: 1.5,
      tiers: [
        { from_km: 1.5, to_km: 10.0, price_per_km: 5000, description: 'Từ trên 1.5 km đến 10 km' },
        { from_km: 10.0, to_km: null, price_per_km: 4000, description: 'Từ trên 10 km trở đi' }
      ]
    }
  }
};

// Toạ độ giả lập chạy thử quanh Hồ Hoàn Kiếm, Hà Nội
const SIMULATION_ROUTE = [
  { lat: 21.028511, lng: 105.854167 },
  { lat: 21.029400, lng: 105.854450 },
  { lat: 21.030700, lng: 105.854600 },
  { lat: 21.032000, lng: 105.854100 },
  { lat: 21.033200, lng: 105.853200 },
  { lat: 21.033800, lng: 105.852000 },
  { lat: 21.033400, lng: 105.850700 },
  { lat: 21.032100, lng: 105.850300 },
  { lat: 21.030600, lng: 105.850900 },
  { lat: 21.029300, lng: 105.851700 },
  { lat: 21.028100, lng: 105.852600 },
  { lat: 21.026900, lng: 105.853600 },
  { lat: 21.026500, lng: 105.854800 },
  { lat: 21.027600, lng: 105.855500 },
  { lat: 21.028511, lng: 105.854167 }
];

// Tính khoảng cách Haversine (km)
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371.0088;
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

// Quy chuẩn bước nhảy step 0.1 km
function roundToStep(distanceKm, step = 0.1, mode = 'round') {
  if (!distanceKm || distanceKm <= 0) return 0.0;
  const factor = 1 / step;
  const stepped = mode === 'ceil' 
    ? Math.ceil(distanceKm * factor) / factor 
    : Math.round(distanceKm * factor) / factor;
  return Number(stepped.toFixed(1));
}

// Tính cước xe bậc thang
function calculateFare(distanceKm, vehicleKey = 'car_4seats', pricing = DEFAULT_PRICING) {
  const vehicle = pricing.vehicles[vehicleKey] || pricing.vehicles.car_4seats;
  const steppedKm = roundToStep(distanceKm, pricing.step_km, pricing.rounding_mode);

  if (steppedKm <= 0) {
    return {
      vehicleName: vehicle.name,
      rawDistanceKm: Number((distanceKm || 0).toFixed(3)),
      steppedDistanceKm: 0.0,
      totalFare: 0,
      breakdown: []
    };
  }

  let total = 0;
  const breakdown = [];
  const baseDist = vehicle.base_distance_km;
  const baseFare = vehicle.base_fare;

  // 1. Cước mở cửa
  const distInBase = Math.min(steppedKm, baseDist);
  total += baseFare;
  breakdown.push({
    stepName: `Giá mở cửa (${baseDist} km đầu)`,
    distanceKm: Number(distInBase.toFixed(1)),
    rate: baseFare,
    unit: 'đ/chuyến',
    subtotal: baseFare
  });

  // 2. Bậc cước tiếp theo
  if (steppedKm > baseDist) {
    for (const tier of vehicle.tiers) {
      if (steppedKm > tier.from_km) {
        const upper = tier.to_km !== null ? Math.min(steppedKm, tier.to_km) : steppedKm;
        const distInTier = Math.max(0, upper - tier.from_km);
        if (distInTier > 0) {
          const roundedTierDist = Number(distInTier.toFixed(1));
          const sub = Math.round(roundedTierDist * tier.price_per_km);
          total += sub;
          breakdown.push({
            stepName: tier.description || `Từ ${tier.from_km} km`,
            distanceKm: roundedTierDist,
            rate: tier.price_per_km,
            unit: 'đ/km',
            subtotal: sub
          });
        }
      }
    }
  }

  return {
    vehicleName: vehicle.name,
    rawDistanceKm: Number(distanceKm.toFixed(3)),
    steppedDistanceKm: steppedKm,
    totalFare: total,
    breakdown
  };
}

function formatVND(amount) {
  if (amount === undefined || amount === null) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount);
}

function formatTime(totalSeconds) {
  if (!totalSeconds || totalSeconds <= 0) return '00:00:00';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  const pad = (n) => n.toString().padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function App() {
  const [pricing] = useState(DEFAULT_PRICING);
  const [selectedVehicle, setSelectedVehicle] = useState('xanh_sm');
  const [tripStatus, setTripStatus] = useState('idle'); // 'idle' | 'running' | 'paused' | 'finished'

  const [currentPos, setCurrentPos] = useState({ lat: 21.028511, lng: 105.854167, accuracy: 10 });
  const [pathCoords, setPathCoords] = useState([]);
  const [rawDistanceKm, setRawDistanceKm] = useState(0.0);
  const [steppedDistanceKm, setSteppedDistanceKm] = useState(0.0);
  const [totalFare, setTotalFare] = useState(0);
  const [fareResult, setFareResult] = useState(null);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState(0);

  const [isSimulating, setIsSimulating] = useState(false);
  const [gpsStatus, setGpsStatus] = useState('Đang khởi tạo GPS...');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  const [showInvoice, setShowInvoice] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const polylineRef = useRef(null);
  const currentMarkerRef = useRef(null);
  const startMarkerRef = useRef(null);
  const watchIdRef = useRef(null);
  const timerRef = useRef(null);
  const simIntervalRef = useRef(null);
  const simIndexRef = useRef(0);

  // Khởi tạo Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [currentPos.lat, currentPos.lng],
      zoom: 16,
      zoomControl: false,
    });

    // Các layer bản đồ mượt mà, không bị chặn 403
    const baseMaps = {
      'Google Maps': L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        attribution: '&copy; Google Maps'
      }),
      'Bản đồ Voyager (OSM)': L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 20,
        attribution: '&copy; CARTO &copy; OpenStreetMap'
      }),
      'Ảnh Vệ Tinh': L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        attribution: '&copy; Google Satellite'
      })
    };

    baseMaps['Google Maps'].addTo(map);
    L.control.layers(baseMaps, null, { position: 'topright' }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const polyline = L.polyline([], {
      color: '#06b6d4',
      weight: 5,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    mapRef.current = map;
    polylineRef.current = polyline;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Cập nhật marker hiện tại
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !currentPos) return;

    const latLng = [currentPos.lat, currentPos.lng];

    if (!currentMarkerRef.current) {
      const pulseIcon = L.divIcon({
        className: 'gps-pulse-marker',
        html: '<div class="pulse-ring"></div><div class="core-dot"></div>',
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });
      currentMarkerRef.current = L.marker(latLng, { icon: pulseIcon }).addTo(map);
      map.setView(latLng, 16);
    } else {
      currentMarkerRef.current.setLatLng(latLng);
    }
  }, [currentPos]);

  // Marker xuất phát
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (pathCoords.length > 0) {
      const startPt = pathCoords[0];
      const latLng = [startPt.lat, startPt.lng];

      if (!startMarkerRef.current) {
        const startIcon = L.divIcon({
          className: 'start-marker',
          html: `
            <div style="background-color: #10b981; color: white; border-radius: 9999px; padding: 4px; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; width: 28px; height: 28px;">
              <span style="font-size: 12px; font-weight: 800;">A</span>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        startMarkerRef.current = L.marker(latLng, { icon: startIcon }).addTo(map);
      }
    } else {
      if (startMarkerRef.current) {
        startMarkerRef.current.remove();
        startMarkerRef.current = null;
      }
    }
  }, [pathCoords]);

  // Vẽ lộ trình
  useEffect(() => {
    if (!polylineRef.current) return;
    polylineRef.current.setLatLngs(pathCoords.map((p) => [p.lat, p.lng]));
  }, [pathCoords]);

  // Lấy vị trí ban đầu
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          const pt = { lat: latitude, lng: longitude, accuracy };
          setCurrentPos(pt);
          setGpsStatus(`GPS sẵn sàng (±${Math.round(accuracy)}m)`);
          if (mapRef.current) mapRef.current.setView([latitude, longitude], 16);
        },
        () => {
          setGpsStatus('Dùng toạ độ mặc định (Hà Nội)');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []);

  // Timer đồng hồ
  useEffect(() => {
    if (tripStatus === 'running') {
      timerRef.current = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [tripStatus]);

  // Tự động tính tiền cước trong JS
  useEffect(() => {
    const result = calculateFare(rawDistanceKm, selectedVehicle, pricing);
    setSteppedDistanceKm(result.steppedDistanceKm);
    setTotalFare(result.totalFare);
    setFareResult(result);
  }, [rawDistanceKm, selectedVehicle, pricing]);

  // GPS Watcher thực tế
  useEffect(() => {
    if (tripStatus === 'running' && !isSimulating) {
      if (!('geolocation' in navigator)) {
        alert('Trình duyệt không hỗ trợ Geolocation!');
        return;
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, accuracy, speed } = pos.coords;
          const newPt = {
            lat: latitude,
            lng: longitude,
            accuracy: accuracy || 10,
            timestamp: pos.timestamp,
            speed: speed || 0
          };

          setCurrentPos(newPt);
          setGpsStatus(`GPS hoạt động (±${Math.round(accuracy || 0)}m)`);
          if (speed && speed > 0) setCurrentSpeedKmh(speed * 3.6);

          if (mapRef.current) mapRef.current.panTo([latitude, longitude], { animate: true });

          setPathCoords((prev) => {
            if (prev.length === 0) return [newPt];
            const last = prev[prev.length - 1];
            const distKm = haversineDistance(last.lat, last.lng, newPt.lat, newPt.lng);
            const distMeters = distKm * 1000;

            if (distMeters < 3 || (accuracy && accuracy > 50)) return prev;

            setRawDistanceKm((d) => d + distKm);
            return [...prev, newPt];
          });
        },
        (err) => setGpsStatus(`Lỗi GPS: ${err.message}`),
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 }
      );
    } else {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [tripStatus, isSimulating]);

  // Giả lập GPS test máy tính
  useEffect(() => {
    if (tripStatus === 'running' && isSimulating) {
      simIntervalRef.current = setInterval(() => {
        simIndexRef.current = (simIndexRef.current + 1) % SIMULATION_ROUTE.length;
        const target = SIMULATION_ROUTE[simIndexRef.current];
        const simPt = {
          lat: target.lat + (Math.random() - 0.5) * 0.0001,
          lng: target.lng + (Math.random() - 0.5) * 0.0001,
          accuracy: 5,
          timestamp: Date.now(),
          speed: 8.5
        };

        setCurrentPos(simPt);
        setCurrentSpeedKmh(28 + Math.random() * 6);

        if (mapRef.current) mapRef.current.panTo([simPt.lat, simPt.lng], { animate: true });

        setPathCoords((prev) => {
          if (prev.length === 0) return [simPt];
          const last = prev[prev.length - 1];
          const distKm = haversineDistance(last.lat, last.lng, simPt.lat, simPt.lng);
          setRawDistanceKm((d) => d + distKm);
          return [...prev, simPt];
        });
      }, 1500);
    } else {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    }
    return () => {
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [tripStatus, isSimulating]);

  const handleStart = () => {
    setStartTime(new Date());
    setEndTime(null);
    setTripStatus('running');
    setRawDistanceKm(0.0);
    setSteppedDistanceKm(0.0);
    setTotalFare(0);
    setDurationSeconds(0);
    setPathCoords([currentPos]);
  };

  const handlePause = () => {
    setTripStatus('paused');
    setCurrentSpeedKmh(0);
  };

  const handleResume = () => {
    setTripStatus('running');
  };

  const handleFinish = () => {
    setEndTime(new Date());
    setTripStatus('finished');
    setCurrentSpeedKmh(0);
    const finalFare = calculateFare(rawDistanceKm, selectedVehicle, pricing);
    setFareResult(finalFare);
    setShowInvoice(true);
  };

  const handleReset = () => {
    setTripStatus('idle');
    setPathCoords([]);
    setRawDistanceKm(0.0);
    setSteppedDistanceKm(0.0);
    setTotalFare(0);
    setDurationSeconds(0);
    setCurrentSpeedKmh(0);
    setStartTime(null);
    setEndTime(null);
    setFareResult(null);
  };

  const handleRecenter = () => {
    if (mapRef.current && currentPos) {
      mapRef.current.setView([currentPos.lat, currentPos.lng], 16, { animate: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-md shadow-emerald-950/40 text-white">
              <Navigation className="w-6 h-6 rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-black tracking-tight text-white">
                  Distance<span className="text-emerald-400">Meter</span>
                </h1>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Step 0.1 KM (JS Pure)
                </span>
              </div>
              <p className="text-xs text-slate-400">Tính cước & đo lộ trình GPS xử lý 100% trong JavaScript</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs">
              <Car className="w-4 h-4 text-emerald-400" />
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                disabled={tripStatus === 'running'}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
              >
                {Object.entries(pricing.vehicles).map(([k, v]) => (
                  <option key={k} value={k} className="bg-slate-900 text-white">
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowPricingModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-all"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Bảng giá cước</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 space-y-4">
        {/* GPS Status */}
        <div className="flex items-center justify-between text-xs px-2 text-slate-400">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${
              isSimulating ? 'bg-purple-500 animate-pulse' :
              tripStatus === 'running' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
            }`} />
            <span>{isSimulating ? 'Mô phỏng xe chạy quanh Hồ Gươm' : gpsStatus}</span>
          </div>
          {tripStatus === 'running' && (
            <div className="text-emerald-400 font-medium animate-pulse">
              ● Đang đo đạc lộ trình di chuyển
            </div>
          )}
        </div>

        {/* 4 Cards Thống Kê */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-slate-800/90 rounded-2xl p-4 md:p-5 border border-cyan-500/20 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs md:text-sm font-medium text-slate-400">Quãng đường</span>
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                <Route className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl md:text-4xl font-extrabold text-white font-mono">
                {steppedDistanceKm.toFixed(1)}
              </span>
              <span className="text-sm font-semibold text-cyan-400">km</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
              <span>Gốc: {rawDistanceKm.toFixed(3)} km</span>
              <span className="text-cyan-400 font-medium bg-cyan-500/10 px-1.5 py-0.5 rounded">
                Step 0.1 km
              </span>
            </div>
          </div>

          <div className="bg-slate-800/90 rounded-2xl p-4 md:p-5 border border-emerald-500/30 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs md:text-sm font-medium text-emerald-400 font-semibold">Tạm tính tiền cước</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Coins className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-black text-emerald-400 font-mono">
              {formatVND(totalFare)}
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              Tính tự động trong file JS
            </div>
          </div>

          <div className="bg-slate-800/90 rounded-2xl p-4 md:p-5 border border-slate-700/60 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs md:text-sm font-medium text-slate-400">Thời gian</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-white font-mono">
              {formatTime(durationSeconds)}
            </div>
            <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${tripStatus === 'running' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></span>
              <span>{tripStatus === 'running' ? 'Đang chạy' : 'Dừng'}</span>
            </div>
          </div>

          <div className="bg-slate-800/90 rounded-2xl p-4 md:p-5 border border-slate-700/60 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs md:text-sm font-medium text-slate-400">Tốc độ tức thời</span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Gauge className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl md:text-4xl font-extrabold text-white font-mono">
                {currentSpeedKmh.toFixed(0)}
              </span>
              <span className="text-sm font-semibold text-indigo-400">km/h</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              Từ cảm biến GPS
            </div>
          </div>
        </div>

        {/* Nút Điều Khiển */}
        <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700/60 shadow-xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            {tripStatus === 'idle' && (
              <button
                onClick={handleStart}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Bắt đầu chuyến đi</span>
              </button>
            )}

            {tripStatus === 'running' && (
              <>
                <button
                  onClick={handlePause}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-lg transition-all active:scale-95"
                >
                  <Pause className="w-5 h-5 fill-current" />
                  <span>Tạm dừng</span>
                </button>
                <button
                  onClick={handleFinish}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-950/40 transition-all active:scale-95"
                >
                  <Square className="w-5 h-5 fill-current" />
                  <span>Kết thúc & Tính tiền</span>
                </button>
              </>
            )}

            {tripStatus === 'paused' && (
              <>
                <button
                  onClick={handleResume}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg transition-all active:scale-95"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Tiếp tục di chuyển</span>
                </button>
                <button
                  onClick={handleFinish}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-950/40 transition-all active:scale-95"
                >
                  <Square className="w-5 h-5 fill-current" />
                  <span>Kết thúc & Tính tiền</span>
                </button>
              </>
            )}

            {tripStatus === 'finished' && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold shadow-lg transition-all active:scale-95"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Bắt đầu chuyến mới</span>
              </button>
            )}
          </div>

          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isSimulating
                ? 'bg-purple-600/30 border-purple-500 text-purple-300 shadow-lg'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>{isSimulating ? 'Đang bật mô phỏng GPS' : 'Mô phỏng GPS (Test máy tính)'}</span>
          </button>
        </div>

        {/* Khung bản đồ Leaflet */}
        <div className="relative w-full h-[440px] md:h-[520px] rounded-2xl overflow-hidden shadow-2xl border border-slate-700/60 bg-slate-900">
          <div ref={mapContainerRef} className="w-full h-full" />

          <div className="absolute top-4 right-4 z-[400]">
            <button
              onClick={handleRecenter}
              title="Căn giữa vị trí hiện tại"
              className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-400 border border-slate-700 shadow-lg backdrop-blur-md transition-all active:scale-95"
            >
              <Crosshair className="w-5 h-5" />
            </button>
          </div>

          <div className="absolute bottom-4 left-4 z-[400] bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700 text-xs text-slate-300 shadow-lg flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white"></span>
              <span>Điểm đầu</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-1 rounded bg-cyan-400"></span>
              <span>Đoạn đường di chuyển</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-ping"></span>
              <span>Vị trí hiện tại</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-3 text-center text-xs text-slate-500">
        DistanceMeter • 100% Client-side React JS • Step 0.1 KM • OpenStreetMap Leaflet
      </footer>

      {/* Modal Hoá đơn */}
      {showInvoice && fareResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black">BIÊN LAI CƯỚC CHUYẾN ĐI</h2>
                <p className="text-xs text-emerald-100">Đồng hồ GPS tính cước chuẩn xác theo quy định</p>
              </div>
              <button
                onClick={() => setShowInvoice(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-slate-200">
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 text-xs">
                <div>
                  <span className="text-slate-400">Phương tiện:</span>
                  <p className="font-semibold text-slate-100 text-sm mt-0.5">{fareResult.vehicleName}</p>
                </div>
                <div>
                  <span className="text-slate-400">Thời gian di chuyển:</span>
                  <p className="font-semibold text-slate-100 text-sm mt-0.5">{formatTime(durationSeconds)}</p>
                </div>
                <div>
                  <span className="text-slate-400">Bắt đầu:</span>
                  <p className="font-medium text-slate-200 mt-0.5">
                    {startTime ? startTime.toLocaleTimeString('vi-VN') : '--:--'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Kết thúc:</span>
                  <p className="font-medium text-slate-200 mt-0.5">
                    {endTime ? endTime.toLocaleTimeString('vi-VN') : '--:--'}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 flex items-center justify-between">
                <div>
                  <span className="text-xs text-cyan-300 font-medium">Quãng đường tính cước:</span>
                  <div className="text-2xl font-black text-cyan-400 font-mono">
                    {fareResult.steppedDistanceKm.toFixed(1)} km
                  </div>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <p>GPS thô: {fareResult.rawDistanceKm.toFixed(3)} km</p>
                  <p className="text-cyan-400 font-semibold mt-0.5">Bước nhảy: 0.1 km</p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Chi tiết các bậc tính tiền
                </h3>
                <div className="border border-slate-700 rounded-2xl overflow-hidden divide-y divide-slate-800 text-xs">
                  {fareResult.breakdown.map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-800/40 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-100">{item.stepName}</p>
                        <p className="text-slate-400 text-[11px]">
                          {item.distanceKm} km × {formatVND(item.rate)}
                        </p>
                      </div>
                      <span className="font-bold text-slate-200 font-mono text-sm">
                        {formatVND(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border-2 border-emerald-500/50 flex items-center justify-between">
                <div>
                  <span className="text-xs text-emerald-300 font-bold uppercase">Tổng cước thanh toán</span>
                  <p className="text-[11px] text-slate-400">Đã bao gồm thuế và các bậc cước</p>
                </div>
                <div className="text-3xl font-black text-emerald-400 font-mono">
                  {formatVND(fareResult.totalFare)}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-800 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium text-xs transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>In biên lai</span>
              </button>
              <button
                onClick={() => setShowInvoice(false)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Bảng giá */}
      {showPricingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">BẢNG GIÁ CƯỚC NIÊM YẾT</h2>
                  <p className="text-xs text-slate-400">
                    Cấu hình quy chuẩn bước nhảy: {pricing.step_km} km (100 mét)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPricingModal(false)}
                className="p-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-slate-200">
              <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-xs text-cyan-200 leading-relaxed">
                💡 <b>Quy tắc tính toán:</b> Quãng đường GPS thực tế sau khi lọc nhiễu sẽ được làm tròn theo 
                bước nhảy <b>{pricing.step_km} km</b>, sau đó tính tiền lũy tiến theo từng bậc cước bên dưới.
              </div>

              <div className="space-y-4">
                {Object.entries(pricing.vehicles).map(([k, v]) => (
                  <div key={k} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-base font-bold text-white">{v.name}</h3>
                        <p className="text-xs text-slate-400">{v.description}</p>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-slate-700 font-semibold text-emerald-400">
                        Mở cửa: {formatVND(v.base_fare)} / {v.base_distance_km} km
                      </span>
                    </div>

                    <div className="border border-slate-700 rounded-xl overflow-hidden divide-y divide-slate-800 text-xs">
                      <div className="p-2.5 bg-slate-800 font-semibold text-slate-300 flex justify-between">
                        <span>Mốc khoảng cách</span>
                        <span>Đơn giá</span>
                      </div>
                      <div className="p-2.5 bg-slate-900/40 flex justify-between text-slate-300">
                        <span>0 đến {v.base_distance_km} km đầu tiên</span>
                        <span className="font-mono text-emerald-400">{formatVND(v.base_fare)} (Trọn gói)</span>
                      </div>
                      {v.tiers.map((t, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-900/20 flex justify-between text-slate-300">
                          <span>{t.description}</span>
                          <span className="font-mono text-cyan-300">{formatVND(t.price_per_km)}/km</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-800 border-t border-slate-700 flex justify-end">
              <button
                onClick={() => setShowPricingModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
