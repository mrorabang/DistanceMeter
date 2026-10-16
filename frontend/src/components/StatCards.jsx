import React from 'react';
import { Gauge, Clock, Coins, Route, Activity } from 'lucide-react';
import { formatCurrency, formatDuration } from '../utils/geo';

export default function StatCards({
  rawDistanceKm,
  steppedDistanceKm,
  totalFare,
  durationSeconds,
  currentSpeedKmh,
  isTracking
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {/* Thẻ Quãng đường (Step 0.1 km) */}
      <div className="relative overflow-hidden bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 md:p-5 border border-cyan-500/20 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs md:text-sm font-medium text-slate-400">Quãng đường</span>
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Route className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-mono">
            {steppedDistanceKm.toFixed(1)}
          </span>
          <span className="text-sm font-semibold text-cyan-400">km</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
          <span>Gốc: {rawDistanceKm.toFixed(3)} km</span>
          <span className="text-cyan-400/90 font-medium bg-cyan-500/10 px-1.5 py-0.5 rounded">
            Step 0.1
          </span>
        </div>
      </div>

      {/* Thẻ Cước phí tạm tính */}
      <div className="relative overflow-hidden bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 md:p-5 border border-emerald-500/30 shadow-lg shadow-emerald-950/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs md:text-sm font-medium text-emerald-400 font-semibold">Tạm tính cước</span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Coins className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl md:text-3xl font-black tracking-tight text-emerald-400 font-mono">
            {formatCurrency(totalFare)}
          </span>
        </div>
        <div className="mt-1 text-[11px] text-slate-400">
          Tính theo bảng giá Python
        </div>
      </div>

      {/* Thẻ Thời gian di chuyển */}
      <div className="relative overflow-hidden bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 md:p-5 border border-slate-700/60 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs md:text-sm font-medium text-slate-400">Thời gian</span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl md:text-3xl font-extrabold text-white font-mono">
            {formatDuration(durationSeconds)}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
          <span className={`w-2 h-2 rounded-full ${isTracking ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></span>
          <span>{isTracking ? 'Đang chạy' : 'Dừng'}</span>
        </div>
      </div>

      {/* Thẻ Tốc độ tức thời */}
      <div className="relative overflow-hidden bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 md:p-5 border border-slate-700/60 shadow-lg">
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
          Cập nhật từ sensor GPS
        </div>
      </div>
    </div>
  );
}

