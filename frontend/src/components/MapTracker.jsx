import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Navigation2, Crosshair, MapPin } from 'lucide-react';

export default function MapTracker({
  currentPos,
  pathCoordinates,
  isTracking,
  autoCenter = true,
  onToggleAutoCenter
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const polylineRef = useRef(null);
  const currentMarkerRef = useRef(null);
  const startMarkerRef = useRef(null);

  // Khởi tạo Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Toạ độ mặc định (Hà Nội: 21.0285, 105.8542) nếu chưa có GPS
    const defaultCenter = currentPos ? [currentPos.lat, currentPos.lng] : [21.0285, 105.8542];

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 16,
      zoomControl: false,
    });

    // Các nguồn bản đồ chất lượng cao, miễn phí và không bị chặn 403
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

    // Đường vẽ lộ trình (Polyline)
    const polyline = L.polyline([], {
      color: '#06b6d4',
      weight: 5,
      opacity: 0.85,
      lineCap: 'round',
      lineJoin: 'round',
      dashArray: null,
    }).addTo(map);

    mapInstanceRef.current = map;
    polylineRef.current = polyline;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Cập nhật marker vị trí hiện tại
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !currentPos) return;

    const latLng = [currentPos.lat, currentPos.lng];

    if (!currentMarkerRef.current) {
      // Icon radar xung nhịp
      const pulseIcon = L.divIcon({
        className: 'gps-pulse-marker',
        html: `
          <div class="pulse-ring"></div>
          <div class="core-dot"></div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      currentMarkerRef.current = L.marker(latLng, { icon: pulseIcon }).addTo(map);
      map.setView(latLng, 16);
    } else {
      currentMarkerRef.current.setLatLng(latLng);
      if (autoCenter) {
        map.panTo(latLng, { animate: true, duration: 0.5 });
      }
    }
  }, [currentPos, autoCenter]);

  // Cập nhật điểm xuất phát (Start Marker)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (pathCoordinates.length > 0) {
      const start = pathCoordinates[0];
      const startLatLng = [start.lat, start.lng];

      if (!startMarkerRef.current) {
        const startIcon = L.divIcon({
          className: 'start-marker',
          html: `
            <div style="background-color: #10b981; color: white; border-radius: 9999px; padding: 4px; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; width: 28px; height: 28px;">
              <span style="font-size: 11px; font-weight: bold;">A</span>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        startMarkerRef.current = L.marker(startLatLng, { icon: startIcon })
          .bindPopup('<b>Điểm khởi hành</b>')
          .addTo(map);
      }
    } else {
      if (startMarkerRef.current) {
        startMarkerRef.current.remove();
        startMarkerRef.current = null;
      }
    }
  }, [pathCoordinates]);

  // Cập nhật đường vẽ lộ trình
  useEffect(() => {
    if (!polylineRef.current) return;
    const latLngs = pathCoordinates.map(p => [p.lat, p.lng]);
    polylineRef.current.setLatLngs(latLngs);
  }, [pathCoordinates]);

  // Nút căn giữa vào vị trí hiện tại
  const handleRecenter = () => {
    if (mapInstanceRef.current && currentPos) {
      mapInstanceRef.current.setView([currentPos.lat, currentPos.lng], 16, { animate: true });
      if (onToggleAutoCenter) onToggleAutoCenter(true);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[380px] md:min-h-[460px] rounded-2xl overflow-hidden shadow-2xl border border-slate-700/60 bg-slate-900">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Controls trên bản đồ */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
        <button
          onClick={handleRecenter}
          title="Căn giữa vị trí hiện tại"
          className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 shadow-lg backdrop-blur-md transition-all active:scale-95"
        >
          <Crosshair className="w-5 h-5 text-cyan-400" />
        </button>
      </div>

      {/* Chú thích bản đồ */}
      <div className="absolute bottom-4 left-4 z-[400] bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700/70 text-xs text-slate-300 shadow-lg flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white"></span>
          <span>Bắt đầu</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-1 rounded bg-cyan-400"></span>
          <span>Lộ trình</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-ping"></span>
          <span>Hiện tại</span>
        </div>
      </div>
    </div>
  );
}

