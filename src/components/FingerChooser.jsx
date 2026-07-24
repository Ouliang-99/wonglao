import React, { useState, useEffect, useRef, useCallback } from 'react';
import { soundManager } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Flame, Fingerprint, RefreshCw } from 'lucide-react';

const COLORS = ['#FF007A', '#00F2FE', '#FFD700', '#A855F7', '#00FF66', '#FF7700'];

export default function FingerChooser() {
  const [touches, setTouches] = useState([]);
  const [countdown, setCountdown] = useState(null);
  const [chosenIdx, setChosenIdx] = useState(null);
  const [isChoosing, setIsChoosing] = useState(false);
  const timerRef = useRef(null);
  const touchesRef = useRef([]);
  touchesRef.current = touches;

  const handleTouchStart = (e) => {
    e.preventDefault();
    if (chosenIdx !== null) return;
    
    soundManager.playClick();
    const newTouches = Array.from(e.touches).map((t, idx) => ({
      id: t.identifier,
      x: t.clientX,
      y: t.clientY,
      color: COLORS[idx % COLORS.length]
    }));
    setTouches(newTouches);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (chosenIdx !== null) return;
    const updated = Array.from(e.touches).map((t, idx) => {
      const existing = touchesRef.current.find(existing => existing.id === t.identifier);
      return {
        id: t.identifier,
        x: t.clientX,
        y: t.clientY,
        color: existing ? existing.color : COLORS[idx % COLORS.length]
      };
    });
    setTouches(updated);
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    if (chosenIdx !== null) return;
    const remaining = Array.from(e.touches).map(t => {
      const existing = touchesRef.current.find(existing => existing.id === t.identifier);
      return {
        id: t.identifier,
        x: t.clientX,
        y: t.clientY,
        color: existing ? existing.color : COLORS[0]
      };
    });
    setTouches(remaining);
  };

  const handleMouseDown = (e) => {
    if ('ontouchstart' in window) return;
    if (chosenIdx !== null) return;

    soundManager.playClick();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (touches.length < 6) {
      setTouches(prev => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          x,
          y,
          color: COLORS[prev.length % COLORS.length]
        }
      ]);
    }
  };

  const startCountdown = useCallback(() => {
    if (isChoosing || chosenIdx !== null) return;
    setIsChoosing(true);
    let count = 3;
    setCountdown(count);

    timerRef.current = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        soundManager.playSpinTick();
      } else {
        clearInterval(timerRef.current);
        setCountdown(null);
        const currentTouches = touchesRef.current;
        if (currentTouches.length > 0) {
          const randomIndex = Math.floor(Math.random() * currentTouches.length);
          setChosenIdx(randomIndex);
          soundManager.playBombExplode();
          confetti({
            particleCount: 100,
            spread: 90,
            origin: {
              x: currentTouches[randomIndex].x / window.innerWidth,
              y: currentTouches[randomIndex].y / window.innerHeight
            }
          });
        }
        setIsChoosing(false);
      }
    }, 1000);
  }, [isChoosing, chosenIdx]);

  useEffect(() => {
    if (touches.length >= 2 && !isChoosing && chosenIdx === null) {
      startCountdown();
    } else if (touches.length < 2 && isChoosing) {
      if (timerRef.current) clearInterval(timerRef.current);
      setIsChoosing(false);
      setCountdown(null);
    }
  }, [touches.length, isChoosing, chosenIdx, startCountdown]);

  const resetGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTouches([]);
    setChosenIdx(null);
    setIsChoosing(false);
    setCountdown(null);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      className="relative w-full h-[520px] bg-slate-950/90 rounded-3xl border border-slate-800 overflow-hidden flex flex-col items-center justify-between p-6 select-none touch-none shadow-[0_0_30px_rgba(255,0,122,0.15)]"
    >
      <div className="z-10 text-center pointer-events-none">
        <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400 flex items-center justify-center space-x-2">
          <Fingerprint className="w-6 h-6 text-pink-500 animate-pulse" />
          <span>สุ่มจับนิ้วลงโทษ 💣</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {touches.length === 0
            ? 'วางนิ้วพร้อมกัน 2 คนขึ้นไปบนหน้าจอ...'
            : touches.length === 1
            ? 'รอเพื่อนวางนิ้วอีกคนเพื่อเริ่มสุ่ม!'
            : isChoosing
            ? `กำลังสุ่มใน ${countdown} วินาที... ห้ามยกนิ้ว!`
            : chosenIdx !== null
            ? 'ได้ผู้โชคดีเรียบร้อย! 🍻'
            : ''}
        </p>
      </div>

      {touches.map((t, idx) => {
        const isChosen = chosenIdx === idx;
        return (
          <div
            key={t.id}
            style={{ left: t.x, top: t.y }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none transition-transform duration-300 flex items-center justify-center ${
              isChosen ? 'w-32 h-32 animate-ping bg-red-600/80 z-30' : 'w-24 h-24'
            }`}
          >
            <div
              className={`w-full h-full rounded-full border-4 border-dashed animate-spin ${
                isChosen ? 'border-amber-300' : ''
              }`}
              style={{
                borderColor: isChosen ? '#FFD700' : t.color,
                boxShadow: `0 0 25px ${isChosen ? '#FF0000' : t.color}`
              }}
            />
            <div
              className={`absolute w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold text-slate-950 ${
                isChosen ? 'bg-amber-400 scale-125' : 'bg-white'
              }`}
            >
              {isChosen ? '💥 โดน!' : `นิ้ว ${idx + 1}`}
            </div>
          </div>
        );
      })}

      {chosenIdx !== null && touches[chosenIdx] && (
        <div className="z-20 bg-red-950/90 border-2 border-red-500 rounded-2xl p-4 text-center text-white font-bold animate-bounce shadow-[0_0_30px_rgba(239,68,68,0.8)]">
          <div className="flex items-center justify-center space-x-1 text-amber-300 text-lg">
            <Flame className="w-5 h-5 text-red-500" />
            <span>นิ้วที่ {chosenIdx + 1} โดนลงโทษ!</span>
          </div>
          <p className="text-xs text-red-200 mt-1">ดื่ม 1-2 จิบ หรือทำภารกิจในวง!</p>
        </div>
      )}

      <div className="z-10 w-full flex justify-between items-center text-xs text-slate-400">
        <span>นิ้วบนจอ: {touches.length}/6</span>
        <button
          onClick={resetGame}
          className="bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold px-3 py-1.5 rounded-xl border border-slate-700 flex items-center space-x-1 active:scale-95 transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>รีเซ็ต</span>
        </button>
      </div>
    </div>
  );
}
