import React from 'react';
import { X, FileText, Check } from 'lucide-react';
import { formatCurrency } from '../utils/geo';

export default function PricingTableModal({ isOpen, onClose, pricingData }) {
  if (!isOpen || !pricingData) return null;

  const vehicles = pricingData.vehicles || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">BẢNG GIÁ NIÊM YẾT QUY ĐỊNH</h2>
              <p className="text-xs text-slate-400">
                Được cấu hình cố định trong backend Python (bước nhảy step: {pricingData.step_km} km)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung các bảng giá */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-200">
          <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-xs text-cyan-200 leading-relaxed">
            💡 <b>Quy tắc tính toán:</b> Hệ thống sử dụng thuật toán Haversine để đo quãng đường GPS thực tế, 
            sau đó tự động quy chuẩn theo bước nhảy <b>{pricingData.step_km} km (100m)</b> và nhân cước theo từng bậc thang tương ứng.
          </div>

          <div className="space-y-4">
            {Object.entries(vehicles).map(([key, v]) => (
              <div key={key} className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-base font-bold text-white">{v.name}</h3>
                    <p className="text-xs text-slate-400">{v.description}</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-700 font-semibold text-emerald-400">
                    Mở cửa: {formatCurrency(v.base_fare)} / {v.base_distance_km} km
                  </span>
                </div>

                <div className="border border-slate-700/60 rounded-xl overflow-hidden divide-y divide-slate-800 text-xs">
                  <div className="p-2.5 bg-slate-800/80 font-semibold text-slate-300 flex justify-between">
                    <span>Mốc khoảng cách</span>
                    <span>Đơn giá mỗi km</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/40 flex justify-between text-slate-300">
                    <span>0 đến {v.base_distance_km} km đầu tiên</span>
                    <span className="font-mono text-emerald-400">{formatCurrency(v.base_fare)} (Trọn gói)</span>
                  </div>
                  {v.tiers && v.tiers.map((t, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-900/20 flex justify-between text-slate-300">
                      <span>{t.description || `Từ ${t.from_km} km`}</span>
                      <span className="font-mono text-cyan-300">{formatCurrency(t.price_per_km)}/km</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-800/60 border-t border-slate-700/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs transition-all"
          >
            Đóng bảng giá
          </button>
        </div>
      </div>
    </div>
  );
}

