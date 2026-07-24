import React from 'react';
import { BarChart3, X } from 'lucide-react';

export default function StatsModal({ isOpen, onClose, stats = [] }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
      <div className="w-full max-w-md rounded-3xl border border-amber-400/30 bg-slate-900 p-5 shadow-[0_0_40px_rgba(251,191,36,0.18)] space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-amber-300" />
            <h2 className="font-black text-white text-base">สถิติดริ้งก์และแยกระดับความห้าว</h2>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          จำแนกจำนวนยกที่โดนลงโทษในแต่ละระดับความห้าว (จิบ / แก้ว / กลม / Custom VIP)
        </p>

        <div className="space-y-3">
          {stats.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">ยังไม่มีสถิติ เริ่มเกมกันเลย!</p>
          ) : (
            stats.map((stat, index) => {
              const jib = stat.jib || 0;
              const kaew = stat.kaew || 0;
              const klom = stat.klom || 0;
              const custom = stat.custom || 0;
              const total = stat.score || (jib + kaew + klom + custom);

              return (
                <div key={stat.id || index} className="rounded-2xl border border-slate-800 bg-slate-950 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 text-center text-sm font-black text-amber-400">#{index + 1}</span>
                      <span className="text-xl">{stat.avatar}</span>
                      <div>
                        <p className="truncate text-sm font-black text-white">{stat.name}</p>
                        <p className="text-[10px] text-slate-500">เล่น {stat.gamesPlayed || 0} เกม · จั่วไป {stat.turns || 0} ตา</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-amber-300 bg-amber-400/10 border border-amber-400/30 px-3 py-1.5 rounded-xl shadow-sm">
                      🍻 รวม {total} ยก
                    </span>
                  </div>

                  {/* Level Breakdown Chips */}
                  <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-900">
                    <div className="flex flex-col items-center p-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-center">
                      <span className="text-[10px] font-bold text-emerald-400">🍺 จิบ</span>
                      <span className="text-xs font-black text-emerald-200 mt-0.5">{jib}</span>
                    </div>
                    <div className="flex flex-col items-center p-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-center">
                      <span className="text-[10px] font-bold text-cyan-400">🍻 แก้ว</span>
                      <span className="text-xs font-black text-cyan-200 mt-0.5">{kaew}</span>
                    </div>
                    <div className="flex flex-col items-center p-1.5 rounded-xl bg-rose-950/40 border border-rose-500/20 text-center">
                      <span className="text-[10px] font-bold text-rose-400">🍾 กลม</span>
                      <span className="text-xs font-black text-rose-200 mt-0.5">{klom}</span>
                    </div>
                    <div className="flex flex-col items-center p-1.5 rounded-xl bg-purple-950/40 border border-purple-500/20 text-center">
                      <span className="text-[10px] font-bold text-purple-400">👑 VIP</span>
                      <span className="text-xs font-black text-purple-200 mt-0.5">{custom}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
