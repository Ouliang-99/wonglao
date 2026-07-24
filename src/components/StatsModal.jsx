import React from 'react';
import { BarChart3, X } from 'lucide-react';

export default function StatsModal({ isOpen, onClose, stats = [] }) {
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
    <div className="w-full max-w-md rounded-3xl border border-amber-400/30 bg-slate-900 p-5 shadow-[0_0_40px_rgba(251,191,36,0.18)]">
      <div className="flex items-center justify-between"><div className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-amber-300" /><h2 className="font-black text-white">สถิติและอันดับ</h2></div><button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-800"><X className="h-5 w-5" /></button></div>
      <p className="mt-1 text-xs text-slate-500">อันดับจากจำนวนรอบที่เล่นในห้องนี้ ข้อมูลจะอยู่จนกว่าห้องหมดอายุ</p>
      <div className="mt-4 space-y-2">{stats.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">ยังไม่มีสถิติ เริ่มเกมกันเลย!</p> : stats.map((stat, index) => <div key={stat.id} className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 p-3"><span className="w-6 text-center text-lg font-black text-amber-300">{index + 1}</span><span className="text-xl">{stat.avatar}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-white">{stat.name}</p><p className="text-[10px] text-slate-500">เล่น {stat.gamesPlayed || 0} เกม · {stat.turns || 0} รอบ</p></div><span className="text-sm font-black text-cyan-300">{stat.score || 0} แต้ม</span></div>)}</div>
    </div>
  </div>;
}
