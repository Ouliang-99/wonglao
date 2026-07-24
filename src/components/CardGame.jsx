import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundManager } from '../utils/audio';
import { wsClient } from '../utils/websocket';
import { INTENSITY_LEVELS, INITIAL_DECKS, getCustomDecks } from '../data/decks';
import { fetchAllCardsFromSupabase } from '../utils/supabase';
import { Sparkles, ChevronRight, Lock, Flame, ShieldAlert, Award, Database, Eye, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

function cleanPromptText(text = '') {
  return text.replace(/^(ความกล้า|ความจริง|ฉันไม่เคย|ใครมีโอกาสสุด|Truth|Dare):\s*/i, '');
}

export default function CardGame({ isPremiumUnlocked, onOpenPassModal, roomCode, players = [], isHost = false }) {
  const [selectedIntensity, setSelectedIntensity] = useState('free');
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [penaltyPoints, setPenaltyPoints] = useState(0);
  const [isDatabaseLoaded, setIsDatabaseLoaded] = useState(false);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(wsClient.gameState?.turnIndex || 0);
  const [remoteCard, setRemoteCard] = useState(wsClient.gameState?.syncedCard || null);

  // Load and shuffle cards from ALL categories filtered only by intensity
  useEffect(() => {
    async function loadDecks() {
      let combined = [];
      const remoteCards = await fetchAllCardsFromSupabase();

      if (remoteCards && remoteCards.length > 0) {
        setIsDatabaseLoaded(true);
        combined = remoteCards.map((c) => ({
          id: c.id,
          deckType: c.deck_type,
          type: c.type || 'truth',
          intensity: c.intensity,
          prompt: c.prompt,
          penalty: c.penalty
        }));
      } else {
        setIsDatabaseLoaded(false);
        const customDecks = getCustomDecks();
        combined = [...INITIAL_DECKS, ...customDecks];
      }

      // Filter ONLY by intensity (All categories mixed together!)
      const filtered = combined.filter((c) => c.intensity === selectedIntensity);

      const shuffled = [...filtered].sort(() => Math.random() - 0.5);
      setCards(shuffled);
      setCurrentIndex(0);
      setIsFlipped(false);

      // Room Multiplayer Initial Sync
      if (wsClient.roomCode && shuffled.length > 0) {
        if (wsClient.gameState?.syncedCard) {
          setRemoteCard(wsClient.gameState.syncedCard);
        } else if (wsClient.isHost || isHost) {
          const initialCard = shuffled[0];
          setRemoteCard(initialCard);
          wsClient.sendAction(
            'CARD_DRAW',
            { syncedCard: initialCard, turnIndex: 0 },
            `การ์ดใบแรกของวง: ${cleanPromptText(initialCard.prompt)}`
          );
        }
      }
    }

    loadDecks();
  }, [selectedIntensity, roomCode, isHost]);

  // Subscribe to WebSocket Game State Sync
  useEffect(() => {
    const unsubscribe = wsClient.subscribe(({ type, payload }) => {
      if (type === 'SYNC_GAME_STATE' && payload.actionType === 'CARD_DRAW') {
        if (payload.state?.syncedCard) {
          setRemoteCard(payload.state.syncedCard);
          soundManager.playCardFlip();
        }
        if (payload.state?.turnIndex !== undefined) {
          setCurrentTurnIndex(payload.state.turnIndex);
        }
      }
    });

    return unsubscribe;
  }, []);

  const currentCard = remoteCard || (cards.length > 0 ? cards[currentIndex] : null);
  const turnPlayer = players.length > 0 ? players[currentTurnIndex % players.length] : null;
  const isMyTurn = turnPlayer && turnPlayer.id === wsClient.playerId;

  const handleNextCard = () => {
    soundManager.playCardFlip();
    setIsFlipped(false);

    const nextCardIdx = (currentIndex + 1) % (cards.length || 1);
    const nextTurnIdx = players.length > 0 ? (currentTurnIndex + 1) % players.length : 0;
    const drawnCard = cards[nextCardIdx] || cards[0];

    setCurrentIndex(nextCardIdx);
    setCurrentTurnIndex(nextTurnIdx);
    setRemoteCard(drawnCard);

    if (wsClient.roomCode && drawnCard) {
      const nextTurnUser = players[nextTurnIdx] || { name: 'เพื่อน' };
      wsClient.sendAction(
        'CARD_DRAW',
        {
          syncedCard: drawnCard,
          turnIndex: nextTurnIdx
        },
        `การ์ดใบนี้ของ ${nextTurnUser.name}: ${cleanPromptText(drawnCard.prompt)}`
      );
    }
  };

  const handleIntensityChange = (levelKey) => {
    const levelInfo = INTENSITY_LEVELS[levelKey.toUpperCase()];
    if (levelInfo.isPremium && !isPremiumUnlocked) {
      soundManager.playClick();
      onOpenPassModal();
    } else {
      soundManager.playClick();
      setSelectedIntensity(levelKey);
    }
  };

  const addPenalty = () => {
    soundManager.playGlassClink();
    setPenaltyPoints((p) => p + 1);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col space-y-4 p-2">
      {/* TURN-BASED MULTIPLAYER ACTIVE BANNER */}
      {roomCode && players.length > 0 && turnPlayer && (
        <div className={`p-3.5 rounded-2xl border flex items-center justify-between shadow-lg transition-all animate-fadeIn ${
          isMyTurn
            ? 'bg-gradient-to-r from-pink-950 via-purple-950 to-slate-950 border-pink-500 shadow-[0_0_25px_rgba(255,0,122,0.5)]'
            : 'bg-slate-950/90 border-cyan-500/30'
        }`}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="text-3xl bg-slate-900 p-2 rounded-2xl border border-slate-700 block">{turnPlayer.avatar || '🍻'}</span>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-950 rounded-full animate-ping" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                กำลังดูการ์ดของ
              </span>
              <h3 className="text-sm font-black text-white flex items-center gap-1.5 mt-0.5">
                <span className="text-cyan-300">{turnPlayer.name}</span>
                {isMyTurn ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-pink-500 text-white animate-bounce">
                    ถึงตาคุณแล้ว!
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-semibold">(กำลังตอบ)</span>
                )}
              </h3>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-cyan-400 font-bold block">สุ่มคำถามทุกหมวด</span>
            <span className="text-[11px] text-slate-400 font-semibold">
              {players.length} คนในห้อง
            </span>
          </div>
        </div>
      )}

      {/* DB Status Badge Indicator */}
      <div className="flex items-center justify-between px-2 text-[11px] font-bold text-slate-400">
        <span className="flex items-center space-x-1">
          <Database className={`w-3.5 h-3.5 ${isDatabaseLoaded ? 'text-emerald-400' : 'text-amber-400'}`} />
          <span>คลังการ์ด: {isDatabaseLoaded ? 'Supabase Live DB 🟢' : 'Local Offline Mode 🟡'}</span>
        </span>
        <span>คำถามสุ่มรวม {cards.length} ใบ</span>
      </div>

      {/* Intensity Mode Selector (Free / 18+ / วงแตก) */}
      <div className="flex justify-between items-center bg-slate-900/90 p-2 rounded-2xl border border-slate-800 space-x-1.5">
        {Object.keys(INTENSITY_LEVELS).map((key) => {
          const level = INTENSITY_LEVELS[key];
          const isSelected = selectedIntensity === level.id;
          const isLocked = level.isPremium && !isPremiumUnlocked;

          return (
            <button
              key={level.id}
              onClick={() => handleIntensityChange(level.id)}
              className={`flex-1 py-2 px-1 rounded-xl text-[11px] font-bold transition-all relative flex items-center justify-center space-x-1 ${
                isSelected
                  ? `bg-gradient-to-r ${level.color} text-white shadow-md`
                  : 'bg-slate-950 text-slate-400 border border-slate-800'
              }`}
            >
              <span>{level.name.split(' ')[0]}</span>
              {isLocked && <Lock className="w-3 h-3 text-amber-400" />}
            </button>
          );
        })}
      </div>

      {/* Card Display Area with Framer Motion */}
      <div className="relative w-full h-84 perspective-1000">
        <AnimatePresence mode="wait">
          {currentCard ? (
            <motion.div
              key={(currentCard.id || 'card') + currentIndex}
              initial={{ rotateY: 90, opacity: 0, scale: 0.9 }}
              animate={{ rotateY: 0, opacity: 1, scale: 1 }}
              exit={{ rotateY: -90, opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              onClick={() => {
                soundManager.playCardFlip();
                setIsFlipped(!isFlipped);
              }}
              className={`w-full h-full rounded-3xl p-6 cursor-pointer select-none flex flex-col justify-between border-2 transition-all shadow-[0_0_30px_rgba(255,0,122,0.2)] relative overflow-hidden ${
                currentCard.type === 'truth'
                  ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-pink-950/80 border-pink-500'
                  : currentCard.type === 'dare'
                  ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/80 border-cyan-400'
                  : 'bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/80 border-amber-400'
              }`}
            >
              {/* Turn Owner Badge embedded directly on top of Card */}
              {roomCode && turnPlayer && (
                <div className="bg-slate-950/90 border-b border-slate-800 -mx-6 -mt-6 p-3 px-6 mb-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{turnPlayer.avatar || '🍻'}</span>
                    <span className="text-xs font-black text-white">
                      การ์ดของ: <span className="text-cyan-300">{turnPlayer.name}</span>
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 flex items-center gap-1">
                    <Eye className="w-3 h-3" /> เห็นตรงกันทุกจอ
                  </span>
                </div>
              )}

              {/* Card Header Tag */}
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-900/80 border border-slate-700 text-white flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                  <span>
                    {currentCard.type === 'truth'
                      ? 'ความจริง (Truth)'
                      : currentCard.type === 'dare'
                      ? 'ความกล้า (Dare)'
                      : currentCard.type === 'never'
                      ? 'ฉันไม่เคย...'
                      : 'ใครมีโอกาสสุด'}
                  </span>
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {currentIndex + 1} / {cards.length}
                </span>
              </div>

              {/* Card Content Body - CLEAN PROMPT TEXT */}
              <div className="my-auto text-center px-2 py-2">
                <p className="text-xl font-bold text-white leading-relaxed tracking-wide">
                  {cleanPromptText(currentCard.prompt)}
                </p>

                {currentCard.penalty && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80 text-sm font-semibold text-pink-400 flex items-center justify-center space-x-1">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>บทลงโทษ: {currentCard.penalty}</span>
                  </div>
                )}
              </div>

              {/* Card Footer Prompt */}
              <div className="text-center text-xs text-slate-400 font-semibold italic">
                {roomCode && turnPlayer ? (
                  isMyTurn ? (
                    <span className="text-pink-400 font-bold">👉 คุณ ({turnPlayer.name}) ตอบคำถามนี้! ทำเสร็จแล้วกดใบถัดไป</span>
                  ) : (
                    <span className="text-cyan-300 font-semibold">👀 ทุกจอกำลังดูคำถามของ {turnPlayer.name}...</span>
                  )
                ) : (
                  'แตะเพื่อพลิกการ์ด / กดปุ่มด้านล่างเพื่อเปลี่ยนใบถัดไป'
                )}
              </div>
            </motion.div>
          ) : (
            <div className="w-full h-full bg-slate-900/80 rounded-3xl border border-slate-800 flex flex-col items-center justify-center p-6 text-center text-slate-400">
              <ShieldAlert className="w-10 h-10 text-amber-400 mb-2" />
              <p>ไม่มีการ์ดในหมวดนี้ กรุณาเปลี่ยนระดับ หรือสร้างการ์ด custom!</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Actions */}
      <div className="flex space-x-3">
        <button
          onClick={addPenalty}
          className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-2xl text-xs font-bold text-amber-400 flex items-center justify-center space-x-1.5 active:scale-95 transition"
        >
          <Award className="w-4 h-4 text-amber-400" />
          <span>บวกจิบสะสม ({penaltyPoints}) 🍻</span>
        </button>

        <button
          onClick={handleNextCard}
          className="flex-[2] py-3.5 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 text-slate-950 font-black rounded-2xl text-sm shadow-[0_0_20px_rgba(255,0,122,0.5)] hover:shadow-[0_0_30px_rgba(0,242,254,0.7)] active:scale-95 transition flex items-center justify-center space-x-2"
        >
          <span>ใบถัดไป (สุ่มหมวด)</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
