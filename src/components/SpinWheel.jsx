import React, { useRef, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audio';
import { RotateCw, Plus, Trash2, Trophy } from 'lucide-react';

const DEFAULT_SLICES = [
  { text: 'ดื่ม 1 จิบ 🍻', color: '#FF007A' },
  { text: 'ดื่ม 2 จิบ 🥂', color: '#00F2FE' },
  { text: 'รอดตัว! ✨', color: '#00FF66' },
  { text: 'คนซ้ายมือดื่ม 🍻', color: '#FFD700' },
  { text: 'คนขวามือดื่ม 🍻', color: '#FF7700' },
  { text: 'ชนแก้วทั้งวง! 🎉', color: '#A855F7' },
  { text: 'เต้น 10 วินาที 💃', color: '#EC4899' },
  { text: 'ดื่ม 3 จิบ ใหญ่! 💥', color: '#EF4444' }
];

export default function SpinWheel({ onSyncResult }) {
  const canvasRef = useRef(null);
  const [slices, setSlices] = useState(() => {
    const saved = localStorage.getItem('wonglao_custom_wheel');
    return saved ? JSON.parse(saved) : DEFAULT_SLICES;
  });
  const [newSliceText, setNewSliceText] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);

  const rotationRef = useRef(0);
  const spinAnimRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('wonglao_custom_wheel', JSON.stringify(slices));
    drawWheel(rotationRef.current);
  }, [slices]);

  const drawWheel = (rotationAngle) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    const center = size / 2;
    const radius = center - 15;

    ctx.clearRect(0, 0, size, size);

    if (slices.length === 0) return;

    const anglePerSlice = (Math.PI * 2) / slices.length;

    // Draw Wheel Slices
    slices.forEach((slice, i) => {
      const startAngle = rotationAngle + i * anglePerSlice;
      const endAngle = startAngle + anglePerSlice;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();

      ctx.fillStyle = slice.color;
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#0B0E14';
      ctx.stroke();

      // Slice Neon Inner Border
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.stroke();

      // Slice Text
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + anglePerSlice / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 15px Kanit, sans-serif';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 6;
      ctx.fillText(slice.text, radius - 20, 5);
      ctx.restore();
    });

    // Outer Neon Ring Glow
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#00F2FE';
    ctx.shadowColor = '#00F2FE';
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Center Pin Hub
    ctx.beginPath();
    ctx.arc(center, center, 28, 0, Math.PI * 2);
    ctx.fillStyle = '#0B0E14';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#FF007A';
    ctx.stroke();

    // Center Logo Text
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 12px Kanit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('วงเหล้า', center, center + 4);
  };

  const spin = () => {
    if (isSpinning || slices.length === 0) return;
    setIsSpinning(true);
    setWinner(null);
    soundManager.playClick();

    const spinRotations = 5 + Math.random() * 5; // 5 to 10 full turns
    const totalSpinAngle = spinRotations * Math.PI * 2 + Math.random() * Math.PI * 2;
    const duration = 4500; // ms
    const startTime = performance.now();
    const startAngle = rotationRef.current;

    let lastTickSlice = -1;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic formula
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentAngle = startAngle + totalSpinAngle * easeOut;
      rotationRef.current = currentAngle % (Math.PI * 2);

      drawWheel(rotationRef.current);

      // Play tick sound when passing slice boundaries
      const anglePerSlice = (Math.PI * 2) / slices.length;
      const normalizedAngle = (2 * Math.PI - (rotationRef.current % (2 * Math.PI))) % (2 * Math.PI);
      const currentSliceIdx = Math.floor(normalizedAngle / anglePerSlice);

      if (currentSliceIdx !== lastTickSlice) {
        soundManager.playSpinTick();
        lastTickSlice = currentSliceIdx;
      }

      if (progress < 1) {
        spinAnimRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        // Calculate Winner (pointer is at top = 270 deg or -PI/2)
        const pointerAngle = (3 * Math.PI) / 2;
        const finalAngle = (pointerAngle - rotationRef.current) % (Math.PI * 2);
        const normalizedFinal = finalAngle < 0 ? finalAngle + Math.PI * 2 : finalAngle;
        const winIndex = Math.floor(normalizedFinal / anglePerSlice) % slices.length;
        const winningSlice = slices[winIndex];

        setWinner(winningSlice);
        soundManager.playWheelWin();
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

        if (onSyncResult) {
          onSyncResult(winningSlice.text);
        }
      }
    };

    spinAnimRef.current = requestAnimationFrame(animate);
  };

  const addSlice = () => {
    if (!newSliceText.trim()) return;
    const colors = ['#FF007A', '#00F2FE', '#FFD700', '#A855F7', '#EC4899', '#00FF66'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setSlices([...slices, { text: newSliceText.trim(), color: randomColor }]);
    setNewSliceText('');
  };

  const removeSlice = (index) => {
    setSlices(slices.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-md mx-auto p-4">
      {/* Pointer */}
      <div className="relative flex flex-col items-center">
        <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-pink-500 z-20 drop-shadow-[0_0_10px_#FF007A]" />
        
        {/* Canvas Wheel */}
        <canvas
          ref={canvasRef}
          width={340}
          height={340}
          className="rounded-full shadow-[0_0_30px_rgba(0,242,254,0.3)] bg-slate-950/80 border border-slate-800"
        />
      </div>

      {/* Winner Display */}
      {winner && (
        <div className="bg-gradient-to-r from-pink-900/80 via-purple-900/80 to-cyan-900/80 border-2 border-amber-400/80 rounded-2xl p-4 text-center shadow-[0_0_25px_rgba(255,215,0,0.4)] animate-bounce w-full">
          <div className="flex items-center justify-center space-x-2 text-amber-400 font-bold text-lg">
            <Trophy className="w-5 h-5" />
            <span>ผลสุ่มบทลงโทษ!</span>
          </div>
          <div className="text-2xl font-black text-white mt-1">{winner.text}</div>
        </div>
      )}

      {/* Spin Button */}
      <button
        onClick={spin}
        disabled={isSpinning || slices.length === 0}
        className="w-full py-4 rounded-2xl font-black text-xl tracking-wider uppercase text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-pink-500 shadow-[0_0_20px_rgba(0,242,254,0.6)] hover:shadow-[0_0_30px_rgba(255,0,122,0.8)] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
      >
        <RotateCw className={`w-6 h-6 ${isSpinning ? 'animate-spin' : ''}`} />
        <span>{isSpinning ? 'กำลังหมุนวงล้อ...' : 'หมุนวงล้อสุ่ม 🎯'}</span>
      </button>

      {/* Customize Slices Accordion */}
      <div className="w-full bg-slate-900/90 backdrop-blur-md rounded-2xl p-4 border border-slate-800 space-y-3">
        <h3 className="text-sm font-semibold text-cyan-400 flex items-center justify-between">
          <span>ปรับแต่งบทลงโทษในวงล้อ ({slices.length} รายการ)</span>
        </h3>

        <div className="flex space-x-2">
          <input
            type="text"
            value={newSliceText}
            onChange={(e) => setNewSliceText(e.target.value)}
            placeholder="เพิ่มบทลงโทษใหม่..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
            onKeyDown={(e) => e.key === 'Enter' && addSlice()}
          />
          <button
            onClick={addSlice}
            className="bg-cyan-500 text-slate-950 font-bold px-3 py-2 rounded-xl text-sm hover:bg-cyan-400 transition"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
          {slices.map((slice, idx) => (
            <div key={idx} className="flex items-center justify-between bg-slate-950/60 p-2 rounded-lg text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: slice.color }} />
                <span className="text-slate-200">{slice.text}</span>
              </div>
              <button
                onClick={() => removeSlice(idx)}
                className="text-red-400 hover:text-red-300 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
