import React from 'react';
import { X, Printer, CheckCircle2, ShieldCheck, Car } from 'lucide-react';
import { formatCurrency, formatDuration } from '../utils/geo';

export default function InvoiceModal({
  isOpen,
  onClose,
  invoiceData,
  durationSeconds,
  startTime,
  endTime
}) {
  if (!isOpen || !invoiceData) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header hoá đơn */}
        <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-wide">BIÊN LAI CƯỚC CHUYẾN ĐI</h2>
              <p className="text-xs text-emerald-100 font-medium">Hệ thống đo GPS & tính tiền chuẩn xác</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung hoá đơn */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-200">
          {/* Thông tin chuyến đi */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 text-xs">
            <div>
              <span className="text-slate-400">Phương tiện:</span>
              <p className="font-semibold text-slate-100 text-sm mt-0.5">{invoiceData.vehicle_name}</p>
            </div>
            <div>
              <span className="text-slate-400">Thời gian di chuyển:</span>
              <p className="font-semibold text-slate-100 text-sm mt-0.5">{formatDuration(durationSeconds)}</p>
            </div>
            <div>
              <span className="text-slate-400">Khởi hành:</span>
              <p className="font-medium text-slate-200 mt-0.5">
                {startTime ? new Date(startTime).toLocaleTimeString('vi-VN') : '--:--'}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Kết thúc:</span>
              <p className="font-medium text-slate-200 mt-0.5">
                {endTime ? new Date(endTime).toLocaleTimeString('vi-VN') : '--:--'}
              </p>
            </div>
          </div>

          {/* Quãng đường & quy chuẩn step 0.1 */}
          <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/40 flex items-center justify-between">
            <div>
              <span className="text-xs text-cyan-300 font-medium">Quãng đường tính cước:</span>
              <div className="text-2xl font-black text-cyan-400 font-mono">
                {invoiceData.stepped_distance_km.toFixed(1)} km
              </div>
            </div>
            <div className="text-right text-xs text-slate-400">
              <p>GPS thô: {invoiceData.raw_distance_km.toFixed(3)} km</p>
              <p className="text-cyan-400 font-medium mt-0.5">Quy chuẩn Step: 0.1 km</p>
            </div>
          </div>

          {/* Bảng chi tiết từng bậc cước */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Chi tiết các bậc tính tiền
            </h3>
            <div className="border border-slate-700/70 rounded-2xl overflow-hidden divide-y divide-slate-800 text-xs">
              {invoiceData.breakdown && invoiceData.breakdown.length > 0 ? (
                invoiceData.breakdown.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-800/30 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-100">{item.step_name}</p>
                      <p className="text-slate-400 text-[11px]">
                        {item.distance_km} km × {formatCurrency(item.rate)}
                      </p>
                    </div>
                    <span className="font-bold text-slate-200 font-mono text-sm">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-slate-400">Không có cước phát sinh</div>
              )}
            </div>
          </div>

          {/* Tổng tiền thanh toán */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border-2 border-emerald-500/50 flex items-center justify-between">
            <div>
              <span className="text-xs text-emerald-300 font-bold uppercase">Tổng cước thanh toán</span>
              <p className="text-[11px] text-slate-400">Đã bao gồm thuế và các bậc cước</p>
            </div>
            <div className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
              {formatCurrency(invoiceData.total_fare)}
            </div>
          </div>
        </div>

        {/* Footer nút hành động */}
        <div className="p-5 bg-slate-800/60 border-t border-slate-700/60 flex items-center justify-end gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium text-xs transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>In biên lai</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-950/50"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

