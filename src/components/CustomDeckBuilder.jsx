import React, { useState, useEffect } from 'react';
import { getCustomDecks, saveCustomDecks, DECK_TYPES } from '../data/decks';
import { saveCardToSupabase } from '../utils/supabase';
import { soundManager } from '../utils/audio';
import { Plus, Trash2, Download, Upload, Sparkles, CheckCircle, Database } from 'lucide-react';

export default function CustomDeckBuilder() {
  const [customCards, setCustomCards] = useState([]);
  const [promptText, setPromptText] = useState('');
  const [penaltyText, setPenaltyText] = useState('');
  const [deckType, setDeckType] = useState(DECK_TYPES.TRUTH_OR_DARE);
  const [intensity, setIntensity] = useState('free');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [savedToCloud, setSavedToCloud] = useState(false);

  useEffect(() => {
    setCustomCards(getCustomDecks());
  }, []);

  const addCustomCard = async () => {
    if (!promptText.trim()) return;
    soundManager.playClick();

    const newCard = {
      id: 'custom_' + Date.now(),
      deckType,
      type: deckType === DECK_TYPES.TRUTH_OR_DARE ? 'truth' : 'never',
      intensity,
      prompt: promptText.trim(),
      penalty: penaltyText.trim() || 'ดื่ม 1 ยก',
      isCustom: true
    };

    // Save to LocalStorage
    const updated = [newCard, ...customCards];
    setCustomCards(updated);
    saveCustomDecks(updated);

    // Save to Supabase Cloud Database if connected
    const cloudRes = await saveCardToSupabase(newCard);
    if (cloudRes) {
      setSavedToCloud(true);
    } else {
      setSavedToCloud(false);
    }

    setPromptText('');
    setPenaltyText('');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const removeCard = (id) => {
    soundManager.playClick();
    const updated = customCards.filter((c) => c.id !== id);
    setCustomCards(updated);
    saveCustomDecks(updated);
  };

  const exportJSON = () => {
    soundManager.playClick();
    const blob = new Blob([JSON.stringify(customCards, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wonglao_custom_deck.json';
    a.click();
  };

  const importJSON = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          const merged = [...imported, ...customCards];
          setCustomCards(merged);
          saveCustomDecks(merged);
          soundManager.playWheelWin();
        }
      } catch (err) {
        alert('ไฟล์ JSON ไม่ถูกต้อง');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-slate-950/90 rounded-3xl p-6 border border-slate-800 space-y-5 shadow-[0_0_30px_rgba(0,242,254,0.15)]">
      <div className="text-center">
        <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 flex items-center justify-center space-x-2">
          <Sparkles className="w-6 h-6 text-cyan-400" />
          <span>สร้างการ์ด Custom Deck ✍️</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          สร้างคำถาม/บทลงโทษเฉพาะแก๊งตัวเอง Sync ลง Supabase Database!
        </p>
      </div>

      {/* Input Form */}
      <div className="space-y-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1">
            ข้อความบนการ์ด / คำถาม (Prompt)
          </label>
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="เช่น: ใครในวงเคยมุดใต้โต๊ะตอนเมามากที่สุด?"
            rows={2}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-300 block mb-1">
            บทลงโทษ (Penalty)
          </label>
          <input
            type="text"
            value={penaltyText}
            onChange={(e) => setPenaltyText(e.target.value)}
            placeholder="เช่น: ดื่ม 1 ยก หรือยอมโดนถ่ายรูปหลุด"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">โหมดการ์ด</label>
            <select
              value={deckType}
              onChange={(e) => setDeckType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white"
            >
              <option value={DECK_TYPES.TRUTH_OR_DARE}>Truth or Dare</option>
              <option value={DECK_TYPES.NEVER_HAVE_I_EVER}>Never Have I Ever</option>
              <option value={DECK_TYPES.MOST_LIKELY_TO}>Most Likely To</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">ความแรง</label>
            <select
              value={intensity}
              onChange={(e) => setIntensity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white"
            >
              <option value="free">กระชับมิตร (Free)</option>
              <option value="spicy">18+ (Spicy)</option>
              <option value="extreme">วงแตก (Extreme)</option>
            </select>
          </div>
        </div>

        <button
          onClick={addCustomCard}
          className="w-full py-3 bg-gradient-to-r from-cyan-400 to-teal-300 text-slate-950 font-black rounded-xl text-sm shadow-md hover:shadow-[0_0_15px_#00F2FE] active:scale-95 transition flex items-center justify-center space-x-1"
        >
          <Plus className="w-5 h-5" />
          <span>บันทึกการ์ดเข้าคลัง</span>
        </button>

        {savedSuccess && (
          <div className="text-center text-xs font-bold text-emerald-400 flex items-center justify-center space-x-1 animate-pulse">
            <CheckCircle className="w-4 h-4" />
            <span>
              บันทึกการ์ดเรียบร้อย! {savedToCloud ? '(แชร์ลง Supabase Cloud ☁️)' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Export / Import Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={exportJSON}
          className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-cyan-400 flex items-center justify-center space-x-1"
        >
          <Download className="w-4 h-4" />
          <span>ส่งออก JSON</span>
        </button>

        <label className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-pink-400 flex items-center justify-center space-x-1 cursor-pointer">
          <Upload className="w-4 h-4" />
          <span>นำเข้า JSON</span>
          <input type="file" accept=".json" onChange={importJSON} className="hidden" />
        </label>
      </div>

      {/* Saved Custom Cards List */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-400">
          การ์ด Custom ที่สร้างไว้ ({customCards.length} ใบ)
        </h3>
        <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
          {customCards.map((c) => (
            <div
              key={c.id}
              className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex justify-between items-start text-xs space-x-2"
            >
              <div className="space-y-1 flex-1">
                <p className="text-white font-semibold">{c.prompt}</p>
                <p className="text-pink-400 font-medium">บทลงโทษ: {c.penalty}</p>
              </div>
              <button
                onClick={() => removeCard(c.id)}
                className="text-red-400 hover:text-red-300 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
