import React, { useState, useEffect } from 'react';
import { soundManager } from '../utils/audio';
import { wsClient } from '../utils/websocket';
import confetti from 'canvas-confetti';
import { Dices, RotateCw, Sparkles } from 'lucide-react';

const DOT_POSITIONS = {
  1: [{ top: '50%', left: '50%' }],
  2: [{ top: '25%', left: '25%' }, { top: '75%', left: '75%' }],
  3: [{ top: '25%', left: '25%' }, { top: '50%', left: '50%' }, { top: '75%', left: '75%' }],
  4: [
    { top: '25%', left: '25%' },
    { top: '25%', left: '75%' },
    { top: '75%', left: '25%' },
    { top: '75%', left: '75%' }
  ],
  5: [
    { top: '25%', left: '25%' },
    { top: '25%', left: '75%' },
    { top: '50%', left: '50%' },
    { top: '75%', left: '25%' },
    { top: '75%', left: '75%' }
  ],
  6: [
    { top: '20%', left: '25%' },
    { top: '50%', left: '25%' },
    { top: '80%', left: '25%' },
    { top: '20%', left: '75%' },
    { top: '50%', left: '75%' },
    { top: '80%', left: '75%' }
  ]
};

export default function DiceRoller({ onSyncResult }) {
  const [diceCount, setDiceCount] = useState(2);
  const [diceValues, setDiceValues] = useState([3, 4]);
  const [isRolling, setIsRolling] = useState(false);
  const [ruleMessage, setRuleMessage] = useState('');

  // Listen for WebSocket remote dice rolls
  useEffect(() => {
    const unsubscribe = wsClient.subscribe((event) => {
      if (event.type === 'SYNC_GAME_STATE' && event.payload.state?.diceRoll) {
        if (event.payload.senderId !== wsClient.playerId) {
          const { diceValues: remoteValues, diceCount: remoteCount, ruleMsg } = event.payload.state.diceRoll;
          triggerDiceRoll(remoteValues, remoteCount, ruleMsg, true);
        }
      }
    });
    return unsubscribe;
  }, []);

  const triggerDiceRoll = (targetValues = null, targetCount = null, remoteRuleMsg = null, isRemote = false) => {
    if (isRolling) return;
    setIsRolling(true);
    setRuleMessage('');
    soundManager.playDiceRoll();

    const activeCount = targetCount !== null ? targetCount : diceCount;
    if (targetCount !== null) setDiceCount(targetCount);

    let count = 0;
    const interval = setInterval(() => {
      setDiceValues((prev) =>
        prev.map(() => Math.floor(Math.random() * 6) + 1)
      );
      count++;
      if (count > 10) {
        clearInterval(interval);
        const finalValues = targetValues !== null
          ? targetValues
          : Array.from({ length: activeCount }, () => Math.floor(Math.random() * 6) + 1);

        setDiceValues(finalValues);
        setIsRolling(false);

        const total = finalValues.reduce((a, b) => a + b, 0);
        let msg = remoteRuleMsg || '';

        if (!remoteRuleMsg) {
          if (activeCount === 2) {
            if (finalValues[0] === finalValues[1]) {
              msg = `แต้มเท่ากัน! (${finalValues[0]}-${finalValues[1]}) คนทอยสั่งใครก็ได้ดื่ม 1 จิบ 🥂`;
              confetti({ particleCount: 50, spread: 50 });
            } else if (total === 7 || total === 11) {
              msg = `ออก 7 หรือ 11! คนทอยดื่ม 1 จิบ 🍻`;
            } else if (total === 12) {
              msg = `แจ็กพอต 12 แต้ม! ชนแก้วทั้งวง! 🎉`;
              confetti({ particleCount: 90, spread: 70 });
            } else {
              msg = `แต้มรวม ${total}: ส่งไม้ต่อให้คนถัดไปทอย`;
            }
          } else {
            msg = `ได้ ${total} แต้ม!`;
          }
        }

        setRuleMessage(msg);

        if (!isRemote) {
          if (wsClient.roomCode) {
            wsClient.sendAction('DICE_ROLL', {
              diceRoll: { diceValues: finalValues, diceCount: activeCount, ruleMsg: msg }
            }, `ทอยลูกเต๋าได้แต้มรวม ${total}`);
          }
          if (onSyncResult) {
            onSyncResult(`ทอยได้แต้มรวม ${total} (${msg})`);
          }
        }
      }
    }, 80);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-slate-950/90 rounded-3xl p-6 border border-slate-800 flex flex-col items-center justify-between space-y-6 shadow-[0_0_30px_rgba(255,215,0,0.15)]">
      <div className="text-center">
        <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200 flex items-center justify-center space-x-2">
          <Dices className="w-6 h-6 text-amber-400" />
          <span>ทอยลูกเต๋านีออน 🎲</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          กฎ: แต้มเบิ้ลสั่งเพื่อนดื่ม / 7 และ 11 คนทอยดื่ม!
        </p>
      </div>

      {/* Select Dice Count */}
      <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800">
        <button
          onClick={() => { setDiceCount(1); setDiceValues([3]); }}
          className={`px-4 py-1.5 rounded-xl font-bold text-xs transition ${
            diceCount === 1 ? 'bg-amber-400 text-slate-950' : 'text-slate-400'
          }`}
        >
          ลูกเต๋า 1 ลูก
        </button>
        <button
          onClick={() => { setDiceCount(2); setDiceValues([3, 4]); }}
          className={`px-4 py-1.5 rounded-xl font-bold text-xs transition ${
            diceCount === 2 ? 'bg-amber-400 text-slate-950' : 'text-slate-400'
          }`}
        >
          ลูกเต๋า 2 ลูก
        </button>
      </div>

      {/* Render Dice Graphics */}
      <div className="flex items-center justify-center space-x-6 my-4">
        {diceValues.map((val, idx) => (
          <div
            key={idx}
            className={`relative w-24 h-24 bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-amber-400/80 rounded-2xl shadow-[0_0_20px_rgba(255,215,0,0.4)] flex items-center justify-center transition-transform duration-200 ${
              isRolling ? 'animate-spin scale-110' : 'hover:scale-105'
            }`}
          >
            {DOT_POSITIONS[val]?.map((pos, dIdx) => (
              <div
                key={dIdx}
                style={{ top: pos.top, left: pos.left }}
                className="absolute w-4 h-4 bg-amber-400 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_8px_#FFD700]"
              />
            ))}
          </div>
        ))}
      </div>

      {/* Total Sum Display & Rule Result */}
      {ruleMessage && (
        <div className="bg-slate-900 border border-amber-500/50 rounded-2xl p-4 text-center w-full shadow-[0_0_15px_rgba(255,215,0,0.2)]">
          <div className="text-amber-400 font-bold text-lg flex items-center justify-center space-x-1">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>แต้มรวม: {diceValues.reduce((a, b) => a + b, 0)}</span>
          </div>
          <p className="text-sm font-semibold text-slate-200 mt-1">{ruleMessage}</p>
        </div>
      )}

      <button
        onClick={() => triggerDiceRoll()}
        disabled={isRolling}
        className="w-full py-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black rounded-2xl text-lg shadow-[0_0_20px_rgba(255,215,0,0.5)] hover:shadow-[0_0_30px_rgba(255,215,0,0.8)] active:scale-95 transition disabled:opacity-50 flex items-center justify-center space-x-2"
      >
        <RotateCw className={`w-6 h-6 ${isRolling ? 'animate-spin' : ''}`} />
        <span>{isRolling ? 'กำลังทอยลูกเต๋า...' : 'เขย่าลูกเต๋า 🎲'}</span>
      </button>
    </div>
  );
}
