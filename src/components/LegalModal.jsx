import React, { useState, useEffect } from 'react';
import { soundManager } from '../utils/audio';
import { ShieldCheck, AlertOctagon, HeartHandshake, Car } from 'lucide-react';

export default function LegalModal() {
  const [hasConfirmed, setHasConfirmed] = useState(() => {
    return localStorage.getItem('wonglao_age_verified') === 'true';
  });

  if (hasConfirmed) return null;

  const handleConfirm = () => {
    soundManager.playClick();
    localStorage.setItem('wonglao_age_verified', 'true');
    setHasConfirmed(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 relative shadow-[0_0_50px_rgba(255,0,122,0.3)] space-y-5">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center mx-auto mb-3 text-pink-500">
            <AlertOctagon className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-white">ข้อตกลงและคำเตือนความปลอดภัย 🍻</h2>
          <p className="text-xs text-pink-400 mt-1 font-semibold">
            แอปพลิเคชันสำหรับผู้มีอายุ 18 ปีขึ้นไปเท่านั้น (Age Rating 18+)
          </p>
        </div>

        <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300">
          <div className="flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p>
              <strong className="text-white">ปฏิบัติตามกฎหมายไทย:</strong> แอปนี้ไม่มีการโฆษณาสุรา ไม่แสดงโลโก้ยี่ห้อสุราจริง และไม่มีระบบพนันออนไลน์เพื่อเงินจริง
            </p>
          </div>

          <div className="flex items-start space-x-2">
            <HeartHandshake className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p>
              <strong className="text-white">สิทธิ์ในการปฏิเสธภารกิจ:</strong> ผู้เล่นทุกคนมีสิทธิ์ปฏิเสธคำถามหรือภารกิจใดๆ ได้ตลอดเวลา หากเห็นว่าไม่ปลอดภัยหรือไม่เต็มใจทำ
            </p>
          </div>

          <div className="flex items-start space-x-2">
            <Car className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <p>
              <strong className="text-white">เมาไม่ขับ ดื่มอย่างรับผิดชอบ:</strong> ห้ามขับขี่ยานพาหนะทุกชนิดหากดื่มเครื่องดื่มแอลกอฮอล์เพื่อความปลอดภัยของตนเองและผู้อื่น
            </p>
          </div>
        </div>

        <button
          onClick={handleConfirm}
          className="w-full py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 text-slate-950 font-black rounded-2xl text-base shadow-[0_0_25px_rgba(255,0,122,0.6)] hover:shadow-[0_0_35px_rgba(0,242,254,0.8)] active:scale-95 transition"
        >
          ฉันอายุ 18+ ปี และยอมรับข้อตกลง (เข้าสู่เกม) 🎉
        </button>
      </div>
    </div>
  );
}
