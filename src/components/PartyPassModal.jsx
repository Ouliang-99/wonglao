import React, { useState } from 'react';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';
import { X, Crown, Sparkles, CheckCircle2, Ticket, LockOpen } from 'lucide-react';

export default function PartyPassModal({ isOpen, onClose, onUnlock }) {
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');

  if (!isOpen) return null;

  const handleSimulatePayment = (planName) => {
    soundManager.playWheelWin();
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    onUnlock();
    onClose();
  };

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'WONGLAO2026' || promoCode.trim().toUpperCase() === 'PARTY') {
      soundManager.playWheelWin();
      confetti({ particleCount: 100, spread: 80 });
      onUnlock();
      onClose();
    } else {
      soundManager.playClick();
      setPromoError('โค้ดไม่ถูกต้อง (ลองใช้โค้ด: WONGLAO2026)');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 relative shadow-[0_0_50px_rgba(255,215,0,0.3)] space-y-5 animate-scaleUp">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-2 text-amber-400">
            <Crown className="w-8 h-8 animate-bounce" />
          </div>
          <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500">
            ปลดล็อก WongLao Party Pass 👑
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            ปลดล็อกโหมด 18+, โหมดวงแตก, Custom Deck และเสียงพากย์ฮาๆ
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="space-y-3">
          {/* Party Pass 24Hrs */}
          <div className="bg-gradient-to-r from-slate-950 to-amber-950/40 p-4 rounded-2xl border border-amber-500/50 flex justify-between items-center shadow-sm">
            <div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500 text-slate-950 inline-block mb-1">
                สายตี้คืนเดียว
              </span>
              <h3 className="text-sm font-bold text-white">Party Pass (24 ชั่วโมง)</h3>
              <p className="text-[11px] text-slate-400">ปลดล็อกทุกโหมด 24 ชม.</p>
            </div>
            <button
              onClick={() => handleSimulatePayment('24hr')}
              className="px-3 py-2 bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black rounded-xl text-xs hover:scale-105 active:scale-95 transition shadow-[0_0_10px_#FFD700]"
            >
              39 บาท
            </button>
          </div>

          {/* Monthly VIP */}
          <div className="bg-gradient-to-r from-slate-950 to-pink-950/40 p-4 rounded-2xl border border-pink-500/50 flex justify-between items-center shadow-sm">
            <div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-pink-500 text-white inline-block mb-1">
                สุดคุ้มประจำเดือน
              </span>
              <h3 className="text-sm font-bold text-white">Monthly VIP (รายเดือน)</h3>
              <p className="text-[11px] text-slate-400">Custom Deck ไม่จำกัด + ไร้โฆษณา</p>
            </div>
            <button
              onClick={() => handleSimulatePayment('monthly')}
              className="px-3 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-black rounded-xl text-xs hover:scale-105 active:scale-95 transition shadow-[0_0_10px_#FF007A]"
            >
              69 บาท/เดือน
            </button>
          </div>
        </div>

        {/* Features List */}
        <div className="space-y-1.5 text-xs text-slate-300">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span>การ์ดโหมด 18+ & โหมดวงแตก ครบทุกใบ</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span>สร้าง Custom Deck ได้ไม่จำกัด</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            <span>เล่นลื่นไหล ไม่มีโฆษณาคั่น</span>
          </div>
        </div>

        {/* Promo Code Test Input */}
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <label className="text-xs font-bold text-slate-400 flex items-center space-x-1">
            <Ticket className="w-3.5 h-3.5 text-cyan-400" />
            <span>มีโค้ดส่วนลด / โปรโมชั่น?</span>
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="กรอกโค้ด (เช่น WONGLAO2026)"
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            />
            <button
              onClick={handleApplyPromo}
              className="bg-amber-400 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs hover:bg-amber-300 transition"
            >
              ใช้โค้ด
            </button>
          </div>
          {promoError && <p className="text-[11px] text-red-400 font-semibold">{promoError}</p>}
        </div>
      </div>
    </div>
  );
}
