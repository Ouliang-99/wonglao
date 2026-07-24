import React, { useState, useEffect } from 'react';
import { soundManager } from '../utils/audio';
import { wsClient } from '../utils/websocket';
import confetti from 'canvas-confetti';
import { Smile, RefreshCw, AlertTriangle } from 'lucide-react';

const TEETH_COUNT = 10;

export default function CrocodileDentist({ onSyncResult }) {
  const [trapTooth, setTrapTooth] = useState(0);
  const [pressedTeeth, setPressedTeeth] = useState([]);
  const [isSnapped, setIsSnapped] = useState(false);
  const [shaking, setShaking] = useState(false);

  const resetGame = (isRemote = false) => {
    soundManager.playClick();
    const newTrap = Math.floor(Math.random() * TEETH_COUNT);
    setTrapTooth(newTrap);
    setPressedTeeth([]);
    setIsSnapped(false);
    setShaking(false);

    if (!isRemote && wsClient.roomCode) {
      wsClient.sendAction('CROC_RESET', {
        crocState: { trapTooth: newTrap, pressedTeeth: [], isSnapped: false }
      }, 'ง้างปากจระเข้เริ่มตาใหม่ 🐊');
    }
  };

  useEffect(() => {
    resetGame();
  }, []);

  // Listen for WebSocket remote croc actions
  useEffect(() => {
    const unsubscribe = wsClient.subscribe((event) => {
      if (event.type === 'SYNC_GAME_STATE' && event.payload.senderId !== wsClient.playerId) {
        const state = event.payload.state;
        if (state.crocToothPress) {
          const { index, isTrap } = state.crocToothPress;
          handleRemoteToothPress(index, isTrap);
        } else if (state.crocState) {
          setTrapTooth(state.crocState.trapTooth);
          setPressedTeeth(state.crocState.pressedTeeth || []);
          setIsSnapped(state.crocState.isSnapped || false);
        }
      }
    });
    return unsubscribe;
  }, [trapTooth]);

  const handleRemoteToothPress = (index, isTrap) => {
    if (isTrap) {
      soundManager.playCrocSnap();
      setIsSnapped(true);
      setShaking(true);
      setPressedTeeth((prev) => [...prev, index]);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
      setTimeout(() => setShaking(false), 600);
    } else {
      soundManager.playClick();
      setPressedTeeth((prev) => [...prev, index]);
    }
  };

  const pressTooth = (index) => {
    if (isSnapped || pressedTeeth.includes(index)) return;

    const isTrap = index === trapTooth;

    if (isTrap) {
      soundManager.playCrocSnap();
      setIsSnapped(true);
      setShaking(true);
      setPressedTeeth((prev) => [...prev, index]);

      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });

      if (wsClient.roomCode) {
        wsClient.sendAction('CROC_PRESS', {
          crocToothPress: { index, isTrap: true }
        }, 'โดนจระเข้งับนิ้ว! 🐊 ดื่ม 2 จิบ');
      }

      if (onSyncResult) {
        onSyncResult('โดนจระเข้งับนิ้ว! ดื่ม 2 จิบ 🐊');
      }

      setTimeout(() => setShaking(false), 600);
    } else {
      soundManager.playClick();
      setPressedTeeth((prev) => [...prev, index]);

      if (wsClient.roomCode) {
        wsClient.sendAction('CROC_PRESS', {
          crocToothPress: { index, isTrap: false }
        }, `จิ้มฟันซี่ที่ ${index + 1} (รอดตัว)`);
      }
    }
  };

  return (
    <div
      className={`relative w-full max-w-md mx-auto bg-slate-950/90 rounded-3xl p-6 border border-slate-800 flex flex-col items-center justify-between space-y-6 shadow-[0_0_30px_rgba(0,255,102,0.15)] ${
        shaking ? 'animate-shake' : ''
      }`}
    >
      <div className="text-center">
        <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 flex items-center justify-center space-x-2">
          <Smile className="w-6 h-6 text-emerald-400" />
          <span>จระเข้งับนิ้ว 🐊</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          ผลัดกันจิ้มฟันคนละ 1 ซี่... ซี่ไหนงับ ดื่ม 2 จิบ!
        </p>
      </div>

      {/* Crocodile Graphic Jaws */}
      <div className="relative w-64 h-56 flex flex-col items-center justify-center">
        <div
          className={`w-56 h-28 bg-gradient-to-b from-emerald-600 to-emerald-800 rounded-t-full border-4 border-emerald-400 relative transition-transform duration-300 shadow-[0_0_20px_rgba(0,255,102,0.4)] ${
            isSnapped ? 'translate-y-12 rotate-2' : '-translate-y-4'
          }`}
        >
          <div className="absolute -top-5 left-10 w-8 h-8 bg-amber-400 rounded-full border-2 border-slate-900 flex items-center justify-center">
            <div className="w-3 h-5 bg-slate-950 rounded-full" />
          </div>
          <div className="absolute -top-5 right-10 w-8 h-8 bg-amber-400 rounded-full border-2 border-slate-900 flex items-center justify-center">
            <div className="w-3 h-5 bg-slate-950 rounded-full" />
          </div>
          <div className="absolute bottom-1 left-4 right-4 flex justify-between px-2">
            {[...Array(6)].map((_, idx) => (
              <div
                key={idx}
                className="w-4 h-6 bg-white rounded-b-md border border-slate-300 shadow-sm"
              />
            ))}
          </div>
        </div>

        <div className="w-56 h-24 bg-gradient-to-t from-emerald-700 to-emerald-900 rounded-b-full border-4 border-emerald-500 relative flex items-start justify-center pt-2 px-3">
          <div className="grid grid-cols-5 gap-2 w-full">
            {[...Array(TEETH_COUNT)].map((_, idx) => {
              const isPressed = pressedTeeth.includes(idx);
              const isTrap = idx === trapTooth && isSnapped;
              return (
                <button
                  key={idx}
                  onClick={() => pressTooth(idx)}
                  disabled={isPressed || isSnapped}
                  className={`h-9 rounded-t-lg font-bold text-xs transition-all border ${
                    isTrap
                      ? 'bg-red-600 border-amber-300 text-white scale-90 shadow-[0_0_15px_#FF0000]'
                      : isPressed
                      ? 'bg-slate-800 border-slate-700 text-slate-500 scale-75'
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800 shadow-[0_4px_0_#94A3B8] active:translate-y-1'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {isSnapped && (
        <div className="bg-red-950/90 border-2 border-red-500 rounded-2xl p-3 text-center text-white font-bold animate-bounce w-full shadow-[0_0_20px_rgba(239,68,68,0.7)]">
          <div className="flex items-center justify-center space-x-2 text-amber-300 text-base">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span>โดนงับแล้ว! ดื่ม 2 จิบ 🍻</span>
          </div>
        </div>
      )}

      <button
        onClick={() => resetGame()}
        className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black rounded-2xl shadow-[0_0_15px_rgba(0,255,102,0.4)] hover:shadow-[0_0_25px_rgba(0,255,102,0.6)] active:scale-95 transition flex items-center justify-center space-x-2"
      >
        <RefreshCw className="w-5 h-5" />
        <span>เริ่มตาใหม่ (ง้างปากจระเข้)</span>
      </button>
    </div>
  );
}
