import React from 'react';
import { Play, Pause, Square, RotateCcw, Sparkles } from 'lucide-react';

export default function TripControls({
  tripStatus, // 'idle' | 'running' | 'paused' | 'finished'
  onStart,
  onPause,
  onResume,
  onFinish,
  onReset,
  isSimulating,
  onToggleSimulation
}) {
  return (
    <div className="bg-slate-800/90 backdrop-blur-md rounded-2xl p-4 border border-slate-700/60 shadow-xl flex flex-wrap items-center justify-between gap-3">
      {/* Cụm nút điều khiển chính */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {tripStatus === 'idle' && (
          <button
            onClick={onStart}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-900/30 transition-all active:scale-95"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Bắt đầu chuyến đi</span>
          </button>
        )}

        {tripStatus === 'running' && (
          <>
            <button
              onClick={onPause}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-lg shadow-amber-900/30 transition-all active:scale-95"
            >
              <Pause className="w-5 h-5 fill-current" />
              <span>Tạm dừng</span>
            </button>
            <button
              onClick={onFinish}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-900/30 transition-all active:scale-95"
            >
              <Square className="w-5 h-5 fill-current" />
              <span>Kết thúc & Tính tiền</span>
            </button>
          </>
        )}

        {tripStatus === 'paused' && (
          <>
            <button
              onClick={onResume}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-900/30 transition-all active:scale-95"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Tiếp tục di chuyển</span>
            </button>
            <button
              onClick={onFinish}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-900/30 transition-all active:scale-95"
            >
              <Square className="w-5 h-5 fill-current" />
              <span>Kết thúc & Tính tiền</span>
            </button>
          </>
        )}

        {tripStatus === 'finished' && (
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold shadow-lg transition-all active:scale-95"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Bắt đầu chuyến mới</span>
          </button>
        )}
      </div>

      {/* Nút bật/tắt chế độ Chạy Thử / Giả lập GPS */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSimulation}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
            isSimulating
              ? 'bg-purple-600/30 border-purple-500 text-purple-300 shadow-md shadow-purple-950/40'
              : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title="Chế độ giả lập di chuyển theo lộ trình mẫu để test khi ngồi văn phòng/máy tính bàn"
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>{isSimulating ? 'Đang bật mô phỏng GPS' : 'Mô phỏng GPS (Test máy tính)'}</span>
        </button>
      </div>
    </div>
  );
}

